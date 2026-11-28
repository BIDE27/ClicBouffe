"use client";

import { createClient } from "../supabase/client";
import {
  RestaurantEntity,
  DishEntity,
  OrderEntity,
  OrderStatus,
  RestaurantKPIs,
  CreateRestaurantParams,
  WaiterCallEntity,
  WaiterCallStatus,
  AppNotificationEntity,
} from "../types/database";
import {
  createRestaurantSchema,
  createRestaurantOrderSchema,
  createDishSchema,
  waiterCallSchema,
  CreateRestaurantOrderInput,
  WaiterCallInput,
} from "../validation/restaurant-schemas";
import { INITIAL_GRID_DISHES, REGIONAL_RESTAURANTS } from "../data/clicbouffe-data";

const LOCAL_STORAGE_RESTO_KEY = "clicbouffe_restaurants";
const LOCAL_STORAGE_DISHES_KEY = "clicbouffe_dishes";
const LOCAL_STORAGE_ORDERS_KEY = "clicbouffe_orders";
const LOCAL_STORAGE_WAITER_CALLS_KEY = "clicbouffe_waiter_calls";
const LOCAL_STORAGE_NOTIFICATIONS_KEY = "clicbouffe_notifications";
const REALTIME_CHANNEL_NAME = "clicbouffe_realtime";

function generateUniqueId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

function readJsonCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function calculateOfficialDeliveryFee(totalDishesCount: number): number {
  if (totalDishesCount <= 0) return 0;
  if (totalDishesCount <= 2) return 80;
  if (totalDishesCount <= 5) return 130;
  if (totalDishesCount <= 10) return 170;
  return 0;
}

function broadcastRealtimeEvent(payload: {
  type: "order_created" | "order_updated" | "waiter_call_created" | "waiter_call_updated" | "notification";
  restaurantId?: string;
  recipientUserId?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
    window.dispatchEvent(new CustomEvent("clicbouffe:realtime", { detail: payload }));
  } catch {
    // Non bloquant
  }
}

function pushLocalNotification(notif: AppNotificationEntity) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
    const list: AppNotificationEntity[] = raw ? JSON.parse(raw) : [];
    const updated = [notif, ...list.filter((n) => n.id !== notif.id)].slice(0, 60);
    localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updated));
    broadcastRealtimeEvent({
      type: "notification",
      restaurantId: notif.restaurant_id || undefined,
      recipientUserId: notif.recipient_user_id,
    });
  } catch {
    // Ignoré
  }
}

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
    sales_mode: "hybrid",
    tables_count: 14,
    table_zones: ["Salle Principale", "Terrasse Port", "Espace VIP"],
    avg_prep_time_min: 18,
    allows_dine_in_composition: true,
    allows_waiter_call: true,
    accepts_cash_on_site: true,
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
    sales_mode: "hybrid",
    tables_count: 10,
    table_zones: ["Salle Principale", "Comptoir"],
    avg_prep_time_min: 15,
    allows_dine_in_composition: true,
    allows_waiter_call: true,
    accepts_cash_on_site: true,
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
    order_type: "dine_in",
    table_number: "Table 4",
    estimated_serve_minutes: 18,
    promised_ready_at: new Date(Date.now() + 13 * 60 * 1000).toISOString(),
    subtotal: 5500,
    delivery_fee: 0,
    total_amount: 5500,
    delivery_address: "Sur place • Table 4",
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
    order_type: "delivery",
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
    order_type: "delivery",
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
    order_type: "delivery",
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

export const INITIAL_DEMO_WAITER_CALLS: WaiterCallEntity[] = [];

