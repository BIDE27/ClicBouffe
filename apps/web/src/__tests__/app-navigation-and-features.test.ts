import { describe, it, expect } from "vitest";
import {
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
  INITIAL_GRID_DISHES,
} from "../lib/data/clicbouffe-data";

describe("Fonctionnalités avancées ClicBouffe (Explorer, Plus Tard, Abonnements & Images)", () => {
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
