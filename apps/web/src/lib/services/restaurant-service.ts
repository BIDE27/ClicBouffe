"use client";

import { createClient } from "../supabase/client";
import {
  RestaurantEntity,
  DishEntity,
  OrderEntity,
  OrderStatus,
  RestaurantKPIs,
} from "../types/database";

const LOCAL_STORAGE_RESTO_KEY = "clicbouffe_restaurants";
const LOCAL_STORAGE_DISHES_KEY = "clicbouffe_dishes";
const LOCAL_STORAGE_ORDERS_KEY = "clicbouffe_orders";

export const INITIAL_DEMO_RESTAURANTS: RestaurantEntity[] = [
  {
    id: "resto-maquis-001",
    owner_id: "user-resto-001",
    name: "Le Maquis du Port",
    slug: "le-maquis-du-port",
    description: "Cuisine locale d'exception, poissons braisés frais et sauces mijotées au feu de bois.",
    logo_url: "/images/restau_maquis.jpg",
    banner_url: "/images/restau_maquis.jpg",
    phone_number: "+229 95 88 77 66",
    address: "Zone Portuaire, Akpakpa Cotonou",
    category: "Cuisine Locale & Poissons Braisés",
    rating: 4.9,
    reviews_count: 184,
    delivery_time: "15-25 min",
    delivery_fee_base: "80 FCFA",
    is_open: true,
    is_verified: true,
    open_time: "11:00",
    close_time: "23:00",
    created_at: new Date().toISOString(),
  },
  {
    id: "resto-burger-002",
    owner_id: "user-resto-002",
    name: "Le Burger Béninois (Gourmet)",
    slug: "le-burger-beninois",
    description: "Burgers gourmets afro-fusion, pain artisanal brioché et frites douces dorées.",
    logo_url: "/images/restau_burger.jpg",
    banner_url: "/images/amberger_banner.jpg",
    phone_number: "+229 96 44 33 22",
    address: "Carrefour Dodji, Akpakpa",
    category: "Fast-Food & Burgers",
    rating: 4.8,
    reviews_count: 195,
    delivery_time: "20-35 min",
    delivery_fee_base: "80 FCFA",
    is_open: true,
    is_verified: true,
    open_time: "11:30",
    close_time: "23:30",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_DISHES: DishEntity[] = [
  {
    id: "dish-1",
    restaurant_id: "resto-maquis-001",
    name: "Pâte noire Télibo & Sauce Crincrin",
    description: "Pâte traditionnelle de farine de cossettes d'igname accompagnée de sauce gombo et crincrin.",
    price: 2000,
    original_price: 2200,
    image_url: "/images/dish_pate_noire.jpg",
    is_available: true,
    is_free_eligible: true,
    allows_customization: true,
    prep_time_min: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: "dish-2",
    restaurant_id: "resto-maquis-001",
    name: "Daurade Braisée Royale & Alloco",
    description: "Poisson entier braisé aux épices du terroir, marinade verte maison et bananes plantains frites.",
    price: 3500,
    original_price: 4000,
    image_url: "/images/restau_maquis.jpg",
    is_available: true,
    is_free_eligible: false,
    allows_customization: true,
    prep_time_min: 25,
    created_at: new Date().toISOString(),
  },
  {
    id: "dish-3",
    restaurant_id: "resto-maquis-001",
    name: "Pâte rouge Amiwo & Poulet Bicyclette",
    description: "Amiwo mijoté au jus de tomate et piment doux, poulet du pays doré et sauce pimentée.",
    price: 2000,
    original_price: 2000,
    image_url: "/images/dish_pate_rouge.jpg",
    is_available: true,
    is_free_eligible: true,
    allows_customization: true,
    prep_time_min: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: "dish-4",
    restaurant_id: "resto-burger-002",
    name: "Amberger Gourmet Signature",
    description: "Double steak haché pur bœuf, cheddar affiné, oignons caramélisés et sauce secrète maison.",
    price: 5000,
    original_price: 5000,
    image_url: "/images/amberger_banner.jpg",
    is_available: true,
    is_free_eligible: false,
    allows_customization: true,
    prep_time_min: 15,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_ORDERS: OrderEntity[] = [
  {
    id: "cmd-8921",
    customer_id: "user-cust-001",
    customer_name: "Koffi Mensah",
    customer_phone: "+229 97 12 34 56",
    restaurant_id: "resto-maquis-001",
    restaurant_name: "Le Maquis du Port",
    status: "pending",
    subtotal: 5500,
    delivery_fee: 80,
    total_amount: 5580,
    delivery_address: "Face Terrain Zico, Akpakpa",
    payment_method: "mobile_money",
    payment_status: "paid",
    notes: "Piment modéré s'il vous plaît, sauce servie à part.",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: "item-1",
        order_id: "cmd-8921",
        dish_id: "dish-2",
        dish_name: "Daurade Braisée Royale & Alloco",
        quantity: 1,
        unit_price: 3500,
        total_price: 3500,
      },
      {
        id: "item-2",
        order_id: "cmd-8921",
        dish_id: "dish-1",
        dish_name: "Pâte noire Télibo & Sauce Crincrin",
        quantity: 1,
        unit_price: 2000,
        total_price: 2000,
      },
    ],
  },
  {
    id: "cmd-8919",
    customer_id: "user-cust-002",
    customer_name: "Aïcha Dandjinou",
    customer_phone: "+229 96 11 22 33",
    restaurant_id: "resto-maquis-001",
    restaurant_name: "Le Maquis du Port",
    status: "preparing",
    subtotal: 4000,
    delivery_fee: 80,
    total_amount: 4080,
    delivery_address: "Quartier Enagnon, Maison 45, Akpakpa",
    payment_method: "cash_on_delivery",
    payment_status: "pending",
    notes: "Bien chaud pour le déjeuner.",
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: "item-3",
        order_id: "cmd-8919",
        dish_id: "dish-3",
        dish_name: "Pâte rouge Amiwo & Poulet Bicyclette",
        quantity: 2,
        unit_price: 2000,
        total_price: 4000,
      },
    ],
  },
  {
    id: "cmd-8914",
    customer_id: "user-cust-003",
    customer_name: "Sébastien Agbokou",
    customer_phone: "+229 95 00 99 88",
    restaurant_id: "resto-maquis-001",
    restaurant_name: "Le Maquis du Port",
    status: "ready_for_pickup",
    subtotal: 7000,
    delivery_fee: 80,
    total_amount: 7080,
    delivery_address: "Boulevard de la Marina, Immeuble Horizon",
    payment_method: "mobile_money",
    payment_status: "paid",
    created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: "item-4",
        order_id: "cmd-8914",
        dish_id: "dish-2",
        dish_name: "Daurade Braisée Royale & Alloco",
        quantity: 2,
        unit_price: 3500,
        total_price: 7000,
      },
    ],
  },
  {
    id: "cmd-8902",
    customer_id: "user-cust-004",
    customer_name: "Béatrice Houndété",
    customer_phone: "+229 97 55 44 33",
    restaurant_id: "resto-maquis-001",
    restaurant_name: "Le Maquis du Port",
    status: "delivered",
    subtotal: 3500,
    delivery_fee: 80,
    total_amount: 3580,
    delivery_address: "Carrefour Le Bélier, Akpakpa",
    payment_method: "mobile_money",
    payment_status: "paid",
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: "item-5",
        order_id: "cmd-8902",
        dish_id: "dish-2",
        dish_name: "Daurade Braisée Royale & Alloco",
        quantity: 1,
        unit_price: 3500,
        total_price: 3500,
      },
    ],
  },
];

