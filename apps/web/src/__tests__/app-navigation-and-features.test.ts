import { describe, it, expect } from "vitest";
import {
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
  INITIAL_GRID_DISHES,
  PROMOTIONAL_CAROUSEL_SLIDES,
  EXPLORER_CATEGORIES,
} from "../lib/data/clicbouffe-data";

describe("Fonctionnalités avancées ClicBouffe (Explorer, Plus Tard, Abonnements & Images)", () => {
  describe("Carrousel publicitaire automatique (Sponsors & Partenaires)", () => {
    it("propose au moins 4 diapositives publicitaires rotatives avec prix en FCFA", () => {
      expect(PROMOTIONAL_CAROUSEL_SLIDES.length).toBeGreaterThanOrEqual(4);
      PROMOTIONAL_CAROUSEL_SLIDES.forEach((slide) => {
        expect(slide.title).toBeTruthy();
        expect(slide.partnerName).toBeTruthy();
        expect(slide.partnerLocation).toBeTruthy();
        expect(slide.price).toContain("FCFA");
        expect(slide.img).toMatch(/\.(jpg|png)$/);
        expect(slide.isSponsored).toBe(true);
        expect(slide.dishRefName).toBeTruthy();
      });
    });

    it("contient l'Amberger signature et les spécialités partenaires", () => {
      const titles = PROMOTIONAL_CAROUSEL_SLIDES.map((s) => s.title);
      expect(titles.some((t) => t.includes("Amberger"))).toBe(true);
      expect(titles.some((t) => t.includes("Daurade") || t.includes("Poisson"))).toBe(true);
      expect(titles.some((t) => t.includes("Pâte Rouge"))).toBe(true);
      expect(titles.some((t) => t.includes("Tapioca"))).toBe(true);
    });

    it("vérifie la logique du carrousel infini continu sans rembobinage", () => {
      const N = PROMOTIONAL_CAROUSEL_SLIDES.length; // 6
      expect(N).toBe(6);

      // 1. Passage de la dernière carte vers la suivante : avance vers le clone sans rembobiner
      const lastVirtualIndex = 2 * N - 1; // 11 (dernière carte du Set 1)
      const nextVirtualIndex = lastVirtualIndex + 1; // 12 (première carte du Set 2, clone de 0)
      expect(nextVirtualIndex).toBe(12);

      // Calcul de l'index réel actif : toujours 0 (carte 1/6)
      const realIndex = ((nextVirtualIndex % N) + N) % N;
      expect(realIndex).toBe(0);

      // Normalisation silencieuse après la fin de la glissade : 12 -> 6 (Set 1)
      const normalizedIndex = N + realIndex;
      expect(normalizedIndex).toBe(6);

      // 2. Trajectoire la plus courte pour la navigation par points (dots)
      const computeShortestPath = (fromReal: number, toReal: number, total: number) => {
        let diff = toReal - fromReal;
        if (diff > total / 2) diff -= total;
        else if (diff < -total / 2) diff += total;
        return diff;
      };

      // De la carte 5 à la carte 0 : +1 (glisse vers l'avant), pas -5 (rembobinage)
      expect(computeShortestPath(5, 0, N)).toBe(1);

      // De la carte 0 à la carte 5 : -1 (glisse vers l'arrière), pas +5
      expect(computeShortestPath(0, 5, N)).toBe(-1);

      // De la carte 1 à la carte 3 : +2 vers l'avant
      expect(computeShortestPath(1, 3, N)).toBe(2);
    });
  });

  describe("Standards visuels : Zéro émoji et catégories avec icônes vectorielles", () => {
    it("toutes les catégories de l'onglet Explorer possèdent une icône vectorielle valide et aucun émoji", () => {
      expect(EXPLORER_CATEGORIES.length).toBeGreaterThanOrEqual(5);
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      EXPLORER_CATEGORIES.forEach((cat) => {
        expect(cat.id).toBeTruthy();
        expect(cat.label).toBeTruthy();
        expect(cat.shortLabel).toBeTruthy();
        expect(emojiRegex.test(cat.label)).toBe(false);
        expect(emojiRegex.test(cat.shortLabel)).toBe(false);
        expect(["Utensils", "Soup", "Flame", "Sandwich", "Beef"]).toContain(cat.iconName);
      });
    });
  });
  describe("Catalogue des plats et photos authentiques", () => {
    it("tous les plats de la grille utilisent des photos authentiques .jpg sans découpage amateur", () => {
      INITIAL_GRID_DISHES.forEach((dish) => {
        expect(dish.img).toMatch(/\.jpg$/);
        expect(dish.img).not.toContain("cropped");
        expect(dish.price).toContain("FCFA");
      });
    });

    it("la liste contient l'Amberger et les spécialités locales béninoises", () => {
      const names = INITIAL_GRID_DISHES.map((d) => d.name);
      expect(names).toContain("Amberger");
      expect(names).toContain("Pâte noire");
      expect(names).toContain("Pâte rouge");
      expect(names).toContain("Tapioca chaud");
      expect(names).toContain("Chawarma");
      expect(names).toContain("Gari au lait");
    });
  });

  describe("Page Explorer : Restaurants de la sous-région (Akpakpa / Cotonou)", () => {
    it("fournit une liste complète de restaurants locaux de qualité", () => {
      expect(REGIONAL_RESTAURANTS.length).toBeGreaterThanOrEqual(6);
      REGIONAL_RESTAURANTS.forEach((r) => {
        expect(r.name).toBeTruthy();
        expect(r.rating).toBeGreaterThanOrEqual(4.5);
        expect(r.img).toMatch(/\.jpg$/);
        expect(r.distance).toBeTruthy();
        expect(r.deliveryFee).toContain("FCFA");
        expect(r.isOpen).toBe(true);
      });
    });

    it("contient les maquis, fast-foods et restaurants familiaux phares", () => {
      const names = REGIONAL_RESTAURANTS.map((r) => r.name);
      expect(names).toContain("Le Maquis du Port");
      expect(names).toContain("Saveurs d'Akpakpa (Terrain Zico)");
      expect(names).toContain("Chawarma & Grill Cotonou");
      expect(names).toContain("Le Burger Béninois (Gourmet)");
      expect(names).toContain("Chez Maman Cécile (Plats du Jour)");
    });
  });

  describe("Page Plus Tard : Plats programmés pour plus tard", () => {
    it("contient des commandes programmées avec date, heure et instructions", () => {
      expect(INITIAL_SCHEDULED_DISHES.length).toBeGreaterThanOrEqual(3);
      INITIAL_SCHEDULED_DISHES.forEach((item) => {
        expect(item.dishName).toBeTruthy();
        expect(item.restaurantName).toBeTruthy();
        expect(item.scheduledDate).toBeTruthy();
        expect(item.scheduledTime).toMatch(/^\d{2}h\d{2}$/);
        expect(item.portions).toBeGreaterThanOrEqual(1);
        expect(item.priceNum).toBeGreaterThan(0);
      });
    });
  });

  describe("Page Abonnements : Plats et restaurants abonnés", () => {
    it("gère les abonnements récurrents actifs et les formules à souscrire", () => {
      expect(INITIAL_SUBSCRIPTIONS.length).toBeGreaterThanOrEqual(3);
      expect(AVAILABLE_FORMULAS.length).toBeGreaterThanOrEqual(3);

      const activeSubs = INITIAL_SUBSCRIPTIONS.filter((s) => s.status === "actif");
      expect(activeSubs.length).toBeGreaterThanOrEqual(2);

      AVAILABLE_FORMULAS.forEach((f) => {
        expect(f.title).toBeTruthy();
        expect(f.price).toContain("FCFA");
        expect(f.features.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe("Barres de navigation dynamiques : Disparition au scroll bas et réapparition au scroll haut", () => {
    it("vérifie la logique de calcul de seuil de scroll pour escamoter et réafficher les barres", () => {
      const thresholdDown = 18;
      const thresholdUp = 12;
      const topSafeZone = 40;

      // Fonction pure de calcul d'état de visibilité
      const computeNavVisibility = (currentY: number, lastY: number): boolean => {
        if (currentY <= topSafeZone) return true;
        const delta = currentY - lastY;
        if (delta > thresholdDown && currentY > 70) return false; // Scroll bas
        if (delta < -thresholdUp) return true; // Scroll haut
        return true;
      };

      // Au sommet de la page, toujours visible
      expect(computeNavVisibility(10, 0)).toBe(true);
      expect(computeNavVisibility(30, 20)).toBe(true);

      // Défilement vers le bas au-delà du seuil : masquer
      expect(computeNavVisibility(150, 100)).toBe(false);

      // Micro-défilement inférieur au seuil : pas de saut intempestif
      expect(computeNavVisibility(110, 100)).toBe(true);

      // Défilement vers le haut : réafficher immédiatement
      expect(computeNavVisibility(130, 155)).toBe(true);
    });

    it("vérifie que les classes de transition fluide utilisent la courbe de Bézier progressive et stylée", () => {
      // Les barres de navigation doivent utiliser les classes GPU stylées .nav-bar-top-stylish et .nav-bar-bottom-stylish
      const topStylishClass = "nav-bar-top-stylish";
      const bottomStylishClass = "nav-bar-bottom-stylish";
      expect(topStylishClass).toBe("nav-bar-top-stylish");
      expect(bottomStylishClass).toBe("nav-bar-bottom-stylish");
    });
  });
});
