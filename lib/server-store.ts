import 'server-only';

import { INITIAL_PRODUCTS } from './data';
import type {
  CartState,
  CartTotals,
  CheckoutConfirmation,
  CheckoutProvider,
  KpiMetrics,
  Product,
  SortOption,
  StoreSnapshot,
  TelemetryPayload,
} from './types';

interface ServerStore {
  products: Product[];
  searchCache: Map<string, number[]>;
  cart: CartState;
  kpis: KpiMetrics;
  idempotencyOrders: Map<string, CheckoutConfirmation>;
  subscribers: Set<string>;
}

const globalForStore = globalThis as unknown as {
  __stackcraftStore?: ServerStore;
};

function createInitialStore(): ServerStore {
  return {
    products: INITIAL_PRODUCTS.map((p) => ({ ...p, specs: [...p.specs], tags: [...p.tags] })),
    searchCache: new Map<string, number[]>(),
    cart: {
      items: [],
      promoCode: null,
    },
    kpis: {
      sessionsCount: 1200,
      ordersCount: 41,
      totalRevenueTTC: 9778.5,
      cac: 85.0,
      avgOrdersPerCustomer: 1.5,
      lastOrderId: 88412,
    },
    idempotencyOrders: new Map<string, CheckoutConfirmation>(),
    subscribers: new Set<string>(),
  };
}

export function getStore(): ServerStore {
  if (!globalForStore.__stackcraftStore) {
    globalForStore.__stackcraftStore = createInitialStore();
  }
  return globalForStore.__stackcraftStore;
}

export function computeCartTotals(cart: CartState, products: Product[]): CartTotals {
  let subtotalHT = 0;
  let totalQty = 0;
  for (const item of cart.items) {
    const p = products.find((x) => x.id === item.productId);
    if (p) {
      subtotalHT += p.priceHT * item.qty;
      totalQty += item.qty;
    }
  }

  let discount = 0;
  let discountLabel = '';
  if (cart.promoCode === 'STACK20') {
    discount = +(subtotalHT * 0.2).toFixed(2);
    discountLabel = 'Code STACK20 (-20 %)';
  } else if (cart.promoCode === 'DEV50') {
    discount = Math.min(subtotalHT, 50.0);
    discountLabel = 'Code DEV50 (-50,00 €)';
  }

  const netHT = Math.max(0, +(subtotalHT - discount).toFixed(2));
  const tva = +(netHT * 0.2).toFixed(2);
  const totalTTC = +(netHT + tva).toFixed(2);

  return { subtotalHT, discount, discountLabel, netHT, tva, totalTTC, totalQty };
}

