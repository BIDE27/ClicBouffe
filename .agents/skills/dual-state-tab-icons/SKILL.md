---
name: dual-state-tab-icons
description: >-
  Conception et implémentation d'icônes de navigation basse (Bottom Tab Bar) dual-state :
  contour filaire (outline) pour l'état inactif, silhouette pleine (solid/filled) avec découpe
  de contreforme en espace négatif (knockout cutout adaptatif clair/sombre : fill-white dark:fill-slate-900)
  pour l'état actif, accompagnée du libellé en gras (font-bold). À activer dès qu'un utilisateur demande
  des icônes de barre de navigation, des états actifs d'onglets, ou un rendu mobile-first natif pixel-perfect.
---

# Dual-State Bottom Tab Navigation Icons (Icônes à Contreforme & Espace Négatif Adaptatif)

Ce skill enseigne à l'agent comment concevoir et implémenter des barres de navigation mobiles (Bottom Tab Bar) professionnelles au standard iOS / Android (SF Symbols & Material Design), avec support universel du mode clair et du mode sombre.

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

## 5. 📋 Structure du Bouton d'Onglet (React + Tailwind CSS)

```tsx
<button
  onClick={() => setActiveTab("home")}
  className={`flex flex-col items-center gap-0.5 transition-colors ${
    activeTab === "home" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"
  }`}
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

## 6. ✅ Checklist de Validation Obligatoire

- [ ] L'icône active est remplie avec la couleur d'accentuation de la marque (`#00AFF2`).
- [ ] Aucun tracé interne n'est bouché : toutes les contreformes (portes, aiguilles, points de calendrier) sont découpées.
- [ ] **Support Dark Mode Obligatoire** : Les contreformes (portes, aiguilles, points) s'alignent automatiquement sur l'arrière-plan sombre via `fill-white dark:fill-slate-900` ou `stroke-white dark:stroke-slate-900` pour éliminer tout "trou blanc" parasite en mode sombre.
- [ ] L'icône inactive est en tracé filaire net (`stroke: 2`, `fill: none`).
- [ ] Le libellé sous l'icône active est en **gras** (`font-bold`).
- [ ] Zéro régression sur le linter (`npm run lint`).
- [ ] Tests unitaires validés (vérification des attributs `fill`, `stroke` et classes adaptatives `dark:fill-slate-900`).
