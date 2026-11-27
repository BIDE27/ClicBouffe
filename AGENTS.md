# 🛡️ CLICBOUFFE — CHARTE TECHNIQUE, ARCHITECTURE ET RÈGLES DE SÉCURITÉ (AGENTS.md)

Ce document constitue la **charte technique, éthique et opérationnelle obligatoire** pour tout agent d'ingénierie logicielle et tout développeur intervenant sur le projet **ClicBouffe**. 
Chaque ligne de code écrite et chaque décision d'architecture doivent respecter scrupuleusement ces directives sans dérogation.

---

## 1. 🏛️ PHILOSOPHIE, OBJECTIFS & STACK TECHNIQUE UNIFIÉE

1. **Stack Technique Centrale** :
   * **Framework Unique** : Next.js 16+ (App Router), React 19, TypeScript strict (`strict: true`).
   * **Mobile Natif via Capacitor** : Capacitor 7+ pour l'encapsulation mobile (iOS / Android) à destination des App Stores.
   * **Styling & Composants** : Tailwind CSS v4 + `shadcn/ui` + `vaul` (tiroirs natifs) + `framer-motion` (animations fluides 60/120 FPS).
   * **Base de données & Backend** : PostgreSQL 16+ hébergé sur Supabase, Row-Level Security (RLS) active, Supabase Edge Functions (Deno/TypeScript) pour la logique critique.
   * **Archive Mobile** : Le dossier `apps/mobile` (Flutter) est conservé comme référence d'archive historique.
2. **Double Rendu (Responsive Web Desktop + Mobile-First & In-App Capacitor)** :
   * **Sur Desktop / Grands écrans** : Expérience marketplace e-commerce moderne, aérée et pleine largeur (standard Uber Eats / Deliveroo Web) avec gestion de panier latérale et espace restaurateur KDS.
   * **Sur Smartphone & dans Capacitor** : Expérience mobile-first compacte, identique au pixel près aux maquettes de référence (TopBar fixe, Bottom TabBar avec bouton central `+ Composer`, tiroirs bottom-sheet coulissants).
3. **Double Mode de Build (SEO vs Capacitor)** :
   * **Production Web (Vercel)** : Build SSR/PPR standard pour un référencement naturel (**SEO**) maximal sur les restaurants, plats et quartiers.
   * **Production Mobile (Capacitor)** : Build d'export statique dédié (`output: 'export'`) embarqué directement dans l'APK/IPA pour un démarrage instantané en 0 ms sans dépendance initiale au réseau.
4. **Zéro Dette Technique** :
   * TypeScript strict sans aucun type `any` non justifié.
   * Zéro avertissement au linter (`npm run lint`).
   * Tests unitaires et d'intégration validés avant tout commit.

---

## 2. 📱 STANDARDS CAPACITOR & RENDU INDISCERNABLE DU NATIF (ANTI-WEBVIEW)

Pour garantir que l'application encapsulée dans Capacitor soit **100 % indiscernable d'une application native** et passe sans encombre les validations Apple App Store et Google Play Store :

1. **Règles CSS & Viewport Anti-Navigateur** :
   * Gestion obligatoire des Safe Areas : `viewport-fit=cover` avec application stricte des paddings `env(safe-area-inset-top)` et `env(safe-area-inset-bottom)`.
   * Suppression de l'effet rebond élastique du navigateur : `overscroll-behavior-y: none;`.
   * Blocage des sélections intempestives : `user-select: none;` et `-webkit-touch-callout: none;` sur les boutons, cartes, menus et visuels.
   * Suppression du surlignage tactile gris/bleu : `-webkit-tap-highlight-color: transparent;`.
   * Hauteur dynamique moderne : Utilisation stricte de `100dvh` pour éviter les sauts lors de l'ouverture du clavier virtuel.
   * Gestion du zoom tactile : `touch-action: manipulation;` pour interdire le zoom involontaire à deux doigts.
