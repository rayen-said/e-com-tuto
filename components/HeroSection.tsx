'use client';

import Link from 'next/link';
import { IconArrowRight, IconRefresh } from './Icons';

interface HeroSectionProps {
  ttfb: number;
  ssrPulseKey: number;
  replayingSsr: boolean;
  pingingNode: string | null;
  onReplaySSR: () => void;
  onPingNode: (node: 'edge' | 'api' | 'redis' | 'postgres') => void;
  onOpenLayerModal: (num: number) => void;
}

const TOPOLOGY_NODES: {
  id: 'edge' | 'api' | 'redis' | 'postgres';
  name: string;
  tag: string;
  desc: string;
}[] = [
  {
    id: 'edge',
    name: 'Edge CDN Anycast',
    tag: 'TLS 1.3',
    desc: 'Routage DNS Anycast vers Paris (CDG1), terminaison TLS 1.3 0-RTT et hydratation SSR.',
  },
  {
    id: 'api',
    name: 'API REST JSON + JWT',
    tag: 'Stateless',
    desc: 'Validation des jetons JWT RS256, limitation de débit et orchestration Cache-Aside.',
  },
  {
    id: 'redis',
    name: 'Redis 7.2 (Mémoire)',
    tag: '~1 ms',
    desc: 'Cache-Aside des recherches catalogue, panier en Redis Hash (cart:usr_9482) et Pub/Sub.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL 16 (ACID)',
    tag: 'GIN + MV',
    desc: 'Source de vérité relationnelle : index GIN tsvector, vues matérialisées et FOR UPDATE.',
  },
];

const ARCHITECTURE_ROUTES = [
  {
    layer: '[2]+[3]',
    href: '/catalogue',
    title: 'Catalogue & recherche prédictive',
    detail: '6 kits techniques, filtres SQL, tri et stratégie Cache-Aside Redis vs GIN tsvector.',
  },
  {
    layer: '[4]',
    href: '/avis',
    title: 'Preuve sociale & avis vérifiés',
    detail: 'Vue matérialisée mv_notes_produits en lecture O(1) et signatures HMAC-SHA256.',
  },
  {
    layer: '[5]',
    href: '/panier',
    title: 'Panier session Redis Hash',
    detail: 'Clé cart:usr_9482, codes promo STACK20 (-20 %) et DEV50 (-50 €), TVA 20 %.',
  },
  {
    layer: '[6]',
    href: '/paiement',
    title: 'Tunnel de paiement ACID',
    detail: 'Idempotency-Key UUID v4, Stripe / PayPal / Apple Pay et verrou SELECT ... FOR UPDATE.',
  },
  {
    layer: '[7]',
    href: '/laboratoire',
    title: 'Laboratoire télémétrie & KPIs',
    detail: 'Flux animé 5 nœuds, en-têtes HTTP/3, SQL/Redis EXPLAIN ANALYZE et KPIs OLAP.',
  },
] as const;

