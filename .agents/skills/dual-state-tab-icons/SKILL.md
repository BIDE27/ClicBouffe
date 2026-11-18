---
name: dual-state-tab-icons
description: >-
  Conception et implémentation de la barre de navigation basse (Bottom Tab Bar) :
  icônes dual-state (contour filaire / silhouette pleine à contreforme découpée adaptative clair/sombre),
  bouton central flottant (FAB) épuré sans texte et sans lueur néon, morphing rotatif continu (+ vers X),
  menu Speed Dial avec affichage progressif en cascade (Scanner QR, Composer), maintien visible
  de la barre de navigation sous flou tamisé et conformité mobile-first native pixel-perfect.
---

# Dual-State Bottom Tab Navigation & Speed Dial FAB (Architecture Mobile Native Pixel-Perfect)

Ce skill enseigne à l'agent comment concevoir et implémenter des barres de navigation mobiles (Bottom Tab Bar) professionnelles au standard iOS / Android (SF Symbols & Material 3), avec support universel du mode clair et du mode sombre, bouton central FAB à morphing rotatif et menu Speed Dial à affichage progressif.

---

## 1. 📖 Termes Techniques Fondamentaux

Quand vous concevez ou décrivez ce composant, utilisez ces termes précis :

1. **Icônes Dual-State (Bistables)** :
   * **Inactif** : Style **Filaire / Contour** (`outline`, `stroke: 1.8-2px`, `fill: none`, `stroke: currentColor`).
   * **Actif** : Style **Plein / Silhouette** (`solid`, `filled`).
2. **Contreforme (Counter-form) & Espace Négatif (Negative Space)** :
   * Les détails intérieurs de l'icône (la porte d'une maison, les aiguilles d'une montre, la grille d'un calendrier, les lignes d'un journal).
3. **Découpe au Pochoir / Knockout Cutout** :
   * Technique consistant à remplir la forme extérieure de la couleur primaire de la marque (`#00AFF2`), et à appliquer la **couleur de fond du conteneur** aux éléments internes pour créer l'illusion d'une découpe transparente nette.
4. **Adaptation Dynamique Mode Sombre (Anti-Trou Blanc)** :
   * La contreforme ne doit **JAMAIS** être figée en blanc fixe (`fill="white"`). Sur une barre sombre (`dark:bg-slate-900`), un élément blanc fixe crée une anomalie visuelle flagrante. La contreforme doit impérativement s'adapter via Tailwind (`fill-white dark:fill-slate-900` ou `stroke-white dark:stroke-slate-900`).
5. **Typographie d'Accompagnement** :
   * Onglet actif : Libellé en **gras** (`font-bold`, couleur de marque `#00AFF2`).
   * Onglet inactif : Libellé en **graisse normale/moyenne** (`font-medium`, couleur ardoise/gris neutre `text-slate-600 dark:text-slate-400`).
6. **Bouton Central Flottant (FAB) Épuré** :
   * Disque circulaire central sans libellé texte en dessous, parfaitement centré dans la concavité de la barre de navigation basse.
7. **Règle Zéro Lueur (No Neon Glow)** :
   * Proscription stricte de toute lueur ou ombre saturée colorée (`shadow-[#00AFF2]/...`). Utilisation exclusive d'ombres douces, nettes et neutres (`shadow-md`, `shadow-lg`, `shadow-xl`).
8. **Morphing Rotatif Continu (+ ↔ X)** :
   * Le bouton central est un élément physique unique permanent qui pivote à 45° via une courbe de Bézier ressort `cubic-bezier(0.34, 1.56, 0.64, 1)` pour transformer le symbole `+` en un `X` géométriquement parfait, évitant tout saut, flash ou superposition de boutons.
