import type { Metadata } from 'next';
import LabPageClient from '@/components/LabPageClient';

export const metadata: Metadata = {
  title: 'Laboratoire Télémétrie & KPIs — Couche [7]',
  description:
    'KPIs d’économie numérique dynamiques, journal de requêtes en direct, flux animé 5 nœuds, en-têtes HTTP/3 JSON et plans SQL EXPLAIN ANALYZE.',
};

export default function LaboratoirePage() {
  return <LabPageClient />;
}
