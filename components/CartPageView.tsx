'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatEuro } from '@/lib/format';
import { useStore } from './StoreProvider';
import { IconArrowRight, IconCart, IconMinus, IconPlus, IconTrash } from './Icons';

export default function CartPageView() {
  const {
    products,
    cart,
    totals,
    promoFeedback,
    cartMutatingId,
    promoSubmitting,
    updateQty,
    removeItem,
    applyPromo,
    openLayerModal,
  } = useStore();

  const [promoInput, setPromoInput] = useState(cart.promoCode ?? '');

  function submitPromo(explicit?: string) {
    const code = (explicit !== undefined ? explicit : promoInput).trim().toUpperCase();
    setPromoInput(code);
    void applyPromo(code);
  }

  const hashPairs = cart.items.map((i) => `"prod_${i.productId}": "${i.qty}"`);
  if (cart.promoCode) hashPairs.push(`"promo_code": "${cart.promoCode}"`);

  return (
    <section id="layer-5" data-layer="5" className="xray-layer space-y-8">
      <button
        type="button"
        onClick={() => openLayerModal(5)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[5] Panier &amp; Session Redis Hash</span>
        <span className="underline">Analyser</span>
      </button>

      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0b1220]">Votre panier</h1>
          <p className="text-sm text-slate-600 mt-1">
            Stocké en mémoire dans un Redis Hash avec TTL 1 800 s, remises serveur et TVA 20 %.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-xs font-semibold">
            cart:usr_9482
          </span>
          <span className="px-2.5 py-1 rounded bg-[#fafafa] border border-slate-200 text-slate-700 font-mono text-xs">
            TTL 1800 s
          </span>
        </div>
      </div>

      {/* Inspection en direct du Redis Hash */}
      <div className="rounded-lg bg-[#fafafa] border border-slate-200 px-4 py-3 font-mono text-xs text-[#0b1220] overflow-x-auto">
        <span className="tok-cmd">HGETALL</span> cart:usr_9482 &rarr;{' '}
        {cart.items.length === 0 ? (
          <span className="text-slate-600">{'{ }'} (clé absente ou expirée)</span>
        ) : (
          <>
            <span className="text-emerald-700">{`{ ${hashPairs.join(', ')} }`}</span>
            <span className="text-slate-600"> · TTC : {formatEuro(totals.totalTTC)}</span>
          </>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="py-14 px-6 rounded-xl bg-[#fafafa] border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <IconCart className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0b1220]">Votre panier Redis est vide</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Ajoutez un kit d&apos;architecture depuis le catalogue pour observer l&apos;exécution
              des commandes{' '}
              <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
                HSET
              </code>{' '}
              et{' '}
              <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
                HINCRBY
              </code>{' '}
              sur <code className="font-mono text-xs text-cyan-800">cart:usr_9482</code>.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
          >
            <span>Parcourir le catalogue</span>
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Liste des articles */}
          <div className="lg:col-span-7 divide-y divide-slate-200 border-y border-slate-200">
            {cart.items.map((item) => {
              const p = products.find((x) => x.id === item.productId);
              if (!p) return null;
              const busy = cartMutatingId === p.id;
              return (
                <div
                  key={item.productId}
                  className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600">
                      <span>{p.sku}</span>
                      <span>·</span>
                      <span>Stock : {p.stock}</span>
                    </div>
                    <h2 className="text-base font-semibold text-[#0b1220]">
                      <Link
                        href={`/produits/${p.id}`}
                        className="hover:text-cyan-800 transition-colors"
                      >
                        {p.name}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-600 font-mono tabular-nums">
                      {formatEuro(p.priceHT)} HT / unité
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={`Diminuer la quantité de ${p.name}`}
                        onClick={() => void updateQty(p.id, -1)}
                        className="p-2 text-slate-700 hover:text-[#0b1220] hover:bg-[#fafafa] rounded-l-lg disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                      >
                        <IconMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-mono tabular-nums font-semibold text-[#0b1220]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        disabled={busy || item.qty >= p.stock}
                        aria-label={`Augmenter la quantité de ${p.name}`}
                        onClick={() => void updateQty(p.id, 1)}
                        className="p-2 text-slate-700 hover:text-[#0b1220] hover:bg-[#fafafa] rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[92px]">
                      <span className="block font-mono tabular-nums text-sm font-semibold text-[#0b1220]">
                        {formatEuro(p.priceHT * item.qty)}
                      </span>
                      <span className="block font-mono text-[11px] text-slate-600">HT</span>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`Supprimer ${p.name} du panier`}
                      onClick={() => void removeItem(p.id)}
                      className="p-2 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Récapitulatif + Codes promo + CTA Paiement */}
          <aside className="lg:col-span-5 rounded-xl bg-[#fafafa] border border-slate-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-[#0b1220]">Récapitulatif et promotions</h2>

            {/* Moteur codes promotionnels */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="promo-input" className="text-xs font-medium text-slate-700">
                  Code promotionnel
                </label>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    disabled={promoSubmitting}
                    onClick={() => submitPromo('STACK20')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-cyan-600 text-cyan-800 transition-colors disabled:opacity-50"
                  >
                    STACK20 (-20 %)
                  </button>
                  <button
                    type="button"
                    disabled={promoSubmitting}
                    onClick={() => submitPromo('DEV50')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-cyan-600 text-cyan-800 transition-colors disabled:opacity-50"
                  >
                    DEV50 (-50 €)
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitPromo();
                    }
                  }}
                  placeholder="Ex : STACK20 ou DEV50"
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono uppercase text-[#0b1220] placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                />
                <button
                  type="button"
                  disabled={promoSubmitting}
                  onClick={() => submitPromo()}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 hover:border-[#0b1220] text-xs font-medium text-[#0b1220] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                >
                  {promoSubmitting ? 'Validation...' : 'Appliquer'}
                </button>
              </div>

              {promoFeedback && (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    promoFeedback.tone === 'success'
                      ? 'text-emerald-700'
                      : promoFeedback.tone === 'warn'
                        ? 'text-amber-800'
                        : 'text-rose-700'
                  }`}
                >
                  {promoFeedback.text}
                </p>
              )}
            </div>

            {/* Détail chiffré */}
            <dl className="space-y-2 text-sm pt-4 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <dt>Sous-total HT ({totals.totalQty} article{totals.totalQty > 1 ? 's' : ''})</dt>
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
                <dt>Net HT</dt>
                <dd className="font-mono tabular-nums text-[#0b1220]">
                  {formatEuro(totals.netHT)}
                </dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>TVA (20 %)</dt>
                <dd className="font-mono tabular-nums text-[#0b1220]">{formatEuro(totals.tva)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#0b1220] pt-3 border-t border-slate-200">
                <dt>Total TTC</dt>
                <dd className="font-mono tabular-nums">{formatEuro(totals.totalTTC)}</dd>
              </div>
            </dl>

            <div className="space-y-2.5 pt-1">
              <Link
                href="/paiement"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
              >
                <span>Passer au paiement ACID</span>
                <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalogue"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