9. **Affichage Progressif en Cascade (Staggered Animation)** :
   * Déploiement séquentiel dynamique des options Speed Dial depuis le bouton central (d'abord l'option inférieure, puis l'option supérieure) avec des délais échelonnés (`delay-75` puis `delay-150`).
10. **Maintien Spatial de la Barre sous Flou Tamisé** :
    * La barre de navigation ne disparaît jamais sous un voile noir opaque. Elle reste visible à sa position d'ancrage (`z-40`), ses 4 onglets inactifs subissant une transition douce vers un flou tamisé (`blur-[1.5px] opacity-35 scale-95 pointer-events-none`).

---

## 2. ⚠️ Le Piège Technique Classique (Pourquoi un simple `fill` échoue)

Dans la plupart des bibliothèques d'icônes vectorielles filaires (ex: Lucide React, Heroicons, Feather) :
* L'icône de la maison est dessinée avec un chemin pour les murs et un autre tracé pour la porte.
* Si un développeur applique bêtement `fill="#00AFF2"`, **la porte se remplit également de bleu**, transformant la maison en un polygone bouché informe sans aucune porte visible.
* **La solution obligatoire** : Utiliser un composant SVG sur-mesure ou composé où la silhouette extérieure prend la couleur d'accentuation (`#00AFF2`) et les tracés intérieurs reçoivent la couleur d'arrière-plan adaptative (`fill={cutoutColor}` avec `className="fill-white dark:fill-slate-900 transition-colors"`).

---

## 3. 🌓 Règle d'Or Dark Mode pour la Découpe de Contreforme

* **En Mode Clair** : Le fond de la Bottom Bar étant blanc (`bg-white/95`), la contreforme prend la couleur blanche (`fill-white` / `#ffffff`).
* **En Mode Sombre** : Le fond de la Bottom Bar devenant sombre (`dark:bg-slate-900/95`), la contreforme **doit immédiatement basculer vers la couleur de fond sombre** (`dark:fill-slate-900` ou `dark:stroke-slate-900`).
* **Priorité de Personnalisation** : Si un développeur fournit explicitement un `cutoutColor` personnalisé (ex: `cutoutColor="#F8FAFC"` ou `cutoutColor="#00AFF2"` pour un badge coloré), cette couleur personnalisée est respectée en priorité sans être écrasée par la classe sombre par défaut.

---

## 4. 🛠️ Bibliothèque de Gabarits SVG Prêts à l'Emploi

### A. ACCUEIL / HOME
```tsx
export function HomeNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: {
  active?: boolean;
  className?: string;
  cutoutColor?: string;
}) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* Silhouette extérieure */}
        <path
          d="M12 2.6L2.6 10.3a1 1 0 0 0-.25.7V20a2 2 0 0 0 2 2h15.3a2 2 0 0 0 2-2v-9a1 1 0 0 0-.25-.7L12 2.6z"
          fill="#00AFF2"
        />
        {/* Contreforme : Porte découpée adaptative clair / sombre */}
        <path
          d="M9.5 22V13a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9h-5z"
          fill={cutoutColor}
          className={isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined}
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}
```

### B. EXPLORER / BOUSSOLE
```tsx
export function ExplorerNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: {
  active?: boolean;
  className?: string;
  cutoutColor?: string;
}) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#00AFF2" />
        <polygon
          points="16.5 7.5 13.8 13.8 7.5 16.5 10.2 10.2 16.5 7.5"
          fill={cutoutColor}
          className={isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined}
        />
        <circle cx="12" cy="12" r="1.4" fill="#00AFF2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
```

### C. HISTORIQUE / PLUS TARD / HORLOGE
```tsx
export function ClockNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: {
  active?: boolean;
  className?: string;
  cutoutColor?: string;
}) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#00AFF2" />
        <path
          d="M12 6.5V12l3.5 2"
          stroke={cutoutColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isDefault ? "stroke-white dark:stroke-slate-900 transition-colors" : undefined}
        />
        <circle
          cx="12"
          cy="12"
          r="1.2"
          fill={cutoutColor}
          className={isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined}
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
```

### D. ÉVÉNEMENTS / ABONNEMENTS / CALENDRIER
```tsx
export function CalendarNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: {
  active?: boolean;
  className?: string;
  cutoutColor?: string;
}) {
  if (active) {
    const isDefault = cutoutColor === "white";
    const fillClass = isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined;
    const strokeClass = isDefault ? "stroke-white dark:stroke-slate-900 transition-colors" : undefined;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="17" rx="3" fill="#00AFF2" />
        <path
          d="M8 2.5v4M16 2.5v4"
          stroke={cutoutColor}
          strokeWidth="2"
          strokeLinecap="round"
          className={strokeClass}
        />
        <line
          x1="3"
          y1="9.5"
          x2="21"
          y2="9.5"
          stroke={cutoutColor}
          strokeWidth="1.5"
          className={strokeClass}
        />
        <circle cx="7.5" cy="13" r="1" fill={cutoutColor} className={fillClass} />
        <circle cx="12" cy="13" r="1" fill={cutoutColor} className={fillClass} />
        <circle cx="16.5" cy="13" r="1" fill={cutoutColor} className={fillClass} />
        <circle cx="7.5" cy="17" r="1" fill={cutoutColor} className={fillClass} />
        <circle cx="12" cy="17" r="1" fill={cutoutColor} className={fillClass} />
        <circle cx="16.5" cy="17" r="1" fill={cutoutColor} className={fillClass} />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
```

---

## 5. 📋 Structure du Bouton d'Onglet Réactif au Flou

Chaque bouton d'onglet doit intégrer la transition de flou et d'opacité lorsque le menu central est ouvert :

```tsx
<button
  onClick={() => {
    setActiveTab("home");
    setScreen("home");
  }}
  className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
    isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95" : "filter-none opacity-100 scale-100"
  } ${activeTab === "home" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"}`}