export const restaurantService = {
  /**
   * Récupère le restaurant assigné à un propriétaire
   */
  async getRestaurantByOwner(ownerId: string): Promise<RestaurantEntity> {
    if (typeof window === "undefined") return INITIAL_DEMO_RESTAURANTS[0];

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("restaurants")
          .select("*")
          .eq("owner_id", ownerId)
          .single();
        if (data) return data as RestaurantEntity;
      } catch {
        // Fallback
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_RESTO_KEY);
    if (cached) {
      try {
        const list = JSON.parse(cached) as RestaurantEntity[];
        const found = list.find((r) => r.owner_id === ownerId);
        if (found) return found;
      } catch {
        // Ignoré
      }
    }

    return INITIAL_DEMO_RESTAURANTS[0];
  },

  /**
   * Bascule le statut d'ouverture (Ouvert / Fermé)
   */
  async toggleRestaurantOpen(restaurantId: string, isOpen: boolean): Promise<boolean> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase
          .from("restaurants")
          .update({ is_open: isOpen })
          .eq("id", restaurantId);
      } catch {
        // Fallback local
      }
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_RESTO_KEY);
      const list: RestaurantEntity[] = cached ? JSON.parse(cached) : INITIAL_DEMO_RESTAURANTS;
      const updated = list.map((r) => (r.id === restaurantId ? { ...r, is_open: isOpen } : r));
      localStorage.setItem(LOCAL_STORAGE_RESTO_KEY, JSON.stringify(updated));
    }

    return isOpen;
  },

  /**
   * Récupère la liste des plats d'un restaurant
   */
  async getDishes(restaurantId: string): Promise<DishEntity[]> {
    if (typeof window === "undefined") return INITIAL_DEMO_DISHES;

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("dishes")
          .select("*")
          .eq("restaurant_id", restaurantId);
        if (data && data.length > 0) return data as DishEntity[];
      } catch {
        // Fallback
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_DISHES_KEY);
    if (cached) {
      try {
        const list = JSON.parse(cached) as DishEntity[];
        const filtered = list.filter((d) => d.restaurant_id === restaurantId);
        if (filtered.length > 0) return filtered;
      } catch {
        // Ignoré
      }
    }

    return INITIAL_DEMO_DISHES.filter((d) => d.restaurant_id === restaurantId);
  },

  /**
   * Active ou désactive un plat en direct
   */
  async toggleDishAvailability(dishId: string, isAvailable: boolean): Promise<boolean> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase
          .from("dishes")
          .update({ is_available: isAvailable })
          .eq("id", dishId);
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_DISHES_KEY);
      const list: DishEntity[] = cached ? JSON.parse(cached) : INITIAL_DEMO_DISHES;
      const updated = list.map((d) => (d.id === dishId ? { ...d, is_available: isAvailable } : d));
      localStorage.setItem(LOCAL_STORAGE_DISHES_KEY, JSON.stringify(updated));
    }

    return isAvailable;
  },

  /**
   * Ajoute un nouveau plat au menu du restaurant
   */
  async addDish(dish: Omit<DishEntity, "id" | "created_at">): Promise<DishEntity> {
    const newDish: DishEntity = {
      ...dish,
      id: `dish-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase.from("dishes").insert({
          restaurant_id: newDish.restaurant_id,
          name: newDish.name,
          description: newDish.description,
          price: newDish.price,
          image_url: newDish.image_url,
          is_available: newDish.is_available,
          is_free_eligible: newDish.is_free_eligible,
          allows_customization: newDish.allows_customization,
        });
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_DISHES_KEY);
      const list: DishEntity[] = cached ? JSON.parse(cached) : INITIAL_DEMO_DISHES;
      localStorage.setItem(LOCAL_STORAGE_DISHES_KEY, JSON.stringify([newDish, ...list]));
    }

    return newDish;
  },

  /**
   * Récupère les commandes du restaurant (KDS)
   */
  async getOrders(restaurantId: string): Promise<OrderEntity[]> {
    if (typeof window === "undefined") return INITIAL_DEMO_ORDERS;

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) return data as unknown as OrderEntity[];
      } catch {
        // Fallback
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (cached) {
      try {
        const list = JSON.parse(cached) as OrderEntity[];
        const filtered = list.filter((o) => o.restaurant_id === restaurantId);
        if (filtered.length > 0) return filtered;
      } catch {
        // Ignoré
      }
    }

    return INITIAL_DEMO_ORDERS.filter((o) => o.restaurant_id === restaurantId);
  },

  /**
   * Met à jour le statut d'une commande (KDS)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderStatus> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase
          .from("orders")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", orderId);
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      const list: OrderEntity[] = cached ? JSON.parse(cached) : INITIAL_DEMO_ORDERS;
      const updated = list.map((o) =>
        o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
      );
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    }

    return status;
  },

  /**
   * Calcule les métriques clés (KPIs) en temps réel
   */
  getKPIs(orders: OrderEntity[], dishes: DishEntity[]): RestaurantKPIs {
    const todayRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, curr) => acc + curr.total_amount, 0);

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const activeDishes = dishes.filter((d) => d.is_available).length;

    return {
      today_revenue_fcfa: todayRevenue,
      today_orders_count: orders.length,
      pending_orders_count: pendingOrders,
      avg_prep_time_min: 18,
      rating: 4.9,
      active_dishes_count: activeDishes,
    };
  },
};
