import type { LayerInfo, Product, VerifiedReview } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 101,
    sku: 'SC-API-001',
    name: 'Architecture Microservices Cloud & API Gateway',
    category: 'Cloud & APIs',
    categorySlug: 'cloud-apis',
    priceHT: 249.0,
    stock: 14,
    initialStock: 14,
    rating: 4.9,
    reviewCount: 118,
    badge: 'Best-Seller',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      'Plan de référence complet : API REST HTTP/3, authentification JWT RS256, rate-limiting distribué et Edge CDN Anycast.',
    longDesc:
      'Conçu pour encaisser des pics de trafic x20 sans dégradation de latence. Inclut les schémas OpenAPI 3.1, la configuration Terraform multi-régions et le routage Edge Anycast TLS 1.3.',
    specs: [
      'Protocole HTTP/3 QUIC + TLS 1.3 0-RTT',
      'Authentification Stateless JWT + rotation de clés JWKS',
      'Circuit-Breaker & Rate Limiting Redis Sliding Window',
    ],
    tags: ['cloud', 'api', 'rest', 'jwt', 'edge', 'cdn', 'microservices', 'tls'],
    svgKey: 'microservices',
  },
  {
    id: 102,
    sku: 'SC-DB-002',
    name: 'Cluster PostgreSQL 16 Haute Disponibilité & ACID',
    category: 'Bases de Données',
    categorySlug: 'bases-de-donnees',
    priceHT: 189.0,
    stock: 8,
    initialStock: 8,
    rating: 5.0,
    reviewCount: 94,
    badge: 'Choix Architecte',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      'Schéma relationnel e-commerce ACID, verrouillage pessimiste FOR UPDATE, index plein texte GIN tsvector et vues matérialisées.',
    longDesc:
      'Éliminez définitivement les surventes de stocks et les requêtes lentes. Ce kit fournit les migrations SQL, le réglage PgBouncer, la réplication synchrone WAL et les plans EXPLAIN ANALYZE commentés.',
    specs: [
      'Transactions ACID strictes avec SELECT ... FOR UPDATE',
      'Indexation plein texte français GIN tsvector (< 12 ms)',
      'Vue matérialisée mv_notes_produits rafraîchie sans verrou',
    ],
    tags: ['postgresql', 'sql', 'acid', 'gin', 'tsvector', 'for update', 'stock', 'base', 'bdd'],
    svgKey: 'postgres',
  },
  {
    id: 103,
    sku: 'SC-UI-003',
    name: 'Design System E-Commerce Tailwind & SSR Rapide',
    category: 'Kits UI',
    categorySlug: 'kits-ui',
    priceHT: 129.0,
    stock: 22,
    initialStock: 22,
    rating: 4.8,
    reviewCount: 73,
    badge: 'Nouveau',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      '65 composants e-commerce accessibles (WCAG AA) optimisés pour l’hydratation SSR et un LCP inférieur à 0,8 seconde.',
    longDesc:
      'Fiches produits, filtres à facettes, tiroir panier coulissant et tunnel de commande optimisés pour maximiser la conversion mobile et réduire l’abandon panier.',
    specs: [
      'Score Lighthouse 99/100 et Core Web Vitals verts',
      'Hydratation SSR progressive sans blocage du thread principal',
      'Thèmes sombre & clair accessibles au clavier',
    ],
    tags: ['ui', 'tailwind', 'ssr', 'design', 'frontend', 'accessibilite', 'conversion'],
    svgKey: 'uikit',
  },
  {
    id: 104,
    sku: 'SC-OPS-004',
    name: 'Formation DevOps : Kubernetes, CI/CD & Observabilité',
    category: 'Formations DevOps',
    categorySlug: 'formations-devops',
    priceHT: 349.0,
    stock: 6,
    initialStock: 6,
    rating: 4.9,
    reviewCount: 52,
    badge: 'Certifiant',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      '24 heures de labs pratiques : déploiement Blue/Green sans coupure, autoscaling HPA et suivi de latence P99 OpenTelemetry.',
    longDesc:
      'Maîtrisez le cycle de vie complet d’une plateforme e-commerce critique : pipelines CI/CD sécurisés, tableaux de bord Grafana/Prometheus et tests de charge k6.',
    specs: [
      'Déploiements Zero-Downtime Blue/Green & Canary',
      'Traçage distribué OpenTelemetry navigateur -> PostgreSQL',
      'Alerting SLO sur latence P99 et taux d’erreur 5xx',
    ],
    tags: ['devops', 'kubernetes', 'k8s', 'cicd', 'docker', 'p99', 'observabilite', 'formation'],
    svgKey: 'devops',
  },
  {
    id: 105,
    sku: 'SC-DB-005',
    name: 'Moteur de Cache Distribué Redis 7.2 & Sessions',
    category: 'Bases de Données',
    categorySlug: 'bases-de-donnees',
    priceHT: 159.0,
    stock: 11,
    initialStock: 11,
    rating: 4.7,
    reviewCount: 41,
    badge: 'Ultra-Rapide',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      'Patron Cache-Aside catalogue, paniers en Redis Hash (HSET/HINCRBY), prévention du Cache Stampede et Pub/Sub support.',
    longDesc:
      'Déchargez votre base PostgreSQL de 85 % des lectures répétitives. Comprend les scripts Lua atomiques, les politiques d’éviction LRU et l’invalidation événementielle.',
    specs: [
      'Latence moyenne de lecture en mémoire : 1,2 ms',
      'Structure Redis Hash pour paniers persistants avec TTL',
      'Protection anti-Thundering Herd par verrous probabilistes',
    ],
    tags: ['redis', 'cache', 'cache-aside', 'hash', 'panier', 'session', 'ttl', 'memoire'],
    svgKey: 'redis',
  },
  {
    id: 106,
    sku: 'SC-PAY-006',
    name: 'Passerelle Paiement PCI-DSS & Webhooks Idempotents',
    category: 'Cloud & APIs',
    categorySlug: 'cloud-apis',
    priceHT: 279.0,
    stock: 5,
    initialStock: 5,
    rating: 4.9,
    reviewCount: 34,
    badge: 'Sécurité Niv. 1',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    shortDesc:
      'Intégration multi-prestataires (Stripe, PayPal OAuth2, Apple Pay) avec clés d’idempotence et réconciliation ACID.',
    longDesc:
      'Sécurisez votre encaissement avec 3D-Secure 2, gestion résiliente des webhooks signés et grand livre financier en partie double pour une conformité PCI-DSS Niveau 1.',
    specs: [
      'Clés Idempotency-Key garantissant zéro double facturation',
      'Support natif Stripe Carte, PayPal OAuth2 et Apple Pay',
      'Couplage transactionnel ACID avec la table orders',
    ],
    tags: ['paiement', 'stripe', 'paypal', 'apple pay', 'pci-dss', 'acid', 'idempotence', 'oauth2'],
    svgKey: 'payment',
  },
];

