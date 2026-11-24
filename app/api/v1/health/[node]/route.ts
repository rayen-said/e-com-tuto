import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ node: string }> }
) {
  const { node } = await context.params;
  const store = getStore();

  const configs: Record<string, TelemetryPayload & { nodeName: string }> = {
    edge: {
      nodeName: 'Edge CDN Anycast',
      method: 'GET',
      path: '/api/v1/health/edge-cdn',
      status: 200,
      maxHopIndex: 1,
      cacheStatus: 'EDGE_HIT',
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 0 },
        { node: 'Redis', ms: 0 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary:
        'Sonde Edge CDN Anycast (Paris CDG1) : terminaison TLS 1.3 active, HTTP/3 QUIC opérationnel, 0 % de perte de paquets.',
      redisCmd: '-- Terminaison au niveau Edge CDN avant l’origine --',
      sqlQuery: '-- Requête interceptée par le nœud Edge Anycast CDG1 --',
      explainPlan: 'BGP Anycast Route -> PoP CDG1 (3 ms RTT).',
      resBody: {
        noeud: 'Edge CDN Anycast',
        pop: 'CDG1-Paris',
        protocole: 'HTTP/3 QUIC',
        tls: '1.3',
        statut: 'SAIN',
      },
    },
    api: {
      nodeName: 'API REST Gateway',
      method: 'GET',
      path: '/api/v1/health/api-gateway',
      status: 200,
      maxHopIndex: 2,
      cacheStatus: 'EDGE_HIT',
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 5 },
        { node: 'Redis', ms: 0 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary:
        'Vérification API REST JSON + JWT : validation signature RS256 active, pool de connexions PgBouncer à 18 % de charge.',
      redisCmd: '-- Vérification JWT stateless en mémoire API --',
      sqlQuery: '-- Contrôle stateless au niveau API REST --',
      explainPlan: 'JWT Verify (RS256) : 0.4 ms | Rate Limit OK (42/1000 req/min).',
      resBody: {
        noeud: 'API REST Gateway',
        auth: 'JWT RS256',
        replicas_actifs: 6,
        statut: 'SAIN',
      },
    },
    redis: {
      nodeName: 'Redis 7.2 Cluster',
      method: 'GET',
      path: '/api/v1/health/redis',
      status: 200,
      maxHopIndex: 3,
      cacheStatus: 'HIT',
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 4 },
        { node: 'Redis', ms: 1 },
        { node: 'PostgreSQL', ms: 0 },
      ],
      summary:
        'PING Redis 7.2 : PONG en 1 ms, taux de succès cache (Hit Ratio) de 92,4 %, mémoire utilisée 412 Mo / 4 Go.',
      redisCmd: 'PING\nINFO stats\nTTL cart:usr_9482',
      sqlQuery: '-- Sonde mémoire Redis uniquement --',
      explainPlan: 'Redis PING -> PONG (0.31 ms) | keyspace_hits: 92.4 %.',
      resBody: {
        noeud: 'Redis 7.2 Cluster',
        reponse: 'PONG',
        hit_ratio: '92,4 %',
        cle_panier: 'cart:usr_9482',
      },
    },
    postgres: {
      nodeName: 'PostgreSQL 16.4 Primaire',
      method: 'GET',
      path: '/api/v1/health/postgresql',
      status: 200,
      maxHopIndex: 4,
      cacheStatus: 'ACID',
      hops: [
        { node: 'Edge CDN', ms: 3 },
        { node: 'API', ms: 4 },
        { node: 'Redis', ms: 1 },
        { node: 'PostgreSQL', ms: 6 },
      ],
      summary:
        'Sonde PostgreSQL 16 Primary : réplication synchrone WAL à 0 ms de retard, isolation ACID opérationnelle.',
      redisCmd: '-- Bypass cache pour sonde directe base primaire --',
      sqlQuery:
        'SELECT version(), pg_is_in_recovery(), count(*) AS produits_actifs\nFROM products WHERE active = true;',
      explainPlan:
        'Aggregate (cost=1.12..1.13 rows=1) (actual time=0.41..0.42 ms)\n  -> Seq Scan on products (actual rows=6 loops=1)\nExecution Time: 0.48 ms',
      resBody: {
        noeud: 'PostgreSQL 16.4 Primary',
        isolation: 'READ COMMITTED (ACID)',
        replique_lag_ms: 0,
        produits_actifs: store.products.length,
      },
    },
  };

  const config = configs[node];
  if (!config) {
    return NextResponse.json({ erreur: 'Nœud inconnu' }, { status: 404 });
  }

  const { nodeName, ...telemetry } = config;
  return NextResponse.json({ nodeName, telemetry }, { status: 200 });
}
