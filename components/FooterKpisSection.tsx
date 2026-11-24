'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { formatEuro, formatPercent } from '@/lib/format';
import type { KpiMetrics } from '@/lib/types';
import { IconArrowRight, IconMessage } from './Icons';

interface FooterKpisSectionProps {
  kpis: KpiMetrics;
  p99Latency: number;
  kpiFlashKey: number;
  inspectingKpis: boolean;
  onInspectKpis: () => void;
  onNewsletterSubmit: (email: string, consent: boolean) => Promise<{ ok: boolean; message: string }>;
  onOpenLegalModal: (kind: 'rgpd' | 'pcidss') => void;
  onOpenSupport: () => void;
  onOpenLayerModal: (num: number) => void;
}

export default function FooterKpisSection({
  kpis,
  p99Latency,
  kpiFlashKey,
  inspectingKpis,
  onInspectKpis,
  onNewsletterSubmit,
  onOpenLegalModal,
  onOpenSupport,
  onOpenLayerModal,
}: FooterKpisSectionProps) {
  const [email, setEmail] = useState('');
  const [rgpdChecked, setRgpdChecked] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const conv = (kpis.ordersCount / kpis.sessionsCount) * 100;
  const aov = kpis.totalRevenueTTC / kpis.ordersCount;
  const ltv = aov * kpis.avgOrdersPerCustomer;
  const ltvCacRatio = ltv / kpis.cac;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback({ ok: false, text: 'Veuillez saisir une adresse e-mail valide.' });
      return;
    }
    if (!rgpdChecked) {
      setFeedback({
        ok: false,
        text: 'Le consentement explicite RGPD est obligatoire pour enregistrer votre inscription.',
      });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    const res = await onNewsletterSubmit(email.trim(), rgpdChecked);
    setSubmitting(false);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setEmail('');
    }
  }

  return (
    <footer
      id="layer-7"
      data-layer="7"
      className="border-t border-slate-200 bg-[#fafafa] mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Bandeau KPIs d'économie numérique — Couche [7] */}
        <div className="xray-layer bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <button
            type="button"
            onClick={() => onOpenLayerModal(7)}
            className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          >
            <span>[7] KPIs Économie Numérique, RGPD &amp; Support</span>
            <span className="underline">Analyser</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#0b1220]">
                KPIs d&apos;économie numérique en temps réel
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Recalculés automatiquement après chaque commande ACID validée.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={inspectingKpis}
                onClick={onInspectKpis}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-[#fafafa] border border-slate-200 hover:border-cyan-600 text-xs font-medium text-[#0b1220] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              >
                {inspectingKpis ? 'Exécution SQL...' : 'Inspecter SQL OLAP'}
              </button>
              <Link
                href="/laboratoire"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              >
                <span>Ouvrir le laboratoire</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div
              key={`conv-${kpiFlashKey}`}
              className={`py-3 sm:py-1 sm:pr-5 first:pt-0 sm:first:pl-0 transition-colors ${
                kpiFlashKey > 0 ? 'kpi-flash rounded-md px-2' : ''
              }`}
            >
              <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                <span>Taux de conversion</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-600">
                  {kpis.ordersCount}/{kpis.sessionsCount.toLocaleString('fr-FR')}
                </span>
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
                {formatPercent(conv)}
              </dd>
              <p className="text-xs text-slate-600 mt-1">Commandes validées / sessions</p>
            </div>

            <div
              key={`aov-${kpiFlashKey}`}
              className={`py-3 sm:py-1 sm:px-5 transition-colors ${
                kpiFlashKey > 0 ? 'kpi-flash rounded-md' : ''
              }`}
            >
              <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                <span>Panier moyen (AOV)</span>
                <span className="font-mono text-[11px] text-cyan-700">
                  {kpiFlashKey > 0 ? 'Mis à jour' : 'Temps réel'}
                </span>
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
                {formatEuro(aov)}
              </dd>
              <p className="text-xs text-slate-600 mt-1">Chiffre d&apos;affaires TTC / commandes</p>
            </div>

            <div
              key={`ltv-${kpiFlashKey}`}
              className={`py-3 sm:py-1 sm:px-5 transition-colors ${
                kpiFlashKey > 0 ? 'kpi-flash rounded-md' : ''
              }`}
            >
              <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                <span>Ratio LTV : CAC</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-600">
                  CAC {kpis.cac} €
                </span>
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
                {ltvCacRatio.toLocaleString('fr-FR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                : 1
              </dd>
              <p className="text-xs text-slate-600 mt-1">Cible rentabilité SaaS &ge; 3 : 1</p>
            </div>

            <div className="py-3 sm:py-1 sm:pl-5 last:pb-0">
              <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                <span>Latence API P99</span>
                <span className="font-mono text-[11px] text-cyan-700">
                  {p99Latency < 50 ? 'Optimal' : p99Latency < 100 ? 'SLO OK' : 'Élevé'}
                </span>
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
                {p99Latency} ms
              </dd>
              <p className="text-xs text-slate-600 mt-1">SLO cible &lt; 100 ms (télémétrie)</p>
            </div>
          </dl>
        </div>

        {/* Newsletter + Conformité + Support */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <h3 className="text-sm font-semibold text-[#0b1220]">
              Veille architecture e-commerce (Newsletter)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Déclenche{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
                POST /api/v1/abonnes
              </code>{' '}
              avec opt-in RGPD et déduplication SQL{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
                ON CONFLICT
              </code>
              .
            </p>
            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5" noValidate>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architecte@entreprise.fr"
                  aria-label="Adresse e-mail pour la newsletter"
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-[#0b1220] placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                >
                  {submitting ? 'Enregistrement...' : "S'abonner"}
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rgpdChecked}
                  onChange={(e) => setRgpdChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-600"
                />
                <span>
                  J&apos;accepte le traitement de mon e-mail conformément au RGPD (désinscription en
                  1 clic).
                </span>
              </label>
              {feedback && (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    feedback.ok ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {feedback.text}
                </p>
              )}
            </form>
          </div>

          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#0b1220]">Conformité et gouvernance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultez les engagements réglementaires européens et bancaires appliqués sur cette
              plateforme.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenLegalModal('rgpd')}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              >
                Politique RGPD &amp; Données
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalModal('pcidss')}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              >
                Attestation PCI-DSS Niv. 1
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#0b1220]">Support ingénierie</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chat temps réel via{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
                POST /api/v1/support/messages
              </code>{' '}
              et Redis Pub/Sub.
            </p>
            <button
              type="button"
              onClick={onOpenSupport}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 hover:border-[#0b1220] text-[#0b1220] font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              <IconMessage className="w-4 h-4 text-slate-600" />
              <span>Ouvrir le chat support</span>
            </button>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            &copy; 2026 StackCraft Commerce — Boutique interactive et tutoriel « Comment créer un
            site e-commerce ».
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Next.js App Router · Tailwind CSS · Redis 7.2 · PostgreSQL 16
          </span>
        </div>
      </div>
    </footer>
  );
}
