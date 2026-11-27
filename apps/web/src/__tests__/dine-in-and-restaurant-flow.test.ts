import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Polyfill minimal localStorage & window pour environnement Node Vitest
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
if (typeof (globalThis.window as { location?: unknown }).location === "undefined") {
  (globalThis.window as { location: unknown }).location = {
    origin: "https://clicbouffe-web.vercel.app",
    href: "https://clicbouffe-web.vercel.app/",
  };
}
if (typeof globalThis.window.dispatchEvent !== "function") {
  globalThis.window.dispatchEvent = () => true;
}

import { restaurantService } from "../lib/services/restaurant-service";
import {
  createRestaurantSchema,
  createRestaurantOrderSchema,
  waiterCallSchema,
} from "../lib/validation/restaurant-schemas";
import { CreateRestaurantPageView } from "../components/restaurant/create-restaurant-page";
import { ScannedRestaurantModal } from "../components/qr/scanned-restaurant-modal";
import { QrCodeDisplay } from "../components/ui/qr-code-display";
import { REGIONAL_RESTAURANTS } from "../lib/data/clicbouffe-data";

describe("Digitalisation Salle, Création Pleine Page, Commandes QR & Appels Serveur", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Validation Zod stricte (Zero-Trust)", () => {
    it("valide une création complète de restaurant avec mode salle QR", () => {
      const valid = createRestaurantSchema.safeParse({
        ownerId: "user-owner-1",
        name: "Maquis La Paix",
        category: "Cuisine Locale & Pâtes (Amiwo, Pâte noire)",
        address: "Akpakpa, Terrain Zico",
        phoneNumber: "+229 97 00 11 22",
        salesMode: "hybrid",
        tablesCount: 16,
        tableZones: ["Salle Principale", "Terrasse"],
        avgPrepTimeMin: 15,
        allowsDineInComposition: true,
        allowsWaiterCall: true,
        acceptsCashOnSite: true,
      });
      expect(valid.success).toBe(true);
    });

    it("rejette un appel serveur sans numéro de table", () => {
      const invalid = waiterCallSchema.safeParse({
        restaurantId: "resto-1",
        tableNumber: "",
        requestType: "silent_request",
        message: "De l'eau svp",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejette une commande vide", () => {
      const invalidOrder = createRestaurantOrderSchema.safeParse({
        restaurantId: "resto-1",
        restaurantName: "Le Maquis du Port",
        orderType: "dine_in",
        tableNumber: "Table 4",
        deliveryAddress: "Sur place • Table 4",
        items: [],
      });
      expect(invalidOrder.success).toBe(false);
    });

    it("rejette une commande sur place sans numéro de table et une URL bannière javascript:", () => {
      const missingTable = createRestaurantOrderSchema.safeParse({
        restaurantId: "resto-1",
        restaurantName: "Le Maquis du Port",
        orderType: "dine_in",
        tableNumber: "",
        deliveryAddress: "Sur place",
        items: [{ dishName: "Alloco", quantity: 1, unitPrice: 1000 }],
      });
      expect(missingTable.success).toBe(false);

      const xssBanner = createRestaurantSchema.safeParse({
        ownerId: "owner-1",
        name: "Maquis Test",
        category: "Locale",
        address: "Akpakpa",
        phoneNumber: "+229 97 00 11 22",
        bannerUrl: "javascript:alert(1)",
      });
      expect(xssBanner.success).toBe(false);
    });
  });

  describe("Parcours Complet Salle QR : Création, Commande Directe & Appel Silencieux", () => {
    it("crée un restaurant complet avec slug recherchable pour QR / lien direct", async () => {
      const { restaurant, error } = await restaurantService.createRestaurant({
        ownerId: "owner-bide",
        name: "Chez Tante Victoire",
        category: "Cuisine Locale & Pâtes",
        address: "Enagnon, Akpakpa",
        phoneNumber: "+229 97 22 33 44",
        salesMode: "hybrid",
        tablesCount: 12,
        tableZones: ["Salle Principale", "Jardin"],
        avgPrepTimeMin: 15,
        allowsDineInComposition: true,
        allowsWaiterCall: true,
      });

      expect(error).toBeNull();
      expect(restaurant).not.toBeNull();
      expect(restaurant?.sales_mode).toBe("hybrid");
      expect(restaurant?.tables_count).toBe(12);
      expect(restaurant?.avg_prep_time_min).toBe(15);

      const found = await restaurantService.findRestaurantByQuery(restaurant!.slug);
      expect(found?.name).toBe("Chez Tante Victoire");
    });

    it("passe une commande sur place (0 FCFA frais de livraison) avec délai promis et notifie le restaurateur", async () => {
      const { order, error } = await restaurantService.createOrder({
        restaurantId: "resto-maquis-001",
        restaurantName: "Le Maquis du Port",
        ownerId: "owner-xyz",
        customerName: "BIDE",
        customerPhone: "Sur place",
        orderType: "dine_in",
        tableNumber: "Table 7",
        estimatedServeMinutes: 15,
        deliveryAddress: "Sur place • Table 7",
        paymentMethod: "cash_on_delivery",
        items: [
          {
            dishId: null,
            dishName: "Pâte rouge Amiwo (Composé sur mesure)",
            quantity: 1,
            unitPrice: 1800,
            customizationDetails: {
              resume: "Sauce Gombo crincrin + Poulet bicyclette doré",
            },
          },
        ],
      });

      expect(error).toBeNull();
      expect(order).not.toBeNull();
      expect(order?.order_type).toBe("dine_in");
      expect(order?.table_number).toBe("Table 7");
      expect(order?.delivery_fee).toBe(0);
      expect(order?.total_amount).toBe(1800);
      expect(order?.payment_status).toBe("pending");
      expect(order?.promised_ready_at).toBeTruthy();

      const notifs = await restaurantService.getNotifications("owner-xyz", ["resto-maquis-001"]);
      expect(notifs.length).toBeGreaterThanOrEqual(1);
      expect(notifs[0].title).toContain("Table 7");
    });

    it("transmet un appel serveur silencieux et permet son suivi jusqu'à 'served'", async () => {
      const { call, error } = await restaurantService.sendWaiterCall({
        restaurantId: "resto-maquis-001",
        restaurantName: "Le Maquis du Port",
        ownerId: "owner-xyz",
        customerName: "BIDE",
        tableNumber: "Table 3",
        requestType: "silent_request",
        message: "Pouvez-vous apporter du piment vert sans bruit ?",
        isSilent: true,
      });

      expect(error).toBeNull();
      expect(call?.status).toBe("pending");
      expect(call?.table_number).toBe("Table 3");

      await restaurantService.updateWaiterCallStatus(call!.id, "served");
      const calls = await restaurantService.getWaiterCalls("resto-maquis-001");
      expect(calls.find((c) => c.id === call!.id)?.status).toBe("served");
    });
  });

  describe("Rendu Pleine Page UI/UX (CreateRestaurantPageView & ScannedRestaurantModal)", () => {
    it("rend la page entière de création de restaurant sans émoji et avec support Dark Mode", () => {
      const markup = renderToStaticMarkup(
        React.createElement(CreateRestaurantPageView, {
          isOpen: true,
          onClose: () => {},
          onSuccess: () => {},
          currentUserId: "user-1",
          theme: "dark",
          onToggleTheme: () => {},
        })
      );

      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      expect(emojiRegex.test(markup)).toBe(false);
      expect(markup).toContain("Créer mon Restaurant");
      expect(markup).toContain("Complet (Salle QR + App)");
      expect(markup).toContain("dark:bg-slate-950");
      expect(markup).toContain("1. Modèle &amp; Identité");
      expect(markup).toContain("3. Salle &amp; QR Code");
    });

    it("rend la vue complète restaurant client avec Sur place, Composition et Appel serveur", () => {
      const markup = renderToStaticMarkup(
        React.createElement(ScannedRestaurantModal, {
          restaurant: REGIONAL_RESTAURANTS[0],
          isOpen: true,
          onClose: () => {},
          selectedDishes: [],
          onToggleDish: () => {},
          onGoToExplorer: () => {},
          detectedTable: "Table 5",
          initialMode: "dine_in",
        })
      );

      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      expect(emojiRegex.test(markup)).toBe(false);
      expect(markup).toContain("Table 5");
      expect(markup).toContain("Composer mon plat");
      expect(markup).toContain("Appeler serveur");
      expect(markup).toContain("dark:bg-slate-950");
    });

    it("rend un QR code vectoriel pur SVG et respecte le mode online_only", () => {
      const qrMarkup = renderToStaticMarkup(
        React.createElement(QrCodeDisplay, {
          value: "https://clicbouffe-web.vercel.app/?resto=maquis-test&table=Table-1",
          label: "Maquis Test • Table 1",
        })
      );
      expect(qrMarkup).toContain("<svg");
      expect(qrMarkup).toContain("<path");
      expect(qrMarkup).toContain("Maquis Test • Table 1");

      const onlineOnlyMarkup = renderToStaticMarkup(
        React.createElement(ScannedRestaurantModal, {
          restaurant: { ...REGIONAL_RESTAURANTS[0], sales_mode: "online_only" },
          isOpen: true,
          onClose: () => {},
          selectedDishes: [],
          onToggleDish: () => {},
          onGoToExplorer: () => {},
        })
      );
      expect(onlineOnlyMarkup).not.toContain("Sur place (Table)");
    });
  });
});
