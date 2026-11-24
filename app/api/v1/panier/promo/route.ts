import { NextRequest, NextResponse } from 'next/server';
import { formatEuro } from '@/lib/format';
import { computeCartTotals, getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = (await req.json()) as { code?: string };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const store = getStore();
  const code = String(body.code || '').trim().toUpperCase();

  if (!store.cart.items.length) {
    return NextResponse.json(
      {
        valide: false,
        message: 'Ajoutez au moins un article au panier avant d’appliquer un code promo.',
      },
      { status: 400 }
    );
  }

  if (code === 'STACK20' || code === 'DEV50') {
    store.cart.promoCode = code;
    const totals = computeCartTotals(store.cart, store.products);

    const message =
      code === 'STACK20'
        ? `Code STACK20 appliqué : -20 % (-${formatEuro(totals.discount)}) !`
        : `Code DEV50 appliqué : -50,00 € (-${formatEuro(totals.discount)}) !`;

    const telemetry: TelemetryPayload = {
      method: 'POST',
      path: '/api/v1/panier/promo',
      status: 200,
      cacheStatus: 'WRITE',
      maxHopIndex: 3,
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 5 },
        { node: 'Redis', ms: 2 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary: `Code promotionnel « ${code} » validé côté serveur et enregistré dans le Redis Hash cart:usr_9482 via HSET (remise : -${formatEuro(totals.discount)}).`,
      reqBody: { code_promo: code },
      resBody: {
        valide: true,
        code,
        remise_ht: totals.discount,
        tva_20: totals.tva,
        total_ttc: totals.totalTTC,
      },
      redisCmd: `HSET cart:usr_9482 "promo_code" "${code}"\nHSET cart:usr_9482 "discount_ht" "${totals.discount.toFixed(2)}"\nEXPIRE cart:usr_9482 1800`,
      sqlQuery: `SELECT code, discount_type, discount_value, active\nFROM promo_codes\nWHERE code = '${code}' AND active = true AND expires_at > NOW();`,
      explainPlan: 'Redis Cache HIT sur la règle promo + HSET cart:usr_9482 (0.35 ms).',
    };

    return NextResponse.json(
      {
        valide: true,
        code,
        message,
        cart: { items: [...store.cart.items], promoCode: store.cart.promoCode },
        totals,
        telemetry,
      },
      { status: 200 }
    );
  }

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/panier/promo',
    status: 422,
    cacheStatus: 'MISS',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 6 },
    ],
    summary: `Code promo « ${code || 'vide'} » rejeté (HTTP 422 Unprocessable Entity) après vérification en base.`,
    reqBody: { code_promo: code },
    resBody: {
      erreur: 'CODE_PROMO_INVALIDE',
      message: 'Codes valides : STACK20 ou DEV50',
    },
    redisCmd: `GET "promo:${code}" -- (nil)`,
    sqlQuery: `SELECT code FROM promo_codes WHERE code = '${code.replace(/'/g, "''")}' AND active = true;`,
    explainPlan: 'Index Scan on promo_codes_code_key (actual rows=0, time=0.22 ms).',
  };

  return NextResponse.json(
    {
      valide: false,
      message: `Code « ${code || 'vide'} » inconnu. Essayez STACK20 (-20 %) ou DEV50 (-50,00 €).`,
      telemetry,
    },
    { status: 422 }
  );
}
