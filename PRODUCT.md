# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js

## Users

Formateur en développement web. Enseigne la création de sites e-commerce et l'architecture full-stack ; a besoin d'un support démonstratif qui dévoile sa propre architecture technique en temps réel, utilisable en cours ou en auto-apprentissage.

## Product Purpose

StackCraft Commerce : boutique e-commerce interactive et tutoriel « Comment créer un site e-commerce » qui révèle les 7 couches de son architecture (Edge CDN/DNS/TLS, navigation et recherche, catalogue relationnel, preuve sociale, panier session Redis, tunnel de paiement ACID, KPIs et télémetry) via un laboratoire de télémétrie docké et un mode inspection X-Ray. Déployé initialement comme fichier HTML unique autonome (Tailwind CDN + JavaScript Vanilla), à reconstruire sous Next.js.

## Positioning

Méta-éducatif : le site est à la fois une boutique fonctionnelle et un tutoriel qui expose ses propres mécanismes techniques (requêtes SQL INNER/LEFT JOIN, flux Redis HSET/HINCRBY/HDEL, idempotence de paiement, télémetry réseau HTTP/3) — une approche qu'une boutique e-commerce classique ne peut pas revendiquer.

## Operating Context

Navigation et recherche prédictive, catalogue de 6 produits techniques, filtres et tri, panier coulissant avec codes promo, tunnel de paiement ACID, KPIs économiques dynamiques (taux de conversion, AOV, ratio LTV:CAC, latence API P99), formulaire newsletter RGPD, modales légales PCI-DSS, widget chat support, laboratoire de télémetry avec journal de requêtes, flux de paquets animé 5 nœuds, onglets HTTP/3 JSON et SQL/Redis EXPLAIN ANALYZE. 100 % de l'interface en français.

## Capabilities and Constraints

- 7 couches d'architecture fonctionnelles (voir cahier des charges source)
- Codes promo STACK20 (-20 %) et DEV50 (-50,00 €), TVA 20 %, total TTC, décrémentation réelle des stocks sur la grille produit
- Transaction SQL simulée : BEGIN; SELECT ... FOR UPDATE; UPDATE inventory; INSERT INTO orders; COMMIT;
- Clé d'idempotence (Idempotency-Key UUID v4), prestataires Stripe Carte / PayPal OAuth2 / Apple Pay
- 4 KPIs dynamiques recalculés après chaque commande
- 100 % français (mots-clés techniques standards en anglais, descriptions en français)
- Illustrations SVG embarquées, aucune image externe
- Actuellement un fichier HTML unique généré par agy ; migration Next.js à planifier

## Brand Commitments

Nom : StackCraft Commerce. Aucun autre engagement de marque, asset, voix ou personnalité n'a été déclaré par l'utilisateur.

## Evidence on Hand

- ecommerce-tutoriel-fr.html (fichier généré par agy, 197 Ko, validé contre le cahier des charges)
- prompt_cahier_des_charges_pour_workspace_ia_local_fr.md (cahier des charges et grille d'évaluation)
Aucun témoignage client, cas d'usage réel, benchmark, donnée de production ou press n'existe ; ne pas en inventer.

## Product Principles

1. Auto-didacte par l'architecture : le produit enseigne en exposant ses propres mécanismes techniques.
2. Localisation française intégrale : 100 % de l'interface en français, termes techniques en anglais uniquement quand ils sont standard.
3. Fonctionnalité réelle : les codes promo, la TVA, le stock et les KPIs doivent véritablement calculer, non simuler en façade.
4. Aucune dépendance externe fragile : tout le contenu visuel (SVG) embarqué, pas d'images externes.

## Accessibility & Inclusion

Aucune exigence d'accessibilité déclarée à ce stade (RGAA/WCAG non demandé).