>
  <HomeNavIcon
    active={activeTab === "home"}
    className="w-5 h-5 transition-transform active:scale-90"
  />
  <span
    className={`text-[9px] transition-all ${
      activeTab === "home" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600 dark:text-slate-400"
    }`}
  >
    Accueil
  </span>
</button>
```

---

## 6. ⚡ Bouton Central FAB & Morphing Rotatif Continu (+ ↔ X)

Le bouton central flottant utilise une rotation à 45° pour transformer géométriquement les bras perpendiculaires du symbole `Plus` en un `X` parfait, sans aucune substitution d'éléments dans le DOM :

```tsx
<div className="relative -top-5 flex flex-col items-center select-none z-50">
  {/* Bouton FAB circulaire unique animé en continu */}
  <button
    type="button"
    aria-label={isFabMenuOpen ? "Fermer les actions rapides" : "Ouvrir les actions rapides"}
    onClick={(e) => {
      e.stopPropagation();
      hapticFeedback("light");
      setIsFabMenuOpen(!isFabMenuOpen);
    }}
    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl relative z-50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 cursor-pointer ${
      isFabMenuOpen
        ? "bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 ring-4 ring-black/10 dark:ring-white/10 scale-105"
        : "bg-[#00AFF2] hover:bg-[#009bd6] ring-0 scale-100"
    }`}
  >
    <div
      className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isFabMenuOpen ? "rotate-45" : "rotate-0"
      }`}
    >
      <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.6]" />
    </div>
  </button>
</div>
```

---

## 7. 🪜 Affichage Progressif en Cascade (Staggered Speed-Dial)

Les options d'action se déploient au-dessus du bouton central avec des délais échelonnés pour une sensation d'animation physique native :

```tsx
<div
  className={`absolute bottom-16 sm:bottom-18 flex flex-col items-center gap-3.5 z-50 transition-all duration-200 ${
    isFabMenuOpen ? "pointer-events-auto" : "pointer-events-none"
  }`}
