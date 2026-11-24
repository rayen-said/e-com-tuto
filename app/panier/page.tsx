import type { Metadata } from 'next';
import CartPageView from '@/components/CartPageView';

export const metadata: Metadata = {
  title: 'Panier — Couche [5] Session Redis Hash',
  description:
    'Panier stocké dans le Redis Hash cart:usr_9482, gestion des quantités, codes promo STACK20 et DEV50, TVA 20 % et calcul TTC.',
};

export default function PanierPage() {
  return <CartPageView />;
}
