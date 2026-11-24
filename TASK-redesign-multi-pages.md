# TÂCHE — Refonte « minimal white » + site e-commerce multi-pages (StackCraft Commerce)

Projet Next.js 15 (App Router) + Tailwind CSS 3.4 + TypeScript, racine du dépôt : ce dossier.
État actuel : application mono-page sombre (`app/page.tsx` → `components/StackCraftApp.tsx`, ~5 500 lignes au total dans `components/` et `lib/`), avec routes API dans `app/api/v1/*` et un magasin serveur dans `lib/server-store.ts`.
Brief original : `prompt_cahier_des_charges_pour_workspace_ia_local_fr.md` (à relire). Contexte produit : `PRODUCT.md`.

## Objectif 1 — Refonte visuelle « minimal white » (direction épinglée par l'utilisateur)

Passer toute l'interface d'un thème sombre à un thème **blanc minimal** :

- Fonds : blanc `#ffffff` et gris très clair `#fafafa`/`#f5f5f4` pour les sections alternées ; plus aucun fond sombre.
- Texte : encre quasi-noir (ex. `#0b1220` / slate-900) ; texte secondaire en slate-600 (contraste ≥ 4,5:1).
- Bordures : filets fins (`border-slate-200`), séparations par lignes horizontales fines plutôt que par cartes ombrées.
- Une seule couleur d'accentuation : un cyan foncé lisible sur blanc (ex. `cyan-600` `#0891b2`), **réservé aux éléments techniques** : badges de couche [1]–[7], mode X-Ray, états actifs, petits indicateurs. Pas d'accent sur les titres.
- Ombres : douces, avec offset vertical et flou (ex. `shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.06)]`) ; jamais d'ombre dure à offset nul.
- Typographie : Inter (déjà chargée via `next/font`) pour tout le texte ; JetBrains Mono **uniquement** pour le code, les requêtes SQL/Redis et les données chiffrées (prix, KPIs en chiffres tabulaires).
- `tailwind.config.js` / `globals.css` / `app/layout.tsx` : redéfinir les tokens (couleurs `surface-*` → palette claire) pour que tous les composants existants basculent proprement.

**Interdictions (floor de qualité) :** pas de dégradés (texte ou fonds), pas de glassmorphism décoratif, pas d'emoji ni de glyphes unicode comme icônes (SVG inline dessinés, style trait cohérent), pas de « kicker/eyebrow » au-dessus des titres, pas de rangées de cartes icône+titre+texte identiques comme structure de page, pas de template « hero-métrique » (gros chiffre + label), pas de numéros de section 01/02/03, pas de modale pour une tâche qui n'en a pas besoin. États hover/focus/disabled/chargement/erreur/vide obligatoires ; focus clavier visible ; `::selection` et scrollbars thématisés en clair ; responsive mobile → desktop vérifié.

## Objectif 2 — Multi-pages : une page par module e-commerce (App Router)

Créer des routes dédiées, avec navigation commune (header fixe + footer) :

