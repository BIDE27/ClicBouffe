import { describe, it, expect } from "vitest";

// ============================================================================
// 1. DÉFINITION DE LA LOGIQUE ACTUELLE DANS page.tsx
// ============================================================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
}

// Logique actuelle dans page.tsx (L183-186)
function calculateDeliveryFeeCurrent(cart: CartItem[]): number {
  return cart.length === 0 ? 0 : cart.length <= 2 ? 80 : cart.length <= 5 ? 130 : 170;
}

// Logique officielle selon AGENTS.md (basée sur le NOMBRE TOTAL DE PLATS / QUANTITÉ)
// 1-2 plats = 80 FCFA, 3-5 plats = 130 FCFA, 6-10 plats = 170 FCFA, >10 plats = 0 FCFA (Gratuit)
export function calculateDeliveryFeeOfficial(totalDishesCount: number): number {
  if (totalDishesCount <= 0) return 0;
  if (totalDishesCount <= 2) return 80;
  if (totalDishesCount <= 5) return 130;
  if (totalDishesCount <= 10) return 170;
  return 0; // Gratuit si > 10 plats
}

// Formatage monétaire avec espace insécable
export function formatFCFA(amount: number): string {
  // \u00A0 est l'espace insécable officiel
  const formattedNumber = amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0");
  return `${formattedNumber}\u00A0FCFA`;
}

// ============================================================================
// 2. SUITE DE TESTS : CALCUL DES FRAIS DE LIVRAISON
// ============================================================================

describe("Calcul des frais de livraison (Grille officielle ClicBouffe)", () => {
  it("0 plat -> Frais de livraison = 0 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(0)).toBe(0);
  });

  it("1 plat -> Frais de livraison = 80 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(1)).toBe(80);
  });

  it("2 plats -> Frais de livraison = 80 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(2)).toBe(80);
  });

  it("3 plats -> Frais de livraison = 130 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(3)).toBe(130);
  });

  it("5 plats -> Frais de livraison = 130 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(5)).toBe(130);
  });

  it("6 plats -> Frais de livraison = 170 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(6)).toBe(170);
  });

  it("10 plats -> Frais de livraison = 170 FCFA", () => {
    expect(calculateDeliveryFeeOfficial(10)).toBe(170);
  });

  it("> 10 plats (ex: 11 plats) -> Frais de livraison = 0 FCFA (Gratuit)", () => {
    expect(calculateDeliveryFeeOfficial(11)).toBe(0);
    expect(calculateDeliveryFeeOfficial(25)).toBe(0);
  });

  // Test de mise en évidence du BUG dans page.tsx (cart.length vs cartItemsCount et manque du cas > 10)
  describe("Détection des anomalies dans l'implémentation actuelle de page.tsx", () => {
    it("BUG 1 : Un panier avec 1 article de quantité 3 (3 plats) est facturé 80 FCFA au lieu de 130 FCFA", () => {
      const cart: CartItem[] = [
        { id: "1", name: "Pâte noire", price: 2000, quantity: 3, image: "/test.png" },
      ];
      const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0); // 3 plats
      const feeCalculatedByPageTsx = calculateDeliveryFeeCurrent(cart); // Utilise cart.length = 1 -> 80 FCFA
      const feeExpected = calculateDeliveryFeeOfficial(itemsCount); // Doit être 130 FCFA

      expect(feeCalculatedByPageTsx).not.toBe(feeExpected);
      expect(feeCalculatedByPageTsx).toBe(80); // Valeur erronée observée
      expect(feeExpected).toBe(130); // Valeur attendue
    });

    it("BUG 2 : Un panier avec plus de 10 plats (ex: 12 plats distincts) est facturé 170 FCFA au lieu de 0 FCFA (Gratuit)", () => {
      const cart: CartItem[] = Array.from({ length: 12 }, (_, i) => ({
        id: `dish-${i}`,
        name: `Plat ${i}`,
        price: 1000,
        quantity: 1,
        image: "/test.png",
      }));
      const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0); // 12 plats
      const feeCalculatedByPageTsx = calculateDeliveryFeeCurrent(cart); // Retourne 170 FCFA
      const feeExpected = calculateDeliveryFeeOfficial(itemsCount); // Doit être 0 FCFA

      expect(feeCalculatedByPageTsx).not.toBe(feeExpected);
      expect(feeCalculatedByPageTsx).toBe(170); // Valeur erronée observée
      expect(feeExpected).toBe(0); // Valeur attendue (Gratuit)
    });
  });
});

