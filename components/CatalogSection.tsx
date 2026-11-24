'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';
import { formatEuro } from '@/lib/format';
import type { CartItem, Product, SortOption } from '@/lib/types';
import ProductSvg from './ProductSvg';
import { IconArrowRight, IconStar } from './Icons';

interface CatalogSectionProps {
  products: Product[];
  cartItems: CartItem[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  mutatingId: number | null;
  onSelectCategory: (cat: string) => void;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onAddToCart: (productId: number) => void;
  onOpenLayerModal: (num: number) => void;
}

export default function CatalogSection({
  products,
  cartItems,
  searchQuery,
  selectedCategory,
  sortBy,
  mutatingId,
  onSelectCategory,
  onSortChange,
  onResetFilters,
  onAddToCart,
  onOpenLayerModal,
}: CatalogSectionProps) {
  return (
    <section id="layer-3" data-layer="3" className="xray-layer space-y-6">
      <button
        type="button"
        onClick={() => onOpenLayerModal(3)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[3] Catalogue Relationnel &amp; SQL JOIN</span>
        <span className="underline">Analyser</span>
      </button>

      {/* Filtres par catégorie + Tri */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par catégorie">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-1 ${
                  active
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-600 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-[#0b1220]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-select" className="text-xs text-slate-600 font-medium">
            Trier par :
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-[#0b1220] focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          >
            <option value="rating_desc">Mieux notés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Comptage résultats */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          <span className="font-mono tabular-nums font-semibold text-[#0b1220]">
            {products.length}
          </span>{' '}
          produit{products.length > 1 ? 's' : ''} affiché{products.length > 1 ? 's' : ''}
          {searchQuery.trim() ? ` pour « ${searchQuery.trim()} »` : ''}
        </span>
        <span className="font-mono text-[11px] text-slate-600">
          Prix HT · TVA 20 % calculée au panier
        </span>
      </div>

      {/* État vide ou grille de 6 produits */}
      {!products.length ? (
        <div className="p-10 rounded-xl bg-[#fafafa] border border-slate-200 text-center space-y-3">
          <h3 className="text-base font-semibold text-[#0b1220]">
            Aucun produit ne correspond à « {searchQuery.trim() || selectedCategory} »
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            L&apos;index PostgreSQL{' '}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
              GIN tsvector
            </code>{' '}
            a renvoyé 0 ligne. Essayez « acid », « redis », « postgresql » ou réinitialisez les
            filtres.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const cartItem = cartItems.find((i) => i.productId === p.id);
            const inCartQty = cartItem ? cartItem.qty : 0;
            const outOfStock = p.stock <= 0;
            const lowStock = p.stock > 0 && p.stock <= 5;
            const isAdding = mutatingId === p.id;

            return (
              <article
                key={p.id}
                className="group rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-soft p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <Link
                    href={`/produits/${p.id}`}
                    className="block relative rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                  >
                    <ProductSvg svgKey={p.svgKey} />
                    <span
                      className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded border text-[11px] font-medium ${p.badgeClass}`}
                    >
                      {p.badge}
                    </span>
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono tabular-nums text-[#0b1220]">
                      <IconStar className="w-3 h-3 text-amber-600" />
                      <span>{p.rating.toFixed(1).replace('.', ',')}</span>
                      <span className="text-slate-600">({p.reviewCount})</span>
                    </span>
                  </Link>

                  <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">{p.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded border font-mono tabular-nums text-[11px] font-medium ${
                        outOfStock
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : lowStock
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {outOfStock ? 'Rupture' : `Stock : ${p.stock}`}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-[#0b1220] leading-snug">
                    <Link
                      href={`/produits/${p.id}`}
                      className="hover:text-cyan-800 transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {p.name}
                    </Link>
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {p.shortDesc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xl font-semibold font-mono tabular-nums text-[#0b1220]">
                        {formatEuro(p.priceHT)}
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono ml-1.5">HT</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">{p.sku}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/produits/${p.id}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-300 hover:border-[#0b1220] text-xs font-medium text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <span>Fiche &amp; SQL</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      disabled={outOfStock || inCartQty >= p.stock || isAdding}
                      onClick={() => onAddToCart(p.id)}
                      className="px-3 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-1"
                    >
                      {outOfStock
                        ? 'Épuisé'
                        : isAdding
                          ? 'Ajout...'
                          : inCartQty > 0
                            ? `Panier (${inCartQty})`
                            : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
