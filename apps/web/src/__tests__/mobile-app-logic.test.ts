import { describe, it, expect } from "vitest";

interface DishItem {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: number;
  img: string;
  isFree?: boolean;
}

// Reproduction fidèle de la logique de calcul de MobileApp (mobile-app.tsx)
function calculateMobileAppTotals(selectedDishes: DishItem[]) {
  const cartItemsCount = selectedDishes.length;

  const cartSubtotal = selectedDishes.reduce((acc, dish) => {
    // Si c'est le 1er plat gratuit sélectionné, prix = 0, sinon prix normal
    if (dish.isFree && selectedDishes.findIndex((d) => d.id === dish.id) === 0) {
      return acc + 0;
    }
    return acc + dish.priceNum;
  }, 0);

  // Grille officielle : 1-2 plats = 80 FCFA, 3-5 = 130 FCFA, 6-10 = 170 FCFA, >10 = 0 FCFA
  const deliveryFee =
    cartItemsCount === 0
      ? 0
      : cartItemsCount <= 2
      ? 80
      : cartItemsCount <= 5
      ? 130
      : cartItemsCount <= 10
      ? 170
      : 0;

  const cartTotal = cartSubtotal + deliveryFee;

  return { cartItemsCount, cartSubtotal, deliveryFee, cartTotal };
}

describe("Logique métier de l'application mobile (MobileApp - Maquette Pixel-Perfect)", () => {
  const FREE_DISH_1: DishItem = {
    id: "1",
    name: "Pâte noire",
    price: "2 000 FCFA",
    priceNum: 2000,
    originalPrice: 200,
    img: "/images/dish_pate_noire.png",
    isFree: true,
  };

  const FREE_DISH_2: DishItem = {
    id: "4",
    name: "Pâte blanche",
    price: "200 FCFA",
    priceNum: 200,
    originalPrice: 200,
    img: "/images/dish_pate_blanche.png",
    isFree: true,
  };

  const PAID_DISH: DishItem = {
    id: "3",
    name: "Chawarma",
    price: "1 000 FCFA",
    priceNum: 1000,
    originalPrice: 1000,
    img: "/images/dish_chawarma.png",
    isFree: false,
  };

  it("1 plat gratuit sélectionné -> Sous-total 0 FCFA, Livraison 80 FCFA, Total 80 FCFA", () => {
    const { cartItemsCount, cartSubtotal, deliveryFee, cartTotal } = calculateMobileAppTotals([
      FREE_DISH_1,
    ]);

    expect(cartItemsCount).toBe(1);
    expect(cartSubtotal).toBe(0);
    expect(deliveryFee).toBe(80);
    expect(cartTotal).toBe(80);
  });

  it("1 plat gratuit + 1 plat payant -> Seul le premier plat gratuit est à 0 FCFA", () => {
    const { cartItemsCount, cartSubtotal, deliveryFee, cartTotal } = calculateMobileAppTotals([
      FREE_DISH_1,
      PAID_DISH,
    ]);

    expect(cartItemsCount).toBe(2);
    expect(cartSubtotal).toBe(1000); // 0 + 1000
    expect(deliveryFee).toBe(80); // 2 plats = 80 FCFA
    expect(cartTotal).toBe(1080);
  });

  it("Deuxième plat gratuit sélectionné -> Facturé au prix normal (seul le premier est offert)", () => {
    const { cartItemsCount, cartSubtotal, deliveryFee, cartTotal } = calculateMobileAppTotals([
      FREE_DISH_1,
      FREE_DISH_2,
    ]);

    expect(cartItemsCount).toBe(2);
    expect(cartSubtotal).toBe(200); // 0 + 200
    expect(deliveryFee).toBe(80);
    expect(cartTotal).toBe(280);
  });

  it("Panier de 3 à 5 plats -> Frais de livraison = 130 FCFA", () => {
    const dishes = [FREE_DISH_1, PAID_DISH, PAID_DISH];
    const { cartItemsCount, deliveryFee } = calculateMobileAppTotals(dishes);

    expect(cartItemsCount).toBe(3);
    expect(deliveryFee).toBe(130);
  });

  it("Panier de 6 à 10 plats -> Frais de livraison = 170 FCFA", () => {
    const dishes = Array.from({ length: 7 }, (_, i) => ({
      ...PAID_DISH,
      id: `dish-${i}`,
    }));
    const { cartItemsCount, deliveryFee } = calculateMobileAppTotals(dishes);

    expect(cartItemsCount).toBe(7);
    expect(deliveryFee).toBe(170);
  });

  it("Panier > 10 plats (11 plats) -> Frais de livraison = 0 FCFA (Gratuit)", () => {
    const dishes = Array.from({ length: 11 }, (_, i) => ({
      ...PAID_DISH,
      id: `dish-${i}`,
    }));
    const { cartItemsCount, deliveryFee } = calculateMobileAppTotals(dishes);

    expect(cartItemsCount).toBe(11);
    expect(deliveryFee).toBe(0);
  });
});
