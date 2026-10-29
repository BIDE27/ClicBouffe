"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  Flame,
  Gift,
  Heart,
  MapPin,
  Menu,
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
}

export default function ClicBouffeWebPlatform() {
  // Mode de navigation : Boutique Client ou Espace Restaurateur
  const [currentView, setCurrentView] = useState<"client_shop" | "restaurant_kds">("client_shop");

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
      description: "Pâte noire traditionnelle de farine de cossettes d'igname accompagnée de sauce gombo fraîche et poisson.",
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
      description: "Tapioca chaud au sucre et lait concentré, un classique revigorant pour démarrer la journée.",
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
      description: "Pain pita garni de poulet émincé mariné, crudités fraîches et sauce blanche maison.",
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
      description: "Pâte de maïs fermentée servie avec sauce graine ou légumes et poisson frit croustillant.",
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
      description: "Gari fin de qualité supérieure, eau glacée, lait crémeux, sucre et arachides grillées croquantes.",
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
      description: "Pâte rouge savoureuse assaisonnée à la purée de tomate et épices locales, servie avec poulet braisé.",
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
      description: "Le burger légendaire ClicBouffe : double steak haché, cheddar fondant, sauce secrète et frites.",
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

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cart.length === 0 ? 0 : cart.length <= 2 ? 80 : cart.length <= 5 ? 130 : 170;
  const cartTotal = cartSubtotal + deliveryFee;

  const addToCart = (dish: (typeof dishes)[0]) => {
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
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const addComposedDishToCart = () => {
    const total =
      composerBasePrice +
      composerProteins.reduce((acc, p) => acc + (p === "Poisson braisé" ? 1000 : 1200), 0) +
      composerExtras.reduce((acc) => acc + 400, 0);

    const newItem: CartItem = {
      id: `composed-${Date.now()}`,
      name: `${composerBase} (Composer son plat)`,
      price: total,
      quantity: 1,
      image: "/images/dish_pate_noire.png",
      options: [composerSauce, ...composerProteins, ...composerExtras],
    };

    setCart([...cart, newItem]);
    setIsComposerOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* ============================================================== */}
      {/* 1. NAVBAR PROFESSIONNELLE COMMERCE & RESTAURATION */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView("client_shop")}>
            <div className="w-11 h-11 rounded-2xl bg-[#00AFF2] flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/25">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-[#00AFF2] tracking-tight">ClicBouffe</span>
              <p className="hidden sm:block text-[11px] font-semibold text-slate-500 -mt-1">
                La gastronomie locale & moderne en 1 clic
              </p>
            </div>
          </div>

          {/* Sélecteur de localisation (Terrain Zico) */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer border border-slate-200/60">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="text-left text-xs">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Lieu de livraison</p>
              <p className="font-bold text-slate-800 truncate max-w-[150px]">{deliveryLocation}</p>
            </div>
          </div>

          {/* Barre de recherche centrale */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un plat (Pâte noire, Amberger, Tapioca...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00AFF2] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Actions : Composer Plat + Panier + Switch Portail Resto */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton phare "Composer son plat" */}
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#00AFF2] to-[#008CC2] text-white text-xs font-bold shadow-md shadow-[#00AFF2]/20 hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Composer mon plat</span>
              <span className="sm:hidden">Composer</span>
            </button>

            {/* Bouton Panier */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00AFF2] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            {/* Bascule vers le portail cuisine */}
            <button
              onClick={() =>
                setCurrentView(currentView === "client_shop" ? "restaurant_kds" : "client_shop")
              }
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                currentView === "restaurant_kds"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {currentView === "restaurant_kds" ? "Mode Client" : "Espace Resto (Cuisine)"}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* VUE 1 : MARCHÉ CLIENT & COMMANDE EN LIGNE (Rendu Web Réel) */}
      {/* ============================================================== */}
      {currentView === "client_shop" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* 1. BANNIÈRE PROMO CADEAU "BOUFFE GRATUITE" (Capture 151714.jpg) */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#00AFF2] to-sky-600 text-white p-6 sm:p-8 shadow-xl shadow-[#00AFF2]/15">
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                <Gift className="w-3.5 h-3.5" /> Offre de Bienvenue ClicBouffe
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Votre 1er plat est 100% GRATUIT !
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                Profitez d&apos;un repas offert (Pâte noire, Tapioca, Pâte blanche, Gari au lait...). Vous ne réglez que les frais de livraison (à partir de 80 FCFA seulement).
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-5 py-2.5 bg-white text-[#00AFF2] font-black rounded-xl text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-colors"
                >
                  Choisir mon plat offert
                </button>
                <span className="text-xs text-sky-100 font-semibold flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Livraison express à Terrain Zico (80 FCFA)
                </span>
              </div>
            </div>

            {/* Illustration en arrière-plan */}
            <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 opacity-90 pointer-events-none">
              <Image
                src="/images/amberger_banner.png"
                alt="Plat à l'honneur"
                width={260}
                height={260}
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* 2. SÉLECTION DES CATÉGORIES (FAMILIERS, COURANTS, EXOTIQUES) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "🍽️ Tout le menu" },
              { id: "familiers", label: "🍲 Plats familiers (Pâte, Tapioca, Gari...)" },
              { id: "courants", label: "🍛 Plats courants (Riz au gras, Poisson...)" },
              { id: "exotiques", label: "🍔 Plats soutenus & exotiques (Burgers, Chawarma...)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#00AFF2] text-white shadow-md shadow-[#00AFF2]/25"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3. PLAT VEDETTE (AMBERGER À 5 000 FCFA) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">À la une : Le Spécial Amberger</h3>
                <p className="text-xs text-slate-500">Recette premium burger & cuisine gourmande</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-full md:w-80 h-52 bg-slate-900 rounded-2xl overflow-hidden shrink-0">
                <Image
                  src="/images/amberger_banner.png"
                  alt="Amberger Maison"
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#00AFF2] text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                  Spécialité ClicBouffe
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>5.0 (148 avis)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">Préparation : 15 min</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900">Amberger Maison</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Steak haché de bœuf assaisonné aux épices d&apos;Afrique de l&apos;Ouest, double tranche de fromage fondu, oignons caramélisés et salade croquante. Livré chaud et croustillant.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-black text-[#00AFF2]">5 000 FCFA</span>
                  <button
                    onClick={() => addToCart(dishes[6])}
                    className="px-6 py-2.5 bg-[#00AFF2] hover:bg-[#009bd6] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. GRILLE DES PLATS DE LA MAQUETTE */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Plats pouvant vous intéresser</h3>
                <p className="text-xs text-slate-500">
                  Composez vos menus préférés ou commandez vos plats du quotidien
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {filteredDishes.length} plat{filteredDishes.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#00AFF2]/60 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-slate-50 flex items-center justify-center p-4">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-contain p-2"
                    />

                    {dish.isFreeEligible && (
                      <span className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Offre Cadeau
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 border border-slate-200">
                      ⏱ {dish.prepTime}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {dish.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{dish.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{dish.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                      <div>
                        <span className="text-base font-black text-slate-900">
                          {dish.price.toLocaleString("fr-FR")} FCFA
                        </span>
                        {dish.isFreeEligible && (
                          <p className="text-[10px] font-semibold text-emerald-600">
                            Gratuit si 1ère commande
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {dish.allowsCustomization && (
                          <button
                            onClick={() => {
                              setComposerBase(dish.name);
                              setIsComposerOpen(true);
                            }}
                            className="px-3 py-1.5 bg-sky-50 text-[#00AFF2] hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Composer
                          </button>
                        )}
                        <button
                          onClick={() => addToCart(dish)}
                          className="p-2 bg-[#00AFF2] hover:bg-[#009bd6] text-white rounded-lg transition-colors"
                          title="Ajouter au panier"
                        >
                          <Plus className="w-4 h-4" />
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
                  <button className="px-3 py-1.5 bg-[#00AFF2] text-white text-xs font-bold rounded-lg hover:bg-[#009bd6]">
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
                <button className="w-full mt-2 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">
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
      {/* MODALE 1 : COMPOSER SON PLAT SUR MESURE */}
      {/* ============================================================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsComposerOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 bg-sky-50 text-[#00AFF2] rounded-full text-xs font-bold">
                Module Exclusif ClicBouffe
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Composer votre plat sur-mesure</h3>
              <p className="text-xs text-slate-500">
                Composez votre assiette comme au restaurant ou chez vous au Bénin / Togo.
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
                      setComposerBase(b.name);
                      setComposerBasePrice(b.price);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center ${
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
                    onClick={() => setComposerSauce(s)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
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
                {[
                  { name: "Poisson braisé", price: 1000 },
                  { name: "Poulet bicyclette", price: 1500 },
                  { name: "Fromage Wagashi", price: 500 },
                  { name: "Viande de bœuf", price: 1200 },
                ].map((p) => {
                  const isChecked = composerProteins.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      onClick={() =>
                        setComposerProteins(
                          isChecked
                            ? composerProteins.filter((x) => x !== p.name)
                            : [...composerProteins, p.name]
                        )
                      }
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center ${
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

            {/* Total et action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Prix total du plat composé :</p>
                <p className="text-xl font-black text-[#00AFF2]">
                  {(
                    composerBasePrice +
                    composerProteins.reduce((a, p) => a + (p === "Poisson braisé" ? 1000 : 1200), 0) +
                    composerExtras.reduce((a) => a + 400, 0)
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </p>
              </div>

              <button
                onClick={addComposedDishToCart}
                className="px-6 py-3 bg-[#00AFF2] hover:bg-[#009bd6] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
              >
                Ajouter ce plat à ma commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANIER COULISSANT LATÉRAL (Slide-Over Cart) */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-slideLeft">
            {/* Header panier */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00AFF2]" />
                <h3 className="font-black text-lg text-slate-900">Mon Panier ClicBouffe</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu articles */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3">
                  <div className="w-16 h-16 relative bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                    {item.options && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.options.join(" + ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-xs text-[#00AFF2]">
                        {item.price === 0 ? "Offert" : `${(item.price * item.quantity).toLocaleString("fr-FR")} FCFA`}
                      </span>

                      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-slate-500 hover:text-slate-900 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-slate-500 hover:text-slate-900 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé commande & Tarifs de livraison */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Sous-total plats :</span>
                  <span className="font-bold text-slate-900">{cartSubtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Frais de livraison ({deliveryLocation.split(",")[0]}) :
                  </span>
                  <span className="font-bold text-slate-900">{deliveryFee} FCFA</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total à payer :</span>
                  <span className="text-[#00AFF2]">{cartTotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Commande enregistrée pour ${deliveryLocation} ! Total : ${cartTotal} FCFA.`);
                  setCart([]);
                  setIsCartOpen(false);
                }}
                className="w-full py-3.5 bg-[#00AFF2] hover:bg-[#009bd6] text-white font-black rounded-xl text-xs tracking-wider shadow-lg shadow-[#00AFF2]/25 transition-all"
              >
                Valider ma commande ({cartTotal.toLocaleString("fr-FR")} FCFA)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">© 2026 ClicBouffe — Plateforme de Restauration en Ligne</p>
        <p className="mt-1">Paiements sécurisés par Mobile Money (MTN MoMo, Moov Money) & Cartes bancaires</p>
      </footer>
    </div>
  );
}
