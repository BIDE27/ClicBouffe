"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  ArrowLeft,
  Clock,
  Flame,
  Soup,
  Sandwich,
  MapPin,
  Star,
  Plus,
  Check,
  Sun,
  Moon,
  Wallet,
  UtensilsCrossed,
} from "lucide-react";
import { LogoMarmite } from "../ui/logo-marmite";
import {
  INITIAL_GRID_DISHES,
  REGIONAL_RESTAURANTS,
  DishItem,
  Restaurant,
} from "../../lib/data/clicbouffe-data";
import { RestaurantEntity } from "../../lib/types/database";
import { hapticFeedback } from "../../lib/native/haptics";

interface GoogleSearchViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  walletBalance?: number;
  onOpenWallet?: () => void;
  deliveryAddress?: string;
  onSelectDish?: (dish: DishItem) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  extraRestaurants?: RestaurantEntity[];
}

const GOOGLE_SHORTCUTS = [
  {
    id: "local",
    title: "Cuisine Locale",
    desc: "Pâte noire & rouge",
    query: "Pâte",
    icon: Soup,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "chawarma",
    title: "Chawarma & Grill",
    desc: "Wraps et brochettes",
    query: "Chawarma",
    icon: Flame,
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  {
    id: "tapioca",
    title: "Tapioca & Gari",
    desc: "Douceurs sucrées",
    query: "Tapioca",
    icon: Soup,
    color: "bg-sky-500/10 text-[#00AFF2] border-sky-500/20",
  },
  {
    id: "burger",
    title: "Fast-Food",
    desc: "Burgers gourmets",
    query: "Burger",
    icon: Sandwich,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    id: "maquis",
    title: "Maquis du Port",
    desc: "Poissons braisés",
    query: "Maquis",
    icon: UtensilsCrossed,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    id: "express",
    title: "Livraison Express",
    desc: "Dès 80 FCFA",
    query: "Akpakpa",
    icon: Clock,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
];

const TRENDING_SEARCHES = [
  "Pâte noire Télibo",
  "Chawarma Géant",
  "Daurade braisée",
  "Tapioca chaud",
  "Riz au Gras",
  "1er Offert",
  "Saveurs d'Akpakpa",
  "Amberger Signature",
];

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

export function GoogleSearchView({
  isOpen,
  onClose,
  initialQuery = "",
  onQueryChange,
  theme = "light",
  onToggleTheme,
  walletBalance = 0,
  onOpenWallet,
  deliveryAddress = "Terrain Zico, Akpakpa",
  onSelectDish,
  onSelectRestaurant,
  extraRestaurants = [],
}: GoogleSearchViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "dishes" | "restaurants">("all");
  const [addedDishIds, setAddedDishIds] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronisation sécurisée avec initialQuery lors de changements externes
  if (prevInitialQuery !== initialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  // Focus automatique lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Interception de la touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onQueryChange?.(val);
  };

  const handleClear = () => {
    hapticFeedback("light");
    handleQueryChange("");
    inputRef.current?.focus();
  };

  const handleShortcutClick = (shortcutQuery: string) => {
    hapticFeedback("light");
    handleQueryChange(shortcutQuery);
    inputRef.current?.focus();
  };

  const handleAddDish = (dish: DishItem) => {
    hapticFeedback("medium");
    onSelectDish?.(dish);
    setAddedDishIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedDishIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  // Filtrage dynamique des plats
  const matchingDishes = useMemo(() => {
    if (!query.trim()) return INITIAL_GRID_DISHES;
    const q = query.toLowerCase().trim();
    return INITIAL_GRID_DISHES.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);

  // Fusion catalogue statique + restaurants créés en base de données (préserve les attributs salle/propriétaire)
  const allRestaurants = useMemo(() => {
    const map = new Map<string, Restaurant & Partial<RestaurantEntity>>();
    REGIONAL_RESTAURANTS.forEach((r) => map.set(r.name.toLowerCase(), r));
    extraRestaurants.forEach((r) => {
      const key = r.name.toLowerCase();
      const existing = map.get(key);
      map.set(key, {
        ...(existing || {}),
        id: existing ? r.id : r.id,
        owner_id: r.owner_id,
        name: r.name,
        slug: r.slug,
        category: r.category || existing?.category || "Cuisine Locale & Grillades",
        categoryId: existing?.categoryId || "local",
        img: r.banner_url || r.logo_url || existing?.img || "/images/restau_maquis.jpg",
        banner_url: r.banner_url,
        logo_url: r.logo_url,
        rating: r.rating || existing?.rating || 4.9,
        reviewsCount: r.reviews_count || existing?.reviewsCount || 1,
        deliveryTime: r.delivery_time || existing?.deliveryTime || `${r.avg_prep_time_min || 20} min`,
        deliveryFee: r.delivery_fee_base || existing?.deliveryFee || "80\u00A0FCFA",
        distance: existing?.distance || "À proximité",
        address: r.address,
        popularDishes: existing?.popularDishes || ["Menu du jour", "Composition sur mesure"],
        badges: r.sales_mode !== "online_only" ? ["QR Salle", "Ouvert"] : ["Ouvert"],
        isOpen: r.is_open,
        sales_mode: r.sales_mode,
        tables_count: r.tables_count,
        table_zones: r.table_zones,
        avg_prep_time_min: r.avg_prep_time_min,
        allows_dine_in_composition: r.allows_dine_in_composition,
        allows_waiter_call: r.allows_waiter_call,
        accepts_cash_on_site: r.accepts_cash_on_site,
      });
    });
    return Array.from(map.values());
  }, [extraRestaurants]);

  // Filtrage dynamique des restaurants
  const matchingRestaurants = useMemo(() => {
    if (!query.trim()) return allRestaurants;
    const q = query.toLowerCase().trim();
    return allRestaurants.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.popularDishes.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [query, allRestaurants]);

  const totalResultsCount = matchingDishes.length + matchingRestaurants.length;
  const hasActiveQuery = query.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche ClicBouffe style Google"
      className="fixed inset-0 z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-y-auto animate-search-enter transition-colors"
    >
      {/* 1. BARRE SUPÉRIEURE DE NAVIGATION ET CONTRÔLES */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-3 pt-safe flex items-center justify-between gap-3">
        {/* Bouton Retour */}
        <button
          onClick={() => {
            hapticFeedback("light");
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all active:scale-95"
          aria-label="Retour à la page précédente"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Retour</span>
        </button>

        {/* Adresse de livraison (centrée discrètement) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
          <MapPin className="w-3.5 h-3.5 text-[#00AFF2] shrink-0" />
          <span className="truncate">{deliveryAddress}</span>
        </div>

        {/* Contrôles droits : Portefeuille, Thème, Fermer */}
        <div className="flex items-center gap-2">
          {/* Solde Portefeuille */}
          {onOpenWallet && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onOpenWallet();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-sky-50 dark:bg-slate-800 border border-sky-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
              title="Mon portefeuille"
            >
              <div className="w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center shrink-0">
                <Wallet className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span>{formatFCFA(walletBalance)}</span>
            </button>
          )}

          {/* Toggle Thème Sombre / Clair */}
          {onToggleTheme && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onToggleTheme();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
              aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 stroke-[2]" />
              )}
            </button>
          )}

          {/* Bouton Fermer direct (X) */}
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Fermer la recherche"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 2. ZONE CENTRALE HERO (LOGO + GRANDE BARRE DE RECHERCHE À LA GOOGLE) */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-12 max-w-5xl w-full mx-auto pb-24">
        {/* Identité visuelle ClicBouffe (Positionnée au centre au-dessus de la barre comme Google) */}
        <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 animate-fadeIn">
          <div className="mb-3 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
            <LogoMarmite
              size={76}
              withBackground={false}
              potColor={theme === "dark" ? "#ffffff" : "#00AFF2"}
              cursorColor={theme === "dark" ? "#00AFF2" : "#ffffff"}
              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#00AFF2] tracking-tight leading-none">
            ClicBouffe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-md">
            Trouvez instantanément vos plats locaux, chawarmas, douceurs et maquis à Cotonou
          </p>
        </div>

        {/* GRANDE BARRE DE RECHERCHE PRINCIPALE (Format Pilule Google) */}
        <div className="w-full max-w-2xl relative animate-search-bar">
          <div className="w-full flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/80 hover:border-[#00AFF2]/60 focus-within:border-[#00AFF2] focus-within:ring-4 focus-within:ring-[#00AFF2]/10 shadow-lg hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-200">
            {/* Loupe de recherche */}
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#00AFF2] shrink-0 stroke-[2.2]" />

            {/* Champ de saisie grand format */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Rechercher un plat, un restaurant, un quartier..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              aria-label="Champ de recherche principal"
            />

            {/* Bouton Effacer le texte si rempli */}
            {query.length > 0 && (
              <button
                onClick={handleClear}
                className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center transition-colors shrink-0"
                aria-label="Effacer le texte recherché"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* 3. RACCOURCIS CIRCULAIRES GOOGLE-STYLE (Quand aucun texte n'est encore saisi ou pour guider) */}
        {!hasActiveQuery && (
          <div className="w-full max-w-2xl mt-8 sm:mt-10 animate-search-shortcuts">
            {/* Titre de section */}
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-4">
              Raccourcis & Enceintes culinaires populaires
            </p>

            {/* Grille des 6 bulles circulaires à la Google (Captures 3 & 4) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
              {GOOGLE_SHORTCUTS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleShortcutClick(item.query)}
                    className="flex flex-col items-center gap-2 group p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all active:scale-95 w-full text-center"
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${item.color}`}
                    >
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-[#00AFF2] transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Suggestions tendances (Chips cliquables) */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                <Flame className="w-3.5 h-3.5 text-[#00AFF2]" />
                <span>Recherches les plus populaires aujourd&apos;hui :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleShortcutClick(tag)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 hover:border-[#00AFF2]/60 dark:hover:border-[#00AFF2]/60 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. RÉSULTATS DE RECHERCHE EN DIRECT (Affichés instantanément) */}
        {hasActiveQuery && (
          <div className="w-full max-w-4xl mt-8 space-y-6 animate-fadeIn">
            {/* Barre d'état des résultats & filtres */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span>Résultats pour </span>
                <span className="font-bold text-slate-900 dark:text-white">« {query} »</span>
                <span className="ml-2 font-bold text-[#00AFF2]">
                  ({totalResultsCount} résultat{totalResultsCount > 1 ? "s" : ""})
                </span>
              </div>

              {/* Filtres par onglet */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeFilter === "all"
                      ? "bg-white dark:bg-slate-800 text-[#00AFF2] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Tous ({totalResultsCount})
                </button>
                <button
                  onClick={() => setActiveFilter("dishes")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeFilter === "dishes"
                      ? "bg-white dark:bg-slate-800 text-[#00AFF2] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Plats ({matchingDishes.length})
                </button>
                <button
                  onClick={() => setActiveFilter("restaurants")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeFilter === "restaurants"
                      ? "bg-white dark:bg-slate-800 text-[#00AFF2] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Restaurants ({matchingRestaurants.length})
                </button>
              </div>
            </div>

            {/* Si aucun résultat */}
            {totalResultsCount === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Aucun résultat pour cette recherche
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Essayez un autre mot-clé comme &quot;Pâte&quot;, &quot;Chawarma&quot;, &quot;Akpakpa&quot; ou explorez nos raccourcis.
                </p>
                <button
                  onClick={handleClear}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#00AFF2] text-white font-bold text-xs hover:bg-[#0098d4] transition-all shadow-xs"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}

            {/* SECTION PLATS CORRESPONDANTS */}
            {(activeFilter === "all" || activeFilter === "dishes") && matchingDishes.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                    <Soup className="w-4 h-4 text-[#00AFF2]" />
                    <span>Plats & Spécialités ({matchingDishes.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {matchingDishes.map((dish) => {
                    const isAdded = !!addedDishIds[dish.id];
                    return (
                      <div
                        key={dish.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <Image
                            src={dish.img}
                            alt={dish.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          {dish.isFree && (
                            <span className="absolute top-2 left-2 bg-[#00AFF2] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              1er Offert
                            </span>
                          )}
                        </div>

                        <div className="p-3 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                              {dish.name}
                            </h3>
                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">
                              {dish.price}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddDish(dish)}
                            className={`mt-3 w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                              isAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-[#00AFF2] hover:bg-[#0098d4] text-white shadow-xs"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Ajouté !</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Commander</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION RESTAURANTS CORRESPONDANTS */}
            {(activeFilter === "all" || activeFilter === "restaurants") &&
              matchingRestaurants.length > 0 && (
                <section className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 text-[#00AFF2]" />
                      <span>Restaurants & Maquis ({matchingRestaurants.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchingRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => {
                          hapticFeedback("light");
                          onSelectRestaurant?.(restaurant);
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex gap-3 cursor-pointer hover:border-[#00AFF2]/60 hover:shadow-md transition-all group"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <Image
                            src={restaurant.img}
                            alt={restaurant.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {restaurant.name}
                              </h3>
                              <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px] shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{restaurant.rating}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {restaurant.category} • {restaurant.distance}
                            </p>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              <Clock className="w-3 h-3 text-[#00AFF2]" />
                              <span>{restaurant.deliveryTime}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Livraison {restaurant.deliveryFee}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {restaurant.popularDishes.slice(0, 2).map((dishName) => (
                              <span
                                key={dishName}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]"
                              >
                                {dishName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
