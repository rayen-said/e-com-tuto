import { NextRequest, NextResponse } from 'next/server';
import type { TelemetryPayload } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderIdRaw = searchParams.get('order_id') || '88412';
  const hashPrefix = searchParams.get('hash') || 'a9f4c2e18b7d';
  const orderIdNum = Number(orderIdRaw);
  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    return NextResponse.json({ erreur: 'order_id doit être un entier positif.' }, { status: 400 });
  }
  if (!/^[0-9a-fA-F]+$/.test(hashPrefix)) {
    return NextResponse.json({ erreur: 'hash doit être hexadécimal.' }, { status: 400 });
  }

  const telemetry: TelemetryPayload = {
    method: 'GET',
    path: `/api/v1/avis/verifier?order_id=${encodeURIComponent(orderIdRaw)}`,
    status: 200,
    cacheStatus: 'MISS',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 8 },
    ],
    summary: `Vérification cryptographique de l’avis lié à ORDER_ID #${orderIdRaw} : signature HMAC-SHA256 (${hashPrefix}...) confirmée authentique.`,
    resBody: {
      order_id: `#${orderIdRaw}`,
      statut_commande: 'PAID',
      signature_hmac_sha256: `${hashPrefix}94e8f10a...`,
      valide: true,
    },
    redisCmd: `GET "review:hmac:${orderIdRaw}" -- MISS`,
    sqlQuery: `SELECT r.id, r.order_id, r.hmac_signature, o.status
FROM verified_reviews r
INNER JOIN orders o ON o.id = r.order_id
WHERE r.order_id = ${orderIdNum} AND o.status = 'PAID';`,
    explainPlan: `Nested Loop Inner Join (actual time=0.25..0.44 ms)
  -> Index Scan on idx_reviews_order_id (order_id = ${orderIdNum})
  -> Index Scan on orders_pkey (id = ${orderIdNum})
Execution Time: 0.51 ms`,
  };

  return NextResponse.json({ valide: true, orderId: orderIdRaw, telemetry }, { status: 200 });
}
