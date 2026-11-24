import { NextRequest, NextResponse } from 'next/server';
import { buildProductDetailSql, getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ erreur: 'Identifiant de produit invalide.' }, { status: 400 });
  }
  const store = getStore();
  const product = store.products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ erreur: 'Produit introuvable' }, { status: 404 });
  }

  const sqlDetail = buildProductDetailSql(product.id);

  const telemetry: TelemetryPayload = {
    method: 'GET',
    path: `/api/v1/produits/${product.id}`,
    status: 200,
    cacheStatus: 'MISS',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 7 },
    ],
    summary: `Chargement détaillé du produit #${product.id} (« ${product.name} ») via INNER JOIN products/inventory et LEFT JOIN mv_notes_produits.`,
    resBody: {
      id: product.id,
      sku: product.sku,
      nom: product.name,
      prix_ht: product.priceHT,
      stock_disponible: product.stock,
      note: product.rating,
      avis: product.reviewCount,
    },
    redisCmd: `GET "product:detail:${product.id}" -- MISS (lecture fraîche du stock temps réel)`,
    sqlQuery: sqlDetail,
    explainPlan: `Nested Loop Left Join (cost=0.43..16.51 rows=1) (actual time=0.31..0.52 ms)\n  -> Nested Loop Inner Join (actual time=0.22..0.38 ms)\n       -> Index Scan using products_pkey on products p (Index Cond: id = ${product.id})\n       -> Index Scan using inventory_product_id_idx on inventory i (Index Cond: product_id = ${product.id})\n  -> Index Scan using mv_notes_produits_idx on mv_notes_produits mv\nPlanning Time: 0.28 ms | Execution Time: 0.61 ms`,
  };

  return NextResponse.json({ product, sqlDetail, telemetry }, { status: 200 });
}
