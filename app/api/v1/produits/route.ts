import { NextRequest, NextResponse } from 'next/server';
import { filterAndSortProducts, getStore } from '@/lib/server-store';
import type { SortOption, TelemetryPayload } from '@/lib/types';

export async function GET(req: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const categorie = searchParams.get('categorie') || 'Tous';
  const sortRaw = searchParams.get('sort');
  const sort: SortOption =
    sortRaw === 'price_asc' || sortRaw === 'price_desc' || sortRaw === 'rating_desc'
      ? sortRaw
      : 'rating_desc';
  const trigger = searchParams.get('trigger') || (q ? 'search' : 'filter');

  const results = filterAndSortProducts(store.products, q, categorie, sort);

  if (trigger === 'search' && q) {
    const cacheKey = `products:search:${q.toLowerCase()}:${categorie}:${sort}`;
    const isHit = store.searchCache.has(cacheKey);
    const safeQ = q.replace(/'/g, "''");

    if (isHit) {
      const telemetry: TelemetryPayload = {
        method: 'GET',
        path: `/api/v1/produits?q=${encodeURIComponent(q)}`,
        status: 200,
        cacheStatus: 'HIT',
        maxHopIndex: 3,
        hops: [
          { node: 'Edge CDN', ms: 3 },
          { node: 'API', ms: 4 },
          { node: 'Redis', ms: 2 },
          { node: 'PostgreSQL', ms: 0 },
        ],
        summary: `Cache-Aside HIT : la clé Redis « ${cacheKey} » existe déjà. PostgreSQL est totalement court-circuité, économisant un scan d’index GIN.`,
        resBody: {
          requete: q,
          source: 'redis_cache_aside',
          total: results.length,
          produits: results.map((r) => ({ id: r.id, nom: r.name, prix_ht: r.priceHT })),
        },
        redisCmd: `GET "${cacheKey}"\n-- Résultat : HIT (TTL restant : 284 s)`,
        sqlQuery: '-- Requête SQL évitée grâce au patron Cache-Aside Redis (CACHE HIT).',
        explainPlan: 'Redis GET O(1) — Temps mémoire : 0.42 ms | PostgreSQL : non sollicité (0 I/O).',
      };

      return NextResponse.json({ products: results, cacheHit: true, cacheKey, telemetry });
    }

    store.searchCache.set(
      cacheKey,
      results.map((r) => r.id)
    );

    const telemetry: TelemetryPayload = {
      method: 'GET',
      path: `/api/v1/produits?q=${encodeURIComponent(q)}`,
      status: 200,
      cacheStatus: 'MISS',
      maxHopIndex: 4,
      hops: [
        { node: 'Edge CDN', ms: 4 },
        { node: 'API', ms: 6 },
        { node: 'Redis', ms: 2 },
        { node: 'PostgreSQL', ms: 13 },
      ],
      summary: `Cache-Aside MISS pour « ${q} » : PostgreSQL exécute un Bitmap Index Scan sur l’index inversé GIN tsvector français, puis l’API écrit le JSON dans Redis (TTL 300 s).`,
      resBody: {
        requete: q,
        source: 'postgresql_gin_tsvector',
        mise_en_cache_redis: true,
        total: results.length,
        produits: results.map((r) => ({ id: r.id, nom: r.name, stock: r.stock })),
      },
      redisCmd: `GET "${cacheKey}"  -- (nil -> MISS)\nSETEX "${cacheKey}" 300 "[${results.map((r) => r.id).join(',')}]"`,
      sqlQuery: `SELECT p.id, p.name, p.price_ht, i.stock_available,\n       ts_rank(p.search_tsv, plainto_tsquery('french', '${safeQ}')) AS pertinence\nFROM products p\nINNER JOIN inventory i ON i.product_id = p.id\nWHERE p.search_tsv @@ plainto_tsquery('french', '${safeQ}')\nORDER BY pertinence DESC\nLIMIT 20;`,
      explainPlan: `Sort (cost=14.82..14.84 rows=${results.length}) (actual time=1.84..1.86 ms)\n  Sort Key: (ts_rank(p.search_tsv, '''${safeQ}''')) DESC\n  -> Nested Loop Inner Join (cost=8.26..14.79 rows=${results.length}) (actual time=0.72..1.45 ms)\n       -> Bitmap Heap Scan on products p (actual time=0.58..0.91 ms)\n            Recheck Cond: (search_tsv @@ plainto_tsquery('french', '${safeQ}'))\n            -> Bitmap Index Scan on idx_products_fts_gin (GIN tsvector)\n                 Index Cond: (search_tsv @@ plainto_tsquery('french', '${safeQ}'))\n       -> Index Scan using inventory_pkey on inventory i (actual time=0.11..0.14 ms)\nPlanning Time: 0.42 ms | Execution Time: 2.15 ms`,
    };

    return NextResponse.json({ products: results, cacheHit: false, cacheKey, telemetry });
  }

  if (trigger === 'sort') {
    const orderClause =
      sort === 'price_asc'
        ? 'p.price_ht ASC'
        : sort === 'price_desc'
          ? 'p.price_ht DESC'
          : 'mv.avg_rating DESC';

    const telemetry: TelemetryPayload = {
      method: 'GET',
      path: `/api/v1/produits?sort=${sort}`,
      status: 200,
      cacheStatus: 'MISS',
      maxHopIndex: 4,
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 4 },
        { node: 'Redis', ms: 2 },
        { node: 'PostgreSQL', ms: 8 },
      ],
      summary: `Tri dynamique du catalogue via clause SQL ORDER BY ${orderClause}.`,
      resBody: {
        tri: sort,
        premier_produit: results[0]?.name || null,
        total: results.length,
      },
      redisCmd: `GET "catalog:sort:${sort}" -- MISS`,
      sqlQuery: `SELECT p.id, p.name, p.price_ht, i.stock_available, mv.avg_rating\nFROM products p\nINNER JOIN inventory i ON i.product_id = p.id\nLEFT JOIN mv_notes_produits mv ON mv.product_id = p.id\nORDER BY ${orderClause};`,
      explainPlan: `Sort (cost=4.20..4.22 rows=${results.length}) (actual time=0.61..0.64 ms)\n  Sort Key: ${orderClause}\n  -> Nested Loop Left Join (actual time=0.18..0.49 ms)\nExecution Time: 0.78 ms`,
    };

    return NextResponse.json({ products: results, cacheHit: false, telemetry });
  }

  const slugMap: Record<string, string> = {
    Tous: 'all',
    'Cloud & APIs': 'cloud-apis',
    'Bases de Données': 'bases-de-donnees',
    'Kits UI': 'kits-ui',
    'Formations DevOps': 'formations-devops',
  };
  const slug = slugMap[categorie] || 'custom';
  const orderSql =
    sort === 'price_asc'
      ? 'p.price_ht ASC'
      : sort === 'price_desc'
        ? 'p.price_ht DESC'
        : 'p.rating DESC';

  const telemetry: TelemetryPayload = {
    method: 'GET',
    path: `/api/v1/produits?categorie=${encodeURIComponent(slug)}&sort=${sort}`,
    status: 200,
    cacheStatus: 'MISS',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 9 },
    ],
    summary: `Filtrage relationnel sur la catégorie « ${categorie} » avec jointure categories + inventory (${results.length} produit(s)).`,
    resBody: {
      categorie,
      tri: sort,
      total: results.length,
      ids: results.map((r) => r.id),
    },
    redisCmd: `GET "catalog:cat:${slug}:${sort}" -- MISS\nSETEX "catalog:cat:${slug}:${sort}" 120 "..."`,
    sqlQuery: `SELECT p.id, p.name, p.price_ht, i.stock_available, c.label\nFROM products p\nINNER JOIN inventory i ON i.product_id = p.id\nINNER JOIN categories c ON c.id = p.category_id\n${
      categorie !== 'Tous' ? `WHERE c.label = '${categorie.replace(/'/g, "''")}'\n` : ''
    }ORDER BY ${orderSql};`,
    explainPlan: `Hash Join (cost=2.14..6.48 rows=${results.length}) (actual time=0.52..0.89 ms)\n  -> Index Scan using idx_products_category on products p\n  -> Index Scan using inventory_pkey on inventory i\nExecution Time: 1.04 ms`,
  };

  return NextResponse.json({ products: results, cacheHit: false, telemetry });
}
