"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  User,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  address: string;
  items: string[];
  customizations?: string[];
  total: number;
  status: "new" | "preparing" | "ready" | "delivered";
  time: string;
  paymentMethod: string;
}

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState<"kitchen" | "menu" | "settings">("kitchen");
  const [isOpen, setIsOpen] = useState(true);

  // Liste des commandes en direct
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "CB-1084",
      customerName: "Aimé Mensah",
      address: "Terrain Zico, Lot 12",
      items: ["Pâte noire (Composer son plat)"],
      customizations: ["Sauce Gombo", "Poisson braisé", "Piment fort"],
      total: 2000,
      status: "new",
      time: "Il y a 3 min",
      paymentMethod: "MTN MoMo (Payé)",
    },
    {
      id: "CB-1083",
      customerName: "Clarisse Dossou",
      address: "Carrefour IITA",
      items: ["Amberger Deluxe", "Tapioca chaud"],
      total: 5100,
      status: "new",
      time: "Il y a 6 min",
      paymentMethod: "Moov Money (Payé)",
    },
    {
      id: "CB-1082",
      customerName: "Koffi Akakpo",
      address: "Cité Houéyiho",
      items: ["Pâte rouge (Amiwo)", "Poulet bicyclette"],
      customizations: ["Sauce Tomate", "Alloco extra"],
      total: 2700,
      status: "preparing",
      time: "Il y a 14 min",
      paymentMethod: "MoMo (Payé)",
    },
    {
      id: "CB-1081",
      customerName: "Blandine Soglo",
      address: "Fidjrossè Plage",
      items: ["Chawarma Poulet", "Gari au lait"],
      total: 1200,
      status: "ready",
      time: "Il y a 22 min",
      paymentMethod: "Espèces à la livraison",
    },
  ]);

  // Plats du menu avec toggle de rupture
  const [menuItems, setMenuItems] = useState([
    { id: "1", name: "Pâte noire", category: "Plats familiers", price: 2000, isAvailable: true, isFreePromo: true },
    { id: "2", name: "Pâte rouge (Amiwo)", category: "Plats familiers", price: 1000, isAvailable: true, isFreePromo: true },
    { id: "3", name: "Tapioca chaud", category: "Plats familiers", price: 100, isAvailable: true, isFreePromo: true },
    { id: "4", name: "Gari au lait", category: "Plats familiers", price: 200, isAvailable: true, isFreePromo: true },
    { id: "5", name: "Amberger Maison", category: "Plats exotiques", price: 5000, isAvailable: true, isFreePromo: false },
    { id: "6", name: "Chawarma Royal", category: "Plats exotiques", price: 1000, isAvailable: false, isFreePromo: false },
    { id: "7", name: "Riz au gras sénégalais", category: "Plats courants", price: 1000, isAvailable: true, isFreePromo: false },
  ]);

  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === "new") return { ...order, status: "preparing" };
        if (order.status === "preparing") return { ...order, status: "ready" };
        if (order.status === "ready") return { ...order, status: "delivered" };
        return order;
      })
    );
  };

  const toggleDishAvailability = (dishId: string) => {
    setMenuItems((prev) =>
      prev.map((dish) =>
        dish.id === dishId ? { ...dish, isAvailable: !dish.isAvailable } : dish
      )
    );
  };

  const addSimulatedOrder = () => {
    const newId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: newId,
      customerName: "Nouveau Client (Test)",
      address: "Terrain Zico, Akpakpa",
      items: ["Pâte blanche (Akassa)", "Sauce Légumes (Gboma)"],
      customizations: ["Poisson frit", "Fromage Wagashi"],
      total: 1800,
      status: "new",
      time: "À l'instant",
      paymentMethod: "FedaPay / MoMo (Payé)",
    };
    setOrders([newOrder, ...orders]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. BARRE DE NAVIGATION SUPÉRIEURE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo & Marque */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A7E1] flex items-center justify-center text-white shadow-md shadow-[#00A7E1]/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#00A7E1] tracking-tight">ClicBouffe</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-sky-50 text-[#00A7E1] rounded-full border border-sky-200">
                Portail Restaurant
              </span>
            </div>
          </div>

          {/* Navigation centrale */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("kitchen")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "kitchen"
                  ? "bg-[#00A7E1] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Flame className="w-4 h-4" />
              Cuisine en Direct
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-full text-xs">
                {orders.filter((o) => o.status !== "delivered").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "menu"
                  ? "bg-[#00A7E1] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Menu className="w-4 h-4" />
              Carte & Menus
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "settings"
                  ? "bg-[#00A7E1] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Store className="w-4 h-4" />
              Statut Supabase
            </button>
          </nav>

          {/* Statut Ouvert/Fermé & Profil */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isOpen
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {isOpen ? "Service Ouvert" : "Restaurant Fermé"}
            </button>

            <button
              onClick={addSimulatedOrder}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Simuler Commande
            </button>
          </div>
        </div>
      </header>

      {/* 2. STATS & RÉSUMÉ EN DIRECT */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Ventes aujourd&apos;hui
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">142 500 FCFA</p>
              <span className="text-[11px] font-semibold text-emerald-600">+18% vs hier</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-[#00A7E1]" /> Commandes reçues
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">24</p>
              <span className="text-[11px] font-medium text-slate-500">4 en cours</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Temps de prépa moyen
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">14 min</p>
              <span className="text-[11px] font-semibold text-emerald-600">Rapide (-2 min)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-500" /> Zone Principale
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">Terrain Zico</p>
              <span className="text-[11px] font-medium text-slate-500">Rayon 3.5 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL PAR ONGLET */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ONGLET 1 : CUISINE EN DIRECT (KDS KANBAN) */}
        {activeTab === "kitchen" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Affichage Cuisine (Temps Réel)</h1>
                <p className="text-sm text-slate-500">
                  Écoute en direct des nouvelles commandes passées sur l&apos;application mobile ClicBouffe.
                </p>
              </div>
              <button
                onClick={addSimulatedOrder}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A7E1] hover:bg-[#0092c4] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tester une nouvelle commande
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Colonne 1 : NOUVELLES COMMANDES */}
              <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-200 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-sky-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00A7E1] animate-ping" />
                    <h2 className="font-bold text-slate-900">Nouvelles Commandes</h2>
                  </div>
                  <span className="px-2 py-0.5 bg-[#00A7E1] text-white rounded-full text-xs font-bold">
                    {orders.filter((o) => o.status === "new").length}
                  </span>
                </div>

                <div className="space-y-3 mt-4 flex-1">
                  {orders
                    .filter((o) => o.status === "new")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl p-4 border border-sky-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#00A7E1]">{order.id}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{order.time}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mt-1">{order.customerName}</h3>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{order.address}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700">Plats commandés :</p>
                          <ul className="mt-1 space-y-1">
                            {order.items.map((it, idx) => (
                              <li key={idx} className="text-sm font-bold text-slate-800">
                                • {it}
                              </li>
                            ))}
                          </ul>

                          {order.customizations && (
                            <div className="mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs">
                              <span className="font-bold text-amber-800">Composition sur-mesure :</span>
                              <p className="text-amber-900 font-medium">
                                {order.customizations.join(" + ")}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-slate-500">Paiement :</span>
                            <p className="text-xs font-semibold text-slate-700">{order.paymentMethod}</p>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{order.total} FCFA</span>
                        </div>

                        <button
                          onClick={() => advanceOrderStatus(order.id)}
                          className="mt-3 w-full py-2 bg-[#00A7E1] hover:bg-[#0092c4] text-white rounded-lg text-sm font-bold transition-all shadow-sm"
                        >
                          Accepter & Lancer en Cuisine
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === "new").length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Aucune nouvelle commande en attente
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne 2 : EN COURS DE CUISSON */}
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <h2 className="font-bold text-slate-900">En Préparation</h2>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                    {orders.filter((o) => o.status === "preparing").length}
                  </span>
                </div>

                <div className="space-y-3 mt-4 flex-1">
                  {orders
                    .filter((o) => o.status === "preparing")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-600">{order.id}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{order.time}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mt-1">{order.customerName}</h3>

                        <div className="mt-2 text-xs text-slate-500">
                          {order.items.join(", ")}
                        </div>

                        {order.customizations && (
                          <div className="mt-2 bg-slate-50 p-2 rounded-lg text-xs font-medium text-slate-700">
                            {order.customizations.join(" + ")}
                          </div>
                        )}

                        <button
                          onClick={() => advanceOrderStatus(order.id)}
                          className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Plat Prêt pour Livraison
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === "preparing").length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Aucune préparation en cours
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne 3 : PRÊT / EN COURS DE LIVRAISON */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-bold text-slate-900">Prêt & En Livraison</h2>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-bold">
                    {orders.filter((o) => o.status === "ready").length}
                  </span>
                </div>

                <div className="space-y-3 mt-4 flex-1">
                  {orders
                    .filter((o) => o.status === "ready")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-600">{order.id}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                            Livreur assigné
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mt-1">{order.customerName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>

                        <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                          <span className="text-slate-600">Livreur : <strong>Issa M. (Moto 02)</strong></span>
                          <span className="font-bold text-slate-900">{order.total} FCFA</span>
                        </div>

                        <button
                          onClick={() => advanceOrderStatus(order.id)}
                          className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                        >
                          Marquer comme remis au client
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === "ready").length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Aucune commande en attente de coursier
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : GESTION DE LA CARTE & RUPTURES */}
        {activeTab === "menu" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestion de la Carte des Plats</h1>
                <p className="text-sm text-slate-500">
                  Gérez la disponibilité immédiate de vos plats. En cas de rupture en cuisine, désactivez le plat en 1 clic.
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00A7E1] hover:bg-[#0092c4] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter un plat
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <th className="py-3.5 px-4">Plat</th>
                    <th className="py-3.5 px-4">Catégorie</th>
                    <th className="py-3.5 px-4">Prix</th>
                    <th className="py-3.5 px-4">Offre Cadeau</th>
                    <th className="py-3.5 px-4 text-right">Disponibilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {menuItems.map((dish) => (
                    <tr key={dish.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {dish.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                          {dish.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {dish.price} FCFA
                      </td>
                      <td className="py-3 px-4">
                        {dish.isFreePromo ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            Bouffe Gratuite
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleDishAvailability(dish.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            dish.isAvailable
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          }`}
                        >
                          {dish.isAvailable ? "En Stock (Actif)" : "Rupture de Stock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET 3 : STATUT TECHNIQUE SUPABASE */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Infrastructure Cloud Supabase & Sécurité</h1>
              <p className="text-sm text-slate-500">
                État de la synchronisation avec la base PostgreSQL et les règles AGENTS.md.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Base de données PostgreSQL 16</h3>
                    <p className="text-xs text-slate-500">Projet : nudmiaaypwfysobcrzvb.supabase.co</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  Connecté & En Ligne
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Sécurité Row Level Security (RLS)</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1">100% des tables protégées</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Politiques actives sur profiles, restaurants, dishes, orders...
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Canal Realtime (WebSockets)</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1">Écoute active</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Publication activée sur les tables orders et dishes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 ClicBouffe Platform — Développé selon les standards d&apos;ingénierie et de sécurité AGENTS.md
      </footer>
    </div>
  );
}