export const CATEGORIES = [
  'Tous',
  'Cloud & APIs',
  'Bases de Données',
  'Kits UI',
  'Formations DevOps',
] as const;

export const LAYERS_INFO: Record<number, LayerInfo> = {
  1: {
    num: 1,
    shortTitle: 'Edge CDN, DNS, TLS 1.3 & SSR',
    title: 'Couche [1] — Infrastructure Edge CDN, DNS, TLS 1.3 & Hydratation SSR',
    stack: ['DNS Anycast BGP', 'HTTP/3 QUIC', 'TLS 1.3 (0-RTT)', 'SSR Edge'],
    architecture:
      'Lorsqu’un visiteur saisit l’URL, le routage DNS Anycast dirige sa requête vers le point de présence (PoP) le plus proche (ex. Paris CDG1). La négociation TLS 1.3 sécurise la connexion en 1 aller-retour, puis le rendu côté serveur (SSR) génère un HTML immédiatement indexable par Google et hydraté par le navigateur.',
    economics:
      'Chaque seconde supplémentaire de temps de chargement initial réduit le taux de conversion mobile de 7 % à 12 % et dégrade le référencement naturel (SEO), ce qui augmente mécaniquement le Coût d’Acquisition Client (CAC).',
    pitfalls:
      'Servir une SPA 100 % côté client sans SSR retarde le First Contentful Paint (FCP) et fait chuter la visibilité organique des fiches produits.',
    demoLabel: 'Rejouer la requête SSR initiale',
  },
  2: {
    num: 2,
    shortTitle: 'Navigation, Recherche & Cache-Aside',
    title: 'Couche [2] — Barre de Navigation, Recherche Prédictive & Cache-Aside',
    stack: ['GET /api/v1/produits?q=', 'Redis Cache-Aside', 'PostgreSQL GIN tsvector', 'Debounce 200 ms'],
    architecture:
      'La recherche applique le patron Cache-Aside : l’API interroge d’abord Redis (`GET products:search:{q}`). En cas de CACHE MISS, PostgreSQL exécute une recherche plein texte linguistique en français via un index inversé `GIN` sur `to_tsvector`, puis stocke le résultat JSON dans Redis avec un TTL de 300 secondes.',
    economics:
      'Les visiteurs qui utilisent la barre de recherche convertissent 2,4× plus que ceux qui naviguent au hasard. Une recherche instantanée (< 30 ms) réduit le taux de rebond et évite le surdimensionnement coûteux de la base SQL.',
    pitfalls:
      'Utiliser `ILIKE \'%terme%\'` force un `Sequential Scan` complet de toute la table produits et sature le CPU de PostgreSQL dès quelques milliers d’utilisateurs simultanés.',
    demoLabel: 'Simuler la recherche « acid »',
  },
  3: {
    num: 3,
    shortTitle: 'Catalogue Relationnel & SQL JOIN',
    title: 'Couche [3] — Catalogue Relationnel & Fiches Produits',
    stack: ['PostgreSQL 16', 'INNER JOIN inventory', 'LEFT JOIN mv_notes', 'Index B-Tree'],
    architecture:
      'Les données métiers sont normalisées : `products` porte le descriptif et le prix, `inventory` isole les compteurs de stock très fréquemment modifiés, et `categories` structure la taxonomie. L’ouverture d’une fiche exécute un `INNER JOIN` indexé sur les clés primaires.',
    economics:
      'Afficher un stock fiable en temps réel et des filtres réactifs (prix, notes, catégories) accélère la découverte produit et augmente directement le Panier Moyen (AOV) grâce à une meilleure adéquation besoin/offre.',
    pitfalls:
      'Le problème des requêtes N+1 (1 requête pour la liste + 1 requête par produit pour son stock) multiplie la latence P99 par 10.',
    demoLabel: 'Inspecter le produit PostgreSQL 16 (JOIN)',
  },
  4: {
    num: 4,
    shortTitle: 'Preuve Sociale & Avis Vérifiés',
    title: 'Couche [4] — Preuve Sociale & Avis Vérifiés Cryptographiquement',
    stack: ['Vue matérialisée mv_notes_produits', 'HMAC-SHA256', 'ORDER_ID lié', 'PCI-DSS'],
    architecture:
      'Recalculer `AVG(rating)` et la distribution sur des millions d’avis à chaque chargement de page est trop lent. Une vue matérialisée (`mv_notes_produits`) pré-agrège les scores en lecture O(1). Chaque avis est lié à un `ORDER_ID` payé et signé par HMAC pour prouver son authenticité.',
    economics:
      'La preuve sociale vérifiée (avis authentiques + badges PCI-DSS & garantie 30 jours) lève l’anxiété d’achat au moment critique et augmente la conversion de +15 % à +30 % tout en diminuant le taux de litiges (chargebacks).',
    pitfalls:
      'Rafraîchir une vue matérialisée sans l’option `CONCURRENTLY` bloque toutes les lectures concurrentes sur la page produit.',
    demoLabel: 'Rafraîchir la vue mv_notes_produits',
  },
  5: {
    num: 5,
    shortTitle: 'Panier Coulissant & Redis Hash',
    title: 'Couche [5] — Panier Coulissant & Session Redis Hash',
    stack: ['Redis Hash cart:usr_9482', 'HSET / HINCRBY / HDEL', 'TTL 1800 s', 'Moteur Promo & TVA 20 %'],
    architecture:
      'Le panier est un état volatile à forte fréquence d’écriture. Le stocker dans un Redis Hash (`cart:usr_9482`) offre des modifications en ~1 ms sans verrouiller PostgreSQL. Les remises (`STACK20`, `DEV50`) et la TVA (20 %) sont toujours recalculées côté serveur pour empêcher toute falsification navigateur.',
    economics:
      'Près de 70 % des paniers e-commerce sont abandonnés. Un tiroir latéral fluide sans rechargement de page, des codes promo transparents et un affichage clair du TTC réduisent drastiquement cette friction.',
    pitfalls:
      'Faire confiance au prix envoyé par le front-end dans le payload JSON expose la boutique à une manipulation tarifaire triviale.',
    demoLabel: 'Ouvrir le panier Redis Hash',
  },
  6: {
    num: 6,
    shortTitle: 'Tunnel de Paiement ACID',
    title: 'Couche [6] — Tunnel de Paiement ACID & Verrouillage Pessimiste',
    stack: ['Idempotency-Key (UUID v4)', 'BEGIN ... COMMIT', 'SELECT ... FOR UPDATE', 'Stripe / PayPal / Apple Pay'],
    architecture:
      'C’est le cœur critique d’un site e-commerce. Une clé d’idempotence protège contre les doubles clics ou coupures réseau. PostgreSQL exécute `SELECT stock FROM inventory FOR UPDATE` pour verrouiller exclusivement les lignes concernées, vérifie la disponibilité, décrémente le stock, insère la commande et valide atomiquement (`COMMIT`).',
    economics:
      'Une erreur au paiement entraîne une perte immédiate de chiffre d’affaires et une destruction de confiance (chute de la LTV). Proposer plusieurs moyens rapides (Stripe Carte, PayPal OAuth2, Apple Pay) maximise le taux de finalisation.',
    pitfalls:
      'Lire le stock hors transaction puis faire un `UPDATE` séparé crée une condition de course (race condition) : deux clients achètent le dernier exemplaire simultanément.',
    demoLabel: 'Ouvrir le tunnel de paiement ACID',
  },
  7: {
    num: 7,
    shortTitle: 'KPIs Économie Numérique, RGPD & Support',
    title: 'Couche [7] — Pied de Page : KPIs d’Économie Numérique, RGPD & Support',
    stack: ['AOV / Conversion / LTV:CAC', 'Latence API P99', 'RGPD (Opt-in & Effacement)', 'Redis Pub/Sub Support'],
    architecture:
      'Les événements de commande alimentent les agrégats analytiques (OLAP) pour piloter les KPIs économiques en continu. Les abonnements newsletter appliquent `INSERT ... ON CONFLICT` avec horodatage du consentement RGPD, et le chat support publie les messages en temps réel sur un canal Redis Pub/Sub.',
    economics:
      'Un e-commerce rentable repose sur l’équilibre `LTV : CAC >= 3 : 1`. Suivre conjointement les métriques techniques (Latence P99) et business (AOV, Conversion) permet d’investir là où l’ingénierie génère le plus de marge.',
    pitfalls:
      'Ignorer la conformité RGPD ou PCI-DSS expose l’entreprise à des amendes jusqu’à 4 % du chiffre d’affaires mondial et à la révocation du contrat bancaire (VADS).',
    demoLabel: 'Exécuter la requête SQL des KPIs',
  },
};

