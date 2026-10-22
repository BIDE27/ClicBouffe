# 🛡️ CLICBOUFFE — RÈGLES DE DÉVELOPPEMENT, D'ARCHITECTURE ET DE SÉCURITÉ (AGENTS.md)

Ce document constitue la **charte technique et éthique obligatoire** pour tout agent d'ingénierie logicielle et tout développeur intervenant sur le projet **ClicBouffe**. 
Chaque ligne de code écrite doit respecter scrupuleusement ces directives sans dérogation.

---

## 1. 🏛️ PHILOSOPHIE & STANDARDS D'INGÉNIERIE

1. **Priorité absolue à la Sécurité & à la Robustesse** : Aucun compromis sur la sécurité au profit de la rapidité. Tout système déployé doit être résilient face aux attaques et aux pannes réseau.
2. **Technologies Modernes & À Jour** : Utiliser exclusivement les dernières versions stables et recommandées des frameworks et bibliothèques (Flutter 3.x+, Next.js 15+ App Router, TypeScript strict, PostgreSQL 16+).
3. **Clean Architecture & Séparation des Responsabilités (SoC)** :
   * Chaque composant a une responsabilité unique (SOLID).
   * Isolation stricte entre la couche de présentation (UI), la logique métier (Domain/Use Cases) et l'accès aux données (Data/Repository).
4. **Typage Strict & Zéro Dette Technique** :
   * TypeScript configuré en `strict: true`, interdiction absolue du type `any` non justifié.
   * Dart avec null-safety stricte, analyse statique sans aucun avertissement (`lint: flutter_lints`).
5. **Code Auto-Documenté & Lisible** : Nommage explicite en anglais ou français cohérent, commentaires réservés à la logique métier complexe.

---

## 2. 🔐 SÉCURITÉ MAXIMALE (ZERO-TRUST & OWASP)

### A. Supabase & Base de Données
* **Row-Level Security (RLS) OBLIGATOIRE sur TOUTES les tables** :
  * Aucune table ne doit être créée sans `ALTER TABLE <nom> ENABLE ROW LEVEL SECURITY;`.
  * Chaque table doit avoir des politiques (`POLICIES`) restrictives pour chaque action : `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
  * Un utilisateur / restaurateur ne peut accéder qu'aux données qui lui appartiennent strictement.
* **Séparation étanche des Clés d'API** :
  * La clé `anon` (publique) est la seule autorisée dans le code Flutter et le client Web Next.js.
  * La clé `service_role` (secrète/admin) est **strictement interdite** dans le code client. Elle est réservée aux Supabase Edge Functions et aux Server Components / API Routes de Next.js.
* **Transactions Atomiques (ACID)** :
  * Toute opération touchant aux paiements, décrémentation des stocks ou validation de commande doit être exécutée dans une transaction PostgreSQL ou une procédure stockée (`SECURITY DEFINER`) pour éviter les attaques par concurrence (*race conditions*).
* **Audit & Traçabilité** :
  * Horodatage obligatoire (`created_at`, `updated_at`) avec triggers automatiques.
  * Journalisation des actions financières et changements de statuts de commandes.

### B. Validation & Assainissement des Données (Input Sanitization)
* **Zéro Confiance dans les Entrées Clients** : Toute donnée provenant du mobile ou du web doit être validée et assainie.
* **Schémas de validation stricts** : Utilisation de **Zod** côté Next.js / TypeScript et de validateurs stricts côté Flutter.
* **Prévention des Injections** : Interdiction formelle des requêtes SQL concaténées brutes. Toujours utiliser les requêtes paramétrées du SDK Supabase ou ORM.

### C. Gestion des Secrets & Variables d'Environnement
* Ne **JAMAIS** commiter de fichier `.env`, de clés privées, de certificats SSL, de clés de signature Android (`keystore`) ou profils iOS dans Git.
* Le fichier `.gitignore` doit être rigoureusement maintenu dès le premier commit.
* Utilisation de gestionnaires de secrets sécurisés (Supabase Vault / Secrets, Vercel Environment Variables).

### D. Stockage Sécurisé Côté Client
* **Mobile (Flutter)** : Utilisation exclusive de `flutter_secure_storage` (Keychain sous iOS, EncryptedSharedPreferences sous Android) pour les tokens et données sensibles. Ne jamais stocker de tokens en clair dans `SharedPreferences`.
* **Web (Next.js)** : Stockage des sessions dans des cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`.

