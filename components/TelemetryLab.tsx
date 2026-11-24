'use client';

import { useState, type CSSProperties } from 'react';
import { formatEuro, formatPercent, highlightJSON, highlightRedis, highlightSQL } from '@/lib/format';
import type { CacheStatus, KpiMetrics, TelemetryLog, TelemetryTab } from '@/lib/types';
import {
  IconDatabase,
  IconGlobe,
  IconMonitor,
  IconRefresh,
  IconServer,
  IconTrash,
  IconZap,
} from './Icons';

interface TelemetryLabProps {
  kpis: KpiMetrics;
  p99Latency: number;
  kpiFlashKey: number;
  inspectingKpis: boolean;
  activeTab: TelemetryTab;
  logs: TelemetryLog[];
  selectedLogId: number | null;
  animSeed: number;
  onInspectKpis: () => void;
  onSwitchTab: (tab: TelemetryTab) => void;
  onSelectLog: (id: number) => void;
  onClearLogs: () => void;
  onReplayAnimation: () => void;
  onOpenLayerModal: (num: number) => void;
}

const NODES = [
  { idx: 0, label: 'Navigateur', sub: 'Client HTTP/3' },
  { idx: 1, label: 'Edge CDN', sub: 'Anycast TLS 1.3' },
  { idx: 2, label: 'Serveur API', sub: 'REST + JWT' },
  { idx: 3, label: 'Redis 7', sub: 'Cache / Hash' },
  { idx: 4, label: 'PostgreSQL', sub: 'ACID · GIN' },
];

function NodeIcon({ idx }: { idx: number }) {
  switch (idx) {
    case 0:
      return <IconMonitor className="w-4 h-4" />;
    case 1:
      return <IconGlobe className="w-4 h-4" />;
    case 2:
      return <IconServer className="w-4 h-4" />;
    case 3:
      return <IconZap className="w-4 h-4" />;
    default:
      return <IconDatabase className="w-4 h-4" />;
  }
}

const METHOD_BADGE: Record<string, string> = {
  GET: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  POST: 'bg-amber-50 text-amber-800 border-amber-200',
  PATCH: 'bg-slate-100 text-slate-800 border-slate-200',
  DELETE: 'bg-rose-50 text-rose-800 border-rose-200',
};

const HOP_PCT_MAP: Record<number, string> = {
  1: '30%',
  2: '50%',
  3: '70%',
  4: '90%',
};

function renderCachePill(status: CacheStatus) {
  switch (status) {
    case 'HIT':
      return <span className="text-emerald-700 font-semibold">HIT</span>;
    case 'EDGE_HIT':
      return <span className="text-cyan-800 font-semibold">EDGE</span>;
    case 'MISS':
      return <span className="text-amber-800 font-semibold">MISS</span>;
    case 'WRITE':
      return <span className="text-rose-700 font-semibold">REDIS</span>;
    default:
      return <span className="text-emerald-700 font-semibold">ACID</span>;
  }
}

function renderCacheBadge(status: CacheStatus) {
  switch (status) {
    case 'HIT':
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold">
          REDIS : CACHE HIT
        </span>
      );
    case 'MISS':
      return (
        <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-semibold">
          REDIS : CACHE MISS
        </span>
      );
    case 'EDGE_HIT':
      return (
        <span className="px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px] font-semibold">
          EDGE CDN : HYDRATATION SSR
        </span>
      );
    case 'WRITE':
      return (
        <span className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px] font-semibold">
          REDIS : ÉCRITURE HASH
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold">
          POSTGRESQL : TRANSACTION ACID
        </span>
      );
  }
}

