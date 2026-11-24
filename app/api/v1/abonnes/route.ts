import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';
import type { TelemetryPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { email?: string; consentement_rgpd?: boolean };
  try {
    body = (await req.json()) as { email?: string; consentement_rgpd?: boolean };
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
  const store = getStore();
  const email = String(body.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { erreur: 'Adresse e-mail invalide.' },
      { status: 400 }
    );
  }
  const rgpd = Boolean(body.consentement_rgpd);

  if (!rgpd) {
    return NextResponse.json(
      { erreur: 'Consentement RGPD requis.' },
      { status: 400 }
    );
  }

  const alreadyExists = store.subscribers.has(email.toLowerCase());
  store.subscribers.add(email.toLowerCase());

  const telemetry: TelemetryPayload = {
    method: 'POST',
    path: '/api/v1/abonnes',
    status: alreadyExists ? 200 : 201,
    cacheStatus: 'ACID',
    maxHopIndex: 4,
    hops: [
      { node: 'Edge CDN', ms: 3 },
      { node: 'API', ms: 5 },
      { node: 'Redis', ms: 1 },
      { node: 'PostgreSQL', ms: 8 },
    ],
    summary: `Enregistrement idempotent de l’abonné « ${email} » avec preuve de consentement RGPD (ON CONFLICT DO NOTHING).`,
    reqBody: { email, consentement_rgpd: true, source: 'footer_stackcraft' },
    resBody: {
      statut: alreadyExists ? 'DEJA_INSCRIT' : 'INSCRIT',
      email,
      double_optin: 'envoye',
    },
    redisCmd: 'INCR metrics:newsletter:signups',
    sqlQuery: `INSERT INTO newsletter_subscribers (email, rgpd_consent_at, ip_hash)\nVALUES ('${email.replace(/'/g, "''")}', NOW(), 'sha256:9f82c1...')\nON CONFLICT (email) DO NOTHING\nRETURNING id, rgpd_consent_at;`,
    explainPlan:
      'Insert on newsletter_subscribers (actual time=0.71..0.74 ms)\n  Conflict Resolution: NOTHING (index newsletter_subscribers_email_key)\nExecution Time: 0.88 ms',
  };

  return NextResponse.json(
    {
      statut: alreadyExists ? 'DEJA_INSCRIT' : 'INSCRIT',
      message:
        alreadyExists
          ? `Cette adresse est déjà inscrite (idempotence ON CONFLICT).`
          : `Inscription confirmée pour ${email} (consentement RGPD horodaté).`,
      telemetry,
    },
    { status: alreadyExists ? 200 : 201 }
  );
}
