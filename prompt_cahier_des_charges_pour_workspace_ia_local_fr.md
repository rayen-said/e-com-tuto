# Cahier des Charges & Prompt de Test — Workspace IA Local
## Projet : « Comment créer un site e-commerce : Architecture Full-Stack & Boutique Interactive »

> **Objectif de ce document :** Tester les capacités de génération de code, de conception d'architecture logicielle et de localisation linguistique (100 % en français) de votre environnement IA local en lui demandant de produire une application web autonome complète (HTML/CSS/JS en un seul fichier).

---

## 1. Prompt Système & Utilisateur à copier dans votre Workspace IA Local

Copiez-collez l'intégralité du bloc ci-dessous dans votre modèle local :

```text
Agis en tant qu'Architecte Logiciel Senior Full-Stack et Expert en Économie Numérique.
Ta mission est de générer une application web interactive complète dans UN SEUL fichier autonome (`ecommerce-tutoriel-fr.html`) utilisant Tailwind CSS (via CDN) et JavaScript Vanilla (sans framework lourd).

### CONCEPT DU PROJET (MÉTA-ÉDUCATIONNEL)
Le site web est à la fois :
1. Une **boutique e-commerce fonctionnelle** baptisée **« StackCraft Commerce »** vendant des kits d'architecture cloud, bases de données et formations DevOps.
2. Un **tutoriel interactif** intitulé **« Comment créer un site e-commerce »** qui dévoile sa propre architecture technique en temps réel.

### CONTRAINTE LINGUISTIQUE STRICTEMENT OBLIGATOIRE
- **100 % de l'interface utilisateur, des produits, des avis, du panier, du tunnel de paiement, des modales pédagogiques et des explications de la console réseau doivent être rédigés en FRANÇAIS.**
- Les mots-clés techniques standards (ex. `GET`, `POST`, `SELECT`, `JOIN`, `FOR UPDATE`, `Redis`, `TLS 1.3`, `ACID`, `AOV`, `CAC`, `LTV`) restent en anglais technique standard, mais toutes leurs descriptions et annotations sont en français.

### EXIGENCES FONCTIONNELLES & ARCHITECTURALES (LES 7 COUCHES)

1. **Barre de Contrôle Architecte (En-tête fixe)** :
   - Titre du projet : *« Comment créer un site e-commerce : Architecture & Boutique »*.
   - Bouton bascule **« Mode Inspection X-Ray : ACTIF / INACTIF »** qui affiche des bordures pointillées cyan autour des 7 zones fonctionnelles de la boutique.
   - Menu déroulant permettant d'ouvrir directement l'analyse technique de chacune des **7 couches** (`[1]` à `[7]`).
   - Bouton pour afficher/masquer le **Laboratoire de Télémétrie Réseau & SQL** en bas de l'écran.

2. **Couche [1] — Infrastructure Edge CDN, DNS, TLS 1.3 & Hydratation SSR (Section Héro)** :
   - Présentation de la proposition de valeur en français.
   - Carte de topologie système en direct (Edge CDN Anycast, API REST JSON + JWT, Redis 7.2, PostgreSQL 16).
   - Bouton *« Rejouer la requête SSR initiale »*.

3. **Couche [2] — Barre de Navigation, Recherche Prédictive & Cache-Aside** :
   - Champ de recherche filtrant les produits en temps réel et déclenchant une requête simulée `GET /api/v1/produits?q=...` avec explication de l'indexation plein texte PostgreSQL (`GIN tsvector`) vs Cache Redis.

4. **Couche [3] — Catalogue Relationnel & Fiches Produits (6 Produits)** :
   - Grille de 6 produits techniques avec illustrations SVG vectorielles intégrées (pas d'images externes cassées), badges, notes, prix en euros (`€`), et stock en temps réel.
   - Filtres par catégorie (*Tous*, *Cloud & APIs*, *Bases de Données*, *Kits UI*, *Formations DevOps*) et tri (*Prix croissant*, *Prix décroissant*, *Mieux notés*).
   - Modale de détail produit affichant la requête SQL `INNER JOIN` / `LEFT JOIN` exécutée pour charger le produit et son stock.

5. **Couche [4] — Preuve Sociale & Avis Vérifiés Cryptographiquement** :
   - Section de confiance (Conformité PCI-DSS Niveau 1, Verrouillage ACID des stocks, Garantie 30 jours).
   - Distribution des notes (Vue matérialisée `mv_notes_produits`) et avis clients liés à un identifiant de commande vérifié (`ORDER_ID #88412`).

