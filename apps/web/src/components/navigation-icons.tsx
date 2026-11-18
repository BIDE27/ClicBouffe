import React from "react";

interface NavIconProps {
  active?: boolean;
  className?: string;
  cutoutColor?: string;
}

/**
 * Icône ACCUEIL Pixel-Perfect
 * - Actif : Maison remplie en bleu officiel (#00AFF2) avec porte découpée à la couleur d'arrière-plan
 *           (blanc en mode clair, dark:fill-slate-900 en mode sombre).
 * - Inactif : Contour épuré ardoise/gris (stroke 1.8-2).
 */
export function HomeNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: NavIconProps) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Corps et toiture de la maison remplis en bleu officiel */}
        <path
          d="M12 2.6L2.6 10.3a1 1 0 0 0-.25.7V20a2 2 0 0 0 2 2h15.3a2 2 0 0 0 2-2v-9a1 1 0 0 0-.25-.7L12 2.6z"
          fill="#00AFF2"
        />
        {/* Porte intérieure découpée à la couleur d'arrière-plan (adaptative clair / sombre) */}
        <path
          d="M9.5 22V13a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9h-5z"
          fill={cutoutColor}
          className={isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined}
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

/**
 * Icône EXPLORER Pixel-Perfect
 * - Actif : Disque rempli en bleu officiel (#00AFF2) avec aiguille de boussole découpée
 *           (blanc en clair, dark:fill-slate-900 en sombre).
 * - Inactif : Contour boussole classique.
 */
export function ExplorerNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: NavIconProps) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Disque boussole rempli en bleu */}
        <circle cx="12" cy="12" r="10" fill="#00AFF2" />
        {/* Aiguille boussole en blanc ou fond sombre */}
        <polygon
          points="16.5 7.5 13.8 13.8 7.5 16.5 10.2 10.2 16.5 7.5"
          fill={cutoutColor}
          className={isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined}
        />
        {/* Pivot central bleu */}
        <circle cx="12" cy="12" r="1.4" fill="#00AFF2" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/**
 * Icône PLUS TARD (Horloge) Pixel-Perfect
 * - Actif : Cadran d'horloge rempli en bleu (#00AFF2) avec aiguilles découpées
 *           (blanc en clair, dark:stroke-slate-900 en sombre).
 * - Inactif : Contour horloge classique.
 */
export function ClockNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: NavIconProps) {
  if (active) {
    const isDefault = cutoutColor === "white";
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Cadran d'horloge rempli en bleu */}
        <circle cx="12" cy="12" r="10" fill="#00AFF2" />
        {/* Aiguilles d'horloge découpées en blanc ou fond sombre */}
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/**
 * Icône ABONNEMENTS (Calendrier) Pixel-Perfect
 * - Actif : Calendrier rempli en bleu (#00AFF2) avec anneaux, en-tête et grille de points
 *           (blanc en clair, dark:stroke-slate-900 / dark:fill-slate-900 en sombre).
 * - Inactif : Contour calendrier classique.
 */
export function CalendarNavIcon({
  active = false,
  className = "w-5 h-5",
  cutoutColor = "white",
}: NavIconProps) {
  if (active) {
    const isDefault = cutoutColor === "white";
    const fillClass = isDefault ? "fill-white dark:fill-slate-900 transition-colors" : undefined;
    const strokeClass = isDefault ? "stroke-white dark:stroke-slate-900 transition-colors" : undefined;
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Corps du calendrier rempli en bleu */}
        <rect x="3" y="4.5" width="18" height="17" rx="3" fill="#00AFF2" />
        {/* Anneaux de reliure supérieurs */}
        <path
          d="M8 2.5v4M16 2.5v4"
          stroke={cutoutColor}
          strokeWidth="2"
          strokeLinecap="round"
          className={strokeClass}
        />
        {/* Ligne d'en-tête */}
        <line
          x1="3"
          y1="9.5"
          x2="21"
          y2="9.5"
          stroke={cutoutColor}
          strokeWidth="1.5"
          className={strokeClass}
        />
        {/* Grille de points/jours (adaptatifs clair / sombre) */}
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