export default function TelemetryLab({
  kpis,
  p99Latency,
  kpiFlashKey,
  inspectingKpis,
  activeTab,
  logs,
  selectedLogId,
  animSeed,
  onInspectKpis,
  onSwitchTab,
  onSelectLog,
  onClearLogs,
  onReplayAnimation,
  onOpenLayerModal,
}: TelemetryLabProps) {
  const [localReplay, setLocalReplay] = useState(0);
  const selectedLog = logs.find((l) => l.id === selectedLogId) || null;

  const conv = (kpis.ordersCount / kpis.sessionsCount) * 100;
  const aov = kpis.totalRevenueTTC / kpis.ordersCount;
  const ltv = aov * kpis.avgOrdersPerCustomer;
  const ltvCacRatio = ltv / kpis.cac;

  const defaultReqHeaders: Record<string, string> = selectedLog
    ? {
        ':method': selectedLog.method,
        ':scheme': 'https',
        ':authority': 'shop.stackcraft.fr',
        ':path': selectedLog.path,
        'x-edge-pop': 'CDG1-Paris',
        'x-tls-version': 'TLSv1.3 (0-RTT)',
        authorization: 'Bearer eyJhbGciOiJSUzI1NiIs...usr_9482',
        accept: 'application/json',
        ...(selectedLog.reqHeaders || {}),
      }
    : {};

  const defaultResHeaders: Record<string, string> = selectedLog
    ? {
        ':status': String(selectedLog.status),
        'content-type': 'application/json; charset=utf-8',
        'alt-svc': 'h3=":443"; ma=86400',
        'strict-transport-security': 'max-age=63072000; includeSubDomains',
        'x-cache':
          selectedLog.cacheStatus === 'HIT'
            ? 'HIT (Redis 7.2)'
            : selectedLog.cacheStatus === 'EDGE_HIT'
              ? 'HIT (Edge SSR)'
              : selectedLog.cacheStatus === 'WRITE'
                ? 'BYPASS (Redis Write)'
                : 'BYPASS (PostgreSQL ACID)',
        'x-response-time': `${selectedLog.totalLatency}ms`,
        ...(selectedLog.resHeaders || {}),
      }
    : {};

  const endPct = selectedLog ? HOP_PCT_MAP[selectedLog.maxHopIndex] || '90%' : '90%';
  const trackWidth = selectedLog
    ? selectedLog.maxHopIndex === 1
      ? '25%'
      : selectedLog.maxHopIndex === 2
        ? '50%'
        : selectedLog.maxHopIndex === 3
          ? '75%'
          : '100%'
    : '0%';

  return (
    <section id="telemetry-lab" data-layer="7" className="xray-layer space-y-8">
      <button
        type="button"
        onClick={() => onOpenLayerModal(7)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[7] Laboratoire de Télémétrie &amp; KPIs OLAP</span>
        <span className="underline">Analyser</span>
      </button>

      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0b1220]">
            Laboratoire de télémétrie réseau, HTTP/3 et SQL
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspectez en temps réel toutes les requêtes capturées depuis le catalogue, le panier,
            les avis et le tunnel de paiement ACID.
          </p>
        </div>
        <button
          type="button"
          disabled={inspectingKpis}
          onClick={onInspectKpis}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
        >
          <IconRefresh className={`w-3.5 h-3.5 ${inspectingKpis ? 'animate-spin' : ''}`} />
          <span>{inspectingKpis ? 'Exécution...' : 'Exécuter la requête SQL des KPIs'}</span>
        </button>
      </div>

      {/* 4 KPIs dynamiques en bandeau hairline */}
      <dl className="grid sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-xl bg-[#fafafa] divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div
          key={`lab-conv-${kpiFlashKey}`}
          className={`p-4 ${kpiFlashKey > 0 ? 'kpi-flash' : ''}`}
        >
          <dt className="text-xs text-slate-600">Taux de conversion</dt>
          <dd className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
            {formatPercent(conv)}
          </dd>
          <span className="text-[11px] font-mono tabular-nums text-slate-600">
            {kpis.ordersCount} cmd / {kpis.sessionsCount.toLocaleString('fr-FR')} sessions
          </span>
        </div>

        <div
          key={`lab-aov-${kpiFlashKey}`}
          className={`p-4 ${kpiFlashKey > 0 ? 'kpi-flash' : ''}`}
        >
          <dt className="text-xs text-slate-600">Panier moyen (AOV)</dt>
          <dd className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
            {formatEuro(aov)}
          </dd>
          <span className="text-[11px] font-mono tabular-nums text-cyan-800">
            CA TTC : {formatEuro(kpis.totalRevenueTTC)}
          </span>
        </div>

        <div
          key={`lab-ltv-${kpiFlashKey}`}
          className={`p-4 ${kpiFlashKey > 0 ? 'kpi-flash' : ''}`}
        >
          <dt className="text-xs text-slate-600">Ratio LTV : CAC</dt>
          <dd className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
            {ltvCacRatio.toLocaleString('fr-FR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{' '}
            : 1
          </dd>
          <span className="text-[11px] font-mono tabular-nums text-slate-600">
            CAC unitaire : {kpis.cac} €
          </span>
        </div>

        <div className="p-4">
          <dt className="text-xs text-slate-600">Latence API P99</dt>
          <dd className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#0b1220]">
            {p99Latency} ms
          </dd>
          <span className="text-[11px] font-mono text-cyan-800">
            {p99Latency < 50 ? 'Optimal (< 50 ms)' : 'Conforme SLO (< 100 ms)'}
          </span>
        </div>
      </dl>

      {/* Console d'inspection : Journal à gauche + 3 onglets à droite */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Barre d'onglets */}
        <div className="px-4 py-3 bg-[#fafafa] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#0b1220]">
              Inspection des requêtes ({logs.length})
            </span>
          </div>

          <div role="tablist" aria-label="Vues d'inspection télémétrie" className="flex flex-wrap items-center gap-1">
            {[
              { id: 'flow' as TelemetryTab, label: 'Flux de paquets (5 nœuds)' },
              { id: 'http' as TelemetryTab, label: 'En-têtes HTTP/3 & JSON' },
              { id: 'sql' as TelemetryTab, label: 'SQL / Redis & EXPLAIN' },
            ].map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isCurrent}
                  aria-controls="panneau-inspection"
                  onClick={() => onSwitchTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${
                    isCurrent
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-600 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-[#0b1220] hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille Journal / Détail */}
        <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Journal des requêtes à gauche */}
          <div className="lg:col-span-4 flex flex-col max-h-[540px]">
            <div className="px-4 py-2.5 bg-[#fafafa] border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-slate-700">
                JOURNAL ({logs.length})
              </span>
              <button
                type="button"
                disabled={logs.length === 0}
                onClick={onClearLogs}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {logs.length === 0 ? (
                <div className="p-6 text-xs text-slate-600 text-center space-y-2">
                  <p className="font-medium text-[#0b1220]">Journal vide</p>
                  <p>
                    Interagissez avec le catalogue, le panier ou le paiement pour capturer une
                    requête.
                  </p>
                </div>
              ) : (
                logs.map((log) => {
                  const active = log.id === selectedLogId;
                  const statusColor = log.status >= 400 ? 'text-rose-700' : 'text-emerald-700';
                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => onSelectLog(log.id)}
                      className={`w-full text-left px-4 py-3 transition-colors flex flex-col gap-1.5 focus-visible:outline-none focus-visible:bg-cyan-50 ${
                        active
                          ? 'bg-cyan-50/70 border-l-2 border-cyan-600'
                          : 'bg-white hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold shrink-0 ${
                              METHOD_BADGE[log.method] || METHOD_BADGE.GET
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="font-mono text-xs text-[#0b1220] truncate">
                            {log.path}
                          </span>
                        </div>
                        <span className={`font-mono tabular-nums text-[11px] font-semibold ${statusColor} shrink-0`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600">
                        <span>
                          {log.timestamp} · {renderCachePill(log.cacheStatus)}
                        </span>
                        <span className="text-[#0b1220] font-medium">{log.totalLatency} ms</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Zone d'inspection à droite */}
          <div
            className="lg:col-span-8 p-4 sm:p-6 bg-white"
            role="tabpanel"
            id="panneau-inspection"
            aria-labelledby={`tab-${activeTab}`}
          >
            {!selectedLog ? (
              <div className="py-12 text-center space-y-2 text-sm text-slate-600">
                <p className="font-medium text-[#0b1220]">Aucune requête sélectionnée</p>
                <p className="text-xs">
                  Exécutez une action (ex. « Exécuter la requête SQL des KPIs » ci-dessus) pour
                  observer le trajet des paquets.
                </p>
              </div>
            ) : activeTab === 'flow' ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#0b1220]">
                      {selectedLog.method} {selectedLog.path}
                    </span>
                    {renderCacheBadge(selectedLog.cacheStatus)}
                    <span className="px-2 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-slate-700 font-mono tabular-nums text-[11px]">
                      Total : <strong className="text-[#0b1220]">{selectedLog.totalLatency} ms</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block" aria-hidden="true" />
                      Aller
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" aria-hidden="true" />
                      Retour
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalReplay((v) => v + 1);
                        onReplayAnimation();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:border-cyan-600 border border-slate-200 text-[#0b1220] text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <IconRefresh className="w-3 h-3 text-cyan-700" />
                      <span>Rejouer</span>
                    </button>
                  </div>
                </div>

                {/* Schéma 5 nœuds animé */}
                <div className="relative py-6 px-3 rounded-xl bg-[#fafafa] border border-slate-200 overflow-x-auto">
                  <div className="min-w-[300px] relative">
                    {/* Ligne de piste */}
                    <div className="absolute left-[10%] right-[10%] top-[46px] h-1 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all duration-300"
                        style={{ width: trackWidth }}
                      />
                    </div>

                    {/* Paquets animés */}
                    <div
                      key={`${selectedLog.id}-${animSeed}-${localReplay}`}
                      className="absolute inset-x-0 top-[48px] h-0 pointer-events-none"
                      style={
                        {
                          '--start-pct': '10%',
                          '--end-pct': endPct,
                        } as CSSProperties
                      }
                    >
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-600 border-2 border-white packet-dot-out" />
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white packet-dot-in" />
                    </div>

                    {/* Latences par saut */}
                    <div className="grid grid-cols-4 gap-2 px-[10%] mb-3">
                      {[0, 1, 2, 3].map((i) => {
                        const hop = selectedLog.hops[i];
                        const active = i < selectedLog.maxHopIndex;
                        return (
                          <div key={i} className="text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono tabular-nums text-[11px] border ${
                                active
                                  ? 'bg-white border-cyan-200 text-cyan-800 font-medium'
                                  : 'bg-[#fafafa] border-slate-200 text-slate-500'
                              }`}
                            >
                              {active && hop ? `+${hop.ms} ms` : '0 ms (ignoré)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Les 5 nœuds */}
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 relative z-10">
                      {NODES.map((n) => {
                        const reached = n.idx <= selectedLog.maxHopIndex;
                        const isTerminal = n.idx === selectedLog.maxHopIndex;
                        return (
                          <div key={n.idx} className="flex flex-col items-center text-center">
                            <div
                              className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-colors ${
                                isTerminal
                                  ? 'bg-cyan-50 border-cyan-600 text-cyan-800'
                                  : reached
                                    ? 'bg-white border-slate-300 text-[#0b1220]'
                                    : 'bg-[#fafafa] border-slate-200 text-slate-500'
                              }`}
                            >
                              <NodeIcon idx={n.idx} />
                            </div>
                            <span
                              className={`mt-2 text-[10px] sm:text-xs font-semibold leading-tight ${
                                reached ? 'text-[#0b1220]' : 'text-slate-500'
                              }`}
                            >
                              {n.label}
                            </span>
                            <span className="text-[9px] sm:text-[11px] font-mono text-slate-600">
                              {reached ? n.sub : 'Court-circuité'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 bg-[#fafafa] border border-slate-200 rounded-lg px-4 py-3 leading-relaxed">
                  <strong className="text-[#0b1220]">Analyse temps réel :</strong>{' '}
                  {selectedLog.summary}
                </p>
              </div>
            ) : activeTab === 'http' ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold font-mono text-cyan-800">
                      REQUÊTE HTTP/3
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 truncate max-w-[180px]">
                      {selectedLog.method} {selectedLog.path}
                    </span>
                  </div>
                  <pre className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220]">
                    {Object.entries(defaultReqHeaders).map(([k, v]) => (
                      <div key={k}>
                        <span className="tok-key">{k}</span>: <span className="tok-str">{v}</span>
                      </div>
                    ))}
                  </pre>
                  {selectedLog.reqBody !== null && selectedLog.reqBody !== undefined && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-600 block">
                        Corps JSON envoyé :
                      </span>
                      <pre
                        className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: highlightJSON(selectedLog.reqBody) }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold font-mono text-emerald-700">
                      RÉPONSE HTTP/3 ({selectedLog.status})
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-600">
                      {selectedLog.totalLatency} ms
                    </span>
                  </div>
                  <pre className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220]">
                    {Object.entries(defaultResHeaders).map(([k, v]) => (
                      <div key={k}>
                        <span className="tok-key">{k}</span>: <span className="tok-str">{v}</span>
                      </div>
                    ))}
                  </pre>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-600 block">
                      Corps JSON reçu :
                    </span>
                    <pre
                      className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56"
                      dangerouslySetInnerHTML={{
                        __html: highlightJSON(selectedLog.resBody ?? {}),
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-rose-700">
                        COMMANDE REDIS 7.2
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">En mémoire</span>
                    </div>
                    <pre
                      className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220]"
                      dangerouslySetInnerHTML={{
                        __html: highlightRedis(selectedLog.redisCmd || ''),
                      }}
                    />
                  </div>

                  <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-cyan-800">
                        REQUÊTE SQL POSTGRESQL 16
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">ACID / GIN</span>
                    </div>
                    <pre
                      className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220]"
                      dangerouslySetInnerHTML={{
                        __html: highlightSQL(
                          selectedLog.sqlQuery ||
                            '-- Requête servie depuis le cache, PostgreSQL non sollicité.'
                        ),
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-4 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-mono text-emerald-700">
                      PLAN D&apos;EXÉCUTION (EXPLAIN ANALYZE)
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      Optimiseur PG 16
                    </span>
                  </div>
                  <pre className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#0b1220] flex-1 whitespace-pre-wrap">
                    {selectedLog.explainPlan ||
                      'Aucun plan SQL (court-circuit Redis Cache HIT).'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
