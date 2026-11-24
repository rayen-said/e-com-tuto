import { NextRequest, NextResponse } from 'next/server';
import { getSupportAutoReply } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { message?: string };
  try {
    body = (await req.json()) as { message?: string };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const clean = String(body.message || '').trim().slice(0, 500);

  if (!clean) {
    return NextResponse.json({ erreur: 'Message vide' }, { status: 400 });
  }

  const reply = getSupportAutoReply(clean);

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/support/messages',
    status: 201,
    cacheStatus: 'ACID',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 7 },
    ],
    summary:
      'Message support persisté dans PostgreSQL puis diffusé en temps réel via Redis Pub/Sub (PUBLISH support:channel:usr_9482).',
    reqBody: { user_id: 'usr_9482', message: clean },
    resBody: {
      statut: 'DIFFUSE',
      canal_pubsub: 'support:channel:usr_9482',
      reponse_auto: reply,
    },
    redisCmd: `PUBLISH support:channel:usr_9482 "${clean.replace(/"/g, '\\"')}"`,
    sqlQuery: `INSERT INTO support_messages (session_id, user_id, role, content)\nVALUES ('sup_9482', 'usr_9482', 'customer', '${clean.replace(/'/g, "''")}')\nRETURNING id, created_at;`,
    explainPlan:
      'Insert on support_messages (actual time=0.49..0.52 ms) + Redis PUBLISH (0.21 ms).',
  };

  return NextResponse.json({ reply, telemetry }, { status: 201 });
}