| Route | Module (couche) | Contenu |
|---|---|---|
| `/` | Accueil — couche [1] | Héro (proposition de valeur FR), carte de topologie (Edge CDN Anycast, API REST+JWT, Redis 7.2, PostgreSQL 16), bouton « Rejouer la requête SSR », liens vers les autres pages |
| `/catalogue` | Couches [2]+[3] | Barre de recherche prédictive (simule `GET /api/v1/produits?q=...`, explication GIN tsvector vs cache Redis), filtres par catégorie (Tous, Cloud & APIs, Bases de Données, Kits UI, Formations DevOps), tri (prix croissant/décroissant, mieux notés), grille des 6 produits (SVG inline, badges, notes, prix en €, stock), chaque produit lien vers sa fiche |
| `/produits/[id]` | Fiche produit — couche [3] | Détail produit + requête SQL `INNER JOIN` / `LEFT JOIN` expliquée (`lib/server-store.ts` `buildProductDetailSql`), stock, ajout au panier |
| `/avis` | Preuve sociale — couche [4] | Bandeaux de confiance (PCI-DSS Niveau 1, verrouillage ACID, garantie 30 jours), distribution des notes (`mv_notes_produits`), avis clients vérifiés (`ORDER_ID #88412`, hash) |
| `/panier` | Panier — couche [5] | Articles, quantités +/-, suppression, clé Redis `cart:usr_9482`, codes promo **STACK20** (-20 %) et **DEV50** (-50,00 €), TVA 20 %, total TTC (calculs réels via `computeCartTotals`) |
| `/paiement` | Tunnel de paiement — couche [6] | Modale/section de paiement : `Idempotency-Key` UUID v4, prestataires Stripe Carte / PayPal OAuth2 / Apple Pay, transaction simulée `BEGIN; SELECT ... FOR UPDATE; UPDATE stock; INSERT INTO orders; COMMIT;`, décrémentation réelle des stocks, vidage du panier, recalcul des 4 KPIs |
| `/laboratoire` | Télémétrie + KPIs — couche [7] | 4 KPIs dynamiques (Taux de conversion, Panier moyen AOV, Ratio LTV:CAC, Latence API P99), journal des requêtes, 3 onglets : flux de paquets animé 5 nœuds (Navigateur → Edge CDN → API → Redis 7 → PostgreSQL, badge CACHE HIT/MISS), en-têtes HTTP/3 + JSON, SQL/Redis + EXPLAIN ANALYZE |

Rules de navigation :

- Header fixe commun : logo/titre « StackCraft Commerce », liens vers `/`, `/catalogue`, `/avis`, `/panier` (avec compteur d'articles), `/paiement`, `/laboratoire`, toggle « Mode Inspection X-Ray » (bordures pointillées + badges `[1]`…`[7]` sur chaque page selon la couche montrée), lien laboratoire.
- Footer commun : 4 KPIs, newsletter (`POST /api/v1/abonnes`), modales légales RGPD/PCI-DSS, widget chat support (`POST /api/v1/support/messages`).
- **Refactor d'état obligatoire** : déplacer l'état global (products, cart, totals, kpis, xray, logs télémétrie, toasts, modales) hors de `StackCraftApp.tsx` dans un `StoreProvider` (React context) installé dans `app/layout.tsx`, afin que le panier/KPIs persistent entre les pages (navigation client). Chaque page consomme le contexte. Réutiliser/adapter les composants existants (`HeroSection`, `CatalogSection`, `SocialProofSection`, `CartDrawer`, `CheckoutModal`, `TelemetryLab`, `FooterKpisSection`, `SupportWidget`, etc.) plutôt que de tout réécrire ; supprimer le code mort.
- Conserver tel quel le comportement métier : 6 produits (`lib/data.ts`), promos STACK20/DEV50, TVA 20 %, décrément de stock, KPIs recalculés après commande, routes `app/api/v1/*` (ne pas les casser), X-Ray, 100 % de l'interface en français (termes techniques anglais autorisés : GET, SQL, Redis, ACID, AOV…), **aucune image externe** (SVG embarqués uniquement).

## Contraintes techniques

- Next.js 15 App Router, TypeScript strict, Tailwind 3.4. `npm run build` et `npm run lint` doivent passer sans erreur.
- Pages en français, `lang="fr"` conservé. Métadonnées par page (`metadata`).
- Pas de nouvelles dépendances externes ; pas d'images externes ; pas de fonts externes supplémentaires (Inter/JetBrains Mono déjà là).
- Responsive : composer correctement à 390 px (mobile) et 1440 px (desktop) ; tester les états vides (panier vide, recherche sans résultat).

## Livrables attendus

1. Le code modifié dans ce dépôt (routes ci-dessus, thème blanc minimal, provider d'état global).
2. `DESIGN.md` à la racine décrivant le nouveau système de design (palette claire, typographie, composants, règles du mode X-Ray) — ce document n'existe pas encore.
3. `npm run build` et `npm run lint` verts à la fin.

Ne modifie pas `ecommerce-tutoriel-fr.html` (artefact original) ni le cahier des charges. Travaille en français dans le code et les commentaires.