2. **Plugins Natifs Capacitor Requis** :
   * `@capacitor/haptics` : Retours haptiques (micro-vibrations) à chaque action clé (ajout au panier, clic sur ingrédient, validation de commande).
   * `@capacitor/status-bar` & `@capacitor/splash-screen` : Splash screen natif au démarrage et barre de statut synchronisée aux couleurs officielles de la marque (`#00AFF2`).
   * `@capacitor/app` : Interception systématique du **bouton Retour matériel Android** (fermeture de modale / tiroir avant fermeture de l'app).
   * `@capacitor/network` : Écoute continue de l'état réseau avec affichage d'un bandeau discret et reprise transparente.
   * `@capacitor/keyboard` : Redimensionnement fluide de la vue lors de la saisie d'adresses ou recherches.
3. **Résilience Réseau & Mode Hors-Ligne (Afrique de l'Ouest / 3G-4G)** :
   * Mise en cache locale persistante (via `@tanstack/react-query` persistant en IndexedDB / stockage local).
   * Les menus, catégories et photos déjà consultés doivent s'afficher instantanément même hors-ligne. Aucun écran blanc n'est toléré.

---

## 3. 🔐 SÉCURITÉ MAXIMALE (ZERO-TRUST & OWASP)

### A. Supabase & Base de Données
* **Row-Level Security (RLS) OBLIGATOIRE sur TOUTES les tables** :
  * Aucune table ne doit être créée sans `ALTER TABLE <nom> ENABLE ROW LEVEL SECURITY;`.
  * Politiques (`POLICIES`) restrictives et explicites pour chaque opération (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
  * Un client ne peut voir ou modifier que son propre panier et ses propres commandes. Un restaurateur ne peut modifier que ses propres plats et commandes assignées.
* **Séparation étanche des Clés d'API** :
  * Clé `anon` (publique) : seule clé autorisée dans le code client Web et Capacitor.
  * Clé `service_role` (secrète) : **strictement interdite** dans le bundle client. Réservée aux Supabase Edge Functions et aux Server Components / API Routes protégées.
* **Transactions Atomiques (ACID)** :
  * La création de commande, le calcul des montants, la décrémentation des stocks et la validation des paiements doivent s'exécuter dans des transactions PostgreSQL ou procédures `SECURITY DEFINER`.
* **Audit & Traçabilité** :
  * Colonnes `created_at` et `updated_at` obligatoires avec triggers automatiques.
  * Journalisation sécurisée de chaque événement de paiement et changement de statut de commande.

### B. Validation & Assainissement des Données (Input Sanitization)
* Schémas de validation stricts avec **Zod** sur toutes les données entrantes (adresses, listes d'options, numéros de téléphone, paniers).
* Prévention totale des injections : requêtes SQL paramétrées via le SDK Supabase, aucune concaténation brute.

### C. Gestion des Secrets & Variables d'Environnement
* Interdiction absolue de commiter des fichiers `.env*`, des clés privées, des tokens Vercel/Supabase ou des certificats de signature d'application.
* Le fichier `.gitignore` doit exclure systématiquement tout fichier sensible.

### D. Stockage des Tokens & Sessions
* **Sur le Web** : Cookies de session `HttpOnly`, `Secure`, `SameSite=Lax`.
* **Dans Capacitor** : Stockage sécurisé des tokens d'authentification via un adaptateur sécurisé pour éviter toute purge inopinée de la WebView.

---

## 4. 🌍 SPÉCIFICITÉS MARCHÉ LOCAL & PAIEMENTS (FCFA / AFRIQUE)

1. **Format Monétaire & Grille Tarifaire** :
   * Tous les montants doivent être rigoureusement formatés en **FCFA** avec espace insécable (ex: `1 000 FCFA`).
   * Calcul des frais de livraison selon la grille officielle :
     * 1 à 2 plats : **80 FCFA**
     * 3 à 5 plats : **130 FCFA**
     * 6 à 10 plats : **170 FCFA**
     * Plus de 10 plats : **Gratuit (0 FCFA)**
2. **Passerelles de Paiement Sécurisées (FedaPay, KKiaPay, Paystack, Mobile Money)** :
   * Validation uniquement via **Webhooks signés cryptographiquement (HMAC / SHA256)** reçus sur une Supabase Edge Function sécurisée.
   * L'application cliente ne valide jamais elle-même une commande : elle attend la confirmation serveur émise par le webhook.
   * Dans Capacitor, ouverture du paiement via `@capacitor/browser` (Chrome Custom Tabs / Safari View Controller) avec retour par Deep Link applicatif.

---

## 5. 👥 ÉQUIPE D'INGÉNIERIE MULTI-AGENTS & PROTOCOLE DE QUALITÉ

Pour garantir un niveau de qualité logiciel d'excellence, chaque lot de travail est soumis à une collaboration structurée entre agents experts :

1. **Agent 1 : Architecte & Développeur Principal (`builder`)** :
   * Responsable de la conception, de l'implémentation du code TypeScript/React, des composants UI, de la configuration Capacitor et de l'intégration Supabase.
2. **Agent 2 : Auditeur Sécurité & Zero-Trust (`security-auditor`)** :
   * Inspecte les politiques RLS, l'isolation des clés API, la validation des schémas Zod, l'absence de fuite de données et la vérification des signatures de webhooks. Bloque toute livraison présentant une vulnérabilité.
3. **Agent 3 : Ingénieur QA & Testeur Automatisé (`qa-tester`)** :
   * Responsable des tests unitaires, des tests d'intégration, de la conformité TypeScript (`tsc --noEmit`), des audits du linter et des tests de robustesse (coupures réseau, montants invalides, flux de panier).
4. **Agent 4 : Spécialiste UX & Finitions Natives (`native-reviewer`)** :
   * Vérifie la fidélité pixel-perfect aux maquettes, le respect des safe areas, la réactivité tactile, les animations à 60/120 FPS et l'ergonomie mobile/desktop.

---

## 6. 🎨 DESIGN SYSTEM, ICONOGRAPHIE ET STANDARDS VISUELS

1. **Interdiction Absolue des Émojis et Émoticônes dans l'Interface** :
   * **Aucun caractère émoji ou émoticône Unicode** (ex: `🍽️`, `🍲`, `🍗`, `🌯`, `🍔`, `⏰`, `⏱️`, `●`, `❚❚`, etc.) ne doit être inséré dans le code JSX, les libellés de boutons, les badges, les filtres de catégories ou les cartes.
   * **Remplacement Obligatoire par des Icônes Vectorielles** : Utilisation exclusive d'icônes vectorielles professionnelles (Lucide React ou SVG personnalisés pixel-perfect).
   * **Cohérence Stylistique** : Les icônes doivent partager la même épaisseur de trait (`strokeWidth` de 1.5 à 2) et les mêmes codes couleurs de la charte ClicBouffe (`#00AFF2` primaire, ardoise/gris neutre, ambre/émeraude pour les statuts).

2. **Espaces Publicitaires et Carrousels Automatiques Partenaires** :
   * Les bannières d'accueil doivent intégrer un **carrousel automatique rotatif** avec défilement fluide, indicateurs de position (dots/pills), support tactile (swipe), pause au survol/toucher et badge discret d'annonce partenaire (`Sponsorisé` ou `Annonce Partenaire`).
   * Cet espace est réservé à la promotion des restaurants partenaires et des créations culinaires d'utilisateurs vendeurs de la marketplace.

3. **Logo Officiel Unique et Permanent de ClicBouffe (Marmite avec Curseur de Clic Intérieur)** :
   * **Emblème Visuel Obligatoire** : Le logo officiel et permanent de ClicBouffe est strictement constitué de **la marmite (avec ses deux poignées latérales, son couvercle et sa couronne supérieure) contenant le curseur de clic avec ses rayons d'impact à l'intérieur** (issu directement du fichier vectoriel source de référence `assets/icones/logo.svg`).
   * **Composant Vectoriel Dédié** : Composant React pur `@/components/ui/logo-marmite` (`LogoMarmite`) garantissant une netteté vectorielle 100% pixel-perfect sans aucun artefact raster ou boîte de fond.
   * **Emplacements d'Application Obligatoires** : Cette icône de marque doit être systématiquement et universellement appliquée pour :
     - L'écran de chargement (Splash Screen) en SVG vectoriel pur avec fond transparent sur bleu marque `#00AFF2`.
     - L'icône officielle du Menu Latéral (SideDrawer) en SVG vectoriel avec badge circulaire bleu marque `#00AFF2`.
     - Le Favicon officiel du site Web (`/favicon.ico`, `/favicon.png`, `/favicon.svg`).
     - L'icône d'application mobile Apple (`/apple-touch-icon.png`) et Android / Web Manifest (`/icon.png`).
     *(Remarque : Dans la barre supérieure TopBar, le logo reste typographique et épuré avec l'intitulé 'ClicBouffe' sans icône marmite juxtaposée).*

4. **Support Universel du Mode Sombre (Dark Mode First-Class Obligatoire)** :
   * **Alignement Systématique de Toute Vue** : Chaque nouvelle page, écran, composant, modale popup (`fixed inset-0`), tiroir coulissant (`SideDrawer`), carte de plat ou restaurant, champ de formulaire (`input`, `select`), bouton et séparateur doit **impérativement et systématiquement** intégrer le support complet du mode sombre (`dark:`) via Tailwind CSS.
   * **Charte Chromatique Mode Sombre** :
     - Fond d'écran principal : `dark:bg-slate-950`
     - Modales, tiroirs, cartes et conteneurs : `dark:bg-slate-900` avec bordure `dark:border-slate-800`
     - Éléments surélevés / sous-cartes : `dark:bg-slate-850` ou `dark:bg-slate-800` avec bordure `dark:border-slate-700`
     - Textes principaux : `dark:text-white` ou `dark:text-slate-100`
     - Textes secondaires / métadonnées : `dark:text-slate-400`
     - Champs de saisie : `dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500`
     - Boutons inactifs / secondaires : `dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`
     - Accents de marque ClicBouffe : maintien du bleu primaire `#00AFF2` avec anneaux/halo adaptés (`dark:bg-sky-950/40`, `dark:border-[#00AFF2]/60`).
   * **Interdiction des Surfaces Blanches en Mode Sombre** : Aucune modale, carte, bandeau ou conteneur blanc (`bg-white` sans contrepartie `dark:bg-slate-900`) n'est toléré lorsque la classe `.dark` est active sur l'élément racine `html`.

---

## 7. 🚀 GIT, CI/CD & CONVENTIONS DE COMMITS

1. **Convention de Commits (en Français Obligatoire)** :
   * Format type : `<type>: <description impérative en français>`
   * `feat: ...` : Nouvelle fonctionnalité
   * `fix: ...` : Correction de bug
   * `security: ...` : Sécurité, RLS, protection des accès
   * `refactor: ...` : Refactorisation sans modification de comportement
   * `test: ...` : Ajout ou correction de tests
   * `chore: ...` : Maintenance, dépendances, configuration Capacitor
2. **Revue Pré-Commit Obligatoire** :
   * Aucune clé secrète présente dans les fichiers trackés.
   * Zéro erreur TypeScript et zéro avertissement linter.
3. **Publication Automatique Git Push Immédiate (Règle Permanente)** :
   * Chaque lot de modifications validé doit être systématiquement poussé vers le dépôt distant (`git push origin main`) dès la validation du commit, sans solliciter de confirmation préalable à l'utilisateur, afin de déclencher instantanément le déploiement continu Vercel CI/CD et de maintenir la production en ligne synchronisée.

---

## 6b. 🪄 RÈGLE ICONOGRAPHIE `Sparkles` (RÉSERVÉE EXCLUSIVEMENT À L'IA)
- **Interdiction Hors IA** : L'icône `Sparkles` (étincelles/étoiles associées au vibe coding et aux outils d'IA) est **strictement proscrite** pour toute fonctionnalité non-IA (création de restaurant, composition de plat, badges sponsorisés, succès commande, recherche).
- **Usage Exclusif** : N'utiliser `Sparkles` que lorsqu'une fonctionnalité repose réellement sur l'Intelligence Artificielle. Dans tous les autres cas, utiliser des icônes métier explicites (`Store`, `ChefHat`, `UtensilsCrossed`, `Award`, `QrCode`, `Check`, `Flame`).

---

*Ce document est la référence maîtresse pour tout développement sur ClicBouffe. Il prévaut sur toute convenance temporaire.*
