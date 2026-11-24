export type ProductSvgKey =
  | 'microservices'
  | 'postgres'
  | 'uikit'
  | 'devops'
  | 'redis'
  | 'payment';

export type SortOption = 'rating_desc' | 'price_asc' | 'price_desc';

export type CheckoutProvider = 'stripe' | 'paypal' | 'applepay';

export type CacheStatus = 'HIT' | 'MISS' | 'EDGE_HIT' | 'WRITE' | 'ACID';

export type TelemetryTab = 'flow' | 'http' | 'sql';

export type ToastType = 'info' | 'success' | 'warn' | 'error';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  priceHT: number;
  stock: number;
  initialStock: number;
  rating: number;
  reviewCount: number;
  badge: string;
  badgeClass: string;
  shortDesc: string;
  longDesc: string;
  specs: string[];
  tags: string[];
  svgKey: ProductSvgKey;
}

export interface CartItem {
  productId: number;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  promoCode: 'STACK20' | 'DEV50' | null;
}

export interface CartTotals {
  subtotalHT: number;
  discount: number;
  discountLabel: string;
  netHT: number;
  tva: number;
  totalTTC: number;
  totalQty: number;
}

export interface KpiMetrics {
  sessionsCount: number;
  ordersCount: number;
  totalRevenueTTC: number;
  cac: number;
  avgOrdersPerCustomer: number;
  lastOrderId: number;
}

export interface TelemetryHop {
  node: string;
  ms: number;
}

export interface TelemetryPayload {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  status: number;
  cacheStatus: CacheStatus;
  maxHopIndex: number;
  hops: TelemetryHop[];
  summary: string;
  reqHeaders?: Record<string, string>;
  reqBody?: unknown;
  resHeaders?: Record<string, string>;
  resBody?: unknown;
  redisCmd?: string;
  sqlQuery?: string;
  explainPlan?: string;
}

export interface TelemetryLog extends TelemetryPayload {
  id: number;
  timestamp: string;
  totalLatency: number;
}

export interface LayerInfo {
  num: number;
  shortTitle: string;
  title: string;
  stack: string[];
  architecture: string;
  economics: string;
  pitfalls: string;
  demoLabel: string;
}

export interface VerifiedReview {
  orderId: string;
  badgeClass: string;
  borderClass: string;
  title: string;
  body: string;
  author: string;
  role: string;
  hashPrefix: string;
  wide?: boolean;
}

export interface SupportMessage {
  id: string;
  sender: 'bot' | 'user';
  time: string;
  text: string;
}

export interface PurchasedSummaryItem {
  product_id: number;
  sku: string;
  nom: string;
  qty: number;
  nouveau_stock: number;
}

export interface CheckoutConfirmation {
  orderId: number;
  usedKey: string;
  provider: CheckoutProvider;
  totalTTC: number;
  purchasedSummary: PurchasedSummaryItem[];
  idempotentReplay?: boolean;
}

export interface StoreSnapshot {
  products: Product[];
  cart: CartState;
  totals: CartTotals;
  kpis: KpiMetrics;
  ttfb: number;
  initialTime: string;
  initialTelemetry: TelemetryPayload;
}
