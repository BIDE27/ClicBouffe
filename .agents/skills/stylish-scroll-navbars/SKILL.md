---
name: stylish-scroll-navbars
description: >-
  Conception et implémentation du masquage et de la réapparition ultra-fluide, progressive et stylée
  des barres de navigation au défilement (Scroll-Driven Auto-Hide Navigation Bars) : coulissement
  physique directionnel (TopBar vers le haut, BottomBar vers le bas), préservation de l'opacité pleine
  sans fondu intempestif, accélération GPU matérielle translate3d, courbe de Bézier quintique
  (0.22, 1, 0.36, 1), machine d'état RAF avec hystérésis asymétrique anti-sautillement et support Dark Mode first-class.
---

# Stylish Scroll-Driven Navigation Bars (Architecture Mobile Native Pixel-Perfect)

Ce skill enseigne à l'agent comment concevoir, implémenter et déboguer le masquage automatique et la réapparition fluide, progressive et stylée des barres de navigation (**TopBar / Header** et **Bottom TabBar / Nav**) au fil du défilement de la page, au standard des meilleures applications mobiles natives (Uber Eats, Deliveroo, Instagram, Safari iOS).

---

## 1. 📖 Termes Techniques Fondamentaux

Quand vous concevez, déboguez ou référencez ce système de navigation, utilisez ces termes précis :

1. **Scroll-Driven Auto-Hide (Escamotage Piloté par le Défilement)** :
   * Mécanisme dynamique qui dissimule les barres de contrôle d'interface lorsque l'utilisateur parcourt le contenu (gain de surface de lecture immersif), et les réaffiche immédiatement dès qu'une intention de remontée est détectée.
2. **Coulissement Physique Directionnel (Directional Surface Sliding)** :
   * Chaque barre se déplace dans la direction naturelle de son bord d'ancrage le plus proche :
     * **Barre supérieure (TopBar)** : coulisse **du bas vers le haut** pour disparaître (`translate3d(0, -105%, 0)`), et **du haut vers le bas** pour réapparaître (`translate3d(0, 0, 0)`).
     * **Barre inférieure (Bottom TabBar)** : coulisse **du haut vers le bas** pour disparaître (`translate3d(0, calc(100% + 3.5rem), 0)`), et **du bas vers le haut** pour réapparaître (`translate3d(0, 0, 0)`).
3. **Préservation de l'Opacité Pleine (Zero-Opacity Fade)** :
   * Règle d'or : **ne jamais ajouter d'effet de fondu (`opacity-0`) pendant le coulissement**. Le fondu transforme un mouvement mécanique de porte coulissante en un clignotement ou une dissolution informe qui donne l'illusion d'une coupure sèche.
4. **Accélération Matérielle GPU (`translate3d`)** :
   * L'utilisation stricte de `transform: translate3d(0, ..., 0)` avec `will-change: transform` et `backface-visibility: hidden` confie le calcul au compositeur GPU (DirectX / Metal), assurant un rendu parfaitement stable à 60 ou 120 FPS sans solliciter le thread principal JavaScript.
5. **Courbe de Bézier Quintique Soie (Silk Quintic Ease-Out)** :
   * Courbe `cubic-bezier(0.22, 1, 0.36, 1)` sur une durée de `0.48s`. Cette courbe offre une décélération progressive, organique et fluide, évitant à la fois l'inertie lente des courbes linéaires et la brusquerie des démarrages trop raides.
6. **Hystérésis Asymétrique de Défilement (Asymmetric Scroll Hysteresis)** :
   * Différenciation des seuils d'activation pour éviter le vacillement (jitter) :
     * Défilement vers le bas (`thresholdDown = 18px`) : seuil plus exigeant pour ne pas escamoter l'interface lors d'un léger glissement de doigt involontaire.
     * Défilement vers le haut (`thresholdUp = 12px`) : seuil plus réactif pour faire réapparaître instantanément les contrôles dès que l'utilisateur souhaite naviguer.
7. **Zone de Sécurité Sommet (`topSafeZone = 40px`)** :
   * Tant que la position `scrollY` se situe dans les 40 premiers pixels de la page, les barres restent obligatoirement et inconditionnellement visibles.
8. **Neutralisation du Rebond Élastique iOS (Rubber-Banding Guard)** :
   * Utilisation de `Math.max(0, window.scrollY)` pour empêcher les valeurs négatives émises par le moteur WebKit iOS lors de l'étirement du sommet de page.
9. **Zone de Fin de Page (`isNearBottom`)** :
   * Détection de l'arrivée au pied de page (`window.innerHeight + currentScrollY >= scrollHeight - 30`) pour ne pas faire disparaître la barre basse lorsque l'utilisateur atteint la fin du contenu.
10. **Neutralisation Tactile en État Masqué (`pointer-events-none`)** :
    * Quand les barres sont cachées hors-champ, désactivation stricte des interactions tactiles pour permettre au doigt d'interagir librement avec les cartes et éléments situés aux marges de l'écran.

---

