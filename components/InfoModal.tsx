'use client';

import { LAYERS_INFO } from '@/lib/data';
import { IconX } from './Icons';

export type InfoModalState =
  | { type: 'layer'; num: number }
  | { type: 'legal'; kind: 'rgpd' | 'pcidss' }
  | null;

interface InfoModalProps {
  modal: InfoModalState;
  onClose: () => void;
  onNavigateToLayer: (num: number) => void;
  onLayerDemoAction: (num: number) => void;
}

export default function InfoModal({
  modal,
  onClose,
  onNavigateToLayer,
  onLayerDemoAction,
}: InfoModalProps) {
  if (!modal) return null;

  let badge = '';
  let title = '';

  if (modal.type === 'layer') {
    const info = LAYERS_INFO[modal.num];
    if (!info) return null;
    badge = `Couche [${modal.num}] / 7`;
    title = info.title;
  } else if (modal.kind === 'rgpd') {
    badge = 'Conformité UE · RGPD';
    title = 'Politique RGPD & Protection des Données Personnelles';
  } else {
    badge = 'Sécurité Bancaire · PCI-DSS v4.0';
    title = 'Attestation de Conformité PCI-DSS Niveau 1';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-50 bg-[#f5f5f4]/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[86vh] overflow-y-auto shadow-popover">
        <div className="px-5 py-4 bg-[#fafafa] border-b border-slate-200 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px] font-semibold shrink-0">
              {badge}
            </span>
            <h3 id="info-modal-title" className="text-sm sm:text-base font-semibold text-[#0b1220] truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Fermer la fenêtre"
            className="p-1.5 rounded-md text-slate-600 hover:text-[#0b1220] hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-700">
          {modal.type === 'layer' ? (
            (() => {
              const info = LAYERS_INFO[modal.num];
              return (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {info.stack.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded border border-cyan-200 bg-cyan-50 text-cyan-800 font-mono text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-200 border-y border-slate-200">
                    <div className="py-4 space-y-1.5">
                      <h4 className="text-xs font-semibold text-[#0b1220]">
                        Architecture technique
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{info.architecture}</p>
                    </div>

                    <div className="py-4 space-y-1.5">
                      <h4 className="text-xs font-semibold text-[#0b1220]">
                        Impact sur l&apos;économie numérique (Conversion, AOV, LTV/CAC)
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{info.economics}</p>
                    </div>

                    <div className="py-4 space-y-1.5">
                      <h4 className="text-xs font-semibold text-amber-800">
                        Piège de production à éviter
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{info.pitfalls}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigateToLayer(modal.num)}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-300 text-xs font-medium text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      Ouvrir la page de la couche [{modal.num}]
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onLayerDemoAction(modal.num)}
                        className="px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                      >
                        {info.demoLabel}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-200 text-xs font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </>
              );
            })()
          ) : modal.kind === 'rgpd' ? (
            <>
              <p className="text-sm text-slate-600 leading-relaxed">
                StackCraft Commerce applique le principe de{' '}
                <strong className="text-[#0b1220]">Protection des Données dès la Conception</strong>{' '}
                (« Privacy by Design ») conformément au Règlement (UE) 2016/679 (RGPD) :
              </p>
              <ul className="space-y-2.5 text-sm text-slate-600 list-disc pl-5">
                <li>
                  <strong className="text-[#0b1220]">Minimisation et chiffrement :</strong> les
                  adresses e-mail et données de facturation sont chiffrées au repos (AES-256-GCM) et
                  en transit (TLS 1.3).
                </li>
                <li>
                  <strong className="text-[#0b1220]">Consentement explicite (Opt-in) :</strong>{' '}
                  chaque abonnement newsletter enregistre un horodatage{' '}
                  <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 text-cyan-800">
                    rgpd_consent_at
                  </code>{' '}
                  opposable.
                </li>
                <li>
                  <strong className="text-[#0b1220]">Droit à l&apos;effacement (Art. 17) :</strong>{' '}
                  l&apos;endpoint{' '}
                  <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 text-cyan-800">
                    DELETE /api/v1/rgpd/effacement
                  </code>{' '}
                  (endpoint d&apos;architecture de référence, simulé dans cette démo) anonymise les
                  PII tout en préservant les factures obligatoires (conservation légale 10 ans).
                </li>
                <li>
                  <strong className="text-[#0b1220]">Durée de vie des sessions :</strong> le panier
                  Redis{' '}
                  <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 text-cyan-800">
                    cart:usr_9482
                  </code>{' '}
                  expire automatiquement après 30 minutes d&apos;inactivité (TTL 1 800 s).
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                >
                  Compris
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 leading-relaxed">
                Notre tunnel de paiement est architecturé selon le périmètre allégé{' '}
                <strong className="text-[#0b1220]">SAQ-A</strong> afin qu&apos;aucun numéro de carte
                bancaire (PAN) ou cryptogramme (CVV) ne transite jamais par nos serveurs applicatifs
                :
              </p>
              <ul className="space-y-2.5 text-sm text-slate-600 list-disc pl-5">
                <li>
                  <strong className="text-[#0b1220]">Tokenisation client :</strong> les champs
                  bancaires sont hébergés dans des iframes isolées Stripe / PayPal / Apple Pay
                  renvoyant un jeton éphémère (
                  <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 text-cyan-800">
                    tok_1Q8x...
                  </code>
                  ).
                </li>
                <li>
                  <strong className="text-[#0b1220]">
                    Authentification forte 3D-Secure 2 (DSP2) :
                  </strong>{' '}
                  challenge biométrique déclenché automatiquement pour limiter la fraude.
                </li>
                <li>
                  <strong className="text-[#0b1220]">Clés d&apos;idempotence :</strong> chaque
                  tentative porte un{' '}
                  <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 text-cyan-800">
                    Idempotency-Key
                  </code>{' '}
                  unique garantissant l&apos;absence de double débit.
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                >
                  Fermer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
