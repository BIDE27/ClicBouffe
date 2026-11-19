"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Check,
  Flame,
  Utensils,
  LogOut,
  RefreshCw,
  Phone,
  MapPin,
  Eye,
  ArrowRight,
  X,
} from "lucide-react";
import {
  RestaurantEntity,
  DishEntity,
  OrderEntity,
  OrderStatus,
  RestaurantKPIs,
} from "@/lib/types/database";
import { restaurantService } from "@/lib/services/restaurant-service";
import { hapticFeedback } from "@/lib/native/haptics";

interface RestaurantDashboardProps {
  ownerId?: string;
  initialRestaurant?: RestaurantEntity | null;
  onSwitchToClientMode?: () => void;
  onSignOut?: () => void;
}

function formatOrderTime(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
}

export function RestaurantDashboard({
  ownerId = "user-resto-001",
  initialRestaurant,
  onSwitchToClientMode,
  onSignOut,
}: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState<"kds" | "menu" | "stats" | "settings">("kds");
  const [restaurant, setRestaurant] = useState<RestaurantEntity | null>(initialRestaurant || null);
  const [dishes, setDishes] = useState<DishEntity[]>([]);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDishModal, setShowAddDishModal] = useState(false);

  // Formulaire nouveau plat
  const [newDishName, setNewDishName] = useState("");
  const [newDishDesc, setNewDishDesc] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishImage, setNewDishImage] = useState("/images/dish_pate_rouge.jpg");
  const [newDishPrepTime, setNewDishPrepTime] = useState("15");
  const [newDishIsFree, setNewDishIsFree] = useState(false);

  // Chargement des données
  const loadData = async () => {
    setIsLoading(true);
    try {
      const resto = initialRestaurant || (await restaurantService.getRestaurantByOwner(ownerId));
      setRestaurant(resto);
      const [dishesData, ordersData] = await Promise.all([
        restaurantService.getDishes(resto.id),
        restaurantService.getOrders(resto.id),
      ]);
      setDishes(dishesData);
      setOrders(ordersData);
    } catch {
      // Ignoré
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const resto = initialRestaurant || (await restaurantService.getRestaurantByOwner(ownerId));
        if (!isMounted) return;
        setRestaurant(resto);
        const [dishesData, ordersData] = await Promise.all([
          restaurantService.getDishes(resto.id),
          restaurantService.getOrders(resto.id),
        ]);
        if (!isMounted) return;
        setDishes(dishesData);
        setOrders(ordersData);
      } catch {
        // Ignoré
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, [ownerId, initialRestaurant]);

  if (isLoading || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00AFF2] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-300">Ouverture de votre Espace Restaurateur...</p>
        </div>
      </div>
    );
  }

  const kpis: RestaurantKPIs = restaurantService.getKPIs(orders, dishes);

  const filteredOrders =
    selectedOrderStatus === "all" ? orders : orders.filter((o) => o.status === selectedOrderStatus);

  // Bascule ouvert / fermé
  const handleToggleOpen = async () => {
    hapticFeedback("medium");
    const updated = await restaurantService.toggleRestaurantOpen(restaurant.id, !restaurant.is_open);
    setRestaurant((prev) => (prev ? { ...prev, is_open: updated } : null));
  };

  // Avancement du statut de commande (KDS)
  const handleAdvanceOrderStatus = async (orderId: string, currentStatus: OrderStatus) => {
    hapticFeedback("medium");
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready_for_pickup";
    else if (currentStatus === "ready_for_pickup") nextStatus = "delivered";

    const savedStatus = await restaurantService.updateOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: savedStatus, updated_at: new Date().toISOString() } : o))
    );
  };

  // Bascule disponibilité plat
  const handleToggleDishAvailability = async (dishId: string, current: boolean) => {
    hapticFeedback("light");
    const updated = await restaurantService.toggleDishAvailability(dishId, !current);
    setDishes((prev) => prev.map((d) => (d.id === dishId ? { ...d, is_available: updated } : d)));
  };

  // Ajout d'un plat
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback("medium");
    const priceNum = parseInt(newDishPrice.replace(/\D/g, ""), 10) || 1000;
    const prepNum = parseInt(newDishPrepTime, 10) || 15;

    const created = await restaurantService.addDish({
      restaurant_id: restaurant.id,
      name: newDishName,
      description: newDishDesc,
      price: priceNum,
      image_url: newDishImage,
      is_available: true,
      is_free_eligible: newDishIsFree,
      allows_customization: true,
      prep_time_min: prepNum,
    });

    setDishes((prev) => [created, ...prev]);
    setShowAddDishModal(false);
    setNewDishName("");
    setNewDishDesc("");
    setNewDishPrice("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ============================================================== */}
      {/* 1. TOP BAR DU RESTAURATEUR (Pro & Stylée) */}
      {/* ============================================================== */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identité Restaurant */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00AFF2]/20 border border-[#00AFF2]/40 flex items-center justify-center text-[#00AFF2] shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {restaurant.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 hidden sm:inline-block">
                  KDS Cuisine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00AFF2]" />
                <span>{restaurant.address}</span>
              </p>
            </div>
          </div>

          {/* Switch Ouvert/Fermé + Actions Droite */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Toggle Statut d'Ouverture */}
            <button
              onClick={handleToggleOpen}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                restaurant.is_open
                  ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  restaurant.is_open ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              <span className="hidden sm:inline">
                {restaurant.is_open ? "Ouvert aux commandes" : "Fermé temporairement"}
              </span>
              <span className="sm:hidden">{restaurant.is_open ? "Ouvert" : "Fermé"}</span>
            </button>

            {/* Bascule vers Boutique Client */}
            {onSwitchToClientMode && (
              <button
                onClick={() => {
                  hapticFeedback("light");
                  onSwitchToClientMode();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                title="Voir le restaurant tel que les clients le voient"
              >
                <Eye className="w-3.5 h-3.5 text-[#00AFF2]" />
                <span className="hidden md:inline">Vue Client</span>
              </button>
            )}

            {/* Rafraîchir */}
            <button
              onClick={() => {
                hapticFeedback("light");
                loadData();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Déconnexion */}
            {onSignOut && (
              <button
                onClick={() => {
                  hapticFeedback("medium");
                  onSignOut();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                aria-label="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. BARRE D'ONGLETS DU TABLEAU DE BORD */}
      {/* ============================================================== */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2 text-xs sm:text-sm font-bold">
          <button
            onClick={() => {
              hapticFeedback("light");
              setActiveTab("kds");
            }}
            className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "kds"
                ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Commandes KDS en direct</span>
            {kpis.pending_orders_count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {kpis.pending_orders_count}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              hapticFeedback("light");
              setActiveTab("menu");
            }}
            className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "menu"
                ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Carte & Plats ({dishes.length})</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback("light");
              setActiveTab("stats");
            }}
            className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "stats"
                ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenus & Statistiques</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BENTO-GRID DES KPIS DU JOUR */}
      {/* ============================================================== */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1 : Chiffre d'Affaires du Jour */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Revenus du jour</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {kpis.today_revenue_fcfa.toLocaleString("fr-FR")}&nbsp;FCFA
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <span>+18%</span>
                <span className="text-slate-500 font-normal">vs hier</span>
              </p>
            </div>
          </div>

          {/* KPI 2 : Commandes traitées */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Commandes</span>
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-[#00AFF2] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {kpis.today_orders_count}
              </p>
              <p className="text-[11px] text-[#00AFF2] font-semibold mt-0.5">
                {kpis.pending_orders_count} en attente
              </p>
            </div>
          </div>

          {/* KPI 3 : Temps de préparation */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Temps Moyen</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {kpis.avg_prep_time_min} min
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Objectif &lt; 20 min
              </p>
            </div>
          </div>

          {/* KPI 4 : Note des clients */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Note Clients</span>
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                <span>{restaurant.rating}</span>
                <span className="text-xs text-slate-400 font-normal">/ 5</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {restaurant.reviews_count} avis certifiés
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. ONGLET 1 : KITCHEN DISPLAY SYSTEM (KDS) */}
        {/* ============================================================== */}
        {activeTab === "kds" && (
          <div className="space-y-4">
            {/* Filtres d'état des commandes */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "Toutes" },
                  { id: "pending", label: "En attente" },
                  { id: "preparing", label: "En cuisine" },
                  { id: "ready_for_pickup", label: "Prêtes" },
                  { id: "delivered", label: "Livrées" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setSelectedOrderStatus(s.id as OrderStatus | "all");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedOrderStatus === s.id
                        ? "bg-[#00AFF2] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Flux direct temps réel actif</span>
              </div>
            </div>

            {/* Grille des Commandes */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Aucune commande dans ce statut</p>
                <p className="text-xs text-slate-500">
                  Les nouvelles commandes des clients apparaîtront ici automatiquement.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "pending";
                  const isPreparing = order.status === "preparing";
                  const isReady = order.status === "ready_for_pickup";
                  const isDelivered = order.status === "delivered";

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                        isPending
                          ? "bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                          : isPreparing
                          ? "bg-slate-900 border-sky-500/40"
                          : isReady
                          ? "bg-slate-900 border-emerald-500/40"
                          : "bg-slate-900/60 border-slate-800 opacity-75"
                      }`}
                    >
                      {/* En-tête de la carte commande */}
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <span className="font-mono text-xs font-black text-[#00AFF2] uppercase">
                              #{order.id}
                            </span>
                            <h3 className="font-bold text-sm text-white mt-0.5">
                              {order.customer_name}
                            </h3>
                          </div>

                          <div className="text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isPending
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                                  : isPreparing
                                  ? "bg-sky-500/20 text-[#00AFF2] border border-sky-500/40"
                                  : isReady
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {isPending
                                ? "À Accepter"
                                : isPreparing
                                ? "En Cuisine"
                                : isReady
                                ? "Prêt Livreur"
                                : "Livrée"}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Reçue à {formatOrderTime(order.created_at)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Coordonnées & Livraison */}
                        <div className="py-2.5 text-xs text-slate-300 space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3 h-3 text-[#00AFF2]" />
                            <span>{order.customer_phone}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3 h-3 text-[#00AFF2]" />
                            <span className="truncate">{order.delivery_address}</span>
                          </p>
                        </div>

                        {/* Liste des Plats Commandés */}
                        <div className="py-2 border-t border-slate-800 space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between text-xs"
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-[#00AFF2] px-1.5 py-0.2 rounded bg-sky-950/60 border border-sky-800/40 shrink-0">
                                  {item.quantity}x
                                </span>
                                <span className="text-white font-medium">{item.dish_name}</span>
                              </div>
                              <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                                {item.total_price.toLocaleString("fr-FR")}&nbsp;FCFA
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Instructions Spéciales */}
                        {order.notes && (
                          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-amber-300/90 italic my-2">
                            &ldquo;{order.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Pied de Carte : Montant & Action Bouton */}
                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total à percevoir</p>
                          <p className="text-sm font-black text-amber-300 font-mono">
                            {order.total_amount.toLocaleString("fr-FR")}&nbsp;FCFA
                          </p>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, "pending")}
                            className="px-3 py-2 bg-[#00AFF2] hover:bg-[#0098d4] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <span>Lancer en cuisine</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, "preparing")}
                            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <span>Plat Prêt</span>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order.id, "ready_for_pickup")}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                          >
                            <span>Remis au coursier</span>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isDelivered && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Livrée avec succès</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. ONGLET 2 : GESTION DE LA CARTE & MENU */}
        {/* ============================================================== */}
        {activeTab === "menu" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-white">Plats au Menu</h2>
                <p className="text-xs text-slate-400">
                  Gérez vos spécialités et ajustez la disponibilité en direct en cas d&apos;épuisement.
                </p>
              </div>

              <button
                onClick={() => {
                  hapticFeedback("light");
                  setShowAddDishModal(true);
                }}
                className="px-3.5 py-2 bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nouveau plat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between group"
                >
                  <div className="h-36 w-full relative bg-slate-800">
                    <Image src={dish.image_url} alt={dish.name} fill className="object-cover" />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dish.is_available
                            ? "bg-emerald-500/90 text-white"
                            : "bg-rose-500/90 text-white"
                        }`}
                      >
                        {dish.is_available ? "En stock" : "Épuisé"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{dish.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{dish.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <p className="text-sm font-black text-amber-300 font-mono">
                          {dish.price.toLocaleString("fr-FR")}&nbsp;FCFA
                        </p>
                        <p className="text-[10px] text-slate-500">Prép : {dish.prep_time_min} min</p>
                      </div>

                      <button
                        onClick={() => handleToggleDishAvailability(dish.id, dish.is_available)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dish.is_available
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                        }`}
                      >
                        {dish.is_available ? "Marquer épuisé" : "Remettre en vente"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. ONGLET 3 : STATISTIQUES FINANCIÈRES */}
        {/* ============================================================== */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-base font-black text-white">Performances Économiques (FCFA)</h2>
              <p className="text-xs text-slate-400">
                Suivi transparent des ventes, des pourcentages de commission et des versements Mobile Money.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400">Total Ventes Semaine</p>
                  <p className="text-xl font-black text-white mt-1">345 000 FCFA</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400">Panier Moyen</p>
                  <p className="text-xl font-black text-amber-300 mt-1">3 450 FCFA</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400">Versements Effectués</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">100% à jour</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODALE D'AJOUT DE PLAT AU MENU */}
      {/* ============================================================== */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#00AFF2]" />
                <h3 className="font-bold text-base text-white">Nouveau Plat au Menu</h3>
              </div>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom du plat</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Brochettes de lotte braisée"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-[#00AFF2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description & Ingrédients</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Marinade verte, oignons braisés, alloco..."
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-[#00AFF2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix (en FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-[#00AFF2] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Temps de prép (min)</label>
                  <input
                    type="number"
                    value={newDishPrepTime}
                    onChange={(e) => setNewDishPrepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-[#00AFF2] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Photo du plat</label>
                <select
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                >
                  <option value="/images/dish_pate_rouge.jpg">Pâte rouge Amiwo</option>
                  <option value="/images/dish_pate_noire.jpg">Pâte noire Télibo</option>
                  <option value="/images/restau_maquis.jpg">Daurade braisée</option>
                  <option value="/images/dish_chawarma.jpg">Chawarma grillé</option>
                  <option value="/images/dish_riz_gras.jpg">Riz au gras sénégalais</option>
                  <option value="/images/amberger_banner.jpg">Amberger Gourmet</option>
                  <option value="/images/dish_tapioca.jpg">Tapioca chaud</option>
                  <option value="/images/dish_gari.jpg">Gari au lait</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="freeEligible"
                  checked={newDishIsFree}
                  onChange={(e) => setNewDishIsFree(e.target.checked)}
                  className="w-4 h-4 accent-[#00AFF2] rounded"
                />
                <label htmlFor="freeEligible" className="text-xs text-slate-300 font-medium">
                  Éligible à l&apos;offre &ldquo;1er plat offert&rdquo; pour les nouveaux clients
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00AFF2] hover:bg-[#0098d4] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter au menu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
