# DESIGN.md — Système de design « Minimal White » (StackCraft Commerce)

Ce document décrit le système visuel, typographique et architectural appliqué à **StackCraft Commerce** lors de la refonte multi-pages Next.js App Router.

---

## 1. Intention visuelle

StackCraft Commerce associe deux usages : une boutique technique crédible et un support pédagogique exposant ses 7 couches d'architecture (Edge CDN, recherche Cache-Aside, catalogue relationnel, preuve sociale, session Redis Hash, paiement ACID, télémétrie et KPIs).

La direction **Minimal White** privilégie la lisibilité documentaire : fonds blancs et neutres très clairs, typographie nette en encre sombre, hiérarchie par filets fins (`1px`) plutôt que par cartes lourdes, et une unique couleur d'accentuation technique réservée aux couches et indicateurs système.

---

## 2. Palette de couleurs & contraste

Toutes les combinaisons texte/fond respectent un rapport de contraste **≥ 4,5:1 (WCAG AA)**.

| Rôle | Token / Classe | Valeur hex | Usage |
| :--- | :--- | :--- | :--- |
| Fond principal | `bg-white` / `surface` | `#ffffff` | Corps de page, cartes produit, panneaux de code, en-tête fixe |
| Fond secondaire | `bg-[#fafafa]` / `surface-50` | `#fafafa` | Zones techniques, pied de page, encadrés de synthèse, schémas SVG |
| Fond tertiaire | `surface-100` | `#f5f5f4` | Surfaces neutres subtiles |
| Bordures / filets | `border-slate-200` | `#e2e8f0` | Séparations horizontales, encadrements fins, grilles tabulaires |
| Bordures interactives | `border-slate-300` | `#cbd5e1` | Champs de saisie, boutons secondaires au repos |
| Encre principale | `text-[#0b1220]` / `ink-950` | `#0b1220` | Titres (`h1`–`h4`), prix, valeurs KPI, boutons CTA primaires (`bg-[#0b1220] text-white`) |
| Encre secondaire | `text-slate-600` | `#475569` | Textes descriptifs, labels, métadonnées (contraste ~7,5:1 sur blanc) |
| **Accent technique unique** | `cyan-600` (filets/indicateurs) & `cyan-700`/`cyan-800` (texte) | `#0891b2` / `#0e7490` / `#155e75` | **Strictement réservé aux éléments techniques** : badges `[1]`–`[7]`, contours X-Ray, état actif d'onglet/navigation, anneaux `focus-visible`, indicateurs de protocole/cache. Jamais sur les titres. |
| Teinte technique claire | `bg-cyan-50` / `border-cyan-200` | `#ecfeff` / `#a5f3fc` | Pastilles techniques, onglets actifs, fonds de schémas SVG |
| Succès (sémantique) | `text-emerald-700` / `bg-emerald-50` | `#047857` / `#ecfdf5` | Stock disponible, `CACHE HIT`, confirmation `COMMIT ACID`, remises |
| Avertissement (sémantique) | `text-amber-800` / `bg-amber-50` | `#92400e` / `#fffbeb` | Stock faible, `CACHE MISS`, pièges de production |
| Erreur / destruction | `text-rose-700` / `bg-rose-50` | `#be123c` / `#fff1f2` | Rupture de stock, `ROLLBACK ACID`, erreurs formulaire, suppression |

### Coloration syntaxique claire (SQL, Redis, JSON)
Sur fond `#ffffff` ou `#fafafa` :
- Mots-clés SQL (`.tok-kw`) : `#0e7490` (`cyan-700`, gras)
- Fonctions SQL (`.tok-fn`) : `#6d28d9` (`violet-700`)
- Chaînes (`.tok-str`) : `#047857` (`emerald-700`)
- Nombres (`.tok-num`) : `#b45309` (`amber-700`)
- Commentaires (`.tok-cmt`) : `#475569` (`slate-600`, italique)
- Clés JSON/HTTP (`.tok-key`) : `#0b1220` (gras)
- Commandes Redis (`.tok-cmd`) : `#be123c` (`rose-700`, gras)

---

## 3. Typographie

Deux polices chargées via `next/font/google` (aucune ressource externe additionnelle) :

- **Inter (`font-sans`)** : utilisée pour l'intégralité de l'interface (navigation, titres, paragraphes, boutons, formulaires, libellés). Hiérarchie sobre (`font-semibold`, `tracking-tight` sur les grands titres, sans graisses excessives ni texte en dégradé).
- **JetBrains Mono (`font-mono tabular-nums`)** : réservée **exclusivement** aux éléments techniques et chiffrés :
  - Requêtes SQL, commandes Redis, en-têtes HTTP/3, payloads JSON et plans `EXPLAIN ANALYZE` ;
  - Identifiants techniques (`cart:usr_9482`, `ORDER_ID #88412`, `Idempotency-Key`, `SKU`, badges `[1]`–`[7]`) ;
  - Données numériques en chiffres tabulaires (`tabular-nums`) : prix en €, quantités, stocks, latences en `ms`, KPIs (`AOV`, taux de conversion, `LTV:CAC`, `P99`).