// ============================================================================
// 3. SUITE DE TESTS : GESTION DU PANIER (AJOUT, SUPPRESSION À 0, RECALCUL)
// ============================================================================

describe("Gestion du panier ClicBouffe", () => {
  it("Suppression automatique d'un article quand la quantité devient 0 ou négative", () => {
    const initialCart: CartItem[] = [
      { id: "1", name: "Pâte noire", price: 2000, quantity: 1, image: "/test.png" },
      { id: "2", name: "Tapioca", price: 100, quantity: 2, image: "/test.png" },
    ];

    // Simuler updateQuantity(id, delta)
    const updateQuantity = (cart: CartItem[], id: string, delta: number): CartItem[] => {
      return cart
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    };

    // Décrémenter l'article 1 de 1 -> doit être supprimé
    const updated1 = updateQuantity(initialCart, "1", -1);
    expect(updated1).toHaveLength(1);
    expect(updated1.find((item) => item.id === "1")).toBeUndefined();

    // Décrémenter l'article 2 de 5 (quantité négative) -> doit être supprimé proprement sans quantité négative
    const updated2 = updateQuantity(updated1, "2", -5);
    expect(updated2).toHaveLength(0);
  });

  it("Recalcul correct du sous-total et du total avec frais de livraison", () => {
    const cart: CartItem[] = [
      { id: "1", name: "Pâte noire", price: 2000, quantity: 2, image: "/test.png" }, // 4 000
      { id: "2", name: "Tapioca", price: 100, quantity: 1, image: "/test.png" }, // 100
    ];

    const totalDishes = cart.reduce((acc, item) => acc + item.quantity, 0); // 3 plats
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0); // 4 100 FCFA
    const deliveryFee = calculateDeliveryFeeOfficial(totalDishes); // 130 FCFA (3 plats)
    const total = subtotal + deliveryFee; // 4 230 FCFA

    expect(totalDishes).toBe(3);
    expect(subtotal).toBe(4100);
    expect(deliveryFee).toBe(130);
    expect(total).toBe(4230);
  });
});

// ============================================================================
// 4. SUITE DE TESTS : FORMATAGE MONÉTAIRE EN FCFA AVEC ESPACE INSÉCABLE
// ============================================================================

describe("Formatage monétaire en FCFA", () => {
  it("Doit contenir un espace insécable entre les milliers et avant le symbole FCFA", () => {
    const formatted = formatFCFA(1000);
    // Vérifier la présence de \u00A0 (non-breaking space)
    expect(formatted).toContain("\u00A0FCFA");
    expect(formatted).toBe("1\u00A0000\u00A0FCFA");
  });

  it("Doit formater correctement 0 FCFA et les montants simples", () => {
    expect(formatFCFA(0)).toBe("0\u00A0FCFA");
    expect(formatFCFA(80)).toBe("80\u00A0FCFA");
    expect(formatFCFA(130)).toBe("130\u00A0FCFA");
  });

  it("Doit formater correctement les grands montants", () => {
    expect(formatFCFA(25000)).toBe("25\u00A0000\u00A0FCFA");
    expect(formatFCFA(1000000)).toBe("1\u00A0000\u00A0000\u00A0FCFA");
  });
});

// ============================================================================
// 5. SUITE DE TESTS : TARIFICATION ET LOGIQUE DE 'COMPOSER SON PLAT'
// ============================================================================

describe("Tarification du module Composer son plat", () => {
  const PROTEIN_PRICES: Record<string, number> = {
    "Poisson braisé": 1000,
    "Poulet bicyclette": 1500,
    "Fromage Wagashi": 500,
    "Viande de bœuf": 1200,
  };

  it("BUG 3 : Tarification erronée des protéines dans page.tsx", () => {
    // Dans page.tsx L229 :
    // p === "Poisson braisé" ? 1000 : 1200
    const pageTsxProteinCalc = (p: string) => (p === "Poisson braisé" ? 1000 : 1200);

    // Fromage Wagashi doit coûter 500 FCFA, or page.tsx facture 1200 FCFA (+700 FCFA !)
    expect(pageTsxProteinCalc("Fromage Wagashi")).toBe(1200);
    expect(PROTEIN_PRICES["Fromage Wagashi"]).toBe(500);

    // Poulet bicyclette doit coûter 1500 FCFA, or page.tsx facture 1200 FCFA (-300 FCFA !)
    expect(pageTsxProteinCalc("Poulet bicyclette")).toBe(1200);
    expect(PROTEIN_PRICES["Poulet bicyclette"]).toBe(1500);
  });
});
