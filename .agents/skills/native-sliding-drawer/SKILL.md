---
name: native-sliding-drawer
description: >-
  Conception et implémentation d'un menu latéral coulissant (SideDrawer) et tiroirs natifs (Sheets) ultra fluides :
  animations keyframes GPU matérielles (translate3d), résolution du piège Tailwind v4 (translate vs transform),
  machine d'état React 19 d'ouverture/fermeture progressive sans coupure sèche, courbes de Bézier iOS (0.16, 1, 0.3, 1),
  fond flouté tamisé, coordination handleClose et support Dark Mode first-class.
---

# Native Sliding Drawer & Sheet Animation System (Architecture Mobile Native Pixel-Perfect)

Ce skill enseigne à l'agent comment concevoir et implémenter des menus latéraux coulissants (**SideDrawer**) et tiroirs coulissants (**Sheets**) au standard des applications natives iOS et Android (Deliveroo, Uber Eats, Apple Store), en résolvant définitivement les pièges de synchronisation React 19 et les évolutions de moteur CSS de **Tailwind CSS v4**.

---

## 1. 📖 Termes Techniques Fondamentaux

Quand vous concevez, déboguez ou référencez ce composant, utilisez ces termes précis :

1. **Sliding Drawer (Tiroir Coulissant Latéral)** :
   * Panneau plein format vertical ancré à un bord de l'écran (généralement à droite `justify-end` ou à gauche), occupant 100% de la hauteur dynamique (`h-full` / `100dvh`).
2. **Backdrop Tamisé (Arrière-plan Assombri & Flouté)** :
   * Voile semi-transparent (`bg-black/60`) avec flou optique léger (`backdrop-blur-xs`), isolant le contenu d'arrière-plan tout en maintenant la sensation de profondeur spatiale.
3. **Machine d'États à Deux Temps (Two-Phase Lifecycle)** :
   * Séparation stricte entre la présence dans le DOM (`isRendered`) et l'état d'animation de sortie (`isClosing`), évitant le démontage instantané brutal du composant.
4. **Accélération Matérielle GPU (`translate3d`)** :
   * Déplacement délégué directement au thread de composition du GPU (`transform: translate3d(...)` avec `will-change: transform`), garantissant un taux de rafraîchissement constant à 60 ou 120 FPS sans saccade CPU.
5. **Courbe de Décélération Ressort iOS (Apple Spring Curve)** :
   * Courbe de Bézier `cubic-bezier(0.16, 1, 0.3, 1)` pour l'ouverture : impulsion initiale rapide suivie d'un freinage organique ultra doux jusqu'à l'arrêt parfait.
6. **Courbe d'Éjection Rapide (Exit Curve)** :
   * Courbe de Bézier `cubic-bezier(0.32, 0, 0.67, 0)` pour la fermeture (300 ms) : accélération fluide de départ pour une sensation de réactivité immédiate.
7. **Coordination `handleClose`** :
   * Fonction unifiée qui déclenche d'abord l'animation de sortie visuelle (`isClosing = true`), puis exécute le rappel d'action (`callback`) et notifie le parent (`onClose()`) après achèvement complet de l'animation.
8. **En-tête Immobile Découplé (Decoupled Pinned Header)** :
   * Structure Flexbox où l'en-tête (`shrink-0 z-20`) est découplé du conteneur de défilement, maintenant le logo et le bouton de fermeture (`X`) 100% fixes et cliquables à tout moment.
9. **Verrouillage du Défilement d'Arrière-Plan (Body Scroll Lock & Anti-Leak)** :
   * Combinaison de `document.body.style.overflow = "hidden"` au montage et de la propriété CSS `overscroll-contain` sur le corps du tiroir, interdisant tout mouvement de la page sous-jacente.

---

## 2. ⚠️ Les Quatre Pièges Majeurs (Pourquoi les tiroirs "sautent" ou défilent mal)

### Piège A : L'Évolution du Moteur Tailwind CSS v4 (`translate` vs `transform`)
* **Le problème** : Dans Tailwind CSS v3, `translate-x-full` manipulait `--tw-translate-x` appliqué à la propriété `transform`. Une transition `transition: transform` fonctionnait donc naturellement.
* **Le changement v4** : Tailwind CSS v4 exploite désormais la nouvelle propriété CSS standard **`translate`** (`translate: var(--tw-translate-x) var(--tw-translate-y)`). 
* **La conséquence fatale** : Si le développeur applique `transition: transform`, le navigateur surveille la propriété `transform` qui **ne change jamais** ! Le panneau saute instantanément d'une position à l'autre en **0 milliseconde**. L'utilisateur a l'impression qu'aucune animation n'a été codée.
* **La solution obligatoire** : Piloter le déplacement horizontal via des **`@keyframes` CSS explicites** qui manipulent directement `transform: translate3d(..., 0, 0)` sans dépendre de la propriété `translate` de Tailwind.

