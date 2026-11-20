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
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SideDrawer } from "../components/navigation/side-drawer";

describe("Gestion du Portefeuille et Menu Latéral", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devrait initialiser le solde du portefeuille à 0 FCFA par défaut", () => {
    const balance = authService.getWalletBalance();
    expect(balance).toBe(0);
  });

  it("devrait créditer et mettre à jour le solde lors d'une recharge", () => {
    expect(authService.getWalletBalance()).toBe(0);

    const newBalance1 = authService.rechargeWallet(2000);
    expect(newBalance1).toBe(2000);
    expect(authService.getWalletBalance()).toBe(2000);

    const newBalance2 = authService.rechargeWallet(5000);
    expect(newBalance2).toBe(7000);
    expect(authService.getWalletBalance()).toBe(7000);
  });

  it("devrait persister le solde rechargé dans le stockage local", () => {
    authService.rechargeWallet(10000);
    const balance = authService.getWalletBalance();
    expect(balance).toBe(10000);
  });

  it("gère les déconnexions sans altérer l'intégrité du solde", async () => {
    authService.rechargeWallet(3000);
    await authService.signOut();
    expect(authService.getWalletBalance()).toBe(3000);
  });

  it("persiste le choix de thème (mode clair / sombre) dans localStorage", () => {
    localStorage.setItem("clicbouffe_theme", "dark");
    expect(localStorage.getItem("clicbouffe_theme")).toBe("dark");

    localStorage.setItem("clicbouffe_theme", "light");
    expect(localStorage.getItem("clicbouffe_theme")).toBe("light");
  });

  describe("Animations douces et progressives du Menu Latéral (SideDrawer)", () => {
    it("ne rend rien dans le DOM lorsque isOpen est false", () => {
      const markup = renderToStaticMarkup(
        React.createElement(SideDrawer, {
          isOpen: false,
          onClose: () => {},
          currentUser: null,
          walletBalance: 0,
          onOpenAuth: () => {},
          onSignOut: () => {},
          onOpenWallet: () => {},
          onOpenDeliveryRates: () => {},
          onNavigateToScreen: () => {},
          theme: "light",
          onToggleTheme: () => {},
        })
      );
      expect(markup).toBe("");
    });

    it("rend le menu latéral avec classes d'animation douce (drawer-backdrop et drawer-panel)", () => {
      const markup = renderToStaticMarkup(
        React.createElement(SideDrawer, {
          isOpen: true,
          onClose: () => {},
          currentUser: null,
          walletBalance: 2000,
          onOpenAuth: () => {},
          onSignOut: () => {},
          onOpenWallet: () => {},
          onOpenDeliveryRates: () => {},
          onNavigateToScreen: () => {},
          theme: "light",
          onToggleTheme: () => {},
        })
      );
      expect(markup).toContain('aria-label="Menu latéral"');
      expect(markup).toContain("drawer-backdrop");
      expect(markup).toContain("drawer-backdrop-in");
      expect(markup).toContain("drawer-panel");
      expect(markup).toContain("drawer-panel-in");
      expect(markup).toContain("Mon Portefeuille");
      expect(markup).toContain("2 000 FCFA");
    });

    it("sépare l'en-tête fixe du corps déroulant avec overscroll-contain", () => {
      const markup = renderToStaticMarkup(
        React.createElement(SideDrawer, {
          isOpen: true,
          onClose: () => {},
          currentUser: null,
          walletBalance: 0,
          onOpenAuth: () => {},
          onSignOut: () => {},
          onOpenWallet: () => {},
          onOpenDeliveryRates: () => {},
          onNavigateToScreen: () => {},
          theme: "dark",
          onToggleTheme: () => {},
        })
      );

      // L'en-tête ne défile pas (shrink-0, sticky/fixe en haut)
      expect(markup).toContain("Menu Principal");
      expect(markup).toContain("shrink-0");

      // Le corps de menu possède sa propre zone déroulante avec overscroll-contain
      expect(markup).toContain("overflow-y-auto");
      expect(markup).toContain("overscroll-contain");
    });
  });
});
