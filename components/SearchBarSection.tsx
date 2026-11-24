'use client';

import type { SearchCachePillState } from './StoreProvider';
import { IconSearch } from './Icons';

interface SearchBarSectionProps {
  searchQuery: string;
  cachePill: SearchCachePillState;
  lastSearchKey: string;
  searchLoading: boolean;
  onSearchChange: (q: string, immediate?: boolean) => void;
  onFlushCache: () => void;
  onOpenLayerModal: (num: number) => void;
}

export default function SearchBarSection({
  searchQuery,
  cachePill,
  lastSearchKey,
  searchLoading,
  onSearchChange,
  onFlushCache,
  onOpenLayerModal,
}: SearchBarSectionProps) {
  const pillConfig: Record<SearchCachePillState, { label: string; className: string }> = {
    ready: {
      label: 'Prêt',
      className: 'bg-[#fafafa] border-slate-200 text-slate-600',
    },
    hit: {
      label: 'CACHE HIT',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold',
    },
    miss: {
      label: 'CACHE MISS',
      className: 'bg-amber-50 border-amber-200 text-amber-800 font-semibold',
    },
    flushed: {
      label: 'Cache vidé',
      className: 'bg-rose-50 border-rose-200 text-rose-800 font-semibold',
    },
  };

  const pill = pillConfig[cachePill];

  return (
    <section
      id="layer-2"
      data-layer="2"
      className="xray-layer rounded-xl bg-[#fafafa] border border-slate-200 p-4 sm:p-5 space-y-4"
    >
      <button
        type="button"
        onClick={() => onOpenLayerModal(2)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[2] Recherche Prédictive &amp; Cache-Aside</span>
        <span className="underline">Analyser</span>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex-1">
          <label htmlFor="search-input" className="sr-only">
            Rechercher un produit dans le catalogue
          </label>
          <div className="relative">
            <IconSearch className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value, false)}
              placeholder="Rechercher (ex : acid, postgresql, redis, kubernetes, stripe)..."
              className="w-full pl-10 pr-28 sm:pr-40 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-[#0b1220] placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => onSearchChange('', true)}
                  className="hidden sm:inline-flex px-2 py-1 text-xs text-slate-600 hover:text-[#0b1220] rounded hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                >
                  Effacer
                </button>
              )}
              <span
                className={`px-2 py-0.5 rounded border font-mono text-[11px] ${
                  searchLoading
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                    : pill.className
                }`}
              >
                {searchLoading ? 'Requête...' : pill.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-slate-600">Essais rapides :</span>
          <button
            type="button"
            onClick={() => onSearchChange('acid', true)}
            className="px-2.5 py-1.5 rounded-md bg-white hover:border-cyan-600 border border-slate-200 text-[#0b1220] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          >
            acid
          </button>
          <button
            type="button"
            onClick={() => onSearchChange('redis', true)}
            className="px-2.5 py-1.5 rounded-md bg-white hover:border-cyan-600 border border-slate-200 text-[#0b1220] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          >
            redis
          </button>
          <button
            type="button"
            onClick={onFlushCache}
            className="px-2.5 py-1.5 rounded-md bg-white hover:border-rose-400 border border-slate-200 text-rose-700 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            title="Vide le cache Redis de recherche"
          >
            FLUSH Cache
          </button>
        </div>
      </div>

      {/* Explication Cache-Aside vs Index GIN tsvector */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px] font-medium">
            GET /api/v1/produits?q=
          </span>
          <span className="leading-relaxed">
            {cachePill === 'hit' && lastSearchKey ? (
              <>
                <strong className="text-emerald-800">REDIS CACHE HIT</strong> pour{' '}
                <code className="font-mono text-cyan-800">{lastSearchKey}</code> : réponse servie en
                mémoire (~2 ms) sans solliciter PostgreSQL.
              </>
            ) : cachePill === 'miss' && lastSearchKey ? (
              <>
                <strong className="text-amber-800">REDIS CACHE MISS</strong> : scan plein texte
                PostgreSQL via index{' '}
                <code className="font-mono text-cyan-800">GIN tsvector</code> puis mise en cache{' '}
                <code className="font-mono text-[#0b1220]">SETEX {lastSearchKey} 300</code>.
                Relancez la même recherche pour observer un CACHE HIT.
              </>
            ) : (
              <>
                1<sup>re</sup> recherche :{' '}
                <strong className="text-[#0b1220]">REDIS MISS</strong> &rarr; scan index PostgreSQL{' '}
                <code className="font-mono text-cyan-800">GIN tsvector</code> + TTL 300 s. 2
                <sup>e</sup> recherche identique :{' '}
                <strong className="text-[#0b1220]">REDIS HIT</strong> (~2 ms).
              </>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
