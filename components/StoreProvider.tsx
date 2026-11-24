'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { generateUUID, nowTime } from '@/lib/format';
import { filterAndSortProducts } from '@/lib/catalog-utils';
import type {
  CartState,
  CartTotals,
  CheckoutConfirmation,
  CheckoutProvider,
  KpiMetrics,
  Product,
  SortOption,
  StoreSnapshot,
  SupportMessage,
  TelemetryLog,
  TelemetryPayload,
  TelemetryTab,
  ToastType,
} from '@/lib/types';
import ArchitectHeader from './ArchitectHeader';
import FooterKpisSection from './FooterKpisSection';
import InfoModal, { type InfoModalState } from './InfoModal';
import SupportWidget from './SupportWidget';
import { IconAlertCircle, IconCheck, IconTerminal, IconX } from './Icons';

export type SearchCachePillState = 'ready' | 'hit' | 'miss' | 'flushed';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface PromoFeedback {
  text: string;
  tone: 'success' | 'warn' | 'error';
}

interface StoreContextValue {
  // Données principales
  products: Product[];
  visibleProducts: Product[];
  cart: CartState;
  totals: CartTotals;
  kpis: KpiMetrics;
  ttfb: number;
  ssrPulseKey: number;
  kpiFlashKey: number;
  p99Latency: number;

  // Recherche & catalogue
  searchQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  cachePill: SearchCachePillState;
  lastSearchKey: string;
  searchLoading: boolean;

  // Mode X-Ray & télémétrie
  xrayActive: boolean;
  logs: TelemetryLog[];
  selectedLogId: number | null;
  activeTab: TelemetryTab;
  animSeed: number;

  // Panier & paiement
  promoFeedback: PromoFeedback | null;
  cartMutatingId: number | null;
  promoSubmitting: boolean;
  checkoutProvider: CheckoutProvider;
  idempotencyKey: string;
  checkoutConfirmation: CheckoutConfirmation | null;
  checkoutSubmitting: boolean;
  checkoutError: string | null;

  // États de chargement ponctuels
  replayingSsr: boolean;
  pingingNode: string | null;
  refreshingView: boolean;
  verifyingOrderId: string | null;
  inspectingKpis: boolean;

  // Actions
  toggleXray: () => void;
  setActiveTab: (tab: TelemetryTab) => void;
  setSelectedLogId: (id: number | null) => void;
  clearLogs: () => void;
  replayAnimation: () => void;

  replaySSR: () => Promise<void>;
  pingNode: (node: 'edge' | 'api' | 'redis' | 'postgres') => Promise<void>;
  handleSearchChange: (q: string, immediate?: boolean) => void;
  flushCache: () => Promise<void>;
  selectCategory: (cat: string) => Promise<void>;
  changeSort: (sort: SortOption) => Promise<void>;
  resetFilters: () => void;
  fetchProductDetail: (productId: number) => Promise<{
    product: Product;
    sqlDetail: string;
  } | null>;
  refreshMaterializedView: () => Promise<void>;
  verifySignature: (orderId: string, hashPrefix: string) => Promise<void>;

