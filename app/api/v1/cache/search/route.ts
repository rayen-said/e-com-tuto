import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function DELETE() {
  const store = getStore();
  const count = store.searchCache.size;
  store.searchCache.clear();

  const telemetry: TelemetryPayload = {
    method: 'DELETE',
    path: '/api/v1/cache/search',
    status: 200,
    cacheStatus: 'WRITE',
    maxHopIndex: 3,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 4 },
      { node: 'Redis', ms: 2 },
      { node: 'PostgreSQL', ms: 0 },
    ],
    summary: `Invalidation manuelle du cache de recherche Redis (${count} clé(s) supprimée(s)). La prochaine recherche déclenchera un CACHE MISS vers PostgreSQL.`,
    redisCmd: `SCAN 0 MATCH "products:search:*" COUNT 100\nUNLINK products:search:*  -- (${count} clés purgées)`,
    sqlQuery: '-- Opération purement Redis (invalidation de cache).',
    explainPlan: 'Redis UNLINK non-bloquant exécuté en 0.6 ms.',
    resBody: { statut: 'cache_vide', cles_supprimees: count },
  };

  return NextResponse.json({ cles_supprimees: count, telemetry }, { status: 200 });
}
