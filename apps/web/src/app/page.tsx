"use client";

import React, { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Store,
  Monitor,
  UtensilsCrossed,
  X,
  ChevronRight,
} from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";
import { isCapacitor } from "@/lib/native/platform";
import MobileApp, { Screen } from "@/components/mobile-simulator/mobile-app";

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
}

function useIsMobile() {
  const subscribe = (callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  };
  const getSnapshot = () => {
    return window.innerWidth < 768 || isCapacitor();
  };
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function ClicBouffePlatform() {
  const isMobileDevice = useIsMobile();

  // Vue Desktop : 'mobile_emulator' | 'desktop_store' | 'restaurant_kds'
  const [desktopView, setDesktopView] = useState<"mobile_emulator" | "desktop_store" | "restaurant_kds">(
    "mobile_emulator"
  );

  // Écran actif dans l'émulateur
  const [emulatorScreen, setEmulatorScreen] = useState<Screen>("splash");

  // Filtre et recherche (mode Boutique Web)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState("all");

  // Panier (mode Boutique Web)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "1",
      name: "Pâte noire (Offre Bienvenue)",
      price: 0,
      quantity: 1,
      image: "/images/dish_pate_noire.png",
      options: ["Sauce Gombo", "Poisson braisé"],
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const deliveryLocation = "Terrain Zico, Akpakpa";

  // Catalogue complet des plats
  const dishes = [
    {
      id: "1",
      name: "Pâte noire traditionnelle",
      category: "familiers",
      price: 2000,
      image: "/images/dish_pate_noire.png",
      description: "Pâte noire de cossettes d'igname accompagnée de sauce gombo fraîche et poisson.",
      isFreeEligible: true,
    },
    {
      id: "2",
      name: "Tapioca chaud crémeux",
      category: "familiers",
      price: 100,
      image: "/images/dish_tapioca.png",
      description: "Tapioca chaud au sucre et lait concentré, un classique revigorant pour démarrer.",
      isFreeEligible: true,
    },
    {
      id: "3",
      name: "Chawarma Royal",
      category: "exotiques",
      price: 1000,
      image: "/images/dish_chawarma.png",
      description: "Pain pita garni de poulet émincé mariné, crudités fraîches et sauce blanche maison.",
      isFreeEligible: false,
    },
    {
      id: "4",
      name: "Pâte blanche (Akassa)",
      category: "familiers",
      price: 200,
      image: "/images/dish_pate_blanche.png",
      description: "Pâte de maïs fermentée servie avec sauce graine ou légumes et poisson frit croustillant.",
      isFreeEligible: true,
    },
    {
      id: "5",
      name: "Gari au lait & Arachides",
      category: "familiers",
      price: 200,
      image: "/images/dish_gari.png",
      description: "Gari fin de qualité supérieure, eau glacée, lait crémeux, sucre et arachides grillées.",
      isFreeEligible: true,
    },
    {
      id: "6",
      name: "Pâte rouge (Amiwo) au Poulet",
      category: "familiers",
      price: 1000,
      image: "/images/dish_pate_rouge.png",
      description: "Pâte rouge assaisonnée à la purée de tomate et épices locales, servie avec poulet braisé.",
      isFreeEligible: true,
    },
    {
      id: "7",
      name: "Amberger Signature",
      category: "exotiques",
      price: 5000,
      image: "/images/amberger_banner.png",
      description: "Le burger légendaire ClicBouffe : double steak haché, cheddar fondant, sauce secrète.",
      isFreeEligible: false,
    },
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
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

  const addToCart = (dish: (typeof dishes)[0]) => {
    hapticFeedback("light");
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    hapticFeedback("light");
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // =========================================================================
  // 1. RENDU DIRECT SUR SMARTPHONE OU DANS CAPACITOR (FULL NATIVE SANS CADRE)
  // =========================================================================
  if (isMobileDevice) {
    return (
      <main className="w-full h-full min-h-[100dvh] bg-white flex flex-col">
        <MobileApp />
      </main>
    );
  }

  // =========================================================================
  // 2. RENDU DESKTOP AVEC SÉLECTEUR DE MODE & ÉMULATEUR PIXEL-PERFECT
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* BARRE DE CONTRÔLE DESKTOP FIXE */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Marque ClicBouffe */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00AFF2] flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/30">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                ClicBouffe
                <span className="w-2 h-2 rounded-full bg-[#00AFF2]" />
              </span>
              <p className="text-[10px] text-slate-400">Plateforme Complète & Application Mobile</p>
            </div>
          </div>

          {/* Sélecteur de vue Desktop */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                hapticFeedback("light");
                setDesktopView("mobile_emulator");
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                desktopView === "mobile_emulator"
                  ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Émulateur Mobile Client</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback("light");
                setDesktopView("desktop_store");
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                desktopView === "desktop_store"
                  ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Boutique Web Pleine Largeur</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback("light");
                setDesktopView("restaurant_kds");
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                desktopView === "restaurant_kds"
                  ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Espace Restaurateur / KDS</span>
            </button>
          </div>

          {/* Indicateur de statut */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Capacitor 8 + Next.js 16</span>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* VUE 1 : ÉMULATEUR MOBILE CLIENT PIXEL-PERFECT (MAQUETTES 1 À 13) */}
      {/* ===================================================================== */}
      {desktopView === "mobile_emulator" && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Panneau de Contrôle Écran par Écran */}
          <div className="w-full lg:w-80 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#00AFF2]" />
                Navigation Maquettes
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cliquez pour afficher instantanément chaque écran de la maquette :
              </p>
            </div>

            <div className="space-y-1.5">
              {[
                { id: "splash" as Screen, label: "1. Splash Screen (Logo officiel)", capture: "150947.jpg" },
                { id: "onboarding" as Screen, label: "2. Onboarding (3 étapes)", capture: "151155, 151227, 151522" },
                { id: "home" as Screen, label: "3. Accueil (Grille 6 plats)", capture: "151615.jpg" },
                { id: "free_food" as Screen, label: "4. Bouffe Gratuite (Choix & Tarifs)", capture: "151714, 151956, 152219" },
                { id: "checkout" as Screen, label: "5. Finalisation (Commande)", capture: "152446.jpg" },
                { id: "compose_dish" as Screen, label: "6. Composer son plat (+)", capture: "Sur-mesure" },
              ].map((step) => {
                const isActive = emulatorScreen === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setEmulatorScreen(step.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#00AFF2]/10 border-[#00AFF2] text-[#00AFF2]"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{step.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Maquette : {step.capture}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? "text-[#00AFF2]" : "text-slate-600"}`} />
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-200">🔍 Rendu 100% Fidèle :</p>
              <p>• Logo vectoriel extrait du fichier PSD officiel.</p>
              <p>• Typographie Google Sans / Plus Jakarta Sans.</p>
              <p>• Icônes cohérentes Lucide.</p>
              <p>• Monnaie FCFA avec espaces insécables.</p>
            </div>
          </div>

          {/* Boîtier Smartphone Moderne */}
          <div className="relative">
            {/* Ombre portée réaliste */}
            <div className="absolute -inset-4 bg-[#00AFF2]/20 rounded-[56px] blur-2xl pointer-events-none" />

            <div className="relative w-[360px] sm:w-[380px] h-[750px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 flex flex-col">
              {/* Encoche haut-parleur & caméra */}
              <div className="absolute top-4 inset-x-0 mx-auto w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-slate-900 ml-3" />
              </div>

              {/* Écran intérieur du smartphone */}
              <div className="w-full h-full rounded-[38px] overflow-hidden bg-white relative">
                <MobileApp
                  forcedScreen={emulatorScreen}
                  onScreenChange={(s) => setEmulatorScreen(s)}
                />
              </div>

              {/* Barre home basse */}
              <div className="w-28 h-1 bg-slate-700/60 rounded-full mx-auto mt-2 shrink-0" />
            </div>
          </div>
        </main>
      )}

      {/* ===================================================================== */}
      {/* VUE 2 : BOUTIQUE WEB PLEINE LARGEUR (RESPONSIVE DESKTOP STANDARD) */}
      {/* ===================================================================== */}
      {desktopView === "desktop_store" && (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          {/* Header Boutique Web */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Boutique Marketplace ClicBouffe
                </span>
                <span className="text-xs bg-sky-100 text-[#00AFF2] px-2.5 py-0.5 rounded-full font-bold">
                  Desktop Pleine Largeur
                </span>
              </div>

              {/* Recherche */}
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, une pâte, un burger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:border-[#00AFF2] focus:bg-white outline-none"
                />
              </div>

              {/* Panier */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00AFF2] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#009bd6]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Panier ({cartItemsCount})</span>
              </button>
            </div>
          </div>

          {/* Grille des plats Desktop */}
          <main className="max-w-7xl mx-auto p-6 space-y-6 flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-50 relative p-4 flex items-center justify-center">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900">{dish.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{dish.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-black text-[#00AFF2]">
                        {formatFCFA(dish.price)}
                      </span>
                      <button
                        onClick={() => addToCart(dish)}
                        className="px-3 py-1.5 bg-[#00AFF2] hover:bg-[#009bd6] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Panier latéral Drawer */}
          {isCartOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
              <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#00AFF2]" />
                    <span>Mon Panier</span>
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="p-1 hover:text-slate-900">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">{item.name}</p>
                        <p className="text-xs text-[#00AFF2] font-semibold">
                          {formatFCFA(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Sous-total :</span>
                    <span className="font-bold text-slate-900">{formatFCFA(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Livraison ({deliveryLocation.split(",")[0]}) :</span>
                    <span className="font-bold text-slate-900">{formatFCFA(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-2">
                    <span>Total à payer :</span>
                    <span className="text-[#00AFF2]">{formatFCFA(cartTotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      hapticFeedback("success");
                      alert(`Commande validée pour un montant de ${formatFCFA(cartTotal)} !`);
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-3 bg-[#00AFF2] hover:bg-[#009bd6] text-white rounded-xl font-bold text-xs uppercase"
                  >
                    Valider la commande ({formatFCFA(cartTotal)})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VUE 3 : ESPACE RESTAURATEUR / KDS (CUISINE EN TEMPS RÉEL) */}
      {/* ===================================================================== */}
      {desktopView === "restaurant_kds" && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-[#00AFF2]" />
              <span>Tableau de bord Cuisine KDS (Kitchen Display System)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Commandes reçues en temps réel des clients ClicBouffe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { id: "CMD-108", client: "Marius D.", dishes: "2x Pâte noire, Sauce Gombo, Poisson", status: "En préparation", time: "Il y a 4 min", fee: "80 FCFA" },
                { id: "CMD-109", client: "Aline K.", dishes: "1x Amberger Signature, Frites", status: "Prêt à livrer", time: "Il y a 12 min", fee: "80 FCFA" },
                { id: "CMD-110", client: "Koffi B.", dishes: "3x Pâte rouge, Poulet bicyclette", status: "Nouveau", time: "Il y a 1 min", fee: "130 FCFA" },
              ].map((cmd) => (
                <div key={cmd.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#00AFF2]">{cmd.id}</span>
                    <span className="text-slate-400">{cmd.time}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{cmd.client}</p>
                  <p className="text-xs text-slate-300">{cmd.dishes}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                    <span className="text-emerald-400 font-semibold">{cmd.status}</span>
                    <span className="text-slate-400 font-mono">Frais : {cmd.fee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
