'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { buildCheckoutPreviewSql } from '@/lib/catalog-utils';
import { formatEuro, highlightSQL } from '@/lib/format';
import type { CheckoutProvider } from '@/lib/types';
import { useStore } from './StoreProvider';
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconCreditCard,
  IconKey,
  IconRefresh,
  IconSmartphone,
} from './Icons';

const PROVIDER_LABELS: Record<CheckoutProvider, string> = {
  stripe: 'Stripe Carte (3DS2 · PCI-DSS)',
  paypal: 'PayPal OAuth2 (PKCE)',
  applepay: 'Apple Pay (Secure Enclave)',
};

const PROVIDERS: {
  id: CheckoutProvider;
  name: string;
  sub: string;
}[] = [
  { id: 'stripe', name: 'Stripe Carte', sub: '3D-Secure 2 · Token' },
  { id: 'paypal', name: 'PayPal OAuth2', sub: 'Flux OAuth 2.0' },
  { id: 'applepay', name: 'Apple Pay', sub: 'Biométrie NFC' },
];

function ProviderIcon({ id }: { id: CheckoutProvider }) {
  if (id === 'stripe') return <IconCreditCard className="w-4 h-4" />;
  if (id === 'paypal') return <IconKey className="w-4 h-4" />;
  return <IconSmartphone className="w-4 h-4" />;
}

