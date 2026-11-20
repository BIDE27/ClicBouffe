import { describe, it, expect, beforeEach } from "vitest";

// Polyfill minimal localStorage pour l'environnement Node.js de test
const memoryStore: Record<string, string> = {};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      for (const k in memoryStore) delete memoryStore[k];
    },
    key: (index: number) => Object.keys(memoryStore)[index] || null,
    length: 0,
  };
}
if (typeof (globalThis as unknown as { window?: unknown }).window === "undefined") {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

import { authService } from "../lib/services/auth-service";
import {
  createClient as createBrowserClient,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "../lib/supabase/client";
import {
  restaurantService,
  INITIAL_DEMO_DISHES,
  INITIAL_DEMO_ORDERS,
} from "../lib/services/restaurant-service";

describe("Services Backend & Authentification ClicBouffe", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Configuration robuste du client Supabase", () => {
    it("définit des identifiants Supabase par défaut valides sans placeholder", () => {
      expect(DEFAULT_SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
      expect(DEFAULT_SUPABASE_ANON_KEY).not.toBe("placeholder-anon-key");
      expect(DEFAULT_SUPABASE_ANON_KEY.length).toBeGreaterThan(50);
    });

    it("initialise le client Supabase sans exception", () => {
      const client = createBrowserClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });
  });

  describe("Service d'authentification (authService)", () => {
    it("génère des profils démo valides pour les tests", () => {
      const client = authService.loginDemo("customer");
      expect(client.role).toBe("customer");
      expect(client.full_name).toBe("Client ClicBouffe");
      expect(client.email).toBe("client@test.bj");

      const resto = authService.loginDemo("restaurant_owner");
      expect(resto.role).toBe("restaurant_owner");
      expect(resto.full_name).toBe("Chef Propriétaire");
      expect(resto.email).toBe("resto@test.bj");
    });

    it("permet l'inscription d'un utilisateur avec compte unique universel", async () => {
      const userSignup = await authService.signUp({
        email: "nouveau.client@test.bj",
        fullName: "Ablavi Lawson",
        phone: "+229 97 44 55 66",
        password: "MonMotDePasse123",
      });

      expect(userSignup.error).toBeNull();
      expect(userSignup.profile).not.toBeNull();
      expect(userSignup.profile?.full_name).toBe("Ablavi Lawson");
      expect(userSignup.profile?.email).toBe("nouveau.client@test.bj");
      expect(userSignup.profile?.role).toBe("customer");
    });

    it("la déconnexion purge la session utilisateur", async () => {
      authService.loginDemo("customer");
      expect(await authService.getCurrentProfile()).not.toBeNull();

      await authService.signOut();
      expect(await authService.getCurrentProfile()).toBeNull();
    });
  });

  describe("Service Restaurateur & KDS Cuisine (restaurantService)", () => {
    it("permet à un utilisateur de créer plusieurs pages de restaurant (Modèle Facebook)", async () => {
      const signupRes = await authService.signUp({
        email: "vendeur@test.bj",
        fullName: "Bio Sika",
        phone: "+229 95 33 22 11",
      });
      const user = signupRes.profile!;

      // Création premier restaurant
      const resto1 = await restaurantService.createRestaurant({
        ownerId: user.id,
        name: "Saveurs d'Akpakpa",
        category: "Cuisine Locale & Pâtes",
        address: "Terrain Zico, Akpakpa",
        phoneNumber: "+229 95 33 22 11",
      });
      expect(resto1.error).toBeNull();
      expect(resto1.restaurant?.name).toBe("Saveurs d'Akpakpa");
      expect(resto1.restaurant?.owner_id).toBe(user.id);

      // Création deuxième restaurant par le même utilisateur
      const resto2 = await restaurantService.createRestaurant({
        ownerId: user.id,
        name: "Grillades du Port",
        category: "Maquis & Grillades",
        address: "Zone Portuaire",
        phoneNumber: "+229 97 11 22 33",
      });
      expect(resto2.error).toBeNull();
      expect(resto2.restaurant?.name).toBe("Grillades du Port");
      expect(resto2.restaurant?.owner_id).toBe(user.id);

      // Vérification que les 2 restaurants sont rattachés au même profil utilisateur
      const userRestos = await restaurantService.getRestaurantsByOwner(user.id);
      expect(userRestos.length).toBe(2);
      expect(userRestos.some((r) => r.name === "Saveurs d'Akpakpa")).toBe(true);
      expect(userRestos.some((r) => r.name === "Grillades du Port")).toBe(true);
    });
    it("récupère le restaurant du propriétaire et ses plats", async () => {
      const resto = await restaurantService.getRestaurantByOwner("user-resto-001");
      expect(resto.name).toBe("Le Maquis du Port");
      expect(resto.is_open).toBe(true);

      const dishes = await restaurantService.getDishes(resto.id);
      expect(dishes.length).toBeGreaterThanOrEqual(3);
      dishes.forEach((dish) => {
        expect(dish.price).toBeGreaterThan(0);
        expect(dish.prep_time_min).toBeGreaterThan(0);
      });
    });

    it("permet de basculer la disponibilité d'un plat (En stock / Épuisé)", async () => {
      const dish = INITIAL_DEMO_DISHES[0];
      const initialAvailability = dish.is_available;

      const updated = await restaurantService.toggleDishAvailability(dish.id, !initialAvailability);
      expect(updated).toBe(!initialAvailability);

      const restored = await restaurantService.toggleDishAvailability(dish.id, initialAvailability);
      expect(restored).toBe(initialAvailability);
    });

    it("permet d'ajouter un nouveau plat au menu", async () => {
      const newDish = await restaurantService.addDish({
        restaurant_id: "resto-maquis-001",
        name: "Poisson Capitaine Braisé",
        description: "Capitaine de lagune braisé au piment vert doux.",
        price: 4500,
        image_url: "/images/restau_maquis.jpg",
        is_available: true,
        is_free_eligible: false,
        allows_customization: true,
        prep_time_min: 25,
      });

      expect(newDish.id).toBeTruthy();
      expect(newDish.price).toBe(4500);

      const allDishes = await restaurantService.getDishes("resto-maquis-001");
      expect(allDishes.some((d) => d.name === "Poisson Capitaine Braisé")).toBe(true);
    });

    it("gère le cycle de vie complet d'une commande KDS", async () => {
      const orders = await restaurantService.getOrders("resto-maquis-001");
      expect(orders.length).toBeGreaterThanOrEqual(3);

      const pendingOrder = orders.find((o) => o.status === "pending");
      expect(pendingOrder).toBeDefined();

      if (pendingOrder) {
        // En attente -> En cuisine
        const preparingStatus = await restaurantService.updateOrderStatus(pendingOrder.id, "preparing");
        expect(preparingStatus).toBe("preparing");

        // En cuisine -> Prêt
        const readyStatus = await restaurantService.updateOrderStatus(pendingOrder.id, "ready_for_pickup");
        expect(readyStatus).toBe("ready_for_pickup");

        // Prêt -> Livré
        const deliveredStatus = await restaurantService.updateOrderStatus(pendingOrder.id, "delivered");
        expect(deliveredStatus).toBe("delivered");
      }
    });

    it("calcule fidèlement les métriques économiques (KPIs) en FCFA", () => {
      const kpis = restaurantService.getKPIs(INITIAL_DEMO_ORDERS, INITIAL_DEMO_DISHES);
      expect(kpis.today_revenue_fcfa).toBeGreaterThan(0);
      expect(kpis.today_orders_count).toBe(INITIAL_DEMO_ORDERS.length);
      expect(kpis.rating).toBeGreaterThanOrEqual(4.5);
      expect(kpis.active_dishes_count).toBeGreaterThan(0);
    });
  });
});
