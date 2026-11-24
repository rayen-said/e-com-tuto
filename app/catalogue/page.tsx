import type { Metadata } from 'next';
import CatalogPageClient from '@/components/CatalogPageClient';

export const metadata: Metadata = {
  title: 'Catalogue — Couches [2] & [3] Recherche & Produits',
  description:
    'Recherche prédictive Cache-Aside Redis vs PostgreSQL GIN tsvector, filtres par catégorie, tri et catalogue des 6 kits techniques.',
};

export default function CataloguePage() {
  return <CatalogPageClient />;
}
