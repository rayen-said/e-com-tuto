'use client';

import CatalogSection from './CatalogSection';
import SearchBarSection from './SearchBarSection';
import { useStore } from './StoreProvider';

export default function CatalogPageClient() {
  const {
    visibleProducts,
    cart,
    searchQuery,
    selectedCategory,
    sortBy,
    cachePill,
    lastSearchKey,
    searchLoading,
    cartMutatingId,
    handleSearchChange,
    flushCache,
    selectCategory,
    changeSort,
    resetFilters,
    addToCart,
    openLayerModal,
  } = useStore();

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1220]">
          Catalogue des architectures et formations
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Recherche plein texte PostgreSQL{' '}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-[#fafafa] border border-slate-200 text-cyan-800">
            GIN tsvector
          </code>{' '}
          avec mise en cache Redis (Couche <span className="font-mono text-cyan-800">[2]</span>) et
          catalogue relationnel synchronisé sur les stocks en temps réel (Couche{' '}
          <span className="font-mono text-cyan-800">[3]</span>).
        </p>
      </div>

      <SearchBarSection
        searchQuery={searchQuery}
        cachePill={cachePill}
        lastSearchKey={lastSearchKey}
        searchLoading={searchLoading}
        onSearchChange={handleSearchChange}
        onFlushCache={() => void flushCache()}
        onOpenLayerModal={openLayerModal}
      />

      <CatalogSection
        products={visibleProducts}
        cartItems={cart.items}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        mutatingId={cartMutatingId}
        onSelectCategory={(cat) => void selectCategory(cat)}
        onSortChange={(s) => void changeSort(s)}
        onResetFilters={resetFilters}
        onAddToCart={(id) => void addToCart(id)}
        onOpenLayerModal={openLayerModal}
      />
    </div>
  );
}
