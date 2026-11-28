"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  BellRing,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Receipt,
  Send,
  ShieldCheck,
  Star,
  Store,
  Truck,
  UtensilsCrossed,
  VolumeX,
  X,
} from "lucide-react";
import {
  DishItem,
  INITIAL_GRID_DISHES,
  Restaurant,
} from "../../lib/data/clicbouffe-data";
import {
  DishEntity,
  OrderEntity,
  OrderStatus,
  RestaurantEntity,
  UserProfile,
  WaiterCallEntity,
  WaiterCallType,
} from "../../lib/types/database";
import { restaurantService } from "../../lib/services/restaurant-service";
import { hapticFeedback } from "../../lib/native/haptics";
import { AppSelect } from "../ui/app-select";

export interface ScannedRestaurantModalProps {
  restaurant: (Restaurant & Partial<RestaurantEntity>) | RestaurantEntity | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDishes: DishItem[];
  onToggleDish: (dish: DishItem) => void;
  onGoToExplorer: () => void;
  detectedTable?: string;
  initialMode?: "dine_in" | "delivery";
  currentUser?: UserProfile | null;
  onOrderCreated?: (order: OrderEntity) => void;
}

const COMPOSE_BASES = [
  { name: "Pâte noire Télibo", price: 500 },
  { name: "Pâte blanche Akassa", price: 400 },
  { name: "Pâte rouge Amiwo", price: 600 },
  { name: "Riz au gras", price: 600 },
  { name: "Alloco doré", price: 500 },
  { name: "Gari / Tapioca", price: 200 },
];

const COMPOSE_SAUCES = [
  "Sauce Gombo crincrin",
  "Sauce Graine",
  "Sauce Tomate pimentée",
  "Sauce Légume",
  "Sauce d'arachide",
];

const COMPOSE_PROTEINS = [
  { name: "Poisson braisé", price: 500 },
  { name: "Poulet bicyclette doré", price: 700 },
  { name: "Viande de bœuf", price: 600 },
  { name: "Fromage Wagashi frit", price: 400 },
];

const COMPOSE_EXTRAS = [
  { name: "Alloco doré", price: 400 },
  { name: "Piment noir maison", price: 200 },
  { name: "Oeuf dur", price: 200 },
];

interface LocalRestoCartItem {
  dishId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  img: string;
  customizationDetails?: Record<string, string | number | boolean>;
}

function getFieldValue(
  restaurant: (Restaurant & Partial<RestaurantEntity>) | RestaurantEntity
): {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  address: string;
  deliveryTime: string;
  deliveryFee: string;
  img: string;
  avgPrepTimeMin: number;
  tablesCount: number;
  tableZones: string[];
  salesMode: "online_only" | "dine_in_only" | "hybrid";
  allowsDineInComposition: boolean;
  allowsWaiterCall: boolean;
  acceptsCashOnSite: boolean;
  popularDishes: string[];
} {
  const anyResto = restaurant as Restaurant & Partial<RestaurantEntity>;
  return {
    id: anyResto.id,
    ownerId: anyResto.owner_id || "user-resto-001",
    name: anyResto.name,
    category: anyResto.category || "Cuisine Locale & Grillades",
    rating: anyResto.rating ?? 4.8,
    reviewsCount: anyResto.reviewsCount ?? anyResto.reviews_count ?? 120,
    address: anyResto.address || "Cotonou, Bénin",
    deliveryTime: anyResto.deliveryTime || anyResto.delivery_time || "15-25 min",
    deliveryFee: anyResto.deliveryFee || anyResto.delivery_fee_base || "80\u00A0FCFA",
    img: anyResto.img || anyResto.banner_url || anyResto.logo_url || "/images/restau_maquis.jpg",
    avgPrepTimeMin: anyResto.avg_prep_time_min || 18,
    tablesCount: anyResto.tables_count ?? 12,
    tableZones:
      Array.isArray(anyResto.table_zones) && anyResto.table_zones.length > 0
        ? anyResto.table_zones
        : ["Comptoir", "Terrasse"],
    salesMode: anyResto.sales_mode || "hybrid",
    allowsDineInComposition: anyResto.allows_dine_in_composition ?? true,
    allowsWaiterCall: anyResto.allows_waiter_call ?? true,
    acceptsCashOnSite: anyResto.accepts_cash_on_site ?? true,
    popularDishes: Array.isArray(anyResto.popularDishes) ? anyResto.popularDishes : [],
  };
}

