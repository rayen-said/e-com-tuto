import { NextRequest, NextResponse } from 'next/server';
import { computeCartTotals, getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { productId?: number };
  try {
    body = (await req.json()) as { productId?: number };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const store = getStore();
  const productId = Number(body.productId);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ erreur: 'Identifiant de produit invalide.' }, { status: 400 });
  }
  const p = store.products.find((x) => x.id === productId);

  if (!p || p.stock <= 0) {
    return NextResponse.json({ erreur: 'Produit épuisé ou introuvable' }, { status: 400 });
  }

  const existing = store.cart.items.find((i) => i.productId === productId);
  if (existing) {
    if (existing.qty >= p.stock) {
      return NextResponse.json(
        { erreur: `Stock maximum atteint (${p.stock}) pour ${p.name}.` },
        { status: 409 }
      );
    }
    existing.qty += 1;
  } else {
    store.cart.items.push({ productId, qty: 1 });
  }

  const newQty = existing ? existing.qty : 1;
  const totals = computeCartTotals(store.cart, store.products);

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/panier/articles',
    status: 200,
    cacheStatus: 'WRITE',
    maxHopIndex: 3,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 0 },
    ],
    summary: `Ajout de « ${p.name} » dans le Redis Hash cart:usr_9482 (quantité = ${newQty}). Aucune écriture SQL superflue sur PostgreSQL.`,
    reqBody: { product_id: p.id, sku: p.sku, quantite: newQty },
    resBody: {
      cle_redis: 'cart:usr_9482',
      articles: totals.totalQty,
      total_ttc: totals.totalTTC,
    },
    redisCmd: `HSET cart:usr_9482 "prod_${p.id}" "${newQty}"\nEXPIRE cart:usr_9482 1800`,
    sqlQuery: '-- Panier géré exclusivement en mémoire dans Redis Hash (latence ~1 ms).',
    explainPlan: 'Redis HSET O(1) : 0.24 ms | EXPIRE O(1) : 0.08 ms.',
  };

  return NextResponse.json(
    {
      cart: { items: [...store.cart.items], promoCode: store.cart.promoCode },
      totals,
      productName: p.name,
      telemetry,
    },
    { status: 200 }
  );
}
