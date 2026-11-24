import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { StoreProvider } from '@/components/StoreProvider';
import { getSnapshot } from '@/lib/server-store';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'StackCraft Commerce — Architecture E-Commerce & Boutique Interactive',
    template: '%s — StackCraft Commerce',
  },
  description:
    'Boutique e-commerce interactive et tutoriel full-stack révélant les 7 couches d’architecture (Edge CDN, Cache-Aside Redis, PostgreSQL 16 ACID, KPIs et télémétrie HTTP/3).',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSnapshot = getSnapshot();

  return (
    <html lang="fr" className={`scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans antialiased bg-white text-[#0b1220] selection:bg-cyan-100 selection:text-[#0b1220]">
        <StoreProvider initialSnapshot={initialSnapshot}>{children}</StoreProvider>
      </body>
    </html>
  );
}