export const VERIFIED_REVIEWS: VerifiedReview[] = [
  {
    orderId: '88412',
    badgeClass: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    borderClass: 'border-slate-200',
    title: '« Zéro survente lors de notre Black Friday »',
    body: 'Le kit Cluster PostgreSQL 16 ACID nous a permis de remplacer nos scripts de décrémentation naïfs par des verrous pessimistes FOR UPDATE. 1 400 commandes/min sans aucune incohérence.',
    author: 'Thomas Delacroix',
    role: 'CTO @ FinShop Paris',
    hashPrefix: 'a9f4c2e18b7d',
  },
  {
    orderId: '88395',
    badgeClass: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    borderClass: 'border-slate-200',
    title: '« Latence divisée par 8 grâce au Cache-Aside Redis »',
    body: "Nous avons appliqué le patron Redis Hash pour le panier et l'indexation GIN tsvector sur notre catalogue de 120 000 références. Notre taux de conversion mobile a bondi de +18 %.",
    author: 'Inès Benali',
    role: 'Lead Architect @ ModaCloud',
    hashPrefix: 'e71d04b93f2a',
  },
  {
    orderId: '88341',
    badgeClass: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    borderClass: 'border-slate-200',
    title: '« Passerelle PCI-DSS et idempotence irréprochables »',
    body: "La passerelle PCI-DSS avec gestion d'idempotence nous a évité des doubles facturations sur réseaux mobiles instables. Documentation francophone impeccable.",
    author: 'Julien Moreau',
    role: 'Staff Engineer @ DevScale Lyon',
    hashPrefix: '4c88b2109fe3',
    wide: true,
  },
];

export const RATING_DISTRIBUTION = [
  { stars: 5, pct: 89, barClass: 'bg-[#0b1220]' },
  { stars: 4, pct: 9, barClass: 'bg-slate-600' },
  { stars: 3, pct: 2, barClass: 'bg-slate-400' },
  { stars: 2, pct: 0, barClass: 'bg-slate-200' },
  { stars: 1, pct: 0, barClass: 'bg-slate-200' },
];