6. **Couche [5] — Panier Coulissant & Session Redis Hash** :
   - Tiroir latéral affichant la clé Redis (`cart:usr_9482`), modification des quantités (`+` / `-`), suppression d'articles.
   - Moteur de codes promotionnels fonctionnel avec deux codes actifs : **`STACK20`** (-20 %) et **`DEV50`** (-50,00 €), calcul de la TVA (20 %) et du total TTC.

7. **Couche [6] — Tunnel de Paiement ACID & Verrouillage Pessimiste** :
   - Modale de paiement avec clé d'idempotence (`Idempotency-Key`), choix du prestataire de paiement (*Stripe Carte*, *PayPal OAuth2*, *Apple Pay*).
   - Lors de la validation : exécution d'une transaction SQL simulée (`BEGIN; SELECT ... FOR UPDATE; UPDATE stock; INSERT INTO orders; COMMIT;`), décrémentation réelle des stocks sur les cartes produits, vidage du panier et mise à jour des KPIs financiers du pied de page.

8. **Couche [7] — Pied de Page : KPIs d'Économie Numérique, RGPD & Support** :
   - 4 cartes d'indicateurs dynamiques recalculés après chaque commande : **Taux de Conversion**, **Panier Moyen (AOV)**, **Ratio LTV : CAC**, et **Latence API P99**.
   - Formulaire d'inscription newsletter (`POST /api/v1/abonnes`), modales légales RGPD/PCI-DSS, et widget de chat support interactif (`POST /api/v1/support/messages`).

9. **Composant Central : Laboratoire de Télémétrie Réseau, HTTP & SQL (Docké en bas)** :
   - Journal des requêtes capturées en temps réel à gauche.
   - 3 onglets d'inspection à droite :
     - **Onglet 1 (Flux de Paquets Animé)** : Schéma interactif à 5 nœuds (`Navigateur -> Edge CDN -> Serveur API -> Redis 7 -> PostgreSQL`) avec animation CSS d'un paquet aller (cyan) et retour (émeraude), temps de latence par saut et badge `REDIS: CACHE HIT` ou `CACHE MISS`.
     - **Onglet 2 (Requêtes/Réponses HTTP JSON)** : En-têtes HTTP/3 complets et corps JSON formatés.
     - **Onglet 3 (Requêtes SQL / Redis & EXPLAIN ANALYZE)** : Code SQL/Redis avec coloration syntaxique et plan d'exécution PostgreSQL.

Produis uniquement le code complet, propre et fonctionnel dans un seul fichier HTML.
```

---

## 2. Grille d'Évaluation pour votre Workspace IA Local

Utilisez cette grille pour noter la qualité de la génération de votre modèle local (sur 20 points) :

| Critère d'Évaluation | Points | Ce qu'il faut vérifier dans le rendu généré |
| :--- | :---: | :--- |
| **1. Complétude & Fichier Unique** | `/ 4` | Le fichier s'ouvre directement dans un navigateur sans erreur console ni dépendance manquante. |
| **2. Localisation Française** | `/ 4` | Tous les textes visibles (boutons, produits, panier, erreurs, modales, console) sont en français naturel. |
| **3. Visualisation Réseau & SQL** | `/ 5` | Chaque clic (recherche, filtre, ajout panier, paiement) met à jour la console du bas avec animation et SQL cohérent. |
| **4. Logique E-Commerce Réelle** | `/ 4` | Les codes promo (`STACK20`, `DEV50`), le calcul de TVA, la décrémentation des stocks et le recalcul de l'AOV fonctionnent. |
| **5. Pédagogie des 7 Couches** | `/ 3` | Le mode X-Ray et les modales expliquent clairement le lien entre architecture technique et économie numérique. |

---

## 3. Scénario de Test Rapide (Smoke Test en 60 secondes)

Une fois que votre IA locale a généré le fichier HTML, ouvrez-le et exécutez ces 5 actions :
1. **Recherche** : Tapez `acid` dans la barre de recherche $\rightarrow$ Vérifiez que la console affiche `GET /api/v1/produits?q=acid` et un scan d'index `GIN`.
2. **Inspection Produit** : Cliquez sur un produit $\rightarrow$ Vérifiez l'affichage de la requête `INNER JOIN` entre `products` et `inventory`.
3. **Panier & Promo** : Ajoutez un article, ouvrez le panier, appliquez le code **`STACK20`** $\rightarrow$ Vérifiez la réduction de 20 % et la commande Redis `HSET`.
4. **Paiement ACID** : Validez la commande $\rightarrow$ Vérifiez que le stock du produit diminue de 1 sur la grille principale et que le **Panier Moyen (AOV)** change dans le pied de page.
5. **Mode X-Ray** : Cliquez sur le bouton *Mode Inspection X-Ray* et ouvrez la modale de la **Couche [6]**.