export default function CheckoutPageView() {
  const {
    products,
    cart,
    totals,
    kpis,
    checkoutProvider,
    idempotencyKey,
    checkoutConfirmation,
    checkoutSubmitting,
    checkoutError,
    setCheckoutProvider,
    regenerateIdempotencyKey,
    resetCheckoutConfirmation,
    quickAddDemoProduct,
    executeCheckout,
    openLayerModal,
  } = useStore();

  const [customerName, setCustomerName] = useState('Camille Laurent');
  const [customerEmail, setCustomerEmail] = useState('camille.laurent@stackcraft.fr');

  const previewSql =
    cart.items.length > 0
      ? buildCheckoutPreviewSql(
          cart.items,
          kpis.lastOrderId + 1,
          idempotencyKey,
          checkoutProvider,
          totals.totalTTC
        )
      : '';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void executeCheckout(customerName, customerEmail);
  }

  return (
    <section id="layer-6" data-layer="6" className="xray-layer space-y-8">
      <button
        type="button"
        onClick={() => openLayerModal(6)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[6] Tunnel de Paiement ACID &amp; Verrouillage Pessimiste</span>
        <span className="underline">Analyser</span>
      </button>

      {/* En-tête de page */}
      <div className="pb-6 border-b border-slate-200 max-w-3xl space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1220]">
          Tunnel de paiement ACID et idempotence
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Chaque validation exécute une transaction PostgreSQL isolée avec verrouillage ligne{' '}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
            SELECT ... FOR UPDATE
          </code>
          , décrémente le stock réel, vide le panier Redis et recalcule les 4 KPIs.
        </p>
      </div>

      {/* Confirmation de commande après COMMIT ACID */}
      {checkoutConfirmation ? (
        <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <IconCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              {checkoutConfirmation.idempotentReplay ? (
                <span className="inline-block px-2.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-xs font-semibold">
                  REJEU IDEMPOTENT · AUCUN DOUBLE DÉBIT · ORDER_ID #{checkoutConfirmation.orderId}
                </span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold">
                  COMMIT ACID RÉUSSI · ORDER_ID #{checkoutConfirmation.orderId}
                </span>
              )}
              <h2 className="text-2xl font-semibold text-[#0b1220]">
                Paiement confirmé ({formatEuro(checkoutConfirmation.totalTTC)})
              </h2>
              <p className="text-xs text-slate-600">
                Clé d&apos;idempotence verrouillée :{' '}
                <code className="font-mono text-[#0b1220]">{checkoutConfirmation.usedKey}</code>
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-[#fafafa] border border-slate-200 p-4 space-y-2 text-xs sm:text-sm">
            <p className="font-semibold text-[#0b1220]">Effets réels appliqués à la boutique :</p>
            <ul className="space-y-1.5 text-slate-600">
              {checkoutConfirmation.purchasedSummary.map((x) => (
                <li key={x.product_id} className="flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-[#0b1220]">{x.nom}</strong> : stock décrémenté de{' '}
                    <span className="font-mono tabular-nums">{x.qty}</span> &rarr;{' '}
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      {x.nouveau_stock} restant(s)
                    </span>
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <IconCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <span>
                  Session Redis <code className="font-mono text-cyan-800">cart:usr_9482</code>{' '}
                  supprimée (<code className="font-mono">DEL</code>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <span>
                  Panier moyen (AOV), taux de conversion et ratio LTV : CAC recalculés en temps
                  réel.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/laboratoire"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors"
            >
              <span>Inspecter la transaction dans le laboratoire</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/catalogue"
              onClick={resetCheckoutConfirmation}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-300 text-[#0b1220] font-medium text-xs transition-colors"
            >
              Retourner au catalogue
            </Link>
          </div>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="py-14 px-6 rounded-xl bg-[#fafafa] border border-slate-200 text-center space-y-4">
          <h2 className="text-lg font-semibold text-[#0b1220]">
            Votre panier est actuellement vide
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Pour exécuter une transaction ACID réelle (
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
              BEGIN; SELECT ... FOR UPDATE; UPDATE inventory; INSERT INTO orders; COMMIT;
            </code>
            ), ajoutez d&apos;abord au moins un produit du catalogue.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => void quickAddDemoProduct()}
              className="px-4 py-2.5 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
            >
              Ajouter « Cluster PostgreSQL 16 » et continuer
            </button>
            <Link
              href="/catalogue"
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-[#0b1220] font-medium text-xs transition-colors"
            >
              Choisir dans le catalogue
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* En-tête Idempotency-Key */}
          <div className="p-4 rounded-xl bg-[#fafafa] border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-600">
                En-tête HTTP <code className="font-mono text-cyan-800">Idempotency-Key</code>{' '}
                (anti-double facturation)
              </span>
              <code className="block mt-1 text-xs sm:text-sm font-mono font-semibold text-[#0b1220] break-all">
                {idempotencyKey}
              </code>
            </div>
            <button
              type="button"
              onClick={regenerateIdempotencyKey}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:border-cyan-600 border border-slate-300 text-xs font-medium text-[#0b1220] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              <IconRefresh className="w-3.5 h-3.5 text-cyan-700" />
              <span>Régénérer UUID</span>
            </button>
          </div>

          {checkoutError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
            >
              <IconAlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Formulaire prestataire + client */}
            <div className="lg:col-span-7 space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-[#0b1220]">
                  Prestataire de paiement
                </legend>
                <div className="grid sm:grid-cols-3 gap-3">
                  {PROVIDERS.map((pr) => {
                    const active = checkoutProvider === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCheckoutProvider(pr.id)}
                        className={`p-3.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${
                          active
                            ? 'bg-cyan-50 border-cyan-600 text-[#0b1220]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div
                          className={`mb-2 ${active ? 'text-cyan-800' : 'text-slate-600'}`}
                        >
                          <ProviderIcon id={pr.id} />
                        </div>
                        <div className="text-xs font-semibold text-[#0b1220]">{pr.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{pr.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h2 className="text-sm font-semibold text-[#0b1220]">Client de démonstration</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Nom complet
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-[#0b1220] focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-[#0b1220] focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Aperçu Transaction SQL ACID */}
              <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0b1220]">
                    Transaction SQL ACID ({PROVIDER_LABELS[checkoutProvider]})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px]">
                    Verrou pessimiste
                  </span>
                </div>
                <pre
                  className="p-3.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220]"
                  dangerouslySetInnerHTML={{ __html: highlightSQL(previewSql) }}
                />
              </div>
            </div>

            {/* Récapitulatif commande */}
            <aside className="lg:col-span-5 rounded-xl bg-[#fafafa] border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#0b1220]">Récapitulatif</h2>
                <Link href="/panier" className="text-xs font-medium text-cyan-800 hover:underline">
                  Modifier le panier
                </Link>
              </div>

              <ul className="divide-y divide-slate-200 text-xs">
                {cart.items.map((i) => {
                  const p = products.find((x) => x.id === i.productId);
                  if (!p) return null;
                  return (
                    <li key={i.productId} className="py-2.5 flex justify-between gap-3">
                      <span className="text-[#0b1220] leading-snug">
                        <span className="font-mono tabular-nums font-semibold">{i.qty}×</span>{' '}
                        {p.name}
                      </span>
                      <span className="font-mono tabular-nums text-[#0b1220] shrink-0">
                        {formatEuro(p.priceHT * i.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <dl className="pt-3 border-t border-slate-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Sous-total HT</dt>
                  <dd className="font-mono tabular-nums text-[#0b1220]">
                    {formatEuro(totals.subtotalHT)}
                  </dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <dt>{totals.discountLabel}</dt>
                    <dd className="font-mono tabular-nums">-{formatEuro(totals.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <dt>TVA (20 %)</dt>
                  <dd className="font-mono tabular-nums text-[#0b1220]">
                    {formatEuro(totals.tva)}
                  </dd>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#0b1220] pt-2.5 border-t border-slate-200">
                  <dt>Total TTC</dt>
                  <dd className="font-mono tabular-nums">{formatEuro(totals.totalTTC)}</dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={checkoutSubmitting}
                className="w-full py-3 px-4 rounded-lg bg-[#0b1220] hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
              >
                {checkoutSubmitting
                  ? 'Exécution BEGIN...COMMIT...'
                  : `Confirmer et payer ${formatEuro(totals.totalTTC)}`}
              </button>
            </aside>
          </div>
        </form>
      )}
    </section>
  );
}