### Piège B : Le Démontage Immédiat React & le Batching de Rendu
* **Le problème 1 (Démontage sec)** : Si le composant fait un simple `if (!isOpen) return null;`, le passage de `isOpen=true` à `isOpen=false` détruit le noeud DOM instantanément. Aucune animation de sortie ne peut s'exécuter.
* **Le problème 2 (Montage batched)** : Si le composant tente de monter l'élément avec `translate-x-full` puis de basculer vers `translate-x-0` dans un simple `requestAnimationFrame`, le moteur de rendu Blink / WebKit regroupe (*batch*) souvent les deux états avant le premier *paint*. L'état initial n'est jamais affiché, et le panneau apparaît directement ouvert sans glissement.
* **La solution obligatoire** : 
  1. Utiliser `@keyframes` : une animation CSS appliquée dès le montage s'exécute **dès la frame 0** sans aucun risque de batching.
  2. Maintenir `isRendered = true` pendant toute la durée de la fermeture (`setTimeout` de 300 ms) et n'appliquer `isRendered = false` qu'une fois l'animation de sortie achevée.

### Piège C : L'En-Tête Embarqué dans le Défilement Global
* **Le problème** : Si la classe `overflow-y-auto` est posée directement sur le conteneur `<aside>`, l'en-tête avec le logo et la croix `X` disparaît vers le haut dès que l'utilisateur commence à parcourir le menu.
* **La solution obligatoire** : Poser `overflow-hidden flex flex-col` sur `<aside>`, placer l'en-tête en premier enfant avec `shrink-0 sticky top-0 z-20`, et n'appliquer `overflow-y-auto overscroll-contain` que sur le corps de contenu (`flex-1`).

### Piège D : La Fuite de Défilement vers l'Arrière-Plan (Scroll Leak / Chaining)
* **Le problème** : En scrollant dans le menu, arriver en fin de liste transmet l'inertie du geste à la page sous-jacente (l'arrière-plan commence à défiler sous le voile sombre).
* **La solution obligatoire** :
  1. Verrouiller le body en React : `document.body.style.overflow = "hidden"` et `document.documentElement.style.overflow = "hidden"` tant que le tiroir est visible.
  2. Ajouter `overscroll-contain` sur la zone déroulante du tiroir pour couper la chaîne de propagation.
  3. Ajouter `onTouchMove={(e) => e.preventDefault()}` et `onWheel={(e) => e.stopPropagation()}` sur le voile d'arrière-plan (*Backdrop*).

---

## 3. 🎨 Règles CSS Globales (`globals.css`)

Insérer ces classes et keyframes dans `apps/web/src/app/globals.css` :

```css
/* ========================================================================== */
/* Animations fluides, progressives et douces du Menu Latéral (SideDrawer)    */
/* ========================================================================== */
@keyframes drawerBackdropIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes drawerBackdropOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes drawerPanelSlideIn {
  0% {
    transform: translate3d(100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes drawerPanelSlideOut {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
}

.drawer-backdrop {
  will-change: opacity;
}

.drawer-backdrop-in {
  animation: drawerBackdropIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.drawer-backdrop-out {
  animation: drawerBackdropOut 0.28s cubic-bezier(0.32, 0, 0.67, 0) forwards;
}

.drawer-panel {
  will-change: transform;
}

.drawer-panel-in {
  animation: drawerPanelSlideIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.drawer-panel-out {
  animation: drawerPanelSlideOut 0.3s cubic-bezier(0.32, 0, 0.67, 0) forwards;
}
```

---

## 4. 🧠 Architecture React 19 du Composant (`side-drawer.tsx`)

