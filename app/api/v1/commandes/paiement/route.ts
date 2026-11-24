import { NextRequest, NextResponse } from 'next/server';
import { computeCartTotals, getStore } from '@/lib/server-store';
import type {
  CheckoutConfirmation,
  CheckoutProvider,
  PurchasedSummaryItem,
  TelemetryPayload,
} from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: {
    provider?: CheckoutProvider;
    customerName?: string;
    customerEmail?: string;
    idempotencyKey?: string;
  };
  try {
    body = (await req.json()) as {
      provider?: CheckoutProvider;
      customerName?: string;
      customerEmail?: string;
      idempotencyKey?: string;
    };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const store = getStore();
  const idempotencyKey =
    req.headers.get('idempotency-key') || body.idempotencyKey;
  if (!idempotencyKey) {
    return NextResponse.json(
      { erreur: 'En-tête Idempotency-Key requis.' },
      { status: 400 }
    );
  }
  const usedKey = idempotencyKey;
  const usedProvider: CheckoutProvider =
    body.provider && ['stripe', 'paypal', 'applepay'].includes(body.provider)
      ? body.provider
      : 'stripe';

  const existingOrder = store.idempotencyOrders.get(usedKey);
  if (existingOrder) {
    const telemetry: TelemetryPayload = {
      method: 'POST',
      path: '/api/v1/commandes/paiement',
      status: 200,
      cacheStatus: 'HIT',
      maxHopIndex: 3,
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 4 },
        { node: 'Redis', ms: 1 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary: `Rejeu idempotent intercepté par Redis pour Idempotency-Key ${usedKey} : commande #${existingOrder.orderId} renvoyée sans double facturation ni double décrémentation.`,
      reqHeaders: { 'idempotency-key': usedKey },
      resBody: {
        commande_id: `ORDER_ID #${existingOrder.orderId}`,
        statut: 'IDEMPOTENT_REPLAY',
        double_debit_evite: true,
      },
      redisCmd: `GET "idem:${usedKey}" -- HIT -> ORDER_${existingOrder.orderId}`,
      sqlQuery: '-- Transaction SQL évitée grâce à la clé d’idempotence déjà engagée.',
      explainPlan: 'Redis GET O(1) (0.18 ms) : protection anti-double débit active.',
    };

    return NextResponse.json(
      {
        confirmation: { ...existingOrder, idempotentReplay: true },
        products: store.products,
        cart: store.cart,
        totals: computeCartTotals(store.cart, store.products),
        kpis: store.kpis,
        telemetry,
      },
      { status: 200 }
    );
  }

  if (!store.cart.items.length) {
    return NextResponse.json({ erreur: 'Votre panier est vide.' }, { status: 400 });
  }

  const totals = computeCartTotals(store.cart, store.products);

  // Vérification stricte des stocks avant COMMIT
  for (const item of store.cart.items) {
    const p = store.products.find((x) => x.id === item.productId);
    if (!p || p.stock < item.qty) {
      return NextResponse.json(
        {
          erreur: `ROLLBACK ACID : stock insuffisant pour ${p ? p.name : 'ce produit'}.`,
        },
        { status: 409 }
      );
    }
  }

  // Décrémentation réelle du stock
  const purchasedSummary: PurchasedSummaryItem[] = store.cart.items.map((item) => {
    const p = store.products.find((x) => x.id === item.productId)!;
    p.stock -= item.qty;
    return {
      product_id: p.id,
      sku: p.sku,
      nom: p.name,
      qty: item.qty,
      nouveau_stock: p.stock,
    };
  });

  store.kpis.lastOrderId += 1;
  const orderId = store.kpis.lastOrderId;
  const idsList = purchasedSummary.map((x) => x.product_id).join(', ');

  // Vidage du panier Redis Hash + invalidation du cache recherche
  store.cart.items = [];
  store.cart.promoCode = null;
  store.searchCache.clear();

  // Mise à jour des KPIs Économie Numérique
  store.kpis.ordersCount += 1;
  store.kpis.totalRevenueTTC = +(store.kpis.totalRevenueTTC + totals.totalTTC).toFixed(2);

  const confirmation: CheckoutConfirmation = {
    orderId,
    usedKey,
    provider: usedProvider,
    totalTTC: totals.totalTTC,
    purchasedSummary,
  };
  store.idempotencyOrders.set(usedKey, confirmation);

  const fullSql = `BEGIN ISOLATION LEVEL READ COMMITTED;
-- 1. Verrouillage pessimiste des lignes de stock
SELECT product_id, stock_available FROM inventory
  WHERE product_id IN (${idsList}) FOR UPDATE;
-- 2. Décrémentation atomique des stocks
${purchasedSummary
  .map(
    (x) =>
      `UPDATE inventory SET stock_available = stock_available - ${x.qty} WHERE product_id = ${x.product_id}; -- stock restant : ${x.nouveau_stock}`
  )
  .join('\n')}
-- 3. Création de la commande et journalisation
INSERT INTO orders (id, user_id, idempotency_key, provider, total_ttc, status)
  VALUES (${orderId}, 'usr_9482', '${usedKey}', '${usedProvider}', ${totals.totalTTC.toFixed(2)}, 'PAID');
COMMIT;`;

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/commandes/paiement',
    status: 201,
    cacheStatus: 'ACID',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 4 },
      { node: 'API', ms: 11 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 19 },
    ],
    summary: `Transaction ACID #${orderId} validée (COMMIT) via ${usedProvider.toUpperCase()} : stocks décrémentés sur PostgreSQL, panier cart:usr_9482 supprimé (DEL) et KPIs AOV/Conversion recalculés.`,
    reqHeaders: { 'idempotency-key': usedKey },
    reqBody: {
      prestataire: usedProvider,
      articles: purchasedSummary.map((x) => ({ id: x.product_id, qty: x.qty })),
      total_ttc: totals.totalTTC,
    },
    resBody: {
      commande_id: `ORDER_ID #${orderId}`,
      statut: 'PAID',
      idempotency_key: usedKey,
      montant_ttc: totals.totalTTC,
      stocks_mis_a_jour: purchasedSummary.map((x) => ({
        id: x.product_id,
        stock_restant: x.nouveau_stock,
      })),
      nouvel_aov: +(store.kpis.totalRevenueTTC / store.kpis.ordersCount).toFixed(2),
    },
    redisCmd: `SET "idem:${usedKey}" "ORDER_${orderId}" EX 86400 NX\nDEL cart:usr_9482\nDEL products:search:*`,
    sqlQuery: fullSql,
    explainPlan: `Transaction Block (READ COMMITTED)\n  1. LockRows (SELECT ... FOR UPDATE) on inventory_pkey (actual time=0.41..0.58 ms, rows=${purchasedSummary.length})\n  2. ModifyTable (UPDATE inventory) (actual time=0.62..0.95 ms, rows=${purchasedSummary.length})\n  3. ModifyTable (INSERT INTO orders) (actual time=0.38..0.44 ms, rows=1)\n  4. WAL Flush + COMMIT (synchronous_commit=on) : 4.20 ms\nTotal Transaction Time: 18.64 ms`,
  };

  return NextResponse.json(
    {
      confirmation,
      products: store.products,
      cart: { items: [], promoCode: null },
      totals: computeCartTotals(store.cart, store.products),
      kpis: { ...store.kpis },
      telemetry,
    },
    { status: 201 }
  );
}
