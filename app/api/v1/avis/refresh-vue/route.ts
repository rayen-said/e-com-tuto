import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  const store = getStore();
  const allReviews = store.products.reduce((acc, p) => acc + p.reviewCount, 0);
  const totalRating = store.products.reduce(
    (sum, p) => sum + p.rating * p.reviewCount,
    0
  );
  const moyenneGlobale = allReviews > 0 ? +(totalRating / allReviews).toFixed(2) : 0;

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/avis/refresh-vue',
    status: 200,
    cacheStatus: 'ACID',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 6 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 21 },
    ],
    summary:
      'Rafraîchissement sans blocage (CONCURRENTLY) de la vue matérialisée mv_notes_produits et invalidation du cache des moyennes.',
    resBody: {
      vue: 'mv_notes_produits',
      moyenne_globale: moyenneGlobale,
      total_avis: allReviews,
      mode: 'CONCURRENTLY',
    },
    redisCmd: 'DEL "reviews:summary:global"',
    sqlQuery:
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_notes_produits;\nSELECT product_id, avg_rating, review_count FROM mv_notes_produits ORDER BY avg_rating DESC;',
    explainPlan:
      'Refresh Materialized View Concurrently (mv_notes_produits)\n  -> Unique Index Scan on idx_mv_notes_product_id (zero read lock)\nExecution Time: 19.42 ms',
  };

  return NextResponse.json({ ok: true, telemetry }, { status: 200 });
}
