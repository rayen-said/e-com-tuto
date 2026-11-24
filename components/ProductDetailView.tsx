'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildProductDetailSql } from '@/lib/catalog-utils';
import { formatEuro, highlightSQL } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useStore } from './StoreProvider';
import ProductSvg from './ProductSvg';
import { IconArrowLeft, IconArrowRight, IconCheck, IconStar } from './Icons';

export default function ProductDetailView({ productId }: { productId: number }) {
  const {
    products,
    cart,
    cartMutatingId,
    fetchProductDetail,
    addToCart,
    openLayerModal,
  } = useStore();

  const storeProduct = products.find((p) => p.id === productId) ?? null;
  const [sqlDetail, setSqlDetail] = useState<string>(() => buildProductDetailSql(productId));
  const [loadingSql, setLoadingSql] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingSql(true);
    void fetchProductDetail(productId).then((res) => {
      if (!active) return;
      if (res) setSqlDetail(res.sqlDetail);
      setLoadingSql(false);
    });
    return () => {
      active = false;
    };
  }, [productId, fetchProductDetail]);

  if (!storeProduct) {
    return (
      <section className="py-12 rounded-xl bg-[#fafafa] border border-slate-200 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-[#0b1220]">Produit introuvable</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {productId > 0 ? (
            <>
              L&apos;identifiant <code className="font-mono text-cyan-800">#{productId}</code> ne
              correspond à aucune ligne dans la table{' '}
              <code className="font-mono text-cyan-800">products</code>.
            </>
          ) : (
            <>L&apos;identifiant fourni dans l&apos;URL n&apos;est pas un entier valide.</>
          )}
        </p>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1220] hover:bg-slate-800 text-white text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au catalogue</span>
        </Link>
      </section>
    );
  }

  const product: Product = storeProduct;
  const cartItem = cart.items.find((i) => i.productId === product.id);
  const inCartQty = cartItem ? cartItem.qty : 0;
  const outOfStock = product.stock <= 0;
  const isAdding = cartMutatingId === product.id;

  return (
    <section id="layer-3" data-layer="3" className="xray-layer space-y-8">
      <button
        type="button"
        onClick={() => openLayerModal(3)}
        className="xray-badge items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-700 text-white font-mono text-[11px] font-semibold hover:bg-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        <span>[3] Fiche Produit &amp; Requête SQL JOIN</span>
        <span className="underline">Analyser</span>
      </button>

      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au catalogue</span>
        </Link>
        <span className="font-mono text-xs text-slate-600">
          GET /api/v1/produits/{product.id}
        </span>
      </nav>

      {/* Fiche produit principale */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <ProductSvg svgKey={product.svgKey} />

          <dl className="grid grid-cols-2 divide-x divide-slate-200 border border-slate-200 rounded-xl bg-[#fafafa]">
            <div className="p-4">
              <dt className="text-xs text-slate-600">Prix unitaire HT</dt>
              <dd className="mt-1 font-mono tabular-nums font-semibold text-xl text-[#0b1220]">
                {formatEuro(product.priceHT)}
              </dd>
            </div>
            <div className="p-4">
              <dt className="text-xs text-slate-600">Stock PostgreSQL</dt>
              <dd
                className={`mt-1 font-mono tabular-nums font-semibold text-xl ${
                  outOfStock ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {product.stock} unité{product.stock > 1 ? 's' : ''}
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className={`px-2 py-0.5 rounded border font-medium ${product.badgeClass}`}>
              {product.badge}
            </span>
            <span className="text-slate-600">{product.category}</span>
            <span className="font-mono text-slate-600">SKU {product.sku}</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[#0b1220]">
              <IconStar className="w-3.5 h-3.5 text-amber-600" />
              <span>{product.rating.toFixed(1).replace('.', ',')}</span>
              <span className="text-slate-600">({product.reviewCount} avis)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0b1220] leading-tight">
            {product.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{product.longDesc}</p>

          <ul className="space-y-2 pt-2 border-t border-slate-200 text-sm text-[#0b1220]">
            {product.specs.map((sp) => (
              <li key={sp} className="flex items-start gap-2.5">
                <IconCheck className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
                <span>{sp}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={outOfStock || inCartQty >= product.stock || isAdding}
              onClick={() => void addToCart(product.id)}
              className="px-5 py-2.5 rounded-lg bg-[#0b1220] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
            >
              {outOfStock
                ? 'Rupture de stock'
                : isAdding
                  ? 'Ajout en cours...'
                  : inCartQty > 0
                    ? `Ajouter un autre (${inCartQty} au panier)`
                    : 'Ajouter au panier Redis Hash'}
            </button>

            <Link
              href="/panier"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white hover:bg-[#fafafa] border border-slate-300 hover:border-[#0b1220] text-[#0b1220] font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              <span>Voir le panier</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Requête SQL INNER JOIN / LEFT JOIN expliquée */}
      <div className="rounded-xl bg-[#fafafa] border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-[#0b1220]">
              Requête SQL exécutée pour charger cette fiche (INNER JOIN + LEFT JOIN)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Capturée automatiquement dans le laboratoire lors du chargement de la route.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px] font-medium">
            {loadingSql ? 'Exécution SQL...' : 'Index Scan PK · 0,85 ms'}
          </span>
        </div>

        <pre
          className="p-4 rounded-lg bg-white border border-slate-200 text-xs font-mono leading-relaxed overflow-x-auto text-[#0b1220]"
          dangerouslySetInnerHTML={{ __html: highlightSQL(sqlDetail) }}
        />

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong className="text-[#0b1220]">Pourquoi ce choix de jointure ?</strong>{' '}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
            INNER JOIN inventory
          </code>{' '}
          impose qu&apos;un produit affichable possède une ligne de stock valide, tandis que{' '}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-white border border-slate-200 text-cyan-800">
            LEFT JOIN mv_notes_produits
          </code>{' '}
          permet d&apos;afficher même un nouveau produit qui n&apos;a pas encore d&apos;avis.
        </p>
      </div>
    </section>
  );
}
