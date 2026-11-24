import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Accueil — Couche [1] Edge CDN & SSR',
  description:
    'Infrastructure Edge CDN Anycast, TLS 1.3, topologie temps réel et accès aux 7 couches e-commerce de StackCraft Commerce.',
};

export default function HomePage() {
  return <HomePageClient />;
}