  addToCart: (productId: number) => Promise<void>;
  updateQty: (productId: number, delta: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  applyPromo: (code: string) => Promise<void>;

  setCheckoutProvider: (p: CheckoutProvider) => void;
  regenerateIdempotencyKey: () => void;
  resetCheckoutConfirmation: () => void;
  quickAddDemoProduct: () => Promise<void>;
  executeCheckout: (customerName: string, customerEmail: string) => Promise<void>;

  inspectKpis: () => Promise<void>;
  openLayerModal: (num: number) => void;
  openLegalModal: (kind: 'rgpd' | 'pcidss') => void;
  openSupport: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const LAYER_ROUTES: Record<number, string> = {
  1: '/',
  2: '/catalogue',
  3: '/catalogue',
  4: '/avis',
  5: '/panier',
  6: '/paiement',
  7: '/laboratoire',
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore doit être utilisé à l’intérieur de StoreProvider.');
  }
  return ctx;
}

export function StoreProvider({
  initialSnapshot,
  children,
}: {
  initialSnapshot: StoreSnapshot;
  children: ReactNode;
}) {
  const router = useRouter();

  // État Boutique & Serveur
  const [products, setProducts] = useState<Product[]>(initialSnapshot.products);
  const [cart, setCart] = useState<CartState>(initialSnapshot.cart);
  const [totals, setTotals] = useState<CartTotals>(initialSnapshot.totals);
  const [kpis, setKpis] = useState<KpiMetrics>(initialSnapshot.kpis);
  const [ttfb, setTtfb] = useState<number>(initialSnapshot.ttfb);
  const [ssrPulseKey, setSsrPulseKey] = useState(0);
  const [kpiFlashKey, setKpiFlashKey] = useState(0);

  // Recherche, Filtres & Tri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState<SortOption>('rating_desc');
  const [cachePill, setCachePill] = useState<SearchCachePillState>('ready');
  const [lastSearchKey, setLastSearchKey] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeqRef = useRef(0);

  // Mode X-Ray & Laboratoire Télémétrie
  const [xrayActive, setXrayActive] = useState(false);
  const [activeTab, setActiveTab] = useState<TelemetryTab>('flow');
  const [animSeed, setAnimSeed] = useState(1);

  const logSeqRef = useRef(1);
  const [logs, setLogs] = useState<TelemetryLog[]>(() => {
    const init = initialSnapshot.initialTelemetry;
    const totalLatency = init.hops.reduce((acc, h) => acc + h.ms, 0);
    return [
      {
        ...init,
        id: 1,
        timestamp: initialSnapshot.initialTime,
        totalLatency,
      },
    ];
  });
  const [selectedLogId, setSelectedLogId] = useState<number | null>(1);

  // Panier & Paiement
  const [promoFeedback, setPromoFeedback] = useState<PromoFeedback | null>(null);
  const [cartMutatingId, setCartMutatingId] = useState<number | null>(null);
  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [checkoutProvider, setCheckoutProvider] = useState<CheckoutProvider>('stripe');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(
    'idem-00000000-0000-4000-8000-000000000000'
  );
  const [checkoutConfirmation, setCheckoutConfirmation] =
    useState<CheckoutConfirmation | null>(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // États de chargement ponctuels
  const [replayingSsr, setReplayingSsr] = useState(false);
  const [pingingNode, setPingingNode] = useState<string | null>(null);
  const [refreshingView, setRefreshingView] = useState(false);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [inspectingKpis, setInspectingKpis] = useState(false);

  // Modale pédagogique / légale & Support Chat
  const [infoModal, setInfoModal] = useState<InfoModalState>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => [
    {
      id: 'init-bot',
      sender: 'bot',
      time: initialSnapshot.initialTime,
      text: 'Bonjour. Je suis l’assistant ingénierie StackCraft. Posez-moi une question sur nos kits, les codes promo (STACK20 / DEV50), PostgreSQL ACID ou le RGPD.',
    },
  ]);

  // Initialisation côté client d'un UUID v4 réel pour Idempotency-Key
  useEffect(() => {
    setIdempotencyKey(generateUUID());
  }, []);

  // Fermeture globale sur Échap
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setInfoModal(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toasts
  const toastSeqRef = useRef(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    toastSeqRef.current += 1;
    const id = toastSeqRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const recordTelemetry = useCallback((entry: TelemetryPayload) => {
    logSeqRef.current += 1;
    const id = logSeqRef.current;
    const totalLatency = entry.hops.reduce((acc, h) => acc + h.ms, 0);
    const log: TelemetryLog = {
      ...entry,
      id,
      timestamp: nowTime(),
      totalLatency,
    };
    setLogs((prev) => [log, ...prev].slice(0, 40));
    setSelectedLogId(id);
    setAnimSeed((v) => v + 1);
  }, []);

  // Produits filtrés côté client instantanément
  const visibleProducts = useMemo(
    () => filterAndSortProducts(products, searchQuery, selectedCategory, sortBy),
    [products, searchQuery, selectedCategory, sortBy]
  );

  // Calcul dynamique Latence P99
  const p99Latency = useMemo(() => {
    if (!logs.length) return 34;
    const latencies = logs.map((l) => l.totalLatency).sort((a, b) => a - b);
    const idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.99));
    return latencies[idx];
  }, [logs]);

  // Couche [1] : Rejouer SSR & Health checks
  const replaySSR = useCallback(async () => {
    setReplayingSsr(true);
    try {
      const res = await fetch('/api/v1/ssr', { cache: 'no-store' });
      if (!res.ok) throw new Error('Erreur SSR');
      const data = (await res.json()) as StoreSnapshot;
      setTtfb(data.ttfb);
      setSsrPulseKey((v) => v + 1);
      recordTelemetry(data.initialTelemetry);
      showToast('Requête SSR initiale (HTTP/3 + TLS 1.3) rejouée.', 'info');
    } catch {
      showToast('Impossible de rejouer la requête SSR.', 'error');
    } finally {
      setReplayingSsr(false);
    }
  }, [recordTelemetry, showToast]);

  const pingNode = useCallback(
    async (node: 'edge' | 'api' | 'redis' | 'postgres') => {
      setPingingNode(node);
      try {
        const res = await fetch(`/api/v1/health/${node}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Erreur health');
        const data = (await res.json()) as { nodeName: string; telemetry: TelemetryPayload };
        recordTelemetry(data.telemetry);
        showToast(`Contrôle de santé exécuté sur : ${data.nodeName}`, 'info');
      } catch {
        showToast('Échec du contrôle de santé sur le nœud.', 'error');
      } finally {
        setPingingNode(null);
      }
    },
    [recordTelemetry, showToast]
  );

  // Couche [2] : Recherche prédictive Cache-Aside
  const runSearchApi = useCallback(
    async (q: string, cat: string, sort: SortOption) => {
      const cleanQ = q.trim();
      if (!cleanQ) {
        setCachePill('ready');
        setLastSearchKey('');
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      const seq = ++searchSeqRef.current;
      try {
        const params = new URLSearchParams({
          q: cleanQ,
          categorie: cat,
          sort,
          trigger: 'search',
        });
        const res = await fetch(`/api/v1/produits?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Erreur recherche');
        const data = (await res.json()) as {
          cacheHit: boolean;
          cacheKey: string;
          telemetry: TelemetryPayload;
        };
        if (seq !== searchSeqRef.current) return;
        setCachePill(data.cacheHit ? 'hit' : 'miss');
        setLastSearchKey(data.cacheKey || `products:search:${cleanQ.toLowerCase()}`);
        recordTelemetry(data.telemetry);
      } catch {
        showToast('Erreur lors de la recherche catalogue.', 'error');
      } finally {
        setSearchLoading(false);
      }
    },
    [recordTelemetry, showToast]
  );

  const handleSearchChange = useCallback(
    (q: string, immediate = false) => {
      setSearchQuery(q);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (!q.trim()) {
        searchSeqRef.current += 1;
        setCachePill('ready');
        setLastSearchKey('');
        setSearchLoading(false);
        return;
      }
      searchDebounceRef.current = setTimeout(
        () => {
          void runSearchApi(q, selectedCategory, sortBy);
        },
        immediate ? 0 : 220
      );
    },
    [runSearchApi, selectedCategory, sortBy]
  );

  const flushCache = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/cache/search', { method: 'DELETE' });
      const data = (await res.json()) as { telemetry: TelemetryPayload; erreur?: string };
      if (!res.ok) throw new Error(data.erreur || 'Erreur serveur lors du vidage du cache');
      setCachePill('flushed');
      setLastSearchKey('');
      recordTelemetry(data.telemetry);
      showToast('Cache de recherche Redis vidé.', 'warn');
    } catch {
      showToast('Erreur lors du vidage du cache Redis.', 'error');
    }
  }, [recordTelemetry, showToast]);

  // Couche [3] : Catégorie, Tri & Fiche Produit
  const selectCategory = useCallback(
    async (cat: string) => {
      setSelectedCategory(cat);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          categorie: cat,
          sort: sortBy,
          trigger: 'filter',
        });
        const res = await fetch(`/api/v1/produits?${params.toString()}`, { cache: 'no-store' });
        const data = (await res.json()) as { telemetry: TelemetryPayload };
        if (!res.ok) throw new Error('Erreur serveur lors du filtrage');
        if (data.telemetry) recordTelemetry(data.telemetry);
      } catch {
        showToast('Erreur lors du filtrage du catalogue.', 'error');
      }
    },
    [recordTelemetry, searchQuery, sortBy, showToast]
  );

  const changeSort = useCallback(
    async (sort: SortOption) => {
      setSortBy(sort);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          categorie: selectedCategory,
          sort,
          trigger: 'sort',
        });
        const res = await fetch(`/api/v1/produits?${params.toString()}`, { cache: 'no-store' });
        const data = (await res.json()) as { telemetry: TelemetryPayload };
        if (!res.ok) throw new Error('Erreur serveur lors du tri');
        if (data.telemetry) recordTelemetry(data.telemetry);
      } catch {
        showToast('Erreur lors du tri du catalogue.', 'error');
      }
    },
    [recordTelemetry, searchQuery, selectedCategory, showToast]
  );

  const resetFilters = useCallback(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchSeqRef.current += 1;
    setSearchQuery('');
    setSelectedCategory('Tous');
    setSortBy('rating_desc');
    setCachePill('ready');
    setLastSearchKey('');
    setSearchLoading(false);
  }, []);

  const fetchProductDetail = useCallback(
    async (productId: number): Promise<{ product: Product; sqlDetail: string } | null> => {
      try {
        const res = await fetch(`/api/v1/produits/${productId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          product: Product;
          sqlDetail: string;
          telemetry: TelemetryPayload;
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
        if (data.telemetry) recordTelemetry(data.telemetry);
        return { product: data.product, sqlDetail: data.sqlDetail };
      } catch {
        showToast('Erreur lors du chargement de la fiche produit.', 'error');
        return null;
      }
    },
    [recordTelemetry, showToast]
  );

  // Couche [4] : Vue matérialisée & HMAC
  const refreshMaterializedView = useCallback(async () => {
    setRefreshingView(true);
    try {
      const res = await fetch('/api/v1/avis/refresh-vue', { method: 'POST' });
      const data = (await res.json()) as { telemetry: TelemetryPayload; erreur?: string };
      if (!res.ok) throw new Error(data.erreur || 'Erreur serveur lors du rafraîchissement');
      if (data.telemetry) recordTelemetry(data.telemetry);
      showToast('Vue matérialisée mv_notes_produits rafraîchie sans verrou.', 'success');
    } catch {
      showToast('Erreur lors du rafraîchissement de la vue matérialisée.', 'error');
    } finally {
      setRefreshingView(false);
    }
  }, [recordTelemetry, showToast]);

  const verifySignature = useCallback(
    async (orderId: string, hashPrefix: string) => {
      setVerifyingOrderId(orderId);
      try {
        const res = await fetch(
          `/api/v1/avis/verifier?order_id=${encodeURIComponent(orderId)}&hash=${encodeURIComponent(hashPrefix)}`,
          { cache: 'no-store' }
        );
        const data = (await res.json()) as { telemetry: TelemetryPayload; erreur?: string };
        if (!res.ok) throw new Error(data.erreur || 'Signature invalide');
        if (data.telemetry) recordTelemetry(data.telemetry);
        showToast(`Signature HMAC-SHA256 de ORDER_ID #${orderId} vérifiée.`, 'success');
      } catch {
        showToast('Erreur lors de la vérification de la signature.', 'error');
      } finally {
        setVerifyingOrderId(null);
      }
    },
    [recordTelemetry, showToast]
  );

  // Couche [5] : Panier Redis Hash & Codes Promo
  const addToCart = useCallback(
    async (productId: number) => {
      setCartMutatingId(productId);
      try {
        const res = await fetch('/api/v1/panier/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.erreur || 'Impossible d’ajouter ce produit.', 'warn');
          return;
        }
        setCart(data.cart);
        setTotals(data.totals);
        if (checkoutConfirmation) setIdempotencyKey(generateUUID());
        setCheckoutConfirmation(null);
        setCheckoutError(null);
        if (data.telemetry) recordTelemetry(data.telemetry);
        showToast(`« ${data.productName} » ajouté au panier.`, 'success');
      } catch {
        showToast('Erreur lors de l’ajout au panier.', 'error');
      } finally {
        setCartMutatingId(null);
      }
    },
    [recordTelemetry, showToast, checkoutConfirmation]
  );

  const updateQty = useCallback(
    async (productId: number, delta: number) => {
      setCartMutatingId(productId);
      try {
        const res = await fetch(`/api/v1/panier/articles/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.erreur || 'Mise à jour impossible.', 'warn');
          return;
        }
        setCart(data.cart);
        setTotals(data.totals);
        if (data.cart.items.length === 0) setPromoFeedback(null);
        if (data.telemetry) recordTelemetry(data.telemetry);
      } catch {
        showToast('Erreur lors de la mise à jour du panier.', 'error');
      } finally {
        setCartMutatingId(null);
      }
    },
    [recordTelemetry, showToast]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      setCartMutatingId(productId);
      try {
        const res = await fetch(`/api/v1/panier/articles/${productId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) return;
        setCart(data.cart);
        setTotals(data.totals);
        if (data.cart.items.length === 0) setPromoFeedback(null);
        if (data.telemetry) recordTelemetry(data.telemetry);
      } catch {
        showToast('Erreur lors de la suppression de l’article.', 'error');
      } finally {
        setCartMutatingId(null);
      }
    },
    [recordTelemetry, showToast]
  );

  const applyPromo = useCallback(
    async (code: string) => {
      setPromoSubmitting(true);
      try {
        const res = await fetch('/api/v1/panier/promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (data.telemetry) recordTelemetry(data.telemetry);

        if (res.ok && data.valide) {
          setCart(data.cart);
          setTotals(data.totals);
          setPromoFeedback({ text: data.message, tone: 'success' });
          showToast(`Code promo ${data.code} appliqué.`, 'success');
        } else {
          setPromoFeedback({
            text: data.message || 'Code promo invalide.',
            tone: res.status === 400 ? 'warn' : 'error',
          });
        }
      } catch {
        showToast('Erreur lors de l’application du code promo.', 'error');
      } finally {
        setPromoSubmitting(false);
      }
    },
    [recordTelemetry, showToast]
  );

  // Couche [6] : Tunnel de Paiement ACID
  const regenerateIdempotencyKey = useCallback(() => {
    setIdempotencyKey(generateUUID());
    setCheckoutError(null);
  }, []);

  const resetCheckoutConfirmation = useCallback(() => {
    setCheckoutConfirmation(null);
    setCheckoutError(null);
    setIdempotencyKey(generateUUID());
  }, []);

  const quickAddDemoProduct = useCallback(async () => {
    await addToCart(102);
    setCheckoutConfirmation(null);
    setCheckoutError(null);
    setIdempotencyKey(generateUUID());
  }, [addToCart]);

  const executeCheckout = useCallback(
    async (customerName: string, customerEmail: string) => {
      if (!customerName.trim() || !customerEmail.trim()) {
        setCheckoutError('Veuillez renseigner le nom complet et l’adresse e-mail.');
        return;
      }
      setCheckoutSubmitting(true);
      setCheckoutError(null);
      try {
        const res = await fetch('/api/v1/commandes/paiement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            provider: checkoutProvider,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            idempotencyKey,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.erreur || 'ROLLBACK ACID : erreur de paiement.';
          setCheckoutError(errMsg);
          showToast(errMsg, 'error');
          return;
        }
        setProducts(data.products);
        setCart(data.cart);
        setTotals(data.totals);
        setKpis(data.kpis);
        setPromoFeedback(null);
        setCachePill('ready');
        setLastSearchKey('');
        setCheckoutConfirmation(data.confirmation);
        setKpiFlashKey((v) => v + 1);
        if (data.telemetry) recordTelemetry(data.telemetry);
        if (data.confirmation.idempotentReplay) {
          showToast(
            `Rejeu idempotent de la commande #${data.confirmation.orderId} : aucun double débit, aucun double décrément de stock.`,
            'info'
          );
        } else {
          showToast(
            `Commande #${data.confirmation.orderId} validée. Stocks et KPIs mis à jour.`,
            'success'
          );
        }
      } catch {
        setCheckoutError('Erreur réseau pendant l’exécution de la transaction ACID.');
        showToast('Erreur réseau pendant la validation du paiement.', 'error');
      } finally {
        setCheckoutSubmitting(false);
      }
    },
    [checkoutProvider, idempotencyKey, recordTelemetry, showToast]
  );

  // Couche [7] : KPIs OLAP, Newsletter & Support Chat
  const inspectKpis = useCallback(async () => {
    setInspectingKpis(true);
    try {
      const res = await fetch('/api/v1/analytics/kpis', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { erreur?: string }).erreur || 'Erreur serveur KPIs');
      setKpis(data.kpis);
      if (data.telemetry) recordTelemetry(data.telemetry);
      showToast('Requête SQL analytique (KPIs OLAP) capturée dans le laboratoire.', 'info');
    } catch {
      showToast('Erreur lors de la récupération des KPIs.', 'error');
    } finally {
      setInspectingKpis(false);
    }
  }, [recordTelemetry, showToast]);

  const submitNewsletter = useCallback(
    async (
      email: string,
      consentement_rgpd: boolean
    ): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch('/api/v1/abonnes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, consentement_rgpd }),
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = (data.erreur as string) || 'Erreur lors de l’inscription.';
          showToast(msg, 'error');
          return { ok: false, message: msg };
        }
        if (data.telemetry) recordTelemetry(data.telemetry);
        showToast('Abonnement newsletter enregistré.', 'success');
        return { ok: true, message: (data.message as string) || 'Inscription enregistrée.' };
      } catch {
        const msg = 'Erreur réseau lors de l’inscription à la newsletter.';
        showToast(msg, 'error');
        return { ok: false, message: msg };
      }
    },
    [recordTelemetry, showToast]
  );

  const sendSupportMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      setSupportMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', time: nowTime(), text: clean },
      ]);
      setSupportSending(true);

      try {
        const res = await fetch('/api/v1/support/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: clean }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { erreur?: string }).erreur || 'Erreur support');
        if (data.telemetry) recordTelemetry(data.telemetry);

        setTimeout(() => {
          setSupportMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              time: nowTime(),
              text: data.reply || 'Message reçu par le support StackCraft.',
            },
          ]);
        }, 450);
      } catch {
        showToast('Erreur lors de l’envoi du message support.', 'error');
        setSupportMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            time: nowTime(),
            text: 'Erreur : le support est momentanément indisponible.',
          },
        ]);
      } finally {
        setSupportSending(false);
      }
    },
    [recordTelemetry, showToast]
  );

  const toggleXray = useCallback(() => {
    setXrayActive((prev) => {
      const next = !prev;
      if (next) {
        showToast(
          'Mode Inspection X-Ray actif : cliquez sur les badges [1] à [7] pour analyser chaque couche.',
          'info'
        );
      }
      return next;
    });
  }, [showToast]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setSelectedLogId(null);
  }, []);

  const replayAnimation = useCallback(() => {
    setAnimSeed((v) => v + 1);
  }, []);

  const handleNavigateToLayer = useCallback(
    (num: number) => {
      setInfoModal(null);
      const target = LAYER_ROUTES[num] || '/';
      router.push(target);
    },
    [router]
  );

  const handleLayerDemoAction = useCallback(
    (num: number) => {
      setInfoModal(null);
      switch (num) {
        case 1:
          router.push('/');
          void replaySSR();
          break;
        case 2:
          router.push('/catalogue');
          handleSearchChange('acid', true);
          break;
        case 3:
          router.push('/produits/102');
          break;
        case 4:
          router.push('/avis');
          void refreshMaterializedView();
          break;
        case 5:
          router.push('/panier');
          break;
        case 6:
          router.push('/paiement');
          break;
        case 7:
          router.push('/laboratoire');
          void inspectKpis();
          break;
      }
    },
    [router, replaySSR, handleSearchChange, refreshMaterializedView, inspectKpis]
  );

  const value: StoreContextValue = {
    products,
    visibleProducts,
    cart,
    totals,
    kpis,
    ttfb,
    ssrPulseKey,
    kpiFlashKey,
    p99Latency,
    searchQuery,
    selectedCategory,
    sortBy,
    cachePill,
    lastSearchKey,
    searchLoading,
    xrayActive,
    logs,
    selectedLogId,
    activeTab,
    animSeed,
    promoFeedback,
    cartMutatingId,
    promoSubmitting,
    checkoutProvider,
    idempotencyKey,
    checkoutConfirmation,
    checkoutSubmitting,
    checkoutError,
    replayingSsr,
    pingingNode,
    refreshingView,
    verifyingOrderId,
    inspectingKpis,
    toggleXray,
    setActiveTab,
    setSelectedLogId,
    clearLogs,
    replayAnimation,
    replaySSR,
    pingNode,
    handleSearchChange,
    flushCache,
    selectCategory,
    changeSort,
    resetFilters,
    fetchProductDetail,
    refreshMaterializedView,
    verifySignature,
    addToCart,
    updateQty,
    removeItem,
    applyPromo,
    setCheckoutProvider,
    regenerateIdempotencyKey,
    resetCheckoutConfirmation,
    quickAddDemoProduct,
    executeCheckout,
    inspectKpis,
    openLayerModal: (num) => setInfoModal({ type: 'layer', num }),
    openLegalModal: (kind) => setInfoModal({ type: 'legal', kind }),
    openSupport: () => setSupportOpen(true),
  };

  return (
    <StoreContext.Provider value={value}>
      <div className={`min-h-screen flex flex-col bg-white text-[#0b1220] ${xrayActive ? 'xray-active' : ''}`}>
        <ArchitectHeader
          xrayActive={xrayActive}
          onToggleXray={toggleXray}
          onOpenLayerModal={(num) => setInfoModal({ type: 'layer', num })}
          cartCount={totals.totalQty}
          logCount={logs.length}
        />

        <main className="flex-1 pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">{children}</div>
        </main>

        <FooterKpisSection
          kpis={kpis}
          p99Latency={p99Latency}
          kpiFlashKey={kpiFlashKey}
          inspectingKpis={inspectingKpis}
          onInspectKpis={() => void inspectKpis()}
          onNewsletterSubmit={submitNewsletter}
          onOpenLegalModal={(kind) => setInfoModal({ type: 'legal', kind })}
          onOpenSupport={() => setSupportOpen(true)}
          onOpenLayerModal={(num) => setInfoModal({ type: 'layer', num })}
        />

        <InfoModal
          modal={infoModal}
          onClose={() => setInfoModal(null)}
          onNavigateToLayer={handleNavigateToLayer}
          onLayerDemoAction={handleLayerDemoAction}
        />

        <SupportWidget
          open={supportOpen}
          messages={supportMessages}
          sending={supportSending}
          onToggle={(force) => setSupportOpen((v) => (force !== undefined ? force : !v))}
          onSendMessage={(txt) => void sendSupportMessage(txt)}
        />

        {/* Notifications toast discrètes en thème clair */}
        {toasts.length > 0 && (
          <div
            aria-live="polite"
            className="fixed bottom-5 left-4 sm:left-5 z-50 space-y-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-white border shadow-soft text-xs ${
                  t.type === 'error'
                    ? 'border-rose-300 text-rose-800'
                    : t.type === 'warn'
                      ? 'border-amber-300 text-amber-800'
                      : t.type === 'success'
                        ? 'border-emerald-300 text-emerald-800'
                        : 'border-slate-200 text-[#0b1220]'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {t.type === 'success' ? (
                    <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                  ) : t.type === 'error' || t.type === 'warn' ? (
                    <IconAlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <IconTerminal className="w-3.5 h-3.5 text-cyan-700" />
                  )}
                </span>
                <span className="flex-1 leading-snug">{t.message}</span>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Fermer la notification"
                  className="text-slate-500 hover:text-[#0b1220] shrink-0"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreContext.Provider>
  );
}