export function buildSsrTelemetry(productsCount: number): TelemetryPayload {
  return {
    method: 'GET',
    path: '/?ssr=hydrate&locale=fr-FR',
    status: 200,
    cacheStatus: 'EDGE_HIT',
    maxHopIndex: 3,
    hops: [
      { node: 'Edge CDN', ms: 4 },
      { node: 'Serveur API', ms: 9 },
      { node: 'Redis 7', ms: 2 },
      { node: 'PostgreSQL', ms: 0 },
    ],
    summary:
      'Résolution DNS Anycast (PoP Paris CDG1), poignée de main TLS 1.3 (0-RTT), rendu HTML SSR Next.js App Router hydraté avec le catalogue en cache Redis (TTL 300 s).',
    resHeaders: {
      'x-ssr-render': 'nextjs-app-router-edge',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
    resBody: {
      page: 'StackCraft Commerce',
      ssr_hydrated: true,
      edge_pop: 'CDG1-Paris',
      tls: 'TLS 1.3 (AEAD_AES_256_GCM)',
      produits_precharges: productsCount,
    },
    redisCmd: 'GET ssr:page:home:fr_FR\nHGETALL cart:usr_9482',
    sqlQuery:
      '-- Page servie via hydratation SSR + cache Redis catalogue\n-- Aucune requête SQL bloquante sur PostgreSQL 16.',
    explainPlan:
      'Edge SSR Cache HIT + Redis Key Lookup (O(1))\nTemps réseau DNS+TLS 1.3 : 4 ms | Rendu SSR : 9 ms | Redis : 2 ms',
  };
}

export function getSnapshot(): StoreSnapshot {
  const store = getStore();
  const totals = computeCartTotals(store.cart, store.products);
  const ttfb = 18 + Math.floor(Math.random() * 11);
  const initialTime = new Date().toLocaleTimeString('fr-FR', { hour12: false });
  return {
    products: store.products.map((p) => ({ ...p })),
    cart: {
      items: store.cart.items.map((i) => ({ ...i })),
      promoCode: store.cart.promoCode,
    },
    totals,
    kpis: { ...store.kpis },
    ttfb,
    initialTime,
    initialTelemetry: buildSsrTelemetry(store.products.length),
  };
}

export function filterAndSortProducts(
  products: Product[],
  q: string,
  category: string,
  sort: SortOption
): Product[] {
  const normalizedQ = q.trim().toLowerCase();
  const list = products.filter((p) => {
    const matchCat = !category || category === 'Tous' || category === 'all' || p.category === category || p.categorySlug === category;
    if (!matchCat) return false;
    if (!normalizedQ) return true;
    const haystack = `${p.name} ${p.category} ${p.shortDesc} ${p.longDesc} ${p.tags.join(' ')}`.toLowerCase();
    return haystack.includes(normalizedQ);
  });

  if (sort === 'price_asc') list.sort((a, b) => a.priceHT - b.priceHT);
  else if (sort === 'price_desc') list.sort((a, b) => b.priceHT - a.priceHT);
  else list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return list;
}

export function getSupportAutoReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('promo') || q.includes('code') || q.includes('reduc')) {
    return 'Deux codes promotionnels sont actifs dans le panier Redis : STACK20 (-20 % sur le HT) et DEV50 (-50,00 € immédiat). Essayez-les dans le tiroir panier !';
  }
  if (q.includes('for update') || q.includes('acid') || q.includes('stock') || q.includes('verrou')) {
    return 'Le verrouillage pessimiste « SELECT ... FOR UPDATE » pose un verrou exclusif au niveau ligne dans PostgreSQL 16 pendant la transaction BEGIN...COMMIT, empêchant deux clients d’acheter le dernier exemplaire.';
  }
  if (q.includes('rgpd') || q.includes('donnee') || q.includes('pci')) {
    return 'StackCraft chiffre les PII au repos (AES-256), respecte le droit à l’effacement RGPD (Art. 17) et ne stocke aucun numéro de carte bancaire grâce à la tokenisation PCI-DSS Niveau 1.';
  }
  return 'Bien reçu ! Votre message a été persisté dans PostgreSQL et diffusé sur Redis Pub/Sub (canal support:usr_9482). Un architecte senior vous répondra sous 2 minutes.';
}

export function buildProductDetailSql(productId: number): string {
  return `SELECT p.id, p.sku, p.name, p.price_ht,
       i.stock_available, i.warehouse_zone,
       c.label AS categorie,
       COALESCE(mv.avg_rating, 5.0) AS note_moyenne,
       COALESCE(mv.review_count, 0) AS nb_avis
FROM products p
INNER JOIN inventory i ON i.product_id = p.id
INNER JOIN categories c ON c.id = p.category_id
LEFT JOIN mv_notes_produits mv ON mv.product_id = p.id
WHERE p.id = ${productId};`;
}

export function buildCheckoutPreviewSql(
  items: { productId: number; qty: number }[],
  nextOrderId: number,
  idempotencyKey: string,
  provider: CheckoutProvider,
  totalTTC: number
): string {
  const idsList = items.map((i) => i.productId).join(', ');
  return `BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT product_id, stock_available FROM inventory
  WHERE product_id IN (${idsList}) FOR UPDATE;
${items
  .map(
    (i) =>
      `UPDATE inventory SET stock_available = stock_available - ${i.qty} WHERE product_id = ${i.productId} AND stock_available >= ${i.qty};`
  )
  .join('\n')}
INSERT INTO orders (id, user_id, idempotency_key, provider, total_ttc, status)
  VALUES (${nextOrderId}, 'usr_9482', '${idempotencyKey}', '${provider}', ${totalTTC.toFixed(2)}, 'PAID');
COMMIT;`;
}