export default function HeroSection({
  ttfb,
  ssrPulseKey,
  replayingSsr,
  pingingNode,
  onReplaySSR,
  onPingNode,
  onOpenLayerModal,
}: HeroSectionProps) {
  return (
    <div className="space-y-14">
      {/* Couche [1] : Héro + Topologie système en direct */}
      <section
        id="layer-1"
        data-layer="1"
        key={ssrPulseKey > 0 ? `hero-${ssrPulseKey}` : 'hero-init'}
        className={`xray-layer py-4 sm:py-6 ${ssrPulseKey > 0 ? 'ssr-pulse rounded-xl' : ''}`}
      >
        <button
          type="button"
          onClick={() => onOpenLayerModal(1)}
          className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
        >
          <span>[1] Edge CDN, DNS, TLS 1.3 &amp; SSR</span>
          <span className="underline">Analyser</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Colonne gauche : proposition de valeur */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold tracking-tight text-[#0b1220] leading-[1.12]">
              Achetez des architectures cloud prêtes pour la production, tout en observant le code
              sous le capot.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              <strong className="font-semibold text-[#0b1220]">StackCraft Commerce</strong> est à la
              fois une boutique e-commerce fonctionnelle et un tutoriel interactif en 7 couches.
              Chaque interaction — recherche plein texte, consultation de fiche SQL, panier Redis
              Hash ou paiement ACID — alimente en direct le laboratoire de télémétrie HTTP/3 et{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
                EXPLAIN ANALYZE
              </code>
              .
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
              >
                <span>Explorer le catalogue (6 kits)</span>
                <IconArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                disabled={replayingSsr}
                onClick={onReplaySSR}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-300 hover:border-[#0b1220] text-[#0b1220] font-medium text-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
              >
                <IconRefresh className={`w-4 h-4 text-cyan-700 ${replayingSsr ? 'animate-spin' : ''}`} />
                <span>
                  {replayingSsr ? 'Rejeu SSR en cours...' : 'Rejouer la requête SSR'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLayerModal(1)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-cyan-800 hover:bg-cyan-50 border border-cyan-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              >
                <span className="font-mono">[1]</span>
                <span>Fiche couche Edge SSR</span>
              </button>
            </div>

            {/* Spécifications réseau sobres séparées par filets */}
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs">
              <div>
                <dt className="text-slate-600">Protocole</dt>
                <dd className="mt-1 font-mono font-semibold text-[#0b1220]">
                  HTTP/3 · QUIC · TLS 1.3
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">TTFB Edge SSR</dt>
                <dd className="mt-1 font-mono tabular-nums font-semibold text-cyan-800">
                  {ttfb} ms (PoP CDG1)
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Résolution DNS</dt>
                <dd className="mt-1 font-mono tabular-nums font-semibold text-[#0b1220]">
                  Anycast BGP · 3 ms
                </dd>
              </div>
            </dl>
          </div>

          {/* Colonne droite : Carte de topologie système en direct */}
          <div className="lg:col-span-6">
            <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-semibold text-[#0b1220]">
                    Topologie système en direct
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cliquez sur un nœud pour déclencher un contrôle de santé (Health Check).
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded border border-cyan-200 bg-cyan-50 text-cyan-800 font-mono tabular-nums text-[11px] font-medium">
                  SLA 99,99 %
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {TOPOLOGY_NODES.map((node) => {
                  const loading = pingingNode === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      disabled={loading}
                      onClick={() => onPingNode(node.id)}
                      className="text-left group p-3.5 rounded-lg bg-white border border-slate-200 hover:border-cyan-600 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b1220]">
                          <span
                            aria-hidden="true"
                            className={`w-2 h-2 rounded-full ${
                              loading ? 'bg-amber-600' : 'bg-cyan-600'
                            }`}
                          />
                          {node.name}
                        </span>
                        <span className="font-mono text-[11px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded shrink-0">
                          {loading ? 'Ping...' : node.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{node.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600">
                <span>Client &rarr; Edge Anycast &rarr; API JWT &rarr; Redis 7.2 &rarr; PostgreSQL 16</span>
                <span className="text-cyan-800 font-medium">SSR actif</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours des 7 couches — Liste éditoriale séparée par filets (sans rangée de cartes identiques) */}
      <section aria-labelledby="architecture-index-heading" className="border-t border-slate-200 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 id="architecture-index-heading" className="text-xl font-semibold tracking-tight text-[#0b1220]">
              Parcourir les modules de l&apos;architecture e-commerce
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Chaque route Next.js App Router expose une couche dédiée tout en conservant votre
              panier, vos KPIs et votre journal de télémétrie.
            </p>
          </div>
          <Link
            href="/laboratoire"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded"
          >
            <span>Voir toutes les requêtes capturées</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {ARCHITECTURE_ROUTES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group py-4 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#fafafa] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-4 min-w-0">
                <span className="font-mono text-xs font-semibold text-cyan-800 w-16 shrink-0">
                  {item.layer}
                </span>
                <span className="text-sm font-semibold text-[#0b1220] group-hover:text-cyan-800 transition-colors shrink-0">
                  {item.title}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 truncate">
                  {item.detail}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-[#0b1220] shrink-0">
                <span className="font-mono">{item.href}</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
