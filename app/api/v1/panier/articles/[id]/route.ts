import { NextRequest, NextResponse } from 'next/server';
import { computeCartTotals, getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ erreur: 'Identifiant d’article invalide.' }, { status: 400 });
  }
  let body: { delta?: number };
  try {
    body = (await req.json()) as { delta?: number };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const delta = Number(body.delta);
  if (!Number.isInteger(delta) || delta === 0) {
    return NextResponse.json({ erreur: 'Delta de quantité invalide (doit être un entier non nul).' }, { status: 400 });
  }
  const store = getStore();
  const p = store.products.find((x) => x.id === productId);
  const idx = store.cart.items.findIndex((i) => i.productId === productId);

  if (idx === -1 || !p) {
    return NextResponse.json({ erreur: 'Article absent du panier' }, { status: 404 });
  }

  const nextQty = store.cart.items[idx].qty + delta;
  if (nextQty <= 0) {
    store.cart.items = store.cart.items.filter((i) => i.productId !== productId);
    if (store.cart.items.length === 0) store.cart.promoCode = null;
    const totals = computeCartTotals(store.cart, store.products);

    const telemetry: TelemetryPayload = {
      method: 'DELETE',
      path: `/api/v1/panier/articles/${productId}`,
      status: 200,
      cacheStatus: 'WRITE',
      maxHopIndex: 3,
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 4 },
        { node: 'Redis', ms: 1 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary: `Suppression du champ prod_${productId} (${p.name}) du Redis Hash cart:usr_9482 via HDEL.`,
      resBody: {
        supprime: `prod_${productId}`,
        articles_restants: store.cart.items.length,
      },
      redisCmd: `HDEL cart:usr_9482 "prod_${productId}"`,
      sqlQuery: '-- Suppression de champ dans le Redis Hash uniquement.',
      explainPlan: 'Redis HDEL O(1) : 0.18 ms.',
    };

    return NextResponse.json(
      {
        cart: { items: [...store.cart.items], promoCode: store.cart.promoCode },
        totals,
        telemetry,
      },
      { status: 200 }
    );
  }

  if (nextQty > p.stock) {
    return NextResponse.json(
      { erreur: `Stock disponible limité à ${p.stock} unité(s).` },
      { status: 409 }
    );
  }

  store.cart.items[idx].qty = nextQty;
  const totals = computeCartTotals(store.cart, store.products);

  const telemetry: TelemetryPayload = {
    method: 'PATCH',
    path: `/api/v1/panier/articles/${productId}`,
    status: 200,
    cacheStatus: 'WRITE',
    maxHopIndex: 3,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 4 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 0 },
    ],
    summary: `Mise à jour atomique de la quantité (${delta > 0 ? `+${delta}` : `${delta}`}) pour prod_${productId} dans Redis Hash cart:usr_9482.`,
    reqBody: { delta, nouvelle_quantite: nextQty },
    resBody: { cle_redis: 'cart:usr_9482', total_ttc: totals.totalTTC },
    redisCmd: `HINCRBY cart:usr_9482 "prod_${productId}" ${delta}\nEXPIRE cart:usr_9482 1800`,
    sqlQuery: '-- Aucun accès PostgreSQL : incrémentation atomique en RAM via Redis HINCRBY.',
    explainPlan: 'Redis HINCRBY O(1) : 0.19 ms.',
  };

  return NextResponse.json(
    {
      cart: { items: [...store.cart.items], promoCode: store.cart.promoCode },
      totals,
      telemetry,
    },
    { status: 200 }
  );
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ erreur: 'Identifiant d’article invalide.' }, { status: 400 });
  }
  const store = getStore();
  const p = store.products.find((x) => x.id === productId);
  const existed = store.cart.items.some((i) => i.productId === productId);
  if (!existed) {
    return NextResponse.json({ erreur: 'Article absent du panier' }, { status: 404 });
  }

  store.cart.items = store.cart.items.filter((i) => i.productId !== productId);
  if (store.cart.items.length === 0) store.cart.promoCode = null;
  const totals = computeCartTotals(store.cart, store.products);

  const telemetry: TelemetryPayload = {
    method: 'DELETE',
    path: `/api/v1/panier/articles/${productId}`,
    status: 200,
    cacheStatus: 'WRITE',
    maxHopIndex: 3,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 4 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 0 },
    ],
    summary: `Suppression du champ prod_${productId} (${p ? p.name : ''}) du Redis Hash cart:usr_9482 via HDEL.`,
    resBody: {
      supprime: `prod_${productId}`,
      articles_restants: store.cart.items.length,
    },
    redisCmd: `HDEL cart:usr_9482 "prod_${productId}"`,
    sqlQuery: '-- Suppression de champ dans le Redis Hash uniquement.',
    explainPlan: 'Redis HDEL O(1) : 0.18 ms.',
  };

  return NextResponse.json(
    {
      cart: { items: [...store.cart.items], promoCode: store.cart.promoCode },
      totals,
      telemetry,
    },
    { status: 200 }
  );
}