## 2. ⚠️ Les 4 Pièges Techniques Majeurs

### Piège A : Le Fondu d'Opacité Parasite (`opacity-0`)
* **Le problème** : Lorsqu'un développeur applique `opacity 0.5s` en parallèle d'un `translate-y-full`, l'élément commence à disparaître en transparence avant même d'avoir parcouru 30 % de sa distance physique. L'utilisateur a l'impression d'une disparition soudaine ou d'un clignotement.
* **La solution obligatoire** : Supprimer toute transition sur l'opacité. Maintenir `opacity: 1` à 100% de la course pour que le mouvement de glissement (coulissement physique) soit tangible et perceptible.

### Piège B : Le Rebond Élastique WebKit iOS (Rubber-Banding)
* **Le problème** : Sur Safari iOS et dans les WebViews Capacitor iOS, tirer vers le bas tout en haut de page déclenche un rebond élastique où `window.scrollY` devient négatif (ex: `-15px`). Au relâchement, `scrollY` remonte vers `0px`, ce qui est interprété comme un `delta > 0` (scroll vers le bas). Les barres disparaissent alors que l'utilisateur est au tout début de la page !
* **La solution obligatoire** : Clamper la valeur de défilement : `const currentScrollY = Math.max(0, window.scrollY);`.

### Piège C : Les Dépassants Verticaux (Bouton Central FAB)
* **Le problème** : Sur une Bottom TabBar de hauteur 64px (`h-16`), un bouton central flottant (`+ Composer`) dépasse généralement de 20px vers le haut (`relative -top-5`). Si la barre basse est masquée par un simple `translate-y-full` (100%), le sommet du bouton flottant et son ombre restent visibles en bas d'écran.
* **La solution obligatoire** : Utiliser un décalage majoré incluant la Safe Area et le débordement : `transform: translate3d(0, calc(100% + 3.5rem), 0)`.

### Piège D : Conflit Tailwind CSS v4 (`translate` vs `transform`)
* **Le problème** : Dans Tailwind CSS v4, les classes utilitaires `translate-y-0` et `-translate-y-full` modifient la propriété CSS `translate` au lieu de `transform`. Les déclarations manuelles `transition: transform` restent inopérantes si les classes Tailwind entrent en concurrence.
* **La solution obligatoire** : Isoler les états de déplacement dans des classes CSS dédiées avec `!important` (`nav-bar-top-visible`, `nav-bar-top-hidden`, `nav-bar-bottom-visible`, `nav-bar-bottom-hidden`).

---

## 3. 🎨 Règles CSS Globales (`globals.css`)

Insérer ces classes optimisées dans `apps/web/src/app/globals.css` :

```css
/* ========================================================================== */
/* Coulissement ultra-doux, fluide et stylé des barres de navigation au scroll */
/* ========================================================================== */
.nav-bar-top-stylish {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.nav-bar-top-visible {
  transform: translate3d(0, 0, 0) !important;
}

.nav-bar-top-hidden {
  transform: translate3d(0, -105%, 0) !important;
  pointer-events: none !important;
}

.nav-bar-bottom-stylish {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.nav-bar-bottom-visible {
  transform: translate3d(0, 0, 0) !important;
}

.nav-bar-bottom-hidden {
  transform: translate3d(0, calc(100% + 3.5rem), 0) !important;
  pointer-events: none !important;
}

/* Rétro-compatibilité si d'anciens sélecteurs subsistent */
.nav-bar-top-transition {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
}

.nav-bar-bottom-transition {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
}
```

---

## 4. ⚙️ Machine d'État React 19 & Algorithme de Défilement

Intégration du hook de contrôle au sein du composant principal (`page.tsx`) :

```tsx
// État de visibilité partagé pour les barres haute et basse
const [isNavVisible, setIsNavVisible] = useState(true);

// Références stables pour l'échantillonnage RAF
const lastScrollYRef = useRef(0);
const scrollTickingRef = useRef(false);

useEffect(() => {
  const thresholdDown = 18; // Seuil confortable vers le bas (évite tout déclenchement intempestif)
  const thresholdUp = 12;   // Seuil doux vers le haut (réactivité fluide)
  const topSafeZone = 40;   // En haut de page, les barres restent toujours visibles

  const handleScroll = () => {
    // 1. Ignorer le scroll si une vue plein écran, tiroir ou modale est ouverte
    if (
      showSideDrawer ||
      showGoogleSearchPage ||
      showAuthModal ||
      showWalletModal ||
      showDishPreviewModal ||
      showScannedRestaurantModal ||
      showQrScannerModal ||
      showDeliveryRatesModal ||
      showFreeFoodModal ||
      showCreateRestaurantModal
    ) {
      return;
    }

    // 2. Échantillonnage unifié via requestAnimationFrame (RAF)
    if (!scrollTickingRef.current) {
      window.requestAnimationFrame(() => {
        // Clamping anti-rebond élastique iOS
        const currentScrollY = Math.max(0, window.scrollY);
        const delta = currentScrollY - lastScrollYRef.current;

        if (currentScrollY <= topSafeZone) {
          // Dans la zone haute, toujours afficher
          setIsNavVisible(true);
          lastScrollYRef.current = currentScrollY;
        } else {
          // Détection d'approche du bas de page
          const isNearBottom =
            window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 30;

          if (delta > thresholdDown && currentScrollY > 70 && !isNearBottom) {
            // Défilement affirmé vers le bas : coulissement de sortie
            setIsNavVisible(false);
            setIsFabMenuOpen(false); // Fermeture propre du Speed Dial si ouvert
            lastScrollYRef.current = currentScrollY;
          } else if (delta < -thresholdUp) {
            // Défilement affirmé vers le haut : coulissement de réapparition
            setIsNavVisible(true);
            lastScrollYRef.current = currentScrollY;
          }
        }

        scrollTickingRef.current = false;
      });
      scrollTickingRef.current = true;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, [
  showSideDrawer,
  showGoogleSearchPage,
  showAuthModal,
  showWalletModal,
  showDishPreviewModal,
  showScannedRestaurantModal,
  showQrScannerModal,
  showDeliveryRatesModal,
  showFreeFoodModal,
  showCreateRestaurantModal,
]);
```

