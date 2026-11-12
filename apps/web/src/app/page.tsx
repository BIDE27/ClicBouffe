"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Flame,
  Gift,
  Home,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

const COMPOSER_PROTEINS = [
  { name: "Poisson braisé", price: 1000 },
  { name: "Poulet bicyclette", price: 1500 },
  { name: "Fromage Wagashi", price: 500 },
  { name: "Viande de bœuf", price: 1200 },
];

const COMPOSER_EXTRAS = [
  { name: "Alloco", price: 400 },
  { name: "Piment noir maison", price: 200 },
  { name: "Oeuf dur", price: 200 },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
}

export default function ClicBouffePlatform() {
  // Mode de navigation : Boutique Client ou Espace Restaurateur
  const [currentView, setCurrentView] = useState<"client_shop" | "restaurant_kds">("client_shop");

  // Tab mobile actif
  const [activeTab, setActiveTab] = useState<"home" | "search" | "cart" | "profile">("home");

  // Filtre par catégorie
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Recherche
  const [searchQuery, setSearchQuery] = useState("");

  // Panier
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

  // Modale "Composer son plat"
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerBase, setComposerBase] = useState("Pâte noire");
  const [composerBasePrice, setComposerBasePrice] = useState(500);
  const [composerSauce, setComposerSauce] = useState("Sauce Gombo");
  const [composerProteins, setComposerProteins] = useState<string[]>(["Poisson braisé"]);
  const [composerExtras, setComposerExtras] = useState<string[]>(["Alloco"]);

  // Modale Promo Cadeau Bienvenue
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Adresse de livraison
  const [deliveryLocation, setDeliveryLocation] = useState("Terrain Zico, Akpakpa");

  // Catalogue complet des plats avec les images réelles
  const dishes = [
    {
      id: "1",
      name: "Pâte noire traditionnelle",
      category: "familiers",
      price: 2000,
      image: "/images/dish_pate_noire.png",
      rating: 4.9,
      prepTime: "15-20 min",
      description:
        "Pâte noire traditionnelle de farine de cossettes d'igname accompagnée de sauce gombo fraîche et poisson.",
      isFreeEligible: true,
      allowsCustomization: true,
    },
    {
      id: "2",
      name: "Tapioca chaud crémeux",
      category: "familiers",
      price: 100,
      image: "/images/dish_tapioca.png",
      rating: 4.8,
      prepTime: "5-10 min",
      description:
        "Tapioca chaud au sucre et lait concentré, un classique revigorant pour démarrer la journée.",
      isFreeEligible: true,
      allowsCustomization: false,
    },
    {
      id: "3",
      name: "Chawarma Royal",
      category: "exotiques",
      price: 1000,
      image: "/images/dish_chawarma.png",
      rating: 4.7,
      prepTime: "10-15 min",
      description:
        "Pain pita garni de poulet émincé mariné, crudités fraîches et sauce blanche maison.",
      isFreeEligible: false,
      allowsCustomization: false,
    },
    {
      id: "4",
      name: "Pâte blanche (Akassa)",
      category: "familiers",
      price: 200,
      image: "/images/dish_pate_blanche.png",
      rating: 4.9,
      prepTime: "10-15 min",
      description:
        "Pâte de maïs fermentée servie avec sauce graine ou légumes et poisson frit croustillant.",
      isFreeEligible: true,
      allowsCustomization: true,
    },
    {
      id: "5",
      name: "Gari au lait & Arachides",
      category: "familiers",
      price: 200,
      image: "/images/dish_gari.png",
      rating: 4.9,
      prepTime: "3 min",
      description:
        "Gari fin de qualité supérieure, eau glacée, lait crémeux, sucre et arachides grillées croquantes.",
      isFreeEligible: true,
      allowsCustomization: false,
    },
    {
      id: "6",
      name: "Pâte rouge (Amiwo) au Poulet",
      category: "familiers",
      price: 1000,
      image: "/images/dish_pate_rouge.png",
      rating: 4.9,
      prepTime: "20 min",
      description:
        "Pâte rouge savoureuse assaisonnée à la purée de tomate et épices locales, servie avec poulet braisé.",
      isFreeEligible: true,
      allowsCustomization: true,
    },
    {
      id: "7",
      name: "Amberger Signature",
      category: "exotiques",
      price: 5000,
      image: "/images/amberger_banner.png",
      rating: 5.0,
      prepTime: "15 min",
      description:
        "Le burger légendaire ClicBouffe : double steak haché, cheddar fondant, sauce secrète et frites.",
      isFreeEligible: false,
      allowsCustomization: false,
    },
  ];

  // Filtre
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Grille officielle : 1-2 plats = 80 FCFA, 3-5 = 130 FCFA, 6-10 = 170 FCFA, >10 = Gratuit (0 FCFA)
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

  const addComposedDishToCart = () => {
    hapticFeedback("success");
    const proteinPrice = composerProteins.reduce((acc, p) => {
      const found = COMPOSER_PROTEINS.find((item) => item.name === p);
      return acc + (found ? found.price : 1000);
    }, 0);
    const extraPrice = composerExtras.reduce((acc, e) => {
      const found = COMPOSER_EXTRAS.find((item) => item.name === e);
      return acc + (found ? found.price : 400);
    }, 0);
    const totalDishPrice = composerBasePrice + proteinPrice + extraPrice;

    const composedItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: `${composerBase} (Sur-mesure)`,
      price: totalDishPrice,
      quantity: 1,
      image: "/images/dish_pate_noire.png",
      options: [composerSauce, ...composerProteins, ...composerExtras],
    };

    setCart((prev) => [...prev, composedItem]);
    setIsComposerOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      {/* ============================================================== */}
      {/* TOP BAR / EN-TÊTE : RESPONSIVE WEB ET MOBILE-FIRST (PT-SAFE) */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 pt-safe transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Marque ClicBouffe */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00AFF2] flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/30 active-press">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                ClicBouffe
                <span className="inline-block w-2 h-2 rounded-full bg-[#00AFF2]" />
              </span>
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                <MapPin className="w-3 h-3 text-[#00AFF2]" />
                <span>{deliveryLocation}</span>
              </div>
            </div>
          </div>

          {/* Recherche centrale (sur écran moyen et grand) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un plat, une pâte, tapioca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs rounded-full border border-slate-200/80 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
            />
          </div>

          {/* Actions Droite : Sélecteur KDS / Panier */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton switch vers Espace Cuisine KDS sur Desktop */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  hapticFeedback("light");
                  setCurrentView("client_shop");
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentView === "client_shop"
                    ? "bg-white text-[#00AFF2] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Boutique
              </button>
              <button
                onClick={() => {
                  hapticFeedback("light");
                  setCurrentView("restaurant_kds");
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === "restaurant_kds"
                    ? "bg-white text-[#00AFF2] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Cuisine KDS
              </button>
            </div>

            {/* Notification */}
            <button
              onClick={() => {
                hapticFeedback("light");
                setShowWelcomeModal(true);
              }}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 relative active-press"
              title="Offre de bienvenue"
            >
              <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
            </button>

            {/* Bouton Panier flottant / Header */}
            <button
              onClick={() => {
                hapticFeedback("medium");
                setIsCartOpen(true);
              }}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#00AFF2] text-white font-bold text-xs shadow-md shadow-[#00AFF2]/25 active-press"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartItemsCount > 0 && (
                <span className="w-5 h-5 bg-white text-[#00AFF2] rounded-full text-[11px] font-black flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Barre de localisation mobile sous le header */}
        <div className="sm:hidden px-4 py-1.5 bg-slate-100/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#00AFF2] shrink-0" />
            <span className="truncate">{deliveryLocation}</span>
          </div>
          <button
            onClick={() => {
              const loc = prompt("Modifier votre adresse de livraison :", deliveryLocation);
              if (loc) setDeliveryLocation(loc);
            }}
            className="text-[10px] font-bold text-[#00AFF2] shrink-0"
          >
            Modifier
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CONTENU PRINCIPAL CLIENT : CATALOGUE ET COMPOSITION */}
      {/* ============================================================== */}
      {currentView === "client_shop" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-8">
          {/* 1. HERO BANNER : AMBERGER & COMPOSER */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 to-[#00AFF2] text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Spécialités Africaines & Fast Food
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Composez vos plats préférés comme à la maison.
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                Pâte noire, Akassa, Amiwo ou Amberger : préparez votre assiette sur-mesure et faites-vous
                livrer au chaud à Cotonou et ses environs.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    hapticFeedback("medium");
                    setIsComposerOpen(true);
                  }}
                  className="px-5 py-2.5 bg-white text-[#00AFF2] font-black rounded-xl text-xs sm:text-sm shadow-md active-press hover:bg-slate-100"
                >
                  + Composer mon plat sur-mesure
                </button>
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setShowWelcomeModal(true);
                  }}
                  className="px-4 py-2.5 bg-sky-700/60 hover:bg-sky-700 text-white font-bold rounded-xl text-xs active-press border border-white/20"
                >
                  🎁 Bouffe Gratuite Bienvenue
                </button>
              </div>
            </div>

            {/* Illustration burger d'arrière plan */}
            <div className="hidden lg:block absolute -right-6 -bottom-6 w-80 h-80 opacity-90 pointer-events-none">
              <Image
                src="/images/amberger_banner.png"
                alt="Amberger ClicBouffe"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* 2. RECHERCHE RAPIDE MOBILE */}
          <div className="md:hidden relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:border-[#00AFF2] outline-none shadow-xs"
            />
          </div>

          {/* 3. FILTRES PAR CATÉGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "Tous les plats" },
              { id: "familiers", label: "Plats familiers" },
              { id: "courants", label: "Plats courants" },
              { id: "exotiques", label: "Plats exotiques" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  hapticFeedback("light");
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active-press ${
                  selectedCategory === cat.id
                    ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/25"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 4. GRILLE DES PLATS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Nos Plats Disponibles
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {filteredDishes.length} plat{filteredDishes.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#00AFF2]/60 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-32 sm:h-44 bg-slate-50/70 flex items-center justify-center p-3">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-contain p-2"
                    />

                    {dish.isFreeEligible && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Offert
                      </span>
                    )}

                    <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[9px] font-bold text-slate-700 border border-slate-200">
                      ⏱ {dish.prepTime}
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-slate-600">
                          {dish.category}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{dish.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {dish.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {dish.price.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {dish.allowsCustomization && (
                          <button
                            onClick={() => {
                              hapticFeedback("light");
                              setComposerBase(dish.name);
                              setIsComposerOpen(true);
                            }}
                            className="px-2 py-1 bg-sky-50 text-[#00AFF2] hover:bg-sky-100 rounded-lg text-[10px] font-bold active-press"
                          >
                            Composer
                          </button>
                        )}
                        <button
                          onClick={() => addToCart(dish)}
                          className="p-1.5 sm:p-2 bg-[#00AFF2] hover:bg-[#009bd6] text-white rounded-lg active-press"
                          title="Ajouter au panier"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ============================================================== */}
      {/* VUE 2 : ESPACE RESTAURATEUR & CUISINE KDS (Rendu Web Réel) */}
      {/* ============================================================== */}
      {currentView === "restaurant_kds" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="px-2.5 py-1 bg-[#00AFF2]/10 text-[#00AFF2] rounded-full text-xs font-bold">
                Tableau de bord Cuisine en direct
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Gestion des Commandes Restaurant</h2>
            </div>
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Service en direct ouvert
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1 : Nouvelles commandes */}
            <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00AFF2] animate-ping" />
                  Nouvelles Commandes
                </span>
                <span className="px-2 py-0.5 bg-[#00AFF2] text-white rounded-full text-xs">2</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs space-y-2">
                <div className="flex justify-between text-xs font-bold font-mono text-[#00AFF2]">
                  <span>#CB-1084</span>
                  <span className="text-slate-500">Il y a 3 min</span>
                </div>
                <p className="font-bold text-slate-900">Aimé Mensah</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Terrain Zico, Akpakpa
                </p>
                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-800">• Pâte noire (Composer son plat)</p>
                  <p className="text-slate-600 pl-3">↳ Sauce Gombo + Poisson braisé + Piment fort</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-sm">2 000 FCFA</span>
                  <button
                    onClick={() => hapticFeedback("light")}
                    className="px-3 py-1.5 bg-[#00AFF2] text-white text-xs font-bold rounded-lg hover:bg-[#009bd6] active-press"
                  >
                    Accepter & Cuire
                  </button>
                </div>
              </div>
            </div>

            {/* Colonne 2 : En Préparation */}
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-amber-600" />
                  En Préparation
                </span>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs">1</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs space-y-2">
                <div className="flex justify-between text-xs font-bold font-mono text-amber-600">
                  <span>#CB-1082</span>
                  <span className="text-slate-500">Il y a 12 min</span>
                </div>
                <p className="font-bold text-slate-900">Koffi Akakpo</p>
                <p className="text-xs text-slate-500">Pâte rouge (Amiwo) + Poulet bicyclette</p>
                <button
                  onClick={() => hapticFeedback("light")}
                  className="w-full mt-2 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 active-press"
                >
                  Plat Prêt pour Livraison
                </button>
              </div>
            </div>

            {/* Colonne 3 : En livraison */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Livreur en Route
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs">1</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-2">
                <div className="flex justify-between text-xs font-bold font-mono text-emerald-600">
                  <span>#CB-1081</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    Moto 02 en route
                  </span>
                </div>
                <p className="font-bold text-slate-900">Blandine Soglo</p>
                <p className="text-xs text-slate-500">Livreur : Issa M. (Course en cours)</p>
                <p className="text-xs font-bold text-slate-800 pt-1">Total : 1 200 FCFA</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* BOTTOM TAB BAR MOBILE & CAPACITOR (EXACTEMENT SELON MAQUETTES) */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16 relative px-2">
          {/* Tab 1 : Accueil */}
          <button
            onClick={() => {
              hapticFeedback("light");
              setActiveTab("home");
              setCurrentView("client_shop");
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              activeTab === "home" ? "text-[#00AFF2]" : "text-slate-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Accueil</span>
          </button>

          {/* Tab 2 : Recherche */}
          <button
            onClick={() => {
              hapticFeedback("light");
              setActiveTab("search");
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              activeTab === "search" ? "text-[#00AFF2]" : "text-slate-600"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold">Recherche</span>
          </button>

          {/* Tab 3 : BOUTON CENTRAL + COMPOSER (HERO ACTION) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={() => {
                hapticFeedback("heavy");
                setIsComposerOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-[#00AFF2] hover:bg-[#0098d4] text-white flex flex-col items-center justify-center shadow-lg shadow-[#00AFF2]/40 border-4 border-white active-press"
              title="Composer son plat"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Tab 4 : Panier */}
          <button
            onClick={() => {
              hapticFeedback("medium");
              setIsCartOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-600 relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-5 w-4 h-4 bg-[#00AFF2] text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
            <span className="text-[10px] font-bold">Panier</span>
          </button>

          {/* Tab 5 : Profil / Switch KDS */}
          <button
            onClick={() => {
              hapticFeedback("light");
              setCurrentView((prev) => (prev === "client_shop" ? "restaurant_kds" : "client_shop"));
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              currentView === "restaurant_kds" ? "text-[#00AFF2]" : "text-slate-600"
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold">
              {currentView === "restaurant_kds" ? "Cuisine" : "Resto"}
            </span>
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* TIROIR / BOTTOM SHEET : COMPOSER SON PLAT SUR MESURE */}
      {/* ============================================================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative pb-safe">
            {/* Poignée de tiroir mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2" />

            <button
              onClick={() => setIsComposerOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
              data-modal-close
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 bg-sky-50 text-[#00AFF2] rounded-full text-xs font-bold">
                Module Exclusif ClicBouffe
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Composer votre plat sur-mesure
              </h3>
              <p className="text-xs text-slate-500">
                Composez votre assiette selon vos envies au Bénin / Togo.
              </p>
            </div>

            {/* Étape 1 : Base */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Choisissez votre base (Obligatoire)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Pâte noire", price: 500 },
                  { name: "Pâte blanche (Akassa)", price: 400 },
                  { name: "Pâte rouge (Amiwo)", price: 600 },
                  { name: "Riz au gras", price: 800 },
                ].map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposerBase(b.name);
                      setComposerBasePrice(b.price);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center active-press ${
                      composerBase === b.name
                        ? "border-[#00AFF2] bg-sky-50/60 text-[#00AFF2] ring-2 ring-[#00AFF2]/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="font-semibold text-slate-500">{b.price} F</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 2 : Sauce */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Choisissez votre sauce (Obligatoire)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Sauce Gombo", "Sauce Tomate fraîche", "Sauce Légumes (Gboma)"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposerSauce(s);
                    }}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all active-press ${
                      composerSauce === s
                        ? "border-[#00AFF2] bg-sky-50/60 text-[#00AFF2] ring-2 ring-[#00AFF2]/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 3 : Protéines */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Viande, Poisson ou Fromage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPOSER_PROTEINS.map((p) => {
                  const isChecked = composerProteins.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        hapticFeedback("light");
                        setComposerProteins(
                          isChecked
                            ? composerProteins.filter((x) => x !== p.name)
                            : [...composerProteins, p.name]
                        );
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center active-press ${
                        isChecked
                          ? "border-[#00AFF2] bg-sky-50/60 text-[#00AFF2]"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="font-semibold text-slate-500">+{p.price} F</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Étape 4 : Suppléments */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Suppléments (Optionnel)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COMPOSER_EXTRAS.map((e) => {
                  const isChecked = composerExtras.includes(e.name);
                  return (
                    <button
                      key={e.name}
                      onClick={() => {
                        hapticFeedback("light");
                        setComposerExtras(
                          isChecked
                            ? composerExtras.filter((x) => x !== e.name)
                            : [...composerExtras, e.name]
                        );
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between active-press ${
                        isChecked
                          ? "border-[#00AFF2] bg-sky-50/60 text-[#00AFF2]"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{e.name}</span>
                      <span className="font-semibold text-slate-500">+{e.price} F</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total et validation */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Prix total du plat :</p>
                <p className="text-lg sm:text-xl font-black text-[#00AFF2]">
                  {formatFCFA(
                    composerBasePrice +
                    composerProteins.reduce((a, p) => {
                      const found = COMPOSER_PROTEINS.find((item) => item.name === p);
                      return a + (found ? found.price : 1000);
                    }, 0) +
                    composerExtras.reduce((a, e) => {
                      const found = COMPOSER_EXTRAS.find((item) => item.name === e);
                      return a + (found ? found.price : 400);
                    }, 0)
                  )}
                </p>
              </div>

              <button
                onClick={addComposedDishToCart}
                className="px-5 py-2.5 bg-[#00AFF2] hover:bg-[#009bd6] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active-press"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANIER COULISSANT LATÉRAL & BOTTOM SHEET MOBILE */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-5 sm:p-6 shadow-2xl pb-safe">
            {/* Header panier */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00AFF2]" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">Mon Panier ClicBouffe</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
                data-drawer-close
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu articles */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600 text-sm">Votre panier est vide</p>
                  <p className="text-xs text-slate-400 mt-1">Ajoutez de délicieux plats pour commander</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 items-center"
                  >
                    <div className="w-14 h-14 relative bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                      {item.options && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.options.join(" + ")}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-black text-xs text-[#00AFF2]">
                          {item.price === 0 ? "Offert" : formatFCFA(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-slate-500 hover:text-slate-900 font-bold active-press"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold active-press"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Résumé commande & Tarifs de livraison */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Sous-total plats :</span>
                  <span className="font-bold text-slate-900">{formatFCFA(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison ({deliveryLocation.split(",")[0]}) :</span>
                  <span className="font-bold text-slate-900">{formatFCFA(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total à payer :</span>
                  <span className="text-[#00AFF2]">{formatFCFA(cartTotal)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  if (cart.length === 0) return;
                  hapticFeedback("success");
                  alert(`Commande validée pour ${deliveryLocation} ! Montant total : ${formatFCFA(cartTotal)}.`);
                  setCart([]);
                  setIsCartOpen(false);
                }}
                className={`w-full py-3 text-white font-black rounded-xl text-xs tracking-wider shadow-lg transition-all active-press ${
                  cart.length === 0
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#00AFF2] hover:bg-[#009bd6] shadow-[#00AFF2]/25"
                }`}
              >
                {cart.length === 0 ? "Panier vide" : `Valider ma commande (${formatFCFA(cartTotal)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP PROMO CADEAU BIENVENUE (CAPTURE 151714.JPG) */}
      {/* ============================================================== */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <Gift className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">BOUFFE GRATUITE !</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bienvenue sur ClicBouffe ! Pour votre première commande, nous vous offrons un plat
                familial gratuit de votre choix. Seuls les frais de livraison s&apos;appliquent.
              </p>
            </div>

            <button
              onClick={() => {
                hapticFeedback("light");
                setShowWelcomeModal(false);
              }}
              className="w-full py-2.5 bg-[#00AFF2] text-white font-black rounded-xl text-xs active-press"
            >
              Découvrir les plats offerts
            </button>
          </div>
        </div>
      )}

      {/* FOOTER DESKTOP */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">© 2026 ClicBouffe — Restauration & Composition de Plats</p>
        <p className="mt-1">Paiements sécurisés par Mobile Money (MTN MoMo, Moov Money) & Cartes bancaires</p>
      </footer>
    </div>
  );
}
