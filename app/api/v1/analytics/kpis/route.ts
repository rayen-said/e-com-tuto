import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function GET() {
  const store = getStore();
  const { ordersCount, sessionsCount, totalRevenueTTC, avgOrdersPerCustomer, cac } = store.kpis;
  const aov = +(totalRevenueTTC / ordersCount).toFixed(2);
  const conv = +((ordersCount / sessionsCount) * 100).toFixed(2);
  const ltvCac = +((aov * avgOrdersPerCustomer) / cac).toFixed(2);

  const telemetry: TelemetryPayload = {
    method: 'GET',
    path: '/api/v1/analytics/kpis',
    status: 200,
    cacheStatus: 'MISS',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 14 },
    ],
    summary:
      'Agrégation OLAP des KPIs d’économie numérique (AOV, Conversion, Ratio LTV:CAC, Latence P99) sur le réplica analytique PostgreSQL 16.',
    resBody: {
      commandes: ordersCount,
      taux_conversion_pct: conv,
      panier_moyen_aov_eur: aov,
      ratio_ltv_cac: ltvCac,
    },
    redisCmd: 'GET "analytics:kpis:live" -- MISS\nSETEX "analytics:kpis:live" 30 "..."',
    sqlQuery: `SELECT COUNT(*) AS nb_commandes,\n       ROUND(AVG(total_ttc), 2) AS panier_moyen_aov,\n       ROUND(COUNT(*)::numeric / ${sessionsCount} * 100, 2) AS taux_conversion_pct,\n       PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS latence_p99\nFROM orders\nWHERE status = 'PAID' AND created_at >= NOW() - INTERVAL '30 days';`,
    explainPlan: `Aggregate (cost=24.10..24.12 rows=1) (actual time=3.42..3.45 ms)\n  -> Index Only Scan using idx_orders_status_date on orders (actual rows=${ordersCount})\nExecution Time: 3.61 ms`,
  };

  return NextResponse.json({ kpis: store.kpis, telemetry }, { status: 200 });
}