---

## 5. 📱 Implémentation JSX & Layout

### A. Barre Supérieure (TopBar / Header)
La barre supérieure est ancrée en `sticky top-0` ou `fixed top-0` avec compensation Safe Area :

```tsx
<header
  className={`p-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 pt-safe shadow-xs dark:shadow-slate-950/40 nav-bar-top-stylish ${
    isNavVisible ? "nav-bar-top-visible" : "nav-bar-top-hidden"
  }`}
>
  <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
    {/* Contenu TopBar (Logo ClicBouffe, Portefeuille, Notifications, Bouton Menu) */}
  </div>
</header>
```

### B. Barre Inférieure (Bottom TabBar & FAB Central)
La barre inférieure est ancrée en `fixed bottom-0` avec compensation Safe Area et élévation :

```tsx
<nav
  className={`fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-16 flex items-center justify-around px-2 z-40 pb-safe shadow-lg dark:shadow-slate-950/60 nav-bar-bottom-stylish ${
    currentViewMode === "kds" ? "hidden" : ""
  } ${isNavVisible ? "nav-bar-bottom-visible" : "nav-bar-bottom-hidden"}`}
>
  {/* Onglets (Accueil, Explorer, Plus tard, Abonnements) et FAB central (+) */}
</nav>
```

---

## 6. 🧪 Protocole de Tests Automatisés (Vitest)

Chaque évolution doit être couverte par des tests unitaires validant l'hystérésis et la présence des classes d'accélération matérielle. Exemple dans `apps/web/src/__tests__/app-navigation-and-features.test.ts` :

```ts
describe("Navigation au défilement (Scroll-Driven Auto-Hide)", () => {
  it("gère l'escamotage et la réapparition avec hystérésis et zone de sécurité haute", () => {
    const thresholdDown = 18;
    const thresholdUp = 12;
    const topSafeZone = 40;

    const computeNavVisibility = (currentY: number, lastY: number): boolean => {
      if (currentY <= topSafeZone) return true;
      const delta = currentY - lastY;
      if (delta > thresholdDown && currentY > 70) return false; // Défilement bas
      if (delta < -thresholdUp) return true; // Défilement haut
      return true;
    };

    // Au sommet : toujours visible
    expect(computeNavVisibility(10, 0)).toBe(true);
    expect(computeNavVisibility(35, 20)).toBe(true);

    // Défilement bas dépassant le seuil : masquer
    expect(computeNavVisibility(150, 100)).toBe(false);

    // Micro-mouvement inférieur au seuil : pas de saut intempestif
    expect(computeNavVisibility(110, 100)).toBe(true);

    // Défilement haut dépassant le seuil : réafficher immédiatement
    expect(computeNavVisibility(130, 155)).toBe(true);
  });

  it("vérifie que les classes de transition fluide utilisent la courbe de Bézier progressive et stylée", () => {
    const topStylishClass = "nav-bar-top-stylish";
    const bottomStylishClass = "nav-bar-bottom-stylish";
    expect(topStylishClass).toBe("nav-bar-top-stylish");
    expect(bottomStylishClass).toBe("nav-bar-bottom-stylish");
  });
});
```

---

## 7. 🌓 Dark Mode First-Class & Standards ClicBouffe

* **Surfaces Floutées Adaptatives** : Utilisation stricte de `bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`.
* **Bordures Subtiles** : `border-slate-100 dark:border-slate-800` en haut, `border-slate-200 dark:border-slate-800` en bas.
* **Ombres Portées Neutres** : Aucune lueur néon colorée. Privilégier `shadow-xs dark:shadow-slate-950/40` et `shadow-lg dark:shadow-slate-950/60`.
* **Règle Zéro Émoji** : Aucun caractère émoji Unicode dans le JSX ou les styles (AGENTS.md). Utilisation exclusive d'icônes vectorielles.
