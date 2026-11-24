import type { Metadata } from 'next';
import ReviewsPageClient from '@/components/ReviewsPageClient';

export const metadata: Metadata = {
  title: 'Avis vérifiés — Couche [4] Preuve Sociale',
  description:
    'Engagements PCI-DSS Niveau 1, verrouillage ACID des stocks, distribution des notes mv_notes_produits et avis vérifiés HMAC-SHA256.',
};

export default function AvisPage() {
  return <ReviewsPageClient />;
}
