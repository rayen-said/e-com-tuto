import type {
  CartState,
  CartTotals,
  CheckoutProvider,
  Product,
  SortOption,
} from './types';
import { INITIAL_PRODUCTS } from './data';
import { CATEGORIES, LAYERS_INFO, VERIFIED_REVIEWS, RATING_DISTRIBUTION } from './data';

export function computeCartTotals(cart: CartState, products: Product[]): CartTotals {
  let subtotalHT = 0;
  let totalQty = 0;
  for (const item of cart.items) {
    const p = products.find((x) => x.id === item.productId);
    if (p) {
      subtotalHT += p.priceHT * item.qty;
      totalQty += item.qty;
    }
  }

  let discount = 0;
  let discountLabel = '';
  if (cart.promoCode === 'STACK20') {
    discount = +(subtotalHT * 0.2).toFixed(2);
    discountLabel = 'Code STACK20 (-20 %)';
  } else if (cart.promoCode === 'DEV50') {
    discount = Math.min(subtotalHT, 50.0);
    discountLabel = 'Code DEV50 (-50,00 €)';
  }

  const netHT = Math.max(0, +(subtotalHT - discount).toFixed(2));
  const tva = +(netHT * 0.2).toFixed(2);
  const totalTTC = +(netHT + tva).toFixed(2);

  return { subtotalHT, discount, discountLabel, netHT, tva, totalTTC, totalQty };
}

export function filterAndSortProducts(
  products: Product[],
  q: string,
  category: string,
  sort: SortOption
): Product[] {
  const normalizedQ = q.trim().toLowerCase();
  const list = products.filter((p) => {
    const matchCat =
      !category ||
      category === 'Tous' ||
      category === 'all' ||
      p.category === category ||
      p.categorySlug === category;
    if (!matchCat) return false;
    if (!normalizedQ) return true;
    const haystack = `${p.name} ${p.category} ${p.shortDesc} ${p.longDesc} ${p.tags.join(' ')}`.toLowerCase();
    return haystack.includes(normalizedQ);
  });

  if (sort === 'price_asc') list.sort((a, b) => a.priceHT - b.priceHT);
  else if (sort === 'price_desc') list.sort((a, b) => b.priceHT - a.priceHT);
  else list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return list;
}

export function buildProductDetailSql(productId: number): string {
  return `SELECT p.id, p.sku, p.name, p.price_ht,
       i.stock_available, i.warehouse_zone,
       c.label AS categorie,
       COALESCE(mv.avg_rating, 5.0) AS note_moyenne,
       COALESCE(mv.review_count, 0) AS nb_avis
FROM products p
INNER JOIN inventory i ON i.product_id = p.id
INNER JOIN categories c ON c.id = p.category_id
LEFT JOIN mv_notes_produits mv ON mv.product_id = p.id
WHERE p.id = ${productId};`;
}

export function buildCheckoutPreviewSql(
  items: { productId: number; qty: number }[],
  nextOrderId: number,
  idempotencyKey: string,
  provider: CheckoutProvider,
  totalTTC: number
): string {
  const idsList = items.map((i) => i.productId).join(', ');
  return `BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT product_id, stock_available FROM inventory
  WHERE product_id IN (${idsList}) FOR UPDATE;
${items
  .map(
    (i) =>
      `UPDATE inventory SET stock_available = stock_available - ${i.qty} WHERE product_id = ${i.productId} AND stock_available >= ${i.qty};`
  )
  .join('\n')}
INSERT INTO orders (id, user_id, idempotency_key, provider, total_ttc, status)
  VALUES (${nextOrderId}, 'usr_9482', '${idempotencyKey}', '${provider}', ${totalTTC.toFixed(2)}, 'PAID');
COMMIT;`;
}

export function getSupportAutoReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('promo') || q.includes('code') || q.includes('reduc')) {
    return 'Deux codes promotionnels sont actifs dans le panier Redis : STACK20 (-20 % sur le HT) et DEV50 (-50,00 € immédiat). Essayez-les dans le tiroir panier !';
  }
  if (q.includes('for update') || q.includes('acid') || q.includes('stock') || q.includes('verrou')) {
    return 'Le verrouillage pessimiste « SELECT ... FOR UPDATE » pose un verrou exclusif au niveau ligne dans PostgreSQL 16 pendant la transaction BEGIN...COMMIT, empêchant deux clients d’acheter le dernier exemplaire.';
  }
  if (q.includes('rgpd') || q.includes('donnee') || q.includes('pci')) {
    return 'StackCraft chiffre les PII au repos (AES-256), respecte le droit à l’effacement RGPD (Art. 17) et ne stocke aucun numéro de carte bancaire grâce à la tokenisation PCI-DSS Niveau 1.';
  }
  return 'Bien reçu ! Votre message a été persisté dans PostgreSQL et diffusé sur Redis Pub/Sub (canal support:usr_9482). Un architecte senior vous répondra sous 2 minutes.';
}

export { INITIAL_PRODUCTS, CATEGORIES, LAYERS_INFO, VERIFIED_REVIEWS, RATING_DISTRIBUTION };
