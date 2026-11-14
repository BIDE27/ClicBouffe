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
});