### A. Machine d'États & Gestion du Cycle de Vie
```tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function SideDrawer({ isOpen, onClose, children }: SideDrawerProps) {
  // Machine d'états d'animation (maintien dans le DOM pendant la fermeture douce)
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const closingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronisation lors des changements de props sans render en cascade
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }

  // Fermeture automatique en fin d'animation de sortie (300 ms)
  useEffect(() => {
    if (isClosing) {
      closingTimeoutRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 300);
      return () => {
        if (closingTimeoutRef.current) {
          clearTimeout(closingTimeoutRef.current);
          closingTimeoutRef.current = null;
        }
      };
    }
  }, [isClosing]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
      }
    };
  }, []);

  // Déclencheur unifié de fermeture douce avec animation fluide
  const handleClose = useCallback(
    (callback?: () => void) => {
      hapticFeedback("light");
      if (isClosing) return;
      setIsClosing(true);
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
      }
      closingTimeoutRef.current = setTimeout(() => {
        callback?.();
        onClose();
        setIsRendered(false);
        setIsClosing(false);
      }, 300);
    },
    [isClosing, onClose]
  );

  // Verrouillage strict du défilement d'arrière-plan (Body Scroll Lock)
  useEffect(() => {
    if (!isOpen || !isRendered) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen, isRendered]);

  // Interception de la touche Échap
  useEffect(() => {
    if (!isOpen || isClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isClosing ? "pointer-events-none" : "pointer-events-auto"
      }`}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Arrière-plan assombri (Backdrop) avec blocage tactile et molette */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs drawer-backdrop ${
          isClosing ? "drawer-backdrop-out" : "drawer-backdrop-in"
        }`}
        onClick={() => handleClose()}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.stopPropagation()}
        aria-hidden="true"
      />

      {/* Tiroir latéral (Sliding Drawer) avec en-tête fixe et corps déroulant */}
      <aside
        className={`relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-slate-100 dark:border-slate-800 drawer-panel ${
          isClosing ? "drawer-panel-out" : "drawer-panel-in"
        }`}
        role="dialog"
        aria-label="Menu latéral"
      >
        {/* En-tête FIXE / IMMOBILE (ne défile jamais avec le reste du menu) */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md pt-safe z-20">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Menu</h2>
          <button
            onClick={() => handleClose()}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Contenu défilable avec overscroll-contain pour stopper la chaîne de défilement */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {children}
        </div>
      </aside>
    </div>
  );
}
```

---

## 5. 🛡️ Règles de Conformité ClicBouffe (AGENTS.md)

1. **Logo Authentique Permanent** :
   * L'en-tête du menu latéral doit impérativement afficher le logo officiel vectoriel avec sa marmite et son curseur intérieur (`<LogoMarmite className="w-8 h-8 shrink-0" size={32} withBackground shape="circle" />`).
2. **Interdiction Totale des Émojis (Règle 6.1)** :
   * Aucune icône Unicode ou émoji n'est toléré dans les boutons du tiroir (Mon Portefeuille, Favoris, Commandes, Abonnements, etc.). Utiliser exclusivement des icônes vectorielles **Lucide React** (`strokeWidth={1.8}` à `2`).
3. **Zéro Lueur Néon (Règle 6.1)** :
   * Proscription stricte des halos bleus ou ombres colorées néon (`shadow-[#00AFF2]/...`). Utiliser `shadow-2xl` neutre pour le panneau et `shadow-xs` pour les badges.
4. **Dark Mode First-Class Obligatoire (Règle 6.4)** :
   * Fond panneau : `bg-white dark:bg-slate-900`
   * Bordures : `border-slate-100 dark:border-slate-800`
   * Textes : `text-slate-900 dark:text-white` et secondaires `text-slate-500 dark:text-slate-400`
   * Séparateurs : `border-slate-100 dark:border-slate-800/80`
   * Boutons interactifs : `hover:bg-slate-50 dark:hover:bg-slate-800/60`
5. **Gestion Native Safe Areas & Clavier** :
   * Ajouter `pt-safe` sur l'en-tête pour respecter la barre de statut iOS / Android.
   * `overscroll-behavior-y: contain` sur la zone de défilement pour empêcher le défilement élastique indésirable de la page d'arrière-plan.

---

## 6. 🧪 Protocole de Tests & Validation Automatisée

Chaque modification du tiroir coulissant doit valider les assertions suivantes dans `src/__tests__/side-drawer-and-wallet.test.ts` :

1. **Rendu nul hors ouverture** : Lorsque `isOpen=false`, `renderToStaticMarkup` doit renvoyer une chaîne vide `""`.
2. **Présence des classes de transition** :
   ```ts
   expect(markup).toContain('aria-label="Menu latéral"');
   expect(markup).toContain("drawer-backdrop");
   expect(markup).toContain("drawer-backdrop-in");
   expect(markup).toContain("drawer-panel");
   expect(markup).toContain("drawer-panel-in");
   ```
3. **Linter et TypeScript** :
   - Zéro avertissement ESLint (`npm run lint`), notamment sur les dépendances de `useCallback` et `useEffect`.
   - Zéro erreur TypeScript (`npm run build`).
4. **Publication Automatique (Règle 7.3)** :
   - Commit en français : `fix(ui): animation keyframe gpu native d'ouverture et fermeture du menu lateral` avec auteur `BIDE27 <berengerbide@gmail.com>`.
   - `git push origin main` immédiat sans confirmation.
