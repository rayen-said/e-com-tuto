import type { Metadata } from 'next';
import CheckoutPageView from '@/components/CheckoutPageView';

export const metadata: Metadata = {
  title: 'Paiement ACID — Couche [6] Transaction PostgreSQL',
  description:
    'Tunnel de paiement sécurisé avec Idempotency-Key UUID v4, Stripe, PayPal OAuth2, Apple Pay et transaction SQL SELECT ... FOR UPDATE.',
};

export default function PaiementPage() {
  return <CheckoutPageView />;
}
