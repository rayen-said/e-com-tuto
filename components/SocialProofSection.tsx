'use client';

import { RATING_DISTRIBUTION, VERIFIED_REVIEWS } from '@/lib/data';
import { IconCheck, IconClock, IconLock, IconRefresh, IconShieldCheck, IconStar } from './Icons';

interface SocialProofSectionProps {
  refreshingView: boolean;
  verifyingOrderId: string | null;
  onRefreshMaterializedView: () => void;
  onVerifySignature: (orderId: string, hashPrefix: string) => void;
  onOpenLayerModal: (num: number) => void;
}

export default function SocialProofSection({
  refreshingView,
  verifyingOrderId,
  onRefreshMaterializedView,
  onVerifySignature,
  onOpenLayerModal,
}: SocialProofSectionProps) {
  return (
    <section id="layer-4" data-layer="4" className="xray-layer space-y-10">
      <button
        type="button"
        onClick={() => onOpenLayerModal(4)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[4] Preuve Sociale &amp; Vue Matérialisée</span>
        <span className="underline">Analyser</span>
      </button>

      {/* En-tête de page sobre (sans kicker) */}
      <div className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1220]">
          Preuve sociale et avis vérifiés cryptographiquement
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Les notes agrégées sont pré-calculées dans la vue matérialisée{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
            mv_notes_produits
          </code>{' '}
          et chaque avis est rattaché à un{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
            ORDER_ID
          </code>{' '}
          signé HMAC-SHA256.
        </p>
      </div>

      {/* Bandeau d'engagements techniques en table de spécifications à filets (pas de cartes identiques) */}
      <div className="border-y border-slate-200 divide-y divide-slate-200">
        <div className="py-4 grid md:grid-cols-12 gap-3 items-baseline">
          <div className="md:col-span-4 flex items-center gap-2.5 text-sm font-semibold text-[#0b1220]">
            <IconShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>Conformité PCI-DSS Niveau 1</span>
          </div>
          <p className="md:col-span-6 text-sm text-slate-600 leading-relaxed">
            Zéro donnée de carte bancaire sur nos serveurs : tokenisation immédiate chez Stripe et
            PayPal sous chiffrement TLS 1.3.
          </p>
          <div className="md:col-span-2 md:text-right">
            <span className="font-mono text-xs text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              SAQ-A
            </span>
          </div>
        </div>

        <div className="py-4 grid md:grid-cols-12 gap-3 items-baseline">
          <div className="md:col-span-4 flex items-center gap-2.5 text-sm font-semibold text-[#0b1220]">
            <IconLock className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>Verrouillage ACID des stocks</span>
          </div>
          <p className="md:col-span-6 text-sm text-slate-600 leading-relaxed">
            Les transactions{' '}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
              SELECT ... FOR UPDATE
            </code>{' '}
            empêchent qu&apos;un dernier kit disponible soit vendu deux fois.
          </p>
          <div className="md:col-span-2 md:text-right">
            <span className="font-mono text-xs text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              PG 16 ACID
            </span>
          </div>
        </div>

        <div className="py-4 grid md:grid-cols-12 gap-3 items-baseline">
          <div className="md:col-span-4 flex items-center gap-2.5 text-sm font-semibold text-[#0b1220]">
            <IconClock className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>Garantie satisfait ou remboursé 30 jours</span>
          </div>
          <p className="md:col-span-6 text-sm text-slate-600 leading-relaxed">
            Remboursement automatisé par clé d&apos;idempotence et journalisation immuable dans le
            grand livre comptable PostgreSQL.
          </p>
          <div className="md:col-span-2 md:text-right">
            <span className="font-mono text-xs text-slate-700 bg-[#fafafa] border border-slate-200 px-2 py-0.5 rounded">
              30 jours
            </span>
          </div>
        </div>
      </div>

      {/* Distribution des notes (mv_notes_produits) + Avis vérifiés liés ORDER_ID */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 rounded-xl bg-[#fafafa] border border-slate-200 p-5 space-y-5">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <span className="text-xs font-mono font-semibold text-cyan-800">mv_notes_produits</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
              Lecture O(1)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold font-mono tabular-nums text-[#0b1220]">
              4,88
            </span>
            <div>
              <div className="flex items-center gap-0.5 text-amber-600" aria-label="Note moyenne 5 sur 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <IconStar key={i} className="w-3.5 h-3.5" />
                ))}
              </div>
              <span className="text-xs text-slate-600 block mt-1">Basé sur 412 avis vérifiés</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {RATING_DISTRIBUTION.map((row) => (
              <div key={row.stars} className="flex items-center gap-2.5">
                <span className="w-10 inline-flex items-center gap-1 font-mono tabular-nums text-slate-700">
                  <span>{row.stars}</span>
                  <IconStar className="w-3 h-3 text-amber-600" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.barClass}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono tabular-nums text-slate-600">
                  {row.pct} %
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={refreshingView}
            onClick={onRefreshMaterializedView}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 hover:border-cyan-600 text-xs font-mono font-medium text-[#0b1220] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          >
            <IconRefresh className={`w-3.5 h-3.5 text-cyan-700 ${refreshingView ? 'animate-spin' : ''}`} />
            <span>
              {refreshingView ? 'Rafraîchissement...' : 'REFRESH MATERIALIZED VIEW'}
            </span>
          </button>
        </div>

        {/* Avis vérifiés liés à un ORDER_ID */}
        <div className="lg:col-span-8 divide-y divide-slate-200 border-y border-slate-200">
          {VERIFIED_REVIEWS.map((review) => {
            const isVerifying = verifyingOrderId === review.orderId;
            return (
              <article key={review.orderId} className="py-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded border font-mono text-[11px] font-semibold ${review.badgeClass}`}
                    >
                      ORDER_ID #{review.orderId}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-600" aria-label="Note 5 sur 5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <IconStar key={i} className="w-3.5 h-3.5" />
                      ))}
                    </span>
                    <span className="font-mono text-xs text-slate-600">5/5</span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-600">
                    HMAC : {review.hashPrefix}...
                  </span>
                </div>

                <h2 className="text-base font-semibold text-[#0b1220]">{review.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-[#0b1220]">{review.author}</span>
                    <span> · {review.role}</span>
                  </div>

                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => onVerifySignature(review.orderId, review.hashPrefix)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-600 text-cyan-800 font-mono text-xs font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>{isVerifying ? 'Vérification...' : 'Vérifier HMAC-SHA256'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
