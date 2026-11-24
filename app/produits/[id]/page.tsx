import type { Metadata } from 'next';
import ProductDetailView from '@/components/ProductDetailView';
import { getStore } from '@/lib/server-store';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);
  const product = getStore().products.find((p) => p.id === productId);

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable dans le catalogue StackCraft Commerce.',
    };
  }

  return {
    title: `${product.name} — Fiche Produit Couche [3]`,
    description: product.shortDesc,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  return <ProductDetailView productId={Number.isInteger(productId) ? productId : -1} />;
}