export function ScannedRestaurantModal({
  restaurant,
  isOpen,
  onClose,
  selectedDishes,
  onToggleDish,
  onGoToExplorer,
  detectedTable,
  initialMode = "dine_in",
  currentUser,
  onOrderCreated,
}: ScannedRestaurantModalProps) {
  const [serviceMode, setServiceMode] = useState<"dine_in" | "delivery">(initialMode);
  const [tableNumber, setTableNumber] = useState<string>(detectedTable || "Table 1");
  const [activeSection, setActiveSection] = useState<"menu" | "compose" | "waiter">("menu");
  const [restaurantDishes, setRestaurantDishes] = useState<DishEntity[]>([]);
  const [localCart, setLocalCart] = useState<LocalRestoCartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>(currentUser?.full_name || "");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "mobile_money">("cash_on_delivery");

  // État Compositeur de plat sur place
  const [composeBase, setComposeBase] = useState(COMPOSE_BASES[0].name);
  const [composeBasePrice, setComposeBasePrice] = useState(COMPOSE_BASES[0].price);
  const [composeSauce, setComposeSauce] = useState(COMPOSE_SAUCES[0]);
  const [composeProteins, setComposeProteins] = useState<string[]>(["Poulet bicyclette doré"]);
  const [composeExtras, setComposeExtras] = useState<string[]>([]);
  const [composeChefNote, setComposeChefNote] = useState("");

  // État Appel Serveur & Demande Silencieuse
  const [silentMessage, setSilentMessage] = useState("");
  const [isSendingCall, setIsSendingCall] = useState(false);
  const [activeWaiterCall, setActiveWaiterCall] = useState<WaiterCallEntity | null>(null);
  const [callFeedback, setCallFeedback] = useState<string | null>(null);

  // État Soumission Commande
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [activePlacedOrder, setActivePlacedOrder] = useState<OrderEntity | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const info = useMemo(() => (restaurant ? getFieldValue(restaurant) : null), [restaurant]);

  const resolvedDefaultMode: "dine_in" | "delivery" = info
    ? info.salesMode === "online_only"
      ? "delivery"
      : info.salesMode === "dine_in_only"
      ? "dine_in"
      : initialMode
    : initialMode;

  const sessionResetKey = `${isOpen ? "open" : "closed"}::${info?.id || "none"}::${detectedTable || ""}::${resolvedDefaultMode}`;
  const [prevSessionKey, setPrevSessionKey] = useState(sessionResetKey);
  if (prevSessionKey !== sessionResetKey) {
    setPrevSessionKey(sessionResetKey);
    if (prevSessionKey.split("::")[1] !== (info?.id || "none")) {
      setLocalCart([]);
      setActivePlacedOrder(null);
      setActiveWaiterCall(null);
      setOrderError(null);
      setCallFeedback(null);
      setOrderNotes("");
      setActiveSection("menu");
    }
    setTableNumber(detectedTable || "Table 1");
    setServiceMode(resolvedDefaultMode);
    if (info && !info.acceptsCashOnSite && resolvedDefaultMode === "dine_in") {
      setPaymentMethod("mobile_money");
    }
  }

  const userFullName = currentUser?.full_name || "";
  const [prevUserFullName, setPrevUserFullName] = useState(userFullName);
  if (prevUserFullName !== userFullName) {
    setPrevUserFullName(userFullName);
    if (userFullName) setCustomerName(userFullName);
  }

  // Chargement des plats spécifiques du restaurant depuis Supabase / Service
  useEffect(() => {
    if (!isOpen || !info) return;
    let mounted = true;
    restaurantService.getDishes(info.id).then((list) => {
      if (mounted) setRestaurantDishes(list);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen, info]);

  // Abonnement temps réel au statut de la commande passée & appel serveur
  useEffect(() => {
    if (!isOpen || !info) return;
    const unsubscribe = restaurantService.subscribeToRestaurantRealtime(info.id, async () => {
      if (activePlacedOrder) {
        const latestOrders = await restaurantService.getOrders(info.id);
        const match = latestOrders.find((o) => o.id === activePlacedOrder.id);
        if (match) setActivePlacedOrder(match);
      }
      if (activeWaiterCall) {
        const latestCalls = await restaurantService.getWaiterCalls(info.id);
        const matchCall = latestCalls.find((c) => c.id === activeWaiterCall.id);
        if (matchCall) setActiveWaiterCall(matchCall);
      }
    });
    return unsubscribe;
  }, [isOpen, info, activePlacedOrder, activeWaiterCall]);

  // Compte à rebours temps réel du service promis
  useEffect(() => {
    if (!activePlacedOrder?.promised_ready_at) return;
    const updateTick = () => {
      const diffMs = new Date(activePlacedOrder.promised_ready_at!).getTime() - Date.now();
      setRemainingSeconds(Math.max(0, Math.floor(diffMs / 1000)));
    };
    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [activePlacedOrder]);

  if (!isOpen || !restaurant || !info) return null;

  // Fusion intelligente des plats du restaurant et du catalogue correspondant
  const fallbackDishes = INITIAL_GRID_DISHES.filter((dish) =>
    info.popularDishes.some(
      (pop) =>
        pop.toLowerCase().includes(dish.name.toLowerCase()) ||
        dish.name.toLowerCase().includes(pop.toLowerCase())
    )
  );

  const menuDishes: DishItem[] =
    restaurantDishes.length > 0
      ? restaurantDishes
          .filter((d) => d.is_available)
          .map((d) => ({
            id: d.id,
            name: d.name,
            price: `${d.price.toLocaleString("fr-FR")}\u00A0FCFA`,
            priceNum: d.price,
            originalPrice: d.original_price,
            img: d.image_url || "/images/dish_pate_rouge.jpg",
            isFree: d.is_free_eligible,
          }))
      : fallbackDishes.length > 0
      ? fallbackDishes
      : INITIAL_GRID_DISHES.slice(0, 4);

  const composeTotal =
    composeBasePrice +
    composeProteins.reduce(
      (acc, name) => acc + (COMPOSE_PROTEINS.find((p) => p.name === name)?.price || 0),
      0
    ) +
    composeExtras.reduce(
      (acc, name) => acc + (COMPOSE_EXTRAS.find((e) => e.name === name)?.price || 0),
      0
    );

  const addDishToLocalCart = (dish: DishItem) => {
    hapticFeedback("light");
    onToggleDish(dish);
    setLocalCart((prev) => {
      const idx = prev.findIndex((i) => i.dishId === dish.id);
      if (idx >= 0) {
        return prev.map((item, k) => (k === idx ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          name: dish.name,
          unitPrice: dish.priceNum,
          quantity: 1,
          img: dish.img,
        },
      ];
    });
  };

  const updateLocalCartQuantity = (index: number, delta: number) => {
    hapticFeedback("light");
    setLocalCart((prev) =>
      prev
        .map((item, idx) => (idx === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleAddComposedDish = () => {
    hapticFeedback("medium");
    const descriptionParts = [
      composeSauce,
      ...composeProteins,
      ...composeExtras,
      composeChefNote.trim() ? `Note: ${composeChefNote.trim()}` : "",
    ].filter(Boolean);

    setLocalCart((prev) => [
      ...prev,
      {
        dishId: null,
        name: `${composeBase} (Composé sur mesure)`,
        unitPrice: composeTotal,
        quantity: 1,
        img: "/images/dish_pate_noire.jpg",
        customizationDetails: {
          base: composeBase,
          sauce: composeSauce,
          proteines: composeProteins.join(", ") || "Aucune",
          supplements: composeExtras.join(", ") || "Aucun",
          instructions: composeChefNote.trim() || "Standard",
          resume: descriptionParts.join(" + "),
        },
      },
    ]);
    setComposeChefNote("");
    setActiveSection("menu");
  };

  const cartCount = localCart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = localCart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const deliveryFee =
    serviceMode === "dine_in"
      ? 0
      : cartCount <= 0
      ? 0
      : cartCount <= 2
      ? 80
      : cartCount <= 5
      ? 130
      : cartCount <= 10
      ? 170
      : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const handlePlaceRestaurantOrder = async () => {
    if (localCart.length === 0) return;
    setIsSubmittingOrder(true);
    setOrderError(null);
    hapticFeedback("medium");

    try {
      const { order, error } = await restaurantService.createOrder({
        restaurantId: info.id,
        restaurantName: info.name,
        ownerId: info.ownerId,
        customerId: currentUser?.id,
        customerName: customerName.trim() || currentUser?.full_name || "Client en salle",
        customerPhone: currentUser?.phone_number || "Sur place",
        orderType: serviceMode,
        tableNumber: serviceMode === "dine_in" ? tableNumber.trim() || "Table 1" : undefined,
        estimatedServeMinutes: info.avgPrepTimeMin,
        deliveryAddress:
          serviceMode === "dine_in"
            ? `Sur place • ${tableNumber.trim() || "Table 1"}`
            : info.address,
        paymentMethod,
        notes: orderNotes.trim() || undefined,
        items: localCart.map((it) => ({
          dishId: it.dishId,
          dishName: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          customizationDetails: it.customizationDetails,
        })),
      });

      if (error || !order) {
        setOrderError(error || "Impossible d'envoyer votre commande.");
      } else {
        hapticFeedback("heavy");
        setActivePlacedOrder(order);
        setLocalCart([]);
        if (onOrderCreated) onOrderCreated(order);
      }
    } catch {
      setOrderError("Erreur de connexion lors de l'envoi en cuisine.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleQuickWaiterCall = async (requestType: WaiterCallType, customMsg?: string) => {
    setIsSendingCall(true);
    setCallFeedback(null);
    hapticFeedback("medium");
    try {
      const { call, error } = await restaurantService.sendWaiterCall({
        restaurantId: info.id,
        restaurantName: info.name,
        ownerId: info.ownerId,
        customerId: currentUser?.id || null,
        customerName: customerName.trim() || currentUser?.full_name || "Client en salle",
        tableNumber: tableNumber.trim() || "Table 1",
        requestType,
        message: customMsg,
        isSilent: true,
      });
      if (error || !call) {
        setCallFeedback(error || "Impossible de joindre le comptoir.");
      } else {
        hapticFeedback("heavy");
        setActiveWaiterCall(call);
        if (customMsg) setSilentMessage("");
        setCallFeedback(
          `Message transmis en sourdine au comptoir (${call.table_number}). Un serveur arrive !`
        );
      }
    } finally {
      setIsSendingCall(false);
    }
  };

  const tableOptions = Array.from(
    { length: Math.max(1, Math.min(200, info.tablesCount || 12)) },
    (_, i) => `Table ${i + 1}`
  );
  const customZones = info.tableZones.filter((z) => !tableOptions.includes(z));

  const orderStatusLabel: Record<OrderStatus, string> = {
    pending: "Reçue par le restaurateur",
    confirmed: "Confirmée",
    preparing: "En préparation en cuisine",
    ready_for_pickup: serviceMode === "dine_in" ? "Prête • En route vers votre table" : "Prête pour livraison",
    delivering: "En cours de livraison",
    delivered: serviceMode === "dine_in" ? "Servie à votre table" : "Livrée",
    cancelled: "Annulée",
  };

  const formatCountdown = (totalSec: number) => {
    if (!Number.isFinite(totalSec) || totalSec <= 0) return "Imminent";
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} min ${secs.toString().padStart(2, "0")} s`;
  };

  const canSwitchToDineIn = info.salesMode !== "online_only";
  const canSwitchToDelivery = info.salesMode !== "dine_in_only";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanned-restaurant-title"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200"
    >
      {/* En-tête Sticky avec Bannière Immersive */}
      <div className="relative h-48 sm:h-56 w-full shrink-0 bg-slate-900">
        <Image src={info.img} alt={info.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

        {/* Barre supérieure de navigation */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between gap-2 z-10">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3.5 py-2 rounded-full bg-black/55 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Menu Salle & Direct</span>
            </div>
            {info.allowsWaiterCall && canSwitchToDineIn && serviceMode === "dine_in" && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setActiveSection("waiter");
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-full bg-[#00AFF2] hover:bg-[#0098d4] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Appeler serveur</span>
              </button>
            )}
            <button
              type="button"
              data-modal-close
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Infos du restaurant en bas de bannière */}
        <div className="absolute bottom-3 left-4 right-4 text-white max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{serviceMode === "dine_in" ? `Sur place • ${tableNumber}` : "Livraison / À emporter"}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              {restaurant.rating ?? info.rating} ({info.reviewsCount})
            </span>
          </div>
          <h2 id="scanned-restaurant-title" className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-xs">
            {restaurant.name}
          </h2>
          <p className="text-xs text-slate-200 flex items-center gap-2 mt-0.5 truncate">
            <span>{info.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00AFF2]" />
              {info.address}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-semibold text-sky-200">
              {"deliveryFee" in restaurant ? restaurant.deliveryFee : info.deliveryFee}
            </span>
          </p>
        </div>
      </div>

      {/* Bandeau Logistique + Choix Sur Place / Livraison */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Infos Délai & Mode */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
              {canSwitchToDineIn && (
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback("light");
                    setServiceMode("dine_in");
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    serviceMode === "dine_in"
                      ? "bg-[#00AFF2] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Sur place (Table)</span>
                </button>
              )}
              {canSwitchToDelivery && (
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback("light");
                    setServiceMode("delivery");
                    if (activeSection === "waiter") setActiveSection("menu");
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    serviceMode === "delivery"
                      ? "bg-[#00AFF2] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Livraison ({info.deliveryFee})</span>
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {serviceMode === "dine_in"
                  ? `Service en ~${info.avgPrepTimeMin} min • 0\u00A0FCFA frais`
                  : `Livraison ${info.deliveryTime} • ${info.deliveryFee}`}
              </span>
            </div>
          </div>

          {/* Si Sur Place : Sélection rapide de la table + Onglets Menu / Composer / Serveur */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "menu" as const, label: `Menu (${menuDishes.length})`, icon: Store },
                ...(info.allowsDineInComposition
                  ? [{ id: "compose" as const, label: "Composer mon plat", icon: ChefHat }]
                  : []),
                ...(info.allowsWaiterCall && canSwitchToDineIn && serviceMode === "dine_in"
                  ? [{ id: "waiter" as const, label: "Serveur / Demande silencieuse", icon: VolumeX }]
                  : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setActiveSection(tab.id);
                    }}
                    className={`min-h-[40px] px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {serviceMode === "dine_in" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Table :</span>
                <AppSelect
                  value={tableNumber}
                  onChange={setTableNumber}
                  compact
                  label="Choisir votre table"
                  ariaLabel="Sélectionner votre numéro de table"
                  className="min-w-[125px]"
                  triggerClassName="bg-sky-50 dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-[#00AFF2]"
                  options={[
                    ...(detectedTable &&
                    !tableOptions.includes(detectedTable) &&
                    !customZones.includes(detectedTable)
                      ? [detectedTable]
                      : []),
                    ...tableOptions,
                    ...customZones,
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 pb-36">
        {/* Bandeau de Commande Active & Compte à Rebours en Direct */}
        {activePlacedOrder && (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 bg-linear-to-r from-emerald-500/15 via-sky-500/10 to-transparent border-2 border-emerald-500/40 dark:border-emerald-500/50 space-y-2.5 animate-in fade-in duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Commande transmise #{activePlacedOrder.id.slice(-5)}
                  </p>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {orderStatusLabel[activePlacedOrder.status]}
                  </h3>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  Délai de service
                </span>
                <span className="text-sm font-black text-[#00AFF2] font-mono">
                  {activePlacedOrder.status === "delivered"
                    ? "Servi"
                    : activePlacedOrder.status === "ready_for_pickup"
                    ? "Prête !"
                    : activePlacedOrder.status === "cancelled"
                    ? "Annulée"
                    : formatCountdown(remainingSeconds)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activePlacedOrder.order_type === "dine_in"
                ? `Votre commande est envoyée directement en cuisine pour la ${activePlacedOrder.table_number}. Vous n'avez pas à attendre un serveur.`
                : `Préparation en cours chez ${info.name}.`}
            </p>
          </div>
        )}

        {/* Suivi d'un appel serveur / demande silencieuse active */}
        {activeWaiterCall && (
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#00AFF2] text-white flex items-center justify-center shrink-0">
                <VolumeX className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {activeWaiterCall.table_number} •{" "}
                  {activeWaiterCall.status === "pending"
                    ? "Demande silencieuse envoyée au serveur"
                    : activeWaiterCall.status === "acknowledged"
                    ? "Un serveur a pris votre demande en charge"
                    : "Demande traitée avec succès"}
                </p>
                {activeWaiterCall.message && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    &ldquo;{activeWaiterCall.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                activeWaiterCall.status === "served"
                  ? "bg-emerald-500 text-white"
                  : activeWaiterCall.status === "acknowledged"
                  ? "bg-sky-500 text-white"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
              }`}
            >
              {activeWaiterCall.status === "pending"
                ? "En cours"
                : activeWaiterCall.status === "acknowledged"
                ? "Serveur en route"
                : "Servi"}
            </span>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 1 : MENU DU RESTAURANT */}
        {/* ============================================================== */}
        {activeSection === "menu" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Carte & Plats du restaurant ({menuDishes.length})
              </h3>
              {info.allowsDineInComposition && (
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback("light");
                    setActiveSection("compose");
                  }}
                  className="text-xs font-bold text-[#00AFF2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Composer mon propre plat</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuDishes.map((dish) => {
                const inLocal = localCart.find((i) => i.dishId === dish.id);
                const isSelectedGlobal = selectedDishes.some((d) => d.id === dish.id);
                const qty = inLocal?.quantity || 0;

                return (
                  <div
                    key={dish.id}
                    className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] flex items-center justify-between gap-3 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <Image src={dish.img} alt={dish.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {dish.name}
                          </h4>
                          {dish.isFree && (
                            <span className="px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] text-[9px] font-bold shrink-0">
                              1er Offert
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-black text-[#00AFF2] mt-0.5">{dish.price}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Prêt en ~{info.avgPrepTimeMin} min • Frais du jour
                        </p>
                      </div>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-1 bg-sky-50 dark:bg-slate-800 p-1 rounded-xl border border-sky-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            const idx = localCart.findIndex((i) => i.dishId === dish.id);
                            if (idx >= 0) updateLocalCartQuantity(idx, -1);
                          }}
                          className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer"
                          aria-label="Retirer un"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#00AFF2]">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addDishToLocalCart(dish)}
                          className="w-10 h-10 rounded-lg bg-[#00AFF2] text-white flex items-center justify-center cursor-pointer"
                          aria-label="Ajouter un"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addDishToLocalCart(dish)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelectedGlobal
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-[#00AFF2] hover:text-white text-slate-700 dark:text-slate-300"
                        }`}
                        title="Ajouter à ma commande"
                        aria-label={`Ajouter ${dish.name}`}
                      >
                        {isSelectedGlobal ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Détail du panier local + Options de validation directe */}
            {localCart.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Votre commande ({serviceMode === "dine_in" ? tableNumber : "Livraison"})
                  </h3>
                  <span className="text-xs font-bold text-[#00AFF2]">
                    {cartCount} article(s)
                  </span>
                </div>

                <div className="space-y-2">
                  {localCart.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.quantity}x {item.name}
                        </p>
                        {item.customizationDetails?.resume && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {String(item.customizationDetails.resume)}
                          </p>
                        )}
                      </div>
                      <span className="font-black text-slate-900 dark:text-white shrink-0">
                        {(item.unitPrice * item.quantity).toLocaleString("fr-FR")}&nbsp;FCFA
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Votre prénom / nom (optionnel)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00AFF2]"
                  />
                  <input
                    type="text"
                    maxLength={250}
                    placeholder="Instruction au chef (ex: sans piment...)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00AFF2]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {(serviceMode !== "dine_in" || info.acceptsCashOnSite) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`min-h-[44px] flex-1 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paymentMethod === "cash_on_delivery"
                          ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2]"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {serviceMode === "dine_in" ? "Régler à table / caisse" : "À la livraison"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mobile_money")}
                    className={`min-h-[44px] flex-1 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      paymentMethod === "mobile_money"
                        ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    MTN / Moov Money
                  </button>
                </div>

                {orderError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{orderError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2 : COMPOSER SON PROPRE PLAT AU RESTAURANT */}
        {/* ============================================================== */}
        {activeSection === "compose" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Composer mon propre plat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Préparé exactement selon vos goûts par {info.name}
                </p>
              </div>
              <span className="text-sm font-black text-[#00AFF2]">
                {composeTotal.toLocaleString("fr-FR")}&nbsp;FCFA
              </span>
            </div>

            {/* Base */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                1. Choisir la base / pâte
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPOSE_BASES.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeBase(b.name);
                      setComposeBasePrice(b.price);
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      composeBase === b.name
                        ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-xs block">{b.name}</span>
                    <span className="text-[10px] opacity-80">{b.price} FCFA</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                2. Choisir la sauce
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPOSE_SAUCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeSauce(s);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all ${
                      composeSauce === s
                        ? "border-[#00AFF2] bg-[#00AFF2] text-white font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Protéines */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                3. Protéines & Viandes
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPOSE_PROTEINS.map((p) => {
                  const has = composeProteins.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setComposeProteins(
                          has
                            ? composeProteins.filter((x) => x !== p.name)
                            : [...composeProteins, p.name]
                        );
                      }}
                      className={`p-2.5 rounded-xl border flex justify-between items-center text-xs cursor-pointer transition-all ${
                        has
                          ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span>+ {p.price} FCFA</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suppléments */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                4. Suppléments & Instructions
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMPOSE_EXTRAS.map((ex) => {
                  const has = composeExtras.includes(ex.name);
                  return (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setComposeExtras(
                          has
                            ? composeExtras.filter((x) => x !== ex.name)
                            : [...composeExtras, ex.name]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        has
                          ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {ex.name} (+{ex.price} FCFA)
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Précision pour le cuisinier (ex: bien chaud, peu salé, sauce à part)..."
                value={composeChefNote}
                onChange={(e) => setComposeChefNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00AFF2]"
              />
            </div>

            <button
              type="button"
              onClick={handleAddComposedDish}
              className="w-full py-3 bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter ce plat sur mesure ({composeTotal.toLocaleString("fr-FR")} FCFA)</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3 : APPELER LE SERVEUR & DEMANDE SILENCIEUSE EN SOURDINE */}
        {/* ============================================================== */}
        {activeSection === "waiter" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-[#00AFF2] flex items-center justify-center shrink-0">
                <VolumeX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Appel Serveur & Messagerie Silencieuse
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Envoyez un signal discret ou écrivez votre demande en sourdine pour être servi immédiatement à la{" "}
                  <strong className="text-[#00AFF2]">{tableNumber}</strong> sans hausser la voix.
                </p>
              </div>
            </div>

            {callFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{callFeedback}</span>
              </div>
            )}

            {/* Raccourcis en 1 clic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={isSendingCall}
                onClick={() => handleQuickWaiterCall("call_waiter")}
                className="p-3 rounded-2xl bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>Appeler un serveur</span>
              </button>

              <button
                type="button"
                disabled={isSendingCall}
                onClick={() =>
                  handleQuickWaiterCall("water_cutlery", "Merci d'apporter de l'eau et des couverts.")
                }
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-[#00AFF2]" />
                <span>Eau / Couverts</span>
              </button>

              <button
                type="button"
                disabled={isSendingCall}
                onClick={() =>
                  handleQuickWaiterCall("bill_request", "Merci d'apporter l'addition à notre table.")
                }
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Demander l&apos;addition</span>
              </button>
            </div>

            {/* Demande écrite personnalisée en sourdine */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-[#00AFF2]" />
                <span>Écrire une demande précise en sourdine ({tableNumber})</span>
              </label>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Ex: Pouvez-vous apporter du piment vert supplémentaire ou des serviettes sans bruit ? Merci !"
                value={silentMessage}
                onChange={(e) => setSilentMessage(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00AFF2] outline-none resize-none"
              />
              <button
                type="button"
                disabled={isSendingCall || !silentMessage.trim()}
                onClick={() => handleQuickWaiterCall("silent_request", silentMessage.trim())}
                className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-slate-800 dark:bg-[#00AFF2] dark:hover:bg-[#0098d4] disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSendingCall ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Envoyer ma demande en sourdine</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page fixe : Validation de Commande Directe ou Explorer */}
      <footer className="fixed bottom-0 inset-x-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {localCart.length > 0 ? (
            <>
              <div className="min-w-0 shrink-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  Total ({serviceMode === "dine_in" ? `${tableNumber} • 0\u00A0FCFA frais` : `Livraison ${deliveryFee}\u00A0FCFA`})
                </span>
                <span className="text-base sm:text-lg font-black text-[#00AFF2]">
                  {cartTotal.toLocaleString("fr-FR")}&nbsp;FCFA
                </span>
              </div>

              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={handlePlaceRestaurantOrder}
                className="min-h-[44px] px-4 sm:px-5 py-2.5 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer min-w-0"
              >
                {isSubmittingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                )}
                <span className="truncate">
                  {serviceMode === "dine_in"
                    ? `Commander (~${info.avgPrepTimeMin} min)`
                    : "Commander maintenant"}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticFeedback("medium");
                  onClose();
                  onGoToExplorer();
                }}
                className="px-4 py-2 bg-[#00AFF2] hover:bg-[#009bd6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explorer tous les restos</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
