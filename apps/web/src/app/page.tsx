"use client";

import React, { useState } from "react";
import MobileApp from "@/components/mobile-simulator/mobile-app";
import {
  ChefHat,
  Compass,
  Gift,
  Home,
  Layers,
  Maximize2,
  Minimize2,
  PlusCircle,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  MapPin,
  Menu,
  Plus,
  Store,
  Truck,
} from "lucide-react";

type Screen = "splash" | "onboarding" | "home" | "free_food" | "compose_dish" | "checkout";

export default function AppHome() {
  const [viewMode, setViewMode] = useState<"mobile_simulator" | "kitchen_dashboard">("mobile_simulator");
  const [activeScreen, setActiveScreen] = useState<Screen>("splash");
  const [isFullscreenPhone, setIsFullscreenPhone] = useState(false);

  // Pour le Dashboard Cuisine
  const [activeTab, setActiveTab] = useState<"kitchen" | "menu" | "settings">("kitchen");
  const [isOpen, setIsOpen] = useState(true);

  const [orders, setOrders] = useState([
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
  ]);

  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === "new") return { ...order, status: "preparing" };
        if (order.status === "preparing") return { ...order, status: "ready" };
        return order;
      })
    );
  };

  const addSimulatedOrder = () => {
    const newId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrders([
      {
        id: newId,
        customerName: "Client Mobile (Terrain Zico)",
        address: "Terrain Zico, Akpakpa",
        items: ["Pâte noire", "Sauce Gombo"],
        customizations: ["Poisson braisé"],
        total: 2000,
        status: "new",
        time: "À l'instant",
        paymentMethod: "Mobile Money (Payé)",
      },
      ...orders,
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* ============================================================== */}
      {/* BARRE SUPÉRIEURE DE SÉLECTION DU MODE */}
      {/* ============================================================== */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00AFF2] flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/30">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">ClicBouffe</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-[#00AFF2]/20 text-[#00AFF2] border border-[#00AFF2]/30 rounded-full">
                Plateforme Complète
              </span>
            </div>
          </div>

          {/* Switch : Simulateur Mobile vs Portail Resto */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("mobile_simulator")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "mobile_simulator"
                  ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Émulateur Mobile Client</span>
            </button>

            <button
              onClick={() => setViewMode("kitchen_dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kitchen_dashboard"
                  ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>🍳 Portail Resto & Cuisine</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MODE 1 : ÉMULATEUR MOBILE CLIENT INTERACTIF */}
      {/* ============================================================== */}
      {viewMode === "mobile_simulator" && (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-10 gap-8 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
          {/* Cadre du Smartphone */}
          <div
            className={`relative transition-all duration-300 ${
              isFullscreenPhone
                ? "w-full max-w-md h-[90vh]"
                : "w-[360px] sm:w-[380px] h-[720px] rounded-[48px] border-[12px] border-slate-800 ring-1 ring-slate-700/50 shadow-2xl shadow-cyan-950/40"
            } bg-black overflow-hidden flex flex-col`}
          >
            {/* Haut-parleur & Caméra du téléphone */}
            {!isFullscreenPhone && (
              <div className="h-6 bg-slate-800 shrink-0 flex items-center justify-center gap-2 px-6">
                <div className="w-12 h-1 bg-slate-700 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-900 border border-slate-700 rounded-full" />
              </div>
            )}

            {/* Écran de l'application */}
            <div className="flex-1 relative overflow-hidden bg-white">
              <MobileApp
                forcedScreen={activeScreen}
                onScreenChange={(s) => setActiveScreen(s)}
              />
            </div>

            {/* Barre de navigation gestuelle en bas */}
            {!isFullscreenPhone && (
              <div className="h-4 bg-slate-800 shrink-0 flex items-center justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            )}
          </div>

          {/* Panneau latéral de contrôle & navigation directe entre les écrans */}
          <div className="w-full max-w-md space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#00AFF2]" />
                  <span>Contrôleur de l&apos;Émulateur</span>
                </div>
                <button
                  onClick={() => setActiveScreen("splash")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#00AFF2] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Redémarrer l&apos;app
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Cliquez directement sur un écran pour le tester dans l&apos;émulateur au pixel près selon vos maquettes :
              </p>

              {/* Boutons de saut direct */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveScreen("splash")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "splash"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  1. Splash Screen
                </button>

                <button
                  onClick={() => setActiveScreen("onboarding")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "onboarding"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  2. Onboarding (3 étapes)
                </button>

                <button
                  onClick={() => setActiveScreen("home")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "home"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  3. Accueil ClicBouffe
                </button>

                <button
                  onClick={() => setActiveScreen("free_food")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "free_food"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  4. Choix Bouffe Gratuite
                </button>

                <button
                  onClick={() => setActiveScreen("compose_dish")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "compose_dish"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  5. Composer son plat
                </button>

                <button
                  onClick={() => setActiveScreen("checkout")}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    activeScreen === "checkout"
                      ? "bg-[#00AFF2]/20 border-[#00AFF2] text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  6. Finalisation (Terrain Zico)
                </button>
              </div>

              {/* Mode Plein écran */}
              <div className="pt-2">
                <button
                  onClick={() => setIsFullscreenPhone(!isFullscreenPhone)}
                  className="w-full py-2 px-3 bg-slate-950 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2"
                >
                  {isFullscreenPhone ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isFullscreenPhone ? "Quitter le plein écran" : "Passer en grand format mobile"}</span>
                </button>
              </div>
            </div>

            {/* Note d'information */}
            <div className="bg-sky-950/40 border border-sky-800/40 p-4 rounded-2xl text-xs text-sky-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#00AFF2]">
                <Layers className="w-4 h-4" />
                <span>Synchronisation Parfaite Mobile & Web</span>
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                Tout ce que vous testez dans cet émulateur est développé à l&apos;identique dans Flutter (`apps/mobile`) et Next.js (`apps/web`). Les images, prix en FCFA et étapes correspondent exactement à vos maquettes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2 : PORTAIL RESTO & CUISINE (KDS TEMPS RÉEL) */}
      {/* ============================================================== */}
      {viewMode === "kitchen_dashboard" && (
        <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col">
          {/* Sous-barre de stats */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                    isOpen ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {isOpen ? "Service Ouvert" : "Fermé"}
                </button>
                <span className="text-xs font-bold text-slate-900">Total Ventes : 142 500 FCFA</span>
              </div>

              <button
                onClick={addSimulatedOrder}
                className="px-3 py-1.5 bg-[#00AFF2] hover:bg-[#009bd6] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                + Simuler Arrivée Commande
              </button>
            </div>
          </div>

          {/* Grille KDS */}
          <div className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nouvelles Commandes */}
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#00AFF2] rounded-full animate-ping" />
                Nouvelles ({orders.filter((o) => o.status === "new").length})
              </h3>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === "new")
                  .map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                      <div className="flex justify-between text-xs font-mono font-bold text-[#00AFF2]">
                        <span>{order.id}</span>
                        <span className="text-slate-500">{order.time}</span>
                      </div>
                      <p className="font-bold text-slate-900 mt-1">{order.customerName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {order.address}
                      </p>
                      <div className="mt-2 pt-2 border-t text-xs">
                        {order.items.map((it, i) => (
                          <p key={i} className="font-semibold text-slate-800">
                            • {it}
                          </p>
                        ))}
                        {order.customizations && (
                          <p className="text-[11px] text-amber-800 mt-1 bg-amber-50 p-1.5 rounded">
                            {order.customizations.join(" + ")}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t flex justify-between items-center">
                        <span className="font-bold text-slate-900">{order.total} FCFA</span>
                        <button
                          onClick={() => advanceOrderStatus(order.id)}
                          className="px-3 py-1.5 bg-[#00AFF2] text-white rounded-lg text-xs font-bold"
                        >
                          Accepter
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* En Préparation */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                En Cuisine ({orders.filter((o) => o.status === "preparing").length})
              </h3>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === "preparing")
                  .map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <span className="text-xs font-mono font-bold text-amber-600">{order.id}</span>
                      <p className="font-bold text-slate-900 mt-1">{order.customerName}</p>
                      <p className="text-xs text-slate-600 mt-1">{order.items.join(", ")}</p>
                      <button
                        onClick={() => advanceOrderStatus(order.id)}
                        className="mt-3 w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Prêt pour Livraison
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Prêt */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Livreur Assigné
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <span className="text-xs font-mono font-bold text-emerald-600">CB-1081</span>
                  <p className="font-bold text-slate-900 mt-1">Blandine Soglo</p>
                  <p className="text-xs text-slate-500">Livreur : Issa M. (Moto 02)</p>
                  <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    En route vers le client
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