---

## 4. Élévation, bordures & règles de qualité (Floor)

- **Séparation par filets** : `border-slate-200` et `divide-slate-200` structurent les sections, les engagements de confiance et les listes d'articles sans multiplier les cartes ombrées.
- **Ombres douces uniquement** :
  - `shadow-soft` (`0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.06)`) au survol des cartes produit et sur les notifications toast.
  - `shadow-popover` (`0 4px 12px rgba(15,23,42,0.08), 0 16px 36px rgba(15,23,42,0.10)`) pour les modales, le menu des 7 couches et le panneau de chat support.
  - Aucune ombre dure à offset nul ni halo lumineux.
- **Interdictions respectées** :
  - Aucun dégradé CSS ou SVG (`bg-gradient-*`, `linearGradient` proscrits).
  - Aucun effet glassmorphism (`backdrop-blur` supprimé).
  - Aucun emoji ni glyphe unicode utilisé comme icône : bibliothèque d'icônes SVG inline unifiées dans `components/Icons.tsx` (trait `1.75px`, `strokeLinecap="round"`).
  - Aucun « kicker / eyebrow » en petites capitales au-dessus des titres.
  - Aucune rangée de cartes identiques icône+titre+texte comme structure de section (ex. les engagements de `/avis` sont présentés en tableau éditorial à filets ; l'index des routes sur `/` en liste horizontale).
  - Aucun template « hero-métrique » ni numérotation décorative `01/02/03`.
  - Aucune modale inutile : fiche produit (`/produits/[id]`), panier (`/panier`), paiement (`/paiement`) et laboratoire (`/laboratoire`) disposent chacun de leur propre route App Router.
- **États d'interface** : chaque élément interactif implémente `hover`, `focus-visible` (`ring-2 ring-cyan-600`), `disabled`, états de chargement (`Requête...`, `Ajout...`, `Exécution BEGIN...COMMIT...`), messages d'erreur explicites et états vides (panier vide, recherche sans résultat, journal vide, produit introuvable).
- **Sélection & barres de défilement** : `::selection` cyan pâle (`#cffafe` / `#0b1220`), scrollbars claires (`#fafafa` / `#cbd5e1`, survol `#0891b2`).

---

## 5. Règles du Mode Inspection X-Ray

Le basculeur **Inspection X-Ray** (`ACTIF` / `INACTIF`) dans l'en-tête fixe applique la classe `.xray-active` au conteneur global de `StoreProvider` :

1. **Contours** : chaque bloc `.xray-layer` correspondant à une couche architecturale reçoit un filet pointillé `outline: 2px dashed #0891b2` avec `outline-offset: 6px`.
2. **Badges `[1]`–`[7]`** : un bouton `.xray-badge` (`bg-cyan-700 text-white font-mono`) apparaît sur le bord supérieur gauche de chaque couche présente sur la route active :
   - `/` → `[1]` Edge CDN, DNS, TLS 1.3 & SSR
   - `/catalogue` → `[2]` Recherche Prédictive & Cache-Aside + `[3]` Catalogue Relationnel
   - `/produits/[id]` → `[3]` Fiche Produit & Requête SQL JOIN
   - `/avis` → `[4]` Preuve Sociale & Vue Matérialisée
   - `/panier` → `[5]` Panier & Session Redis Hash
   - `/paiement` → `[6]` Tunnel de Paiement ACID & Verrouillage Pessimiste
   - `/laboratoire` et pied de page commun → `[7]` Télémétrie & KPIs d'Économie Numérique
3. **Interaction** : cliquer sur un badge ouvre la fiche pédagogique détaillée (`InfoModal`) présentant la pile technique, l'impact économique, le piège de production et un bouton d'action directe vers la couche ou sa démonstration.

---

## 6. Architecture Multi-Pages & Persistance d'État

- **Layout commun (`app/layout.tsx`)** : charge le cliché initial serveur (`getSnapshot()`), injecte `Inter` et `JetBrains Mono` (`lang="fr"`), et monte `<StoreProvider>`.
- **Contexte global (`components/StoreProvider.tsx`)** : persiste le catalogue, les stocks décrémentés, le panier Redis, les totaux (`computeCartTotals`), les 4 KPIs, l'état X-Ray, le journal de télémétrie, les notifications et le chat support pendant toute la navigation client entre `/`, `/catalogue`, `/produits/[id]`, `/avis`, `/panier`, `/paiement` et `/laboratoire`.
- **Responsive** : vérifié de **390 px** (en-tête compact avec accès panier + X-Ray + menu tiroir mobile, empilement vertical fluide, schémas à défilement horizontal contrôlé) jusqu'à **1440 px** (grille 12 colonnes `max-w-7xl`).