---

## 3. 📱 STANDARDS FLUTTER (MOBILE CLIENT & LIVREUR)

1. **Architecture Feature-First** :
   ```
   lib/
   ├── core/           # Thème, constantes, utils, réseau, erreurs
   ├── features/       # Modules indépendants (auth, home, cart, orders, profile...)
   │   └── <feature>/
   │       ├── data/           # Modèles DTO, datasources Supabase, repositories impl
   │       ├── domain/         # Entités pures, use cases, interfaces repository
   │       └── presentation/   # Écrans (views), widgets, state management
   └── main.dart
   ```
2. **Gestion d'État** : Utilisation de **Riverpod** ou **BLoC**, prévisibles, réactifs et testables.
3. **Résilience Réseau & Mode Hors-Ligne Dégradé** :
   * L'application doit gérer avec élégance les coupures de connexion (connexions 3G/4G instables).
   * Feedback visuel immédiat pour l'utilisateur en cas de perte réseau (pas d'écran blanc ni de crash).
   * Cache local intelligent des menus et images.
4. **Performance & Rendu Visuel** :
   * Atteindre un rendu stable à 60/120 FPS.
   * Optimisation des images : chargement lazy, placeholders lissés, format WebP.
   * Respect fidèle des maquettes UI/UX (couleurs, espacements, ergonomie "Composer son plat").

---

## 4. 🌐 STANDARDS NEXT.JS (PORTAIL RESTOS & SUPER-ADMIN)

1. **Next.js App Router & Server-First** :
   * Privilégier les **Server Components** par défaut pour la vitesse de chargement et le SEO.
   * Utiliser `'use client'` uniquement pour les composants interactifs (formulaires, alertes sonores, cartes interactives).
2. **Design System Professionnel** :
   * Tailwind CSS avec **shadcn/ui** pour un rendu élégant, cohérent et accessible (a11y).
   * Mode sombre/clair supporté.
3. **Temps Réel en Cuisine** :
   * Écoute en direct des nouvelles commandes via le SDK Supabase Realtime.
   * Gestion de l'audio HTML5 avec reprise automatique pour les alertes de commandes en cuisine.

---

## 5. 🌍 SPÉCIFICITÉS MARCHÉ LOCAL & PAIEMENT (FCFA / AFRIQUE)

1. **Multi-Devise & Format Monétaire** :
   * Formater rigoureusement les montants en **FCFA** (ex: `1 000 FCFA` avec espace insécable).
   * Calcul précis des frais de livraison selon la grille (80 F, 130 F, 170 F, gratuit au-delà de 10 plats).
2. **Passerelles de Paiement Sécurisées** :
   * Intégration par Webhook cryptographiquement vérifié (signature HMAC / SHA256) pour FedaPay / KKiaPay / Paystack.
   * Une commande n'est validée en base QUE lorsque le webhook signé confirme la transaction, jamais sur simple retour de l'application cliente.

---

## 6. 🚀 GIT, CI/CD & QUALITÉ DE LIVRAISON

1. **Convention de Commits (Conventional Commits en Français)** :
   * **Langue obligatoire** : **Tous les messages de commit doivent être rédigés exclusivement en français**.
   * Format type : `<type>: <description impérative en français>`
   * `feat: ...` : Nouvelle fonctionnalité (ex: `feat: ajout de l'écran d'accueil`)
   * `fix: ...` : Correction de bug (ex: `fix: correction du calcul des frais de livraison`)
   * `security: ...` : Sécurité (ex: `security: activation des politiques RLS sur les commandes`)
   * `refactor: ...` : Refactorisation sans changement de comportement (ex: `refactor: réorganisation des repositories`)
   * `chore: ...` : Maintenance, configuration, dépendances (ex: `chore: initialisation du projet Flutter`)
2. **Revue de Sécurité Pré-Commit** :
   * Vérifier qu'aucun identifiant, clé API secrète ou mot de passe n'est présent.
   * Vérifier que les tests unitaires et l'analyse statique passent sans erreur.
3. **Déploiement Continu** :
   * Vercel pour le Web (Next.js) avec previews automatiques par branche.
   * Supabase CLI pour les migrations de base de données versionnées dans le dépôt Git.

---

*Ce document est la référence maîtresse pour tout développement sur ClicBouffe. Il prévaut sur toute convenance temporaire.*