>
  {/* Option 2 (Haut) : Composer - Apparition progressive (Stagger #2 : delay-150) */}
  <div
    className={`relative flex items-center justify-center w-12 sm:w-14 cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
      isFabMenuOpen
        ? "translate-y-0 scale-100 opacity-100 delay-150"
        : "translate-y-8 scale-50 opacity-0 delay-0 pointer-events-none"
    }`}
    onClick={(e) => {
      e.stopPropagation();
      hapticFeedback("medium");
      setIsFabMenuOpen(false);
      setScreen("compose_dish");
    }}
  >
    <span
      className={`absolute right-full mr-3.5 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg whitespace-nowrap select-none group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-all duration-300 ${
        isFabMenuOpen ? "translate-x-0 opacity-100 delay-175" : "translate-x-3 opacity-0 delay-0"
      }`}
    >
      Composer
    </span>
    <div
      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform shrink-0"
      title="Composer mon plat"
    >
      <ChefHat className="w-5 h-5 stroke-[2.2]" />
    </div>
  </div>

  {/* Option 1 (Bas) : Scanner QR - Apparition progressive (Stagger #1 : delay-75) */}
  <div
    className={`relative flex items-center justify-center w-12 sm:w-14 cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
      isFabMenuOpen
        ? "translate-y-0 scale-100 opacity-100 delay-75"
        : "translate-y-4 scale-50 opacity-0 delay-0 pointer-events-none"
    }`}
    onClick={(e) => {
      e.stopPropagation();
      hapticFeedback("medium");
      setIsFabMenuOpen(false);
      setShowQrScannerModal(true);
    }}
  >
    <span
      className={`absolute right-full mr-3.5 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg whitespace-nowrap select-none group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-all duration-300 ${
        isFabMenuOpen ? "translate-x-0 opacity-100 delay-100" : "translate-x-3 opacity-0 delay-0"
      }`}
    >
      Scanner QR
    </span>
    <div
      className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform shrink-0"
      title="Scanner un QR code"
    >
      <QrCode className="w-5 h-5 stroke-[2.2]" />
    </div>
  </div>
</div>
```

---

## 8. 🌫️ Gestion des Niveaux de Profondeur & Voile de Flou (Z-Index Hierarchy)

Pour garantir que la barre reste visible mais floutée, et que l'écran soit élégamment tamisé :

```
[z-50] : Bouton FAB central (+ ↔ X) et options Speed Dial (Nets & Actifs)
[z-40] : Barre de navigation basse (<nav>) avec onglets floutés (blur-[1.5px] opacity-35)
[z-30] : Voile plein écran semi-transparent (bg-black/50 backdrop-blur-md cliquable)
[z-20] : En-tête TopBar sticky (flouté blur-[2px] opacity-40)
[z-10] : Contenu principal de la page (flouté blur-[2px] opacity-40)
```

---

## 9. 📷 Intégration du Scanner QR Code

Le scanner de QR code permet d'afficher directement un plat ou un menu complet de restaurant :
* **Flux caméra en direct** avec `navigator.mediaDevices.getUserMedia` et bascule torche (`Flashlight`).
* **Viseur laser animé** avec coins de visée en repère.
* **Accès direct démo 1-clic** pour tester instantanément un restaurant (*Le Maquis du Port*) ou un plat (*Pâte noire*).
* **Modale dédiée `ScannedRestaurantModal`** affichant la carte complète du restaurant avec tous ses prix en FCFA et boutons d'ajout au panier.

---

## 10. ✅ Checklist de Validation Obligatoire

- [ ] L'icône active est remplie avec la couleur d'accentuation de la marque (`#00AFF2`).
- [ ] Aucun tracé interne n'est bouché : toutes les contreformes (portes, aiguilles, points de calendrier) sont découpées.
- [ ] **Support Dark Mode Obligatoire** : Les contreformes s'alignent automatiquement sur l'arrière-plan sombre via `fill-white dark:fill-slate-900` ou `stroke-white dark:stroke-slate-900`.
- [ ] L'icône inactive est en tracé filaire net (`stroke: 2`, `fill: none`).
- [ ] Le libellé sous l'icône active est en **gras** (`font-bold`).
- [ ] **Bouton central sans libellé texte** : le bouton central reste épuré sans texte "Composer plat".
- [ ] **Zéro lueur colorée** : aucune classe `shadow-[#00AFF2]/...` sur les boutons ou icônes (ombres neutres uniquement).
- [ ] **Morphing rotatif continu** : le bouton central pivote à 45° (`Plus` ↔ `X`) via `cubic-bezier(0.34, 1.56, 0.64, 1)` sans saut visuel.
- [ ] **Affichage progressif en cascade** : apparition échelonnée des boutons Speed Dial (`delay-75` pour Scanner, `delay-150` pour Composer).
- [ ] **Maintien visible de la barre de navigation** : la barre reste visible en bas sous un flou doux (`blur-[1.5px] opacity-35`).
- [ ] **Zéro émoji** : utilisation exclusive d'icônes vectorielles professionnelles Lucide React.
- [ ] Zéro régression sur les tests unitaires et le linter (`npm run test`, `npm run lint`).