function normalizeRestaurantRow(row: Record<string, unknown>): RestaurantEntity {
  return {
    id: String(row.id || ""),
    owner_id: String(row.owner_id || ""),
    name: String(row.name || "Restaurant ClicBouffe"),
    slug: String(row.slug || ""),
    description: String(row.description || "Cuisine authentique et fraîche préparée sur commande."),
    logo_url: String(row.logo_url || "/images/restau_maquis.jpg"),
    banner_url: String(row.banner_url || row.logo_url || "/images/restau_maquis.jpg"),
    phone_number: String(row.phone_number || ""),
    address: String(row.address || "Cotonou, Bénin"),
    category: String(row.category || "Cuisine Locale & Grillades"),
    rating: Number(row.rating || 4.9),
    reviews_count: Number(row.reviews_count || 12),
    delivery_time: String(row.delivery_time || `${Number(row.avg_prep_time_min || 20)} min`),
    delivery_fee_base: String(row.delivery_fee_base || "80 FCFA"),
    is_open: row.is_open !== undefined ? Boolean(row.is_open) : row.is_active !== false,
    is_verified: Boolean(row.is_verified ?? true),
    open_time: row.open_time ? String(row.open_time) : "09:00",
    close_time: row.close_time ? String(row.close_time) : "23:00",
    sales_mode: (row.sales_mode as RestaurantEntity["sales_mode"]) || "hybrid",
    tables_count: typeof row.tables_count === "number" ? row.tables_count : 10,
    table_zones: Array.isArray(row.table_zones) ? (row.table_zones as string[]) : ["Salle Principale"],
    avg_prep_time_min: typeof row.avg_prep_time_min === "number" ? row.avg_prep_time_min : 20,
    allows_dine_in_composition:
      row.allows_dine_in_composition !== undefined ? Boolean(row.allows_dine_in_composition) : true,
    allows_waiter_call: row.allows_waiter_call !== undefined ? Boolean(row.allows_waiter_call) : true,
    accepts_cash_on_site: row.accepts_cash_on_site !== undefined ? Boolean(row.accepts_cash_on_site) : true,
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

export const restaurantService = {
  /**
   * Récupère tous les restaurants créés par un utilisateur
   */
  async getRestaurantsByOwner(ownerId: string): Promise<RestaurantEntity[]> {
    if (typeof window === "undefined") return [];

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row) => normalizeRestaurantRow(row as Record<string, unknown>));
        }
      } catch {
        // Fallback local en cas de problème réseau
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_RESTO_KEY);
    if (cached) {
      try {
        const list = JSON.parse(cached) as RestaurantEntity[];
        return list.filter((r) => r.owner_id === ownerId);
      } catch {
        return [];
      }
    }

    return [];
  },

  /**
   * Récupère la liste complète des restaurants actifs (Supabase + cache local + catalogue)
   */
  async getAllActiveRestaurants(): Promise<RestaurantEntity[]> {
    const mapById = new Map<string, RestaurantEntity>();
    const seenSlugs = new Set<string>();

    // Priorité aux restaurants de démo complets (cohérents avec INITIAL_DEMO_DISHES / ORDERS)
    INITIAL_DEMO_RESTAURANTS.forEach((demo) => {
      mapById.set(demo.id, demo);
      seenSlugs.add(demo.slug);
    });

    // Ajout des restaurants du catalogue régional sans dupliquer les noms/slugs existants
    REGIONAL_RESTAURANTS.forEach((r) => {
      const slug = r.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (seenSlugs.has(slug)) return;
      seenSlugs.add(slug);
      mapById.set(r.id, {
        id: r.id,
        owner_id: "user-resto-001",
        name: r.name,
        slug,
        description: `Spécialités : ${r.popularDishes.join(", ")}.`,
        logo_url: r.img,
        banner_url: r.img,
        phone_number: "+229 97 00 00 00",
        address: r.address,
        category: r.category,
        rating: r.rating,
        reviews_count: r.reviewsCount,
        delivery_time: r.deliveryTime,
        delivery_fee_base: r.deliveryFee,
        is_open: r.isOpen,
        is_verified: true,
        open_time: "09:00",
        close_time: "23:00",
        sales_mode: "hybrid",
        tables_count: 12,
        table_zones: ["Salle Principale", "Terrasse"],
        avg_prep_time_min: 18,
        allows_dine_in_composition: true,
        allows_waiter_call: true,
        accepts_cash_on_site: true,
        created_at: new Date().toISOString(),
      });
    });

    const cachedList = readJsonCache<RestaurantEntity[]>(LOCAL_STORAGE_RESTO_KEY, []);
    cachedList.forEach((r) => mapById.set(r.id, r));

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && data) {
          data.forEach((row) => {
            const normalized = normalizeRestaurantRow(row as Record<string, unknown>);
            mapById.set(normalized.id, normalized);
          });
        }
      } catch {
        // Fallback local
      }
    }

    return Array.from(mapById.values());
  },

  /**
   * Recherche un restaurant par slug, ID, nom ou payload QR (?resto=... ou CLICBOUFFE-RESTO:...)
   */
  async findRestaurantByQuery(query: string): Promise<RestaurantEntity | null> {
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    const all = await this.getAllActiveRestaurants();
    return (
      all.find(
        (r) =>
          r.slug.toLowerCase() === clean ||
          r.id.toLowerCase() === clean ||
          clean.includes(r.slug.toLowerCase()) ||
          clean.includes(r.name.toLowerCase())
      ) || null
    );
  },

  /**
   * Crée un nouveau restaurant pour un utilisateur connecté (Page entière dédiée)
   */
  async createRestaurant(
    params: CreateRestaurantParams
  ): Promise<{ restaurant: RestaurantEntity | null; error: string | null }> {
    const parsed = createRestaurantSchema.safeParse({
      ...params,
      salesMode: params.salesMode || "hybrid",
      tablesCount: params.tablesCount ?? 10,
      tableZones: params.tableZones && params.tableZones.length > 0 ? params.tableZones : ["Salle Principale"],
      avgPrepTimeMin: params.avgPrepTimeMin ?? 20,
      allowsDineInComposition: params.allowsDineInComposition ?? true,
      allowsWaiterCall: params.allowsWaiterCall ?? true,
      acceptsCashOnSite: params.acceptsCashOnSite ?? true,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { restaurant: null, error: firstIssue?.message || "Données du restaurant invalides." };
    }

    const v = parsed.data;
    const slug =
      v.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now().toString(36);

    const newResto: RestaurantEntity = {
      id: generateUniqueId("resto"),
      owner_id: v.ownerId,
      name: v.name,
      slug,
      description:
        v.description ||
        "Cuisine authentique et fraîche préparée avec passion, disponible en salle et en livraison.",
      logo_url: v.logoUrl || "/images/logos/logo-marmite-bleu.svg",
      banner_url: v.bannerUrl || "/images/restau_maquis.jpg",
      phone_number: v.phoneNumber,
      address: v.address,
      category: v.category,
      rating: 5.0,
      reviews_count: 0,
      delivery_time: `${Math.max(10, v.avgPrepTimeMin - 5)}-${v.avgPrepTimeMin + 10} min`,
      delivery_fee_base: v.salesMode === "dine_in_only" ? "0\u00A0FCFA (Sur place)" : "80\u00A0FCFA",
      is_open: true,
      is_verified: false,
      open_time: v.openTime || "09:00",
      close_time: v.closeTime || "23:00",
      sales_mode: v.salesMode,
      tables_count: v.tablesCount,
      table_zones: v.tableZones,
      avg_prep_time_min: v.avgPrepTimeMin,
      allows_dine_in_composition: v.allowsDineInComposition,
      allows_waiter_call: v.allowsWaiterCall,
      accepts_cash_on_site: v.acceptsCashOnSite,
      created_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const verifiedOwnerId = user?.id || v.ownerId;
        newResto.owner_id = verifiedOwnerId;

        // Tentative complète avec colonnes de digitalisation de salle (is_verified forcé false côté serveur)
        let insertResult = await supabase
          .from("restaurants")
          .insert({
            owner_id: verifiedOwnerId,
            name: newResto.name,
            slug: newResto.slug,
            description: newResto.description,
            logo_url: newResto.logo_url,
            banner_url: newResto.banner_url,
            phone_number: newResto.phone_number,
            address: newResto.address,
            category: newResto.category,
            open_time: newResto.open_time,
            close_time: newResto.close_time,
            sales_mode: newResto.sales_mode,
            tables_count: newResto.tables_count,
            table_zones: newResto.table_zones,
            avg_prep_time_min: newResto.avg_prep_time_min,
            allows_dine_in_composition: newResto.allows_dine_in_composition,
            allows_waiter_call: newResto.allows_waiter_call,
            accepts_cash_on_site: newResto.accepts_cash_on_site,
            is_open: true,
            is_active: true,
            is_verified: false,
          })
          .select()
          .single();

        // Fallback si les nouvelles colonnes SQL ne sont pas encore migrées sur le cloud
        if (insertResult.error && /column|schema cache/i.test(insertResult.error.message)) {
          insertResult = await supabase
            .from("restaurants")
            .insert({
              owner_id: verifiedOwnerId,
              name: newResto.name,
              slug: newResto.slug,
              description: newResto.description,
              logo_url: newResto.logo_url,
              banner_url: newResto.banner_url,
              phone_number: newResto.phone_number,
              address: newResto.address,
              open_time: newResto.open_time,
              close_time: newResto.close_time,
              is_active: true,
              is_verified: false,
            })
            .select()
            .single();
        }

        if (insertResult.error) {
          return { restaurant: null, error: insertResult.error.message };
        }

        if (insertResult.data) {
          newResto.id = insertResult.data.id;
          newResto.created_at = insertResult.data.created_at || newResto.created_at;
        }
      } catch (err: unknown) {
        return {
          restaurant: null,
          error: (err as Error)?.message || "Impossible d'enregistrer le restaurant dans la base de données.",
        };
      }
    }

    // Insertion synchronisée des plats du menu initial dans public.dishes + cache local
    if (v.initialDishes && v.initialDishes.length > 0) {
      const nowIso = new Date().toISOString();
      let createdDishes: DishEntity[] = v.initialDishes.map((d, idx) => ({
        id: generateUniqueId(`dish-${idx}`),
        restaurant_id: newResto.id,
        category_label: d.categoryLabel,
        name: d.name,
        description: d.description || "",
        price: d.price,
        image_url: d.imageUrl || "/images/dish_pate_rouge.jpg",
        is_available: true,
        is_free_eligible: d.isFreeEligible,
        allows_customization: d.allowsCustomization,
        prep_time_min: d.prepTimeMin,
        display_order: idx,
        created_at: nowIso,
      }));

      if (process.env.NODE_ENV !== "test") {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newResto.id);
          if (isUuid) {
            const supabase = createClient();
            const payload = createdDishes.map((d, idx) => ({
              restaurant_id: newResto.id,
              name: d.name,
              description: d.description,
              price: d.price,
              image_url: d.image_url,
              category_label: d.category_label,
              prep_time_min: d.prep_time_min,
              display_order: idx,
              is_available: true,
              is_free_eligible: d.is_free_eligible,
              allows_customization: d.allows_customization,
            }));
            const dishesRes = await supabase.from("dishes").insert(payload).select();
            if (dishesRes.error && /column|schema cache/i.test(dishesRes.error.message)) {
              const fallbackPayload = createdDishes.map((d) => ({
                restaurant_id: newResto.id,
                name: d.name,
                description: d.description,
                price: d.price,
                image_url: d.image_url,
                is_available: true,
                is_free_eligible: d.is_free_eligible,
                allows_customization: d.allows_customization,
              }));
              const fallbackRes = await supabase.from("dishes").insert(fallbackPayload).select();
              if (fallbackRes.data && fallbackRes.data.length > 0) {
                createdDishes = fallbackRes.data.map((row, idx) => ({
                  ...createdDishes[idx],
                  id: String((row as { id: string }).id),
                }));
              }
            } else if (dishesRes.data && dishesRes.data.length > 0) {
              createdDishes = dishesRes.data.map((row, idx) => ({
                ...createdDishes[idx],
                id: String((row as { id: string }).id),
              }));
            }
          }
        } catch {
          // Repli local garanti
        }
      }

      if (typeof window !== "undefined") {
        const cachedDishes = readJsonCache<DishEntity[]>(LOCAL_STORAGE_DISHES_KEY, INITIAL_DEMO_DISHES);
        localStorage.setItem(LOCAL_STORAGE_DISHES_KEY, JSON.stringify([...createdDishes, ...cachedDishes]));
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<RestaurantEntity[]>(LOCAL_STORAGE_RESTO_KEY, INITIAL_DEMO_RESTAURANTS);
      localStorage.setItem(LOCAL_STORAGE_RESTO_KEY, JSON.stringify([newResto, ...list.filter((r) => r.id !== newResto.id)]));
    }

    return { restaurant: newResto, error: null };
  },

  /**
   * Récupère le restaurant actif ou principal assigné à un propriétaire (sans fuite cross-utilisateur)
   */
  async getRestaurantByOwner(ownerId: string): Promise<RestaurantEntity | null> {
    const userRestos = await this.getRestaurantsByOwner(ownerId);
    if (userRestos.length > 0) {
      return userRestos[0];
    }
    if (ownerId === "user-resto-001") {
      return INITIAL_DEMO_RESTAURANTS[0];
    }
    return null;
  },

  /**
   * Bascule le statut d'ouverture (Ouvert / Fermé)
   */
  async toggleRestaurantOpen(restaurantId: string, isOpen: boolean): Promise<boolean> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);
        if (isUuid) {
          const supabase = createClient();
          const { error } = await supabase
            .from("restaurants")
            .update({ is_active: isOpen, is_open: isOpen })
            .eq("id", restaurantId);
          if (error) {
            return !isOpen;
          }
        }
      } catch {
        // Fallback local
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<RestaurantEntity[]>(LOCAL_STORAGE_RESTO_KEY, INITIAL_DEMO_RESTAURANTS);
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
        if (data && data.length > 0) {
          return data.map((d) => ({
            ...(d as DishEntity),
            category_label: (d as DishEntity).category_label || "Plats Principaux",
            prep_time_min: (d as DishEntity).prep_time_min || 15,
          }));
        }
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

    const demoMatches = INITIAL_DEMO_DISHES.filter((d) => d.restaurant_id === restaurantId);
    if (demoMatches.length > 0) return demoMatches;

    // Si restaurant catalogue (r1..r6) ou nouveau restaurant sans plat dédié encore ajouté, retourne les suggestions
    return INITIAL_GRID_DISHES.slice(0, 6).map((item) => ({
      id: `${restaurantId}-${item.id}`,
      restaurant_id: restaurantId,
      name: item.name,
      description: "Préparé à la commande • Frais du jour",
      price: item.priceNum,
      original_price: item.originalPrice,
      image_url: item.img,
      is_available: true,
      is_free_eligible: Boolean(item.isFree),
      allows_customization: true,
      prep_time_min: 18,
      created_at: new Date().toISOString(),
    }));
  },

  /**
   * Active ou désactive un plat en direct
   */
  async toggleDishAvailability(dishId: string, isAvailable: boolean): Promise<boolean> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dishId);
        if (isUuid) {
          const supabase = createClient();
          const { error } = await supabase
            .from("dishes")
            .update({ is_available: isAvailable })
            .eq("id", dishId);
          if (error) return !isAvailable;
        }
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<DishEntity[]>(LOCAL_STORAGE_DISHES_KEY, INITIAL_DEMO_DISHES);
      const updated = list.map((d) => (d.id === dishId ? { ...d, is_available: isAvailable } : d));
      localStorage.setItem(LOCAL_STORAGE_DISHES_KEY, JSON.stringify(updated));
    }

    return isAvailable;
  },

  /**
   * Ajoute un nouveau plat au menu du restaurant (validé par Zod)
   */
  async addDish(dish: Omit<DishEntity, "id" | "created_at">): Promise<DishEntity> {
    const validated = createDishSchema.safeParse({
      restaurantId: dish.restaurant_id,
      name: dish.name,
      description: dish.description,
      price: Math.max(0, Math.round(dish.price)),
      category: dish.category_label || dish.category_id || "Plats Principaux",
      prepTimeMin: dish.prep_time_min || 15,
      imageUrl: dish.image_url,
    });
    const safeDish = validated.success ? validated.data : null;

    const newDish: DishEntity = {
      ...dish,
      category_label: safeDish?.category || dish.category_label || "Plats Principaux",
      name: safeDish?.name || dish.name.trim(),
      description: safeDish?.description || dish.description.trim(),
      price: safeDish?.price ?? Math.max(0, Math.round(dish.price)),
      prep_time_min: safeDish?.prepTimeMin ?? (dish.prep_time_min || 15),
      id: generateUniqueId("dish"),
      created_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        let insertDishRes = await supabase
          .from("dishes")
          .insert({
            restaurant_id: newDish.restaurant_id,
            name: newDish.name,
            description: newDish.description,
            price: newDish.price,
            image_url: newDish.image_url,
            category_label: newDish.category_label,
            prep_time_min: newDish.prep_time_min,
            is_available: newDish.is_available,
            is_free_eligible: newDish.is_free_eligible,
            allows_customization: newDish.allows_customization,
          })
          .select()
          .single();

        if (insertDishRes.error && /column|schema cache/i.test(insertDishRes.error.message)) {
          insertDishRes = await supabase
            .from("dishes")
            .insert({
              restaurant_id: newDish.restaurant_id,
              name: newDish.name,
              description: newDish.description,
              price: newDish.price,
              image_url: newDish.image_url,
              is_available: newDish.is_available,
              is_free_eligible: newDish.is_free_eligible,
              allows_customization: newDish.allows_customization,
            })
            .select()
            .single();
        }

        if (insertDishRes.data?.id) {
          newDish.id = insertDishRes.data.id;
        }
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<DishEntity[]>(LOCAL_STORAGE_DISHES_KEY, INITIAL_DEMO_DISHES);
      localStorage.setItem(LOCAL_STORAGE_DISHES_KEY, JSON.stringify([newDish, ...list]));
    }

    return newDish;
  },

  /**
   * Passe une commande directe (Sur Place en Salle ou Livraison) et notifie le restaurateur en temps réel
   */
  async createOrder(
    input: CreateRestaurantOrderInput & { ownerId?: string }
  ): Promise<{ order: OrderEntity | null; error: string | null }> {
    const parsed = createRestaurantOrderSchema.safeParse(input);
    if (!parsed.success) {
      return {
        order: null,
        error: parsed.error.issues[0]?.message || "Impossible de valider votre commande.",
      };
    }

    const v = parsed.data;
    const totalCount = v.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = v.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const deliveryFee = v.orderType === "dine_in" || v.orderType === "pickup" ? 0 : calculateOfficialDeliveryFee(totalCount);
    const totalAmount = subtotal + deliveryFee;
    const promisedReadyAt = new Date(Date.now() + v.estimatedServeMinutes * 60 * 1000).toISOString();

    const orderId = generateUniqueId("cmd");
    const nowIso = new Date().toISOString();

    const newOrder: OrderEntity = {
      id: orderId,
      customer_id: v.customerId || generateUniqueId("guest"),
      customer_name: v.customerName,
      customer_phone: v.customerPhone,
      restaurant_id: v.restaurantId,
      restaurant_name: v.restaurantName,
      status: "pending",
      order_type: v.orderType,
      table_number: v.tableNumber,
      estimated_serve_minutes: v.estimatedServeMinutes,
      promised_ready_at: promisedReadyAt,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      delivery_address: v.deliveryAddress,
      payment_method: v.paymentMethod,
      // Zero-Trust : seul le webhook serveur cryptographique valide 'paid' après paiement réel
      payment_status: "pending",
      notes: v.notes,
      created_at: nowIso,
      updated_at: nowIso,
      items: v.items.map((item, idx) => ({
        id: generateUniqueId(`item-${idx}`),
        order_id: orderId,
        dish_id: item.dishId || null,
        dish_name: item.dishName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        customization_details: item.customizationDetails,
      })),
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.restaurantId);
        if (session?.user?.id && isUuid) {
          newOrder.customer_id = session.user.id;
          // 1. Priorité à la RPC atomique SECURITY DEFINER (recalcule les prix côté DB)
          const rpcResult = await supabase.rpc("create_order_atomic", {
            p_restaurant_id: v.restaurantId,
            p_order_type: v.orderType,
            p_table_number: v.tableNumber || null,
            p_estimated_serve_minutes: v.estimatedServeMinutes,
            p_delivery_address: v.deliveryAddress,
            p_customer_name: v.customerName,
            p_customer_phone: v.customerPhone,
            p_payment_method: v.paymentMethod,
            p_notes: v.notes || null,
            p_items: v.items,
          });

          if (!rpcResult.error && rpcResult.data) {
            newOrder.id = String(rpcResult.data);
          } else if (rpcResult.error && /function|schema cache/i.test(rpcResult.error.message)) {
            // 2. Repli contrôlé si la migration RPC n'est pas encore déployée
            let dbOrder = await supabase
              .from("orders")
              .insert({
                customer_id: session.user.id,
                restaurant_id: v.restaurantId,
                status: "pending",
                order_type: v.orderType,
                table_number: v.tableNumber || null,
                estimated_serve_minutes: v.estimatedServeMinutes,
                promised_ready_at: promisedReadyAt,
                customer_name: v.customerName,
                customer_phone: v.customerPhone,
                subtotal,
                delivery_fee: deliveryFee,
                total_amount: totalAmount,
                delivery_address: v.deliveryAddress,
                payment_method: v.paymentMethod,
                payment_status: "pending",
                notes: v.notes || null,
              })
              .select()
              .single();

            if (dbOrder.error && /column|schema cache/i.test(dbOrder.error.message)) {
              dbOrder = await supabase
                .from("orders")
                .insert({
                  customer_id: session.user.id,
                  restaurant_id: v.restaurantId,
                  status: "pending",
                  subtotal,
                  delivery_fee: deliveryFee,
                  total_amount: totalAmount,
                  delivery_address: v.deliveryAddress,
                  payment_method: v.paymentMethod,
                  payment_status: "pending",
                  notes: v.tableNumber ? `[${v.tableNumber}] ${v.notes || ""}`.trim() : v.notes || null,
                })
                .select()
                .single();
            }

            if (dbOrder.data?.id) {
              newOrder.id = dbOrder.data.id;
              const itemsPayload = newOrder.items.map((it) => ({
                order_id: dbOrder.data.id,
                dish_id: it.dish_id && /^[0-9a-f-]{36}$/i.test(it.dish_id) ? it.dish_id : null,
                dish_name: it.dish_name,
                quantity: it.quantity,
                unit_price: it.unit_price,
                total_price: it.total_price,
                customization_details: it.customization_details || {},
              }));
              await supabase.from("order_items").insert(itemsPayload);
            }
          }
        }
      } catch {
        // Repli local garanti pour mode invité / hors-ligne
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<OrderEntity[]>(LOCAL_STORAGE_ORDERS_KEY, INITIAL_DEMO_ORDERS);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify([newOrder, ...list]));

      const targetOwnerId = input.ownerId || "user-resto-001";
      pushLocalNotification({
        id: generateUniqueId("notif"),
        recipient_user_id: targetOwnerId,
        restaurant_id: newOrder.restaurant_id,
        type: v.orderType === "dine_in" ? "new_dine_in_order" : "new_delivery_order",
        title:
          v.orderType === "dine_in"
            ? `Nouvelle commande en salle (${v.tableNumber || "Sur place"})`
            : `Nouvelle commande • ${v.restaurantName}`,
        body: `${v.customerName} • ${totalCount} plat(s) • ${totalAmount.toLocaleString("fr-FR")}\u00A0FCFA${
          v.orderType === "dine_in" ? ` • À servir sous ${v.estimatedServeMinutes} min` : ""
        }`,
        table_number: v.tableNumber || null,
        order_id: newOrder.id,
        is_read: false,
        created_at: nowIso,
      });

      broadcastRealtimeEvent({
        type: "order_created",
        restaurantId: newOrder.restaurant_id,
        recipientUserId: targetOwnerId,
      });
    }

    return { order: newOrder, error: null };
  },

  /**
   * Récupère les commandes du restaurant (KDS)
   */
  async getOrders(restaurantId: string): Promise<OrderEntity[]> {
    if (typeof window === "undefined") return INITIAL_DEMO_ORDERS;

    let remoteOrders: OrderEntity[] = [];
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);
        if (isUuid) {
          const supabase = createClient();
          const { data } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("restaurant_id", restaurantId)
            .order("created_at", { ascending: false });
          if (data && data.length > 0) {
            remoteOrders = data.map((row) => {
              const r = row as Record<string, unknown>;
              const itemsRaw = Array.isArray(r.order_items) ? r.order_items : [];
              return {
                id: String(r.id),
                customer_id: String(r.customer_id || ""),
                customer_name: String(r.customer_name || "Client ClicBouffe"),
                customer_phone: String(r.customer_phone || "Sur place"),
                restaurant_id: String(r.restaurant_id),
                restaurant_name: String(r.restaurant_name || "Restaurant"),
                status: (r.status as OrderStatus) || "pending",
                order_type: (r.order_type as OrderEntity["order_type"]) || "delivery",
                table_number: r.table_number ? String(r.table_number) : undefined,
                estimated_serve_minutes:
                  typeof r.estimated_serve_minutes === "number" ? r.estimated_serve_minutes : undefined,
                promised_ready_at: r.promised_ready_at ? String(r.promised_ready_at) : undefined,
                subtotal: Number(r.subtotal || 0),
                delivery_fee: Number(r.delivery_fee || 0),
                total_amount: Number(r.total_amount || 0),
                delivery_address: String(r.delivery_address || ""),
                payment_method: (r.payment_method as OrderEntity["payment_method"]) || "cash_on_delivery",
                payment_status: (r.payment_status as OrderEntity["payment_status"]) || "pending",
                notes: r.notes ? String(r.notes) : undefined,
                created_at: String(r.created_at || new Date().toISOString()),
                updated_at: String(r.updated_at || new Date().toISOString()),
                items: itemsRaw.map((it: Record<string, unknown>) => ({
                  id: String(it.id),
                  order_id: String(it.order_id),
                  dish_id: it.dish_id ? String(it.dish_id) : null,
                  dish_name: String(it.dish_name || "Plat commandé"),
                  quantity: Number(it.quantity || 1),
                  unit_price: Number(it.unit_price || 0),
                  total_price: Number(it.total_price || 0),
                  customization_details:
                    (it.customization_details as Record<string, string | number | boolean>) || undefined,
                })),
              };
            });
          }
        }
      } catch {
        // Fallback
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    let localOrders: OrderEntity[] = [];
    if (cached) {
      try {
        const list = JSON.parse(cached) as OrderEntity[];
        localOrders = list.filter((o) => o.restaurant_id === restaurantId);
      } catch {
        // Ignoré
      }
    }

    const mergedMap = new Map<string, OrderEntity>();
    remoteOrders.forEach((o) => mergedMap.set(o.id, o));
    localOrders.forEach((o) => {
      if (!mergedMap.has(o.id)) mergedMap.set(o.id, o);
    });

    if (mergedMap.size > 0) {
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return INITIAL_DEMO_ORDERS.filter((o) => o.restaurant_id === restaurantId);
  },

  /**
   * Met à jour le statut d'une commande (KDS)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderStatus> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
        if (isUuid) {
          const supabase = createClient();
          const { error } = await supabase
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", orderId);
          if (error) {
            throw error;
          }
        }
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<OrderEntity[]>(LOCAL_STORAGE_ORDERS_KEY, INITIAL_DEMO_ORDERS);
      let targetOrder: OrderEntity | undefined;
      const updated = list.map((o) => {
        if (o.id === orderId) {
          targetOrder = { ...o, status, updated_at: new Date().toISOString() };
          return targetOrder;
        }
        return o;
      });
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));

      if (targetOrder) {
        broadcastRealtimeEvent({
          type: "order_updated",
          restaurantId: targetOrder.restaurant_id,
          recipientUserId: targetOrder.customer_id,
        });
      }
    }

    return status;
  },

  /**
   * Envoie un appel serveur ou une demande silencieuse depuis la table d'un client
   */
  async sendWaiterCall(
    input: WaiterCallInput & { ownerId?: string }
  ): Promise<{ call: WaiterCallEntity | null; error: string | null }> {
    const parsed = waiterCallSchema.safeParse(input);
    if (!parsed.success) {
      return {
        call: null,
        error: parsed.error.issues[0]?.message || "Demande invalide.",
      };
    }

    const v = parsed.data;
    const nowIso = new Date().toISOString();
    const newCall: WaiterCallEntity = {
      id: generateUniqueId("call"),
      restaurant_id: v.restaurantId,
      restaurant_name: v.restaurantName,
      customer_id: v.customerId || null,
      customer_name: v.customerName,
      table_number: v.tableNumber,
      request_type: v.requestType,
      message: v.message,
      is_silent: v.isSilent,
      status: "pending",
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.restaurantId);
        if (isUuid) {
          const supabase = createClient();
          const rpcRes = await supabase.rpc("submit_waiter_call", {
            p_restaurant_id: v.restaurantId,
            p_table_number: v.tableNumber,
            p_request_type: v.requestType,
            p_message: v.message || null,
            p_customer_name: v.customerName,
            p_is_silent: v.isSilent,
          });

          if (!rpcRes.error && rpcRes.data && typeof rpcRes.data === "object") {
            const row = rpcRes.data as { id?: string };
            if (row.id) newCall.id = row.id;
          } else if (rpcRes.error && /function|schema cache/i.test(rpcRes.error.message)) {
            const { data: sessionData } = await supabase.auth.getSession();
            const uid = sessionData?.session?.user?.id || null;
            if (uid) {
              const { data } = await supabase
                .from("waiter_calls")
                .insert({
                  restaurant_id: v.restaurantId,
                  customer_id: uid,
                  customer_name: v.customerName,
                  table_number: v.tableNumber,
                  request_type: v.requestType,
                  message: v.message || null,
                  is_silent: v.isSilent,
                  status: "pending",
                })
                .select()
                .single();
              if (data?.id) newCall.id = data.id;
            } else {
              // Invité anonyme : ne pas faire .select() soumis à RLS SELECT
              await supabase.from("waiter_calls").insert({
                restaurant_id: v.restaurantId,
                customer_id: null,
                customer_name: v.customerName,
                table_number: v.tableNumber,
                request_type: v.requestType,
                message: v.message || null,
                is_silent: v.isSilent,
                status: "pending",
              });
            }
          }
        }
      } catch {
        // Fallback local temps réel
      }
    }

    if (typeof window !== "undefined") {
      const list = readJsonCache<WaiterCallEntity[]>(LOCAL_STORAGE_WAITER_CALLS_KEY, INITIAL_DEMO_WAITER_CALLS);
      localStorage.setItem(LOCAL_STORAGE_WAITER_CALLS_KEY, JSON.stringify([newCall, ...list]));

      const targetOwnerId = input.ownerId || "user-resto-001";
      const labelMap: Record<WaiterCallInput["requestType"], string> = {
        call_waiter: `Appel serveur • ${v.tableNumber}`,
        silent_request: `Demande silencieuse • ${v.tableNumber}`,
        bill_request: `Addition demandée • ${v.tableNumber}`,
        water_cutlery: `Eau / Couverts • ${v.tableNumber}`,
        urgent_help: `Assistance table • ${v.tableNumber}`,
      };

      pushLocalNotification({
        id: generateUniqueId("notif-call"),
        recipient_user_id: targetOwnerId,
        restaurant_id: v.restaurantId,
        type: v.requestType === "silent_request" ? "silent_request" : "waiter_call",
        title: labelMap[v.requestType],
        body: v.message?.trim() || `${v.customerName} demande un service immédiat à la ${v.tableNumber}.`,
        table_number: v.tableNumber,
        order_id: null,
        is_read: false,
        created_at: nowIso,
      });

      broadcastRealtimeEvent({
        type: "waiter_call_created",
        restaurantId: v.restaurantId,
        recipientUserId: targetOwnerId,
      });
    }

    return { call: newCall, error: null };
  },

  /**
   * Liste les appels serveur et demandes silencieuses d'un restaurant
   */
  async getWaiterCalls(restaurantId: string): Promise<WaiterCallEntity[]> {
    if (typeof window === "undefined") return [];

    let remoteCalls: WaiterCallEntity[] = [];
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);
        if (isUuid) {
          const supabase = createClient();
          const { data } = await supabase
            .from("waiter_calls")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("created_at", { ascending: false });
          if (data) remoteCalls = data as WaiterCallEntity[];
        }
      } catch {
        // Fallback local
      }
    }

    let localCalls: WaiterCallEntity[] = [];
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_WAITER_CALLS_KEY);
      if (cached) {
        const list = JSON.parse(cached) as WaiterCallEntity[];
        localCalls = list.filter((c) => c.restaurant_id === restaurantId);
      }
    } catch {
      // Ignoré
    }

    const merged = new Map<string, WaiterCallEntity>();
    remoteCalls.forEach((c) => merged.set(c.id, c));
    localCalls.forEach((c) => {
      if (!merged.has(c.id)) merged.set(c.id, c);
    });

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Met à jour l'état d'un appel serveur (pris en charge / servi)
   */
  async updateWaiterCallStatus(callId: string, status: WaiterCallStatus): Promise<WaiterCallStatus> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId);
        if (isUuid) {
          const supabase = createClient();
          await supabase
            .from("waiter_calls")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", callId);
        }
      } catch {
        // Fallback local
      }
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_WAITER_CALLS_KEY);
        const list: WaiterCallEntity[] = cached ? JSON.parse(cached) : [];
        let restaurantId: string | undefined;
        const updated = list.map((c) => {
          if (c.id === callId) {
            restaurantId = c.restaurant_id;
            return { ...c, status, updated_at: new Date().toISOString() };
          }
          return c;
        });
        localStorage.setItem(LOCAL_STORAGE_WAITER_CALLS_KEY, JSON.stringify(updated));
        broadcastRealtimeEvent({ type: "waiter_call_updated", restaurantId });
      } catch {
        // Ignoré
      }
    }

    return status;
  },

  /**
   * Récupère les notifications de l'utilisateur connecté (restaurateur ou client)
   */
  async getNotifications(userId: string, ownedRestaurantIds: string[] = []): Promise<AppNotificationEntity[]> {
    if (typeof window === "undefined") return [];

    const merged = new Map<string, AppNotificationEntity>();

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("app_notifications")
          .select("*")
          .eq("recipient_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(40);
        if (data) {
          data.forEach((n) => merged.set(String((n as AppNotificationEntity).id), n as AppNotificationEntity));
        }
      } catch {
        // Fallback local
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
      if (raw) {
        const list = JSON.parse(raw) as AppNotificationEntity[];
        list
          .filter(
            (n) =>
              n.recipient_user_id === userId ||
              (n.restaurant_id && ownedRestaurantIds.includes(n.restaurant_id))
          )
          .forEach((n) => {
            if (!merged.has(n.id)) merged.set(n.id, n);
          });
      }
    } catch {
      // Ignoré
    }

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllNotificationsRead(userId: string, ownedRestaurantIds: string[] = []): Promise<void> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase
          .from("app_notifications")
          .update({ is_read: true })
          .eq("recipient_user_id", userId)
          .eq("is_read", false);
      } catch {
        // Fallback
      }
    }

    if (typeof window !== "undefined") {
      try {
        const list = readJsonCache<AppNotificationEntity[]>(LOCAL_STORAGE_NOTIFICATIONS_KEY, []);
        const updated = list.map((n) =>
          n.recipient_user_id === userId || (n.restaurant_id && ownedRestaurantIds.includes(n.restaurant_id))
            ? { ...n, is_read: true }
            : n
        );
        localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updated));
        broadcastRealtimeEvent({ type: "notification", recipientUserId: userId });
      } catch {
        // Ignoré
      }
    }
  },

  /**
   * Souscription temps réel aux notifications d'un utilisateur (Supabase Realtime + BroadcastChannel)
   */
  subscribeToUserNotifications(userId: string, onUpdate: () => void): () => void {
    if (typeof window === "undefined") return () => {};

    let bc: BroadcastChannel | null = null;
    const handleEvent = () => onUpdate();
    window.addEventListener("clicbouffe:realtime", handleEvent);

    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      bc.onmessage = () => onUpdate();
    }

    let supabaseClient: ReturnType<typeof createClient> | null = null;
    let supabaseChannel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    if (process.env.NODE_ENV !== "test" && /^[0-9a-f-]{36}$/i.test(userId)) {
      try {
        supabaseClient = createClient();
        supabaseChannel = supabaseClient
          .channel(`user-notif-${userId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "app_notifications", filter: `recipient_user_id=eq.${userId}` },
            () => onUpdate()
          )
          .subscribe();
      } catch {
        // Non bloquant
      }
    }

    return () => {
      window.removeEventListener("clicbouffe:realtime", handleEvent);
      if (bc) bc.close();
      if (supabaseClient && supabaseChannel) {
        try {
          supabaseClient.removeChannel(supabaseChannel);
        } catch {
          // Ignoré
        }
      }
    };
  },

  /**
   * Souscription temps réel hybride (Supabase Realtime + BroadcastChannel multi-onglets)
   */
  subscribeToRestaurantRealtime(
    restaurantId: string,
    onUpdate: () => void
  ): () => void {
    if (typeof window === "undefined") return () => {};

    let bc: BroadcastChannel | null = null;
    const handleEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<{ restaurantId?: string }>).detail;
      if (!detail?.restaurantId || detail.restaurantId === restaurantId) {
        onUpdate();
      }
    };

    window.addEventListener("clicbouffe:realtime", handleEvent);

    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (!msg.data?.restaurantId || msg.data.restaurantId === restaurantId) {
          onUpdate();
        }
      };
    }

    let supabaseClient: ReturnType<typeof createClient> | null = null;
    let supabaseChannel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    if (process.env.NODE_ENV !== "test") {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);
      if (isUuid) {
        try {
          supabaseClient = createClient();
          supabaseChannel = supabaseClient
            .channel(`resto-live-${restaurantId}`)
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
              () => onUpdate()
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "waiter_calls", filter: `restaurant_id=eq.${restaurantId}` },
              () => onUpdate()
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "app_notifications", filter: `restaurant_id=eq.${restaurantId}` },
              () => onUpdate()
            )
            .subscribe();
        } catch {
          // Non bloquant
        }
      }
    }

    return () => {
      window.removeEventListener("clicbouffe:realtime", handleEvent);
      if (bc) bc.close();
      if (supabaseClient && supabaseChannel) {
        try {
          supabaseClient.removeChannel(supabaseChannel);
        } catch {
          // Ignoré
        }
      }
    };
  },

  /**
   * Calcule les métriques clés (KPIs) en temps réel
   */
  getKPIs(
    orders: OrderEntity[],
    dishes: DishEntity[],
    waiterCalls: WaiterCallEntity[] = [],
    restaurant?: Partial<RestaurantEntity>
  ): RestaurantKPIs {
    const todayRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, curr) => acc + curr.total_amount, 0);

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const dineInOrders = orders.filter((o) => o.order_type === "dine_in").length;
    const pendingWaiterCalls = waiterCalls.filter((c) => c.status === "pending").length;
    const activeDishes = dishes.filter((d) => d.is_available).length;
    const avgDishPrep =
      dishes.length > 0
        ? Math.round(dishes.reduce((acc, d) => acc + (d.prep_time_min || 18), 0) / dishes.length)
        : 18;

    return {
      today_revenue_fcfa: todayRevenue,
      today_orders_count: orders.length,
      pending_orders_count: pendingOrders,
      avg_prep_time_min: restaurant?.avg_prep_time_min || avgDishPrep,
      rating: restaurant?.rating ?? 4.9,
      active_dishes_count: activeDishes,
      dine_in_orders_count: dineInOrders,
      pending_waiter_calls_count: pendingWaiterCalls,
    };
  },
};
