"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Gift,
  Info,
  MapPin,
  Menu as MenuIcon,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";
import {
  HomeNavIcon,
  ExplorerNavIcon,
  ClockNavIcon,
  CalendarNavIcon,
} from "@/components/navigation-icons";

export type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "explorer"
  | "plus_tard"
  | "abonnements"
  | "free_food"
  | "compose_dish"
  | "checkout";

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

export {
  INITIAL_GRID_DISHES,
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
} from "@/lib/data/clicbouffe-data";
export type {
  DishItem,
  Restaurant,
  ScheduledDish,
  MealSubscription,
} from "@/lib/data/clicbouffe-data";

import {
  INITIAL_GRID_DISHES,
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
  DishItem,
  ScheduledDish,
  MealSubscription,
} from "@/lib/data/clicbouffe-data";

export default function ClicBouffePlatform() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Modales
  const [showFreeFoodModal, setShowFreeFoodModal] = useState(false);
  const [showDeliveryRatesModal, setShowDeliveryRatesModal] = useState(false);
  const [showDishPreviewModal, setShowDishPreviewModal] = useState(false);
  const [previewDish, setPreviewDish] = useState<DishItem | null>(null);

  // Recherche & Plats
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDishes, setSelectedDishes] = useState<DishItem[]>([
    INITIAL_GRID_DISHES[0], // Pâte noire sélectionnée par défaut
  ]);
  const [showMoreDishes, setShowMoreDishes] = useState(false);

  // Onglet actif de navigation basse
  const [activeNavTab, setActiveNavTab] = useState<"home" | "explorer" | "plus_tard" | "abonnements">("home");

  // État Explorer
  const [selectedExplorerCategory, setSelectedExplorerCategory] = useState<"all" | "local" | "maquis" | "chawarma" | "burger">("all");

  // État Plus Tard (Plats programmés)
  const [scheduledDishes, setScheduledDishes] = useState<ScheduledDish[]>(INITIAL_SCHEDULED_DISHES);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDishChoice, setScheduleDishChoice] = useState<DishItem>(INITIAL_GRID_DISHES[0]);
  const [scheduleDay, setScheduleDay] = useState("Aujourd'hui");
  const [scheduleHour, setScheduleHour] = useState("19h30");
  const [scheduleNote, setScheduleNote] = useState("");
  const [schedulePortions, setSchedulePortions] = useState(1);

  // État Abonnements
  const [subscriptions, setSubscriptions] = useState<MealSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [activeSubTab, setActiveSubTab] = useState<"active" | "discover">("active");

  // Paramètres de commande & Finalisation
  const [expandedStep, setExpandedStep] = useState<1 | 2 | 3>(1);
  const [deliveryAddress] = useState("Terrain Zico, Akpakpa");
  const [recipient, setRecipient] = useState("Moi seul(e)");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Composer son plat
  const [composeBase, setComposeBase] = useState("Pâte noire");
  const [composeBasePrice, setComposeBasePrice] = useState(500);
  const [composeSauce, setComposeSauce] = useState("Sauce Gombo");
  const [composeProteins, setComposeProteins] = useState<string[]>(["Poisson braisé"]);
  const [composeExtras, setComposeExtras] = useState<string[]>([]);

  const setScreen = useCallback((s: Screen) => {
    hapticFeedback("light");
    setCurrentScreen(s);
    if (s === "home" || s === "explorer" || s === "plus_tard" || s === "abonnements") {
      setActiveNavTab(s);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Redirection automatique Splash vers Onboarding (2.5s)
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setScreen("onboarding");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, setScreen]);

  // Étapes Onboarding
  const onboardingSteps = [
    {
      title: "Des plats familiers",
      desc: "Composez à votre convenance des plats que vous avez l'habitude de manger chez vous et qui ne sont pas forcément accessibles dans les restaurants.",
      img: "/images/onboarding_1.png",
    },
    {
      title: "Des plats courants",
      desc: "Des plats plus ou moins bourgeois que vous trouvez souvent dans les restaurants ou que vous cuisinez à la maison.",
      img: "/images/onboarding_2.png",
    },
    {
      title: "Des plats soutenus\net exotiques",
      desc: "Des plats bourgeois que vous et votre famille mangez pour votre plaisir.",
      img: "/images/onboarding_3.png",
    },
  ];

  // Calcul des totaux et de la grille tarifaire officielle
  const cartItemsCount = selectedDishes.length;
  const cartSubtotal = selectedDishes.reduce((acc, dish) => {
    if (dish.isFree && selectedDishes.findIndex((d) => d.id === dish.id) === 0) {
      return acc + 0;
    }
    return acc + dish.priceNum;
  }, 0);

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

  // Calcul Composer son plat
  const composeTotal =
    composeBasePrice +
    composeProteins.length * 500 +
    composeExtras.length * 300;

  const toggleSelectDish = (dish: DishItem) => {
    hapticFeedback("light");
    const exists = selectedDishes.some((d) => d.id === dish.id);
    if (exists) {
      setSelectedDishes(selectedDishes.filter((d) => d.id !== dish.id));
    } else {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const displayedHomeDishes = INITIAL_GRID_DISHES.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRestaurants = REGIONAL_RESTAURANTS.filter((r) => {
    if (selectedExplorerCategory !== "all" && r.categoryId !== selectedExplorerCategory) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.popularDishes.some((p) => p.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans select-none text-slate-900">
      {/* ============================================================== */}
      {/* 1. ÉCRAN SPLASH SCREEN (Capture 150947.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "splash" && (
        <main
          onClick={() => setScreen("onboarding")}
          className="fixed inset-0 z-50 bg-[#00AFF2] flex flex-col items-center justify-center p-6 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-48 sm:w-60 h-44 sm:h-56 flex items-center justify-center">
              <Image
                src="/images/logo_splash.png"
                alt="Logo ClicBouffe"
                width={220}
                height={200}
                priority
                className="object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 drop-shadow-sm font-sans">
              ClicBouffe
            </h1>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setScreen("onboarding");
            }}
            className="absolute bottom-10 text-xs sm:text-sm text-white/80 font-medium tracking-wide hover:text-white transition-opacity"
          >
            Passer l&apos;introduction &gt;
          </button>
        </main>
      )}

      {/* ============================================================== */}
      {/* 2. ÉCRANS ONBOARDING (Captures 151155, 151227, 151522.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "onboarding" && (
        <main className="min-h-screen w-full bg-white flex flex-col items-center justify-between p-6 sm:py-12">
          <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-72 sm:w-80 h-52 sm:h-60 mb-8 flex items-center justify-center">
              {onboardingSteps[onboardingIndex].img ? (
                <Image
                  src={onboardingSteps[onboardingIndex].img}
                  alt={onboardingSteps[onboardingIndex].title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-4">
                  <UtensilsCrossed className="w-12 h-12 text-[#00AFF2] mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">
                    Emplacement photo {onboardingIndex + 1}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight whitespace-pre-line leading-tight">
              {onboardingSteps[onboardingIndex].title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xs mt-4">
              {onboardingSteps[onboardingIndex].desc}
            </p>

            <div className="flex items-center justify-center gap-3 my-8">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    onboardingIndex === idx
                      ? "w-3 h-3 bg-[#00AFF2]"
                      : "w-2.5 h-2.5 border-2 border-black bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-full max-w-md flex items-center justify-between px-2 pt-4">
            <button
              onClick={() => {
                if (onboardingIndex > 0) {
                  hapticFeedback("light");
                  setOnboardingIndex(onboardingIndex - 1);
                }
              }}
              className={`p-2 text-black transition-opacity ${
                onboardingIndex > 0 ? "opacity-100 hover:text-[#00AFF2]" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                hapticFeedback("medium");
                setScreen("home");
              }}
              className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-wider px-8 py-2.5 rounded-lg shadow-sm shadow-[#00AFF2]/30 uppercase transition-all"
            >
              SAUTER
            </button>

            <button
              onClick={() => {
                hapticFeedback("light");
                if (onboardingIndex < 2) {
                  setOnboardingIndex(onboardingIndex + 1);
                } else {
                  setScreen("home");
                }
              }}
              className="p-2 text-black hover:text-[#00AFF2] transition-colors"
              aria-label="Étape suivante"
            >
              <ChevronRight className="w-8 h-8 stroke-[2.5]" />
            </button>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 3. ÉCRANS PRINCIPAUX AVEC HEADER & BOTTOM NAV UNIFIÉS */}
      {/* ============================================================== */}
      {(currentScreen === "home" ||
        currentScreen === "explorer" ||
        currentScreen === "plus_tard" ||
        currentScreen === "abonnements") && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          {/* Top Bar Responsive */}
          <header className="p-4 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 pt-safe">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setScreen("home")}
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Image
                    src="/images/cursor_icon.png"
                    alt="Logo ClicBouffe"
                    width={24}
                    height={24}
                    priority
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  />
                  <h1 className="text-xl sm:text-2xl font-black text-[#00AFF2] tracking-tight">
                    ClicBouffe
                  </h1>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#00AFF2]" />
                  <span>{deliveryAddress}</span>
                </div>
              </div>

              {/* Barre de recherche responsive */}
              <div className="hidden md:flex flex-1 max-w-sm relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, un restaurant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:border-[#00AFF2] focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Actions Droite */}
              <div className="flex items-center gap-2 sm:gap-4 text-slate-800">
                <button
                  onClick={() => setShowFreeFoodModal(true)}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 stroke-[1.8]" />
                  <span className="w-2 h-2 rounded-full bg-[#00AFF2] absolute top-1.5 right-1.5" />
                </button>
                <button
                  onClick={() => setScreen("free_food")}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors"
                  aria-label="Recherche"
                >
                  <Search className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button
                  onClick={() => setShowDeliveryRatesModal(true)}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors"
                  aria-label="Menu"
                >
                  <MenuIcon className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>
          </header>

          {/* ============================================================== */}
          {/* ONGLET 1 : ACCUEIL */}
          {/* ============================================================== */}
          {currentScreen === "home" && (
            <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4 pb-28">
              {/* Bannière Hero Amberger Propre & Stylée */}
              <div
                onClick={() => {
                  hapticFeedback("light");
                  const amberger = INITIAL_GRID_DISHES.find((d) => d.name === "Amberger") || INITIAL_GRID_DISHES[0];
                  setPreviewDish(amberger);
                  setShowDishPreviewModal(true);
                }}
                className="w-full h-44 sm:h-64 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200/90 group cursor-pointer hover:shadow-lg transition-all"
              >
                <Image
                  src="/images/amberger_banner.jpg"
                  alt="Amberger Signature"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00AFF2] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      Spécialité du Chef
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/80 font-medium">
                      Terrain Zico • Préparé à la minute
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Amberger Gourmet Signature
                      </h2>
                      <p className="text-xs sm:text-sm text-white/90 font-semibold mt-0.5">
                        5 000 FCFA <span className="font-normal text-white/75 text-[11px]">• Double steak, cheddar affiné & sauce maison</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticFeedback("medium");
                        const amberger = INITIAL_GRID_DISHES.find((d) => d.name === "Amberger");
                        if (amberger) setSelectedDishes((prev) => [...prev, amberger]);
                      }}
                      className="px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#00AFF2] hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <span>Commander</span>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Titre section Plats */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Plats pouvant vous intéresser
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sélectionnés pour vous à Akpakpa (Cotonou)
                  </p>
                </div>
                <button
                  onClick={() => setScreen("free_food")}
                  className="text-xs font-bold text-[#00AFF2] hover:underline"
                >
                  Tout voir &gt;
                </button>
              </div>

              {/* Grille des plats authentiques, centrés, avec belles cartes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {displayedHomeDishes.slice(0, 6).map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setPreviewDish(dish);
                      setShowDishPreviewModal(true);
                    }}
                    className="bg-white rounded-2xl border border-slate-200/90 p-2.5 flex flex-col justify-between text-left shadow-xs hover:shadow-md hover:border-[#00AFF2] transition-all group cursor-pointer relative"
                  >
                    {/* Conteneur d'image propre, centré, aspect-ratio parfait sans coupures */}
                    <div className="w-full h-28 sm:h-36 relative rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                      {dish.isFree && (
                        <span className="absolute top-1.5 right-1.5 bg-[#00AFF2] text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                          1er Offert
                        </span>
                      )}
                    </div>

                    {/* Informations du plat */}
                    <div className="w-full pt-1 flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#00AFF2] transition-colors">
                          {dish.name}
                        </p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-700">
                          {dish.price}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticFeedback("medium");
                          setSelectedDishes((prev) => [...prev, dish]);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#00AFF2] group-hover:text-white text-slate-700 flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                        aria-label={`Ajouter ${dish.name} au panier`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* ============================================================== */}
          {/* ONGLET 2 : EXPLORER (RESTAURANTS DISPONIBLES DANS LA SOUS-RÉGION) */}
          {/* ============================================================== */}
          {currentScreen === "explorer" && (
            <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4 pb-28">
              {/* En-tête Sous-région */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Sous-région : Akpakpa & Cotonou Est</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Restaurants & Maquis Disponibles
                  </h2>
                  <p className="text-xs text-slate-500">
                    Livraison directe chez vous au {deliveryAddress} (dès 80 FCFA)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    6 Ouverts maintenant
                  </span>
                </div>
              </div>

              {/* Filtres thématiques par catégorie */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: "all", label: "🍽️ Tous les restaurants" },
                  { id: "local", label: "🍲 Cuisine Locale & Pâtes" },
                  { id: "maquis", label: "🍗 Maquis & Grillades" },
                  { id: "chawarma", label: "🌯 Chawarma & Wraps" },
                  { id: "burger", label: "🍔 Fast-Food & Burgers" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setSelectedExplorerCategory(cat.id as "all" | "local" | "maquis" | "chawarma" | "burger");
                    }}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-semibold transition-all ${
                      selectedExplorerCategory === cat.id
                        ? "bg-[#00AFF2] text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-[#00AFF2]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grille des restaurants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((restau) => (
                  <div
                    key={restau.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#00AFF2] transition-all flex flex-col group cursor-pointer"
                    onClick={() => {
                      hapticFeedback("light");
                      setScreen("free_food");
                    }}
                  >
                    {/* Photo du restaurant */}
                    <div className="h-36 sm:h-44 w-full relative bg-slate-100 overflow-hidden">
                      <Image
                        src={restau.img}
                        alt={restau.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {restau.badges.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{restau.rating}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({restau.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Détails du restaurant */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#00AFF2] transition-colors truncate">
                          {restau.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {restau.category} • {restau.distance}
                        </p>

                        {/* Plats phares */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {restau.popularDishes.slice(0, 3).map((dish) => (
                            <span
                              key={dish}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-slate-600 font-medium">
                          <span>⏱️ {restau.deliveryTime}</span>
                          <span className="mx-1">•</span>
                          <span className="text-[#00AFF2] font-semibold">{restau.deliveryFee}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            hapticFeedback("medium");
                            setScreen("compose_dish");
                          }}
                          className="px-3 py-1 bg-[#00AFF2] text-white rounded-lg font-bold hover:bg-[#0098d4] transition-colors shadow-2xs"
                        >
                          Commander
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* ============================================================== */}
          {/* ONGLET 3 : PLUS TARD (PLATS ENREGISTRÉS & PROGRAMMÉS) */}
          {/* ============================================================== */}
          {currentScreen === "plus_tard" && (
            <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 pb-28">
              {/* En-tête */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <ClockNavIcon active className="w-4 h-4" />
                    <span>Planification des repas</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Plats Programmés pour Plus Tard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vos commandes programmées pour être préparées et livrées à l&apos;heure de votre choix.
                  </p>
                </div>

                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setShowScheduleModal(true);
                  }}
                  className="px-4 py-2 bg-[#00AFF2] text-white rounded-xl font-bold text-xs hover:bg-[#0098d4] transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Programmer un plat</span>
                </button>
              </div>

              {/* Prochaine livraison programmée */}
              {scheduledDishes.length > 0 && (
                <div className="bg-gradient-to-r from-[#00AFF2]/10 via-[#00AFF2]/5 to-transparent rounded-2xl p-3 sm:p-4 border border-[#00AFF2]/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00AFF2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ClockNavIcon active className="w-5 h-5" cutoutColor="#00AFF2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">
                      Prochaine livraison programmée
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-600 truncate">
                      <span className="font-bold text-[#00AFF2]">{scheduledDishes[0].scheduledDate} à {scheduledDishes[0].scheduledTime}</span> : {scheduledDishes[0].dishName} ({scheduledDishes[0].restaurantName})
                    </p>
                  </div>
                </div>
              )}

              {/* Liste des plats programmés */}
              <div className="space-y-3">
                {scheduledDishes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-slate-100 shrink-0">
                        <Image
                          src={item.img}
                          alt={item.dishName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#00AFF2]/15 text-[#00AFF2] text-[10px] font-bold">
                            ⏰ {item.scheduledDate} à {item.scheduledTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.portions} portion(s)
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                          {item.dishName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Restau : <span className="font-semibold text-slate-700">{item.restaurantName}</span>
                        </p>
                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            &ldquo;{item.instructions}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2">
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        {item.price}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            hapticFeedback("light");
                            alert(`Créneau modifié avec succès pour ${item.dishName} !`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Modifier créneau
                        </button>
                        <button
                          onClick={() => {
                            hapticFeedback("medium");
                            setScheduledDishes((prev) => prev.filter((d) => d.id !== item.id));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="Supprimer la programmation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rappel Grille de Livraison Officielle */}
              <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#00AFF2] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">
                    Tarifs de livraison officiels pour vos commandes programmées :
                  </p>
                  <p className="mt-0.5 text-slate-500">
                    1 à 2 plats = <strong>80 FCFA</strong> • 3 à 5 plats = <strong>130 FCFA</strong> • 6 à 10 plats = <strong>170 FCFA</strong> • Plus de 10 plats = <strong>Gratuit (0 FCFA)</strong>.
                  </p>
                </div>
              </div>
            </main>
          )}

          {/* ============================================================== */}
          {/* ONGLET 4 : ABONNEMENTS (PLATS & RESTAURANTS ABONNÉS) */}
          {/* ============================================================== */}
          {currentScreen === "abonnements" && (
            <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 pb-28">
              {/* En-tête */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <CalendarNavIcon active className="w-4 h-4" />
                    <span>Gestion des abonnements</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Mes Abonnements & Formules Repas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vos plats et restaurants réguliers livrés automatiquement à créneau fixe.
                  </p>
                </div>

                {/* Switcher Onglets Mes Abos vs Découvrir */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setActiveSubTab("active");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSubTab === "active"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Actifs ({subscriptions.filter((s) => s.status === "actif").length})
                  </button>
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setActiveSubTab("discover");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSubTab === "discover"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Formules ({AVAILABLE_FORMULAS.length})
                  </button>
                </div>
              </div>

              {activeSubTab === "active" ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-slate-100 shrink-0">
                          <Image
                            src={sub.img}
                            alt={sub.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === "actif"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
                              }`}
                            >
                              {sub.status === "actif" ? "● Actif" : "❚❚ En pause"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {sub.renewalDate}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                            {sub.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700">
                            {sub.targetName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Restau : <span className="font-semibold">{sub.providerName}</span> • Créneau : <span className="font-semibold text-slate-700">{sub.frequency} à {sub.scheduledTime}</span>
                          </p>

                          {sub.benefits && (
                            <ul className="mt-2 space-y-0.5">
                              {sub.benefits.map((b) => (
                                <li key={b} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-[#00AFF2]" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-3">
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {sub.pricePerPeriod}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              hapticFeedback("light");
                              setSubscriptions((prev) =>
                                prev.map((s) =>
                                  s.id === sub.id
                                    ? { ...s, status: s.status === "actif" ? "en_pause" : "actif" }
                                    : s
                                )
                              );
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                              sub.status === "actif"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {sub.status === "actif" ? "Mettre en pause" : "Reprendre"}
                          </button>
                          <button
                            onClick={() => {
                              hapticFeedback("light");
                              alert(`Options d'abonnement pour ${sub.title} modifiées !`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                          >
                            Gérer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AVAILABLE_FORMULAS.map((formula) => (
                    <div
                      key={formula.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-[#00AFF2] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-[#00AFF2]/10 text-[#00AFF2] text-[10px] font-bold">
                          {formula.badge}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-2">
                          {formula.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {formula.description}
                        </p>
                        <p className="text-lg font-black text-slate-900 mt-3">
                          {formula.price}
                        </p>
                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {formula.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#00AFF2]" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          hapticFeedback("medium");
                          alert(`Souscription confirmée à la ${formula.title} !`);
                        }}
                        className="mt-4 w-full py-2 bg-[#00AFF2] text-white rounded-xl font-bold text-xs hover:bg-[#0098d4] transition-colors shadow-xs"
                      >
                        Souscrire à cette formule
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </main>
          )}

          {/* Barre Navigation Basse Pixel-Perfect avec FAB (+) Composer plat */}
          <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-2 z-30 pb-safe">
            <div className="max-w-lg w-full mx-auto flex items-center justify-around">
              {/* Accueil */}
              <button
                onClick={() => {
                  setActiveNavTab("home");
                  setScreen("home");
                }}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeNavTab === "home" ? "text-[#00AFF2]" : "text-slate-600 hover:text-[#00AFF2]"
                }`}
              >
                <HomeNavIcon
                  active={activeNavTab === "home"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "home" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"
                  }`}
                >
                  Accueil
                </span>
              </button>

              {/* Explorer */}
              <button
                onClick={() => {
                  setActiveNavTab("explorer");
                  setScreen("explorer");
                }}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeNavTab === "explorer" ? "text-[#00AFF2]" : "text-slate-600 hover:text-[#00AFF2]"
                }`}
              >
                <ExplorerNavIcon
                  active={activeNavTab === "explorer"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "explorer" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"
                  }`}
                >
                  Explorer
                </span>
              </button>

              {/* Bouton central (+) Composer plat */}
              <div
                className="relative -top-5 flex flex-col items-center cursor-pointer"
                onClick={() => {
                  hapticFeedback("medium");
                  setScreen("compose_dish");
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00AFF2] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#00AFF2]/40 hover:scale-105 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-bold text-black mt-1">Composer plat</span>
              </div>

              {/* Plus tard */}
              <button
                onClick={() => {
                  setActiveNavTab("plus_tard");
                  setScreen("plus_tard");
                }}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeNavTab === "plus_tard" ? "text-[#00AFF2]" : "text-slate-600 hover:text-[#00AFF2]"
                }`}
              >
                <ClockNavIcon
                  active={activeNavTab === "plus_tard"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "plus_tard" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"
                  }`}
                >
                  Plus tard
                </span>
              </button>

              {/* Abonnements */}
              <button
                onClick={() => {
                  setActiveNavTab("abonnements");
                  setScreen("abonnements");
                }}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeNavTab === "abonnements" ? "text-[#00AFF2]" : "text-slate-600 hover:text-[#00AFF2]"
                }`}
              >
                <CalendarNavIcon
                  active={activeNavTab === "abonnements"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "abonnements" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"
                  }`}
                >
                  Abonnements
                </span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALE BOUFFE GRATUITE (Capture 151714.jpg) */}
      {/* ============================================================== */}
      {showFreeFoodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xs sm:max-w-sm p-6 relative shadow-2xl text-center animate-scaleUp">
            <button
              onClick={() => setShowFreeFoodModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-black tracking-wider uppercase mt-1">
              BOUFFE GRATUITE
            </h3>

            <div className="my-5 flex flex-col items-center">
              <div className="relative w-28 h-24 flex items-center justify-center">
                <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center text-[#00AFF2] border border-sky-100">
                  <Gift className="w-12 h-12 stroke-[1.8]" />
                </div>
                <span className="absolute -top-1 -right-1 px-2.5 py-1 bg-[#00AFF2] text-white rounded-full text-[9px] font-black tracking-wide shadow-sm">
                  100% GRATUIT
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed px-2">
              Profitez d&apos;une bouffe 100% gratuite comme cadeau de bienvenu. Faites votre premier pas gratuitement dans un monde libre en civilisation culinaire.
            </p>

            <button
              onClick={() => {
                hapticFeedback("medium");
                setShowFreeFoodModal(false);
                setScreen("free_food");
              }}
              className="mt-6 w-full bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00AFF2]/30 uppercase tracking-wider"
            >
              Profiter
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ÉCRAN CHOIX BOUFFE GRATUITE (Captures 151956, 152219, 152403) */}
      {/* ============================================================== */}
      {currentScreen === "free_food" && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          <header className="p-4 border-b border-slate-100 sticky top-0 bg-white z-20 pt-safe">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button
                onClick={() => setScreen("home")}
                className="p-1 text-black hover:text-[#00AFF2]"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight">
                Choix de la bouffe gratuite
              </h2>
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-28">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Vous pouvez choisir une seule bouffe gratuite. Pour recevoir votre bouffe choisie, il ne vous suffira que de payer la livraison de cette dernière.{" "}
              <span
                onClick={() => setShowDeliveryRatesModal(true)}
                className="text-[#00AFF2] font-semibold cursor-pointer underline"
              >
                Lire plus...
              </span>
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDeliveryRatesModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] hover:opacity-80"
              >
                <span>Tarif de livraison</span>
                <span className="w-5 h-5 rounded-md bg-[#00AFF2] text-white flex items-center justify-center">
                  <MenuIcon className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {(showMoreDishes ? INITIAL_GRID_DISHES : INITIAL_GRID_DISHES.slice(0, 4)).map(
                (dish) => {
                  const isSelected = selectedDishes.some((d) => d.id === dish.id);
                  return (
                    <div
                      key={dish.id}
                      onClick={() => toggleSelectDish(dish)}
                      className={`rounded-2xl border p-2 flex flex-col items-center justify-between text-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#00AFF2] bg-sky-50/20 ring-2 ring-[#00AFF2]/30"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {dish.isFree && (
                        <span className="text-[10px] text-slate-400 self-start ml-1 font-medium">
                          Gratuit
                        </span>
                      )}

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticFeedback("light");
                          setPreviewDish(dish);
                          setShowDishPreviewModal(true);
                        }}
                        className="w-24 sm:w-28 h-24 sm:h-28 relative my-1 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"
                      >
                        {dish.img ? (
                          <Image
                            src={dish.img}
                            alt={dish.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-full py-1.5 px-1 rounded-b-xl transition-colors ${
                          isSelected
                            ? "bg-[#00AFF2] text-white"
                            : "bg-transparent text-slate-900"
                        }`}
                      >
                        <p className="text-xs font-bold truncate">{dish.name}</p>
                        <p
                          className={`text-[11px] ${
                            dish.isFree ? "line-through opacity-75" : "font-semibold"
                          }`}
                        >
                          {dish.originalPrice ?? dish.priceNum} FCFA
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setShowMoreDishes(!showMoreDishes)}
                className="text-xs font-semibold text-[#00AFF2] underline hover:opacity-80"
              >
                {showMoreDishes ? "Voir moins de bouffes" : "Voir plus de bouffes"}
              </button>
            </div>
          </main>

          <div className="fixed bottom-5 right-5 z-30 pb-safe">
            <button
              onClick={() => {
                if (selectedDishes.length > 0) {
                  hapticFeedback("medium");
                  setScreen("checkout");
                }
              }}
              disabled={selectedDishes.length === 0}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 ${
                selectedDishes.length > 0
                  ? "bg-[#00AFF2] hover:bg-[#009bd6] text-white cursor-pointer shadow-[#00AFF2]/40"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>
                {selectedDishes.length === 1 && selectedDishes[0].isFree
                  ? "0 F CFA (1)"
                  : `${cartSubtotal} F CFA (${selectedDishes.length})`}
              </span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODALE TARIF DE LIVRAISON (Capture 152247.jpg) */}
      {/* ============================================================== */}
      {showDeliveryRatesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xs sm:max-w-sm p-6 relative shadow-2xl text-center animate-scaleUp">
            <button
              onClick={() => setShowDeliveryRatesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-black tracking-wider uppercase mb-5">
              TARIF DE LIVRAISON
            </h3>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Entre 1F et 200F</span>
                <span className="font-bold text-slate-900">80 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Entre 03 et 05 plats</span>
                <span className="font-bold text-slate-900">130 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Entre 06 et 10 plats</span>
                <span className="font-bold text-slate-900">170 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Plus de 10 plats</span>
                <span className="font-bold text-emerald-600">Gratuit</span>
              </div>
            </div>

            <button
              onClick={() => setShowDeliveryRatesModal(false)}
              className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold text-[#00AFF2] mx-auto hover:underline"
            >
              <Info className="w-3.5 h-3.5" />
              Politique d&apos;utilisation et conditions
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODALE APERÇU PLAT (Capture 152030.jpg) */}
      {/* ============================================================== */}
      {showDishPreviewModal && previewDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xs sm:max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative h-52 bg-slate-100">
              {previewDish.img ? (
                <Image
                  src={previewDish.img}
                  alt={previewDish.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Utensils className="w-12 h-12" />
                </div>
              )}
              <button
                onClick={() => setShowDishPreviewModal(false)}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
              {previewDish.isFree && (
                <span className="absolute bottom-3 left-3 px-3 py-1 bg-[#00AFF2] text-white rounded-full text-xs font-bold shadow-sm">
                  100% Gratuit (1er plat)
                </span>
              )}
            </div>

            <div className="p-5 text-center">
              <h3 className="text-lg font-black text-slate-900">{previewDish.name}</h3>
              <p className="text-base font-bold text-[#00AFF2] mt-1">{previewDish.price}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Préparé avec des ingrédients frais du terroir béninois selon la recette traditionnelle. Livré chaud et prêt à déguster chez vous à Akpakpa.
              </p>

              <button
                onClick={() => {
                  hapticFeedback("medium");
                  toggleSelectDish(previewDish);
                  setShowDishPreviewModal(false);
                }}
                className="mt-5 w-full py-3 bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#00AFF2]/30"
              >
                {selectedDishes.some((d) => d.id === previewDish.id)
                  ? "Retirer du panier"
                  : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODALE PROGRAMMER UN PLAT POUR PLUS TARD */}
      {/* ============================================================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md p-5 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#00AFF2] mb-1">
              <ClockNavIcon active className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-900">
                Programmer un plat pour plus tard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Choisissez le plat et l&apos;heure à laquelle vous souhaitez être livré.
            </p>

            <div className="space-y-3.5 text-xs">
              {/* Choix du plat */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  1. Sélectionner le plat :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INITIAL_GRID_DISHES.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setScheduleDishChoice(d)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        scheduleDishChoice.id === d.id
                          ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg relative overflow-hidden bg-slate-100 shrink-0">
                        <Image src={d.img} alt={d.name} fill className="object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs truncate">{d.name}</p>
                        <p className="text-[10px] text-slate-500">{d.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix du jour */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  2. Jour de livraison :
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["Aujourd'hui", "Demain", "Vendredi", "Samedi", "Dimanche"].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setScheduleDay(day)}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        scheduleDay === day
                          ? "bg-[#00AFF2] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix de l'heure */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  3. Heure souhaitée :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["12h00", "12h30", "13h00", "19h00", "19h30", "20h00"].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setScheduleHour(h)}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-center transition-all ${
                        scheduleHour === h
                          ? "bg-[#00AFF2] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  4. Portions :
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSchedulePortions(Math.max(1, schedulePortions - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm">{schedulePortions}</span>
                  <button
                    type="button"
                    onClick={() => setSchedulePortions(schedulePortions + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  5. Instructions particulières (Optionnel) :
                </label>
                <input
                  type="text"
                  placeholder="Ex : sans piment, sauce à part..."
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-[#00AFF2]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticFeedback("success");
                  const newScheduled: ScheduledDish = {
                    id: `sch-${Date.now()}`,
                    dishName: scheduleDishChoice.name,
                    restaurantName: "Saveurs d'Akpakpa (Terrain Zico)",
                    price: `${scheduleDishChoice.priceNum * schedulePortions} FCFA`,
                    priceNum: scheduleDishChoice.priceNum * schedulePortions,
                    scheduledDate: scheduleDay,
                    scheduledTime: scheduleHour,
                    portions: schedulePortions,
                    instructions: scheduleNote || "Préparation soignée à l'heure",
                    img: scheduleDishChoice.img,
                    status: "confirmé",
                  };
                  setScheduledDishes([newScheduled, ...scheduledDishes]);
                  setShowScheduleModal(false);
                }}
                className="w-full py-3 bg-[#00AFF2] text-white font-bold rounded-xl mt-3 hover:bg-[#0098d4] transition-all shadow-md shadow-[#00AFF2]/30 uppercase tracking-wider text-xs"
              >
                Confirmer la programmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. ÉCRAN COMPOSER SON PLAT (+ FAB) */}
      {/* ============================================================== */}
      {currentScreen === "compose_dish" && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          <header className="p-4 border-b border-slate-100 sticky top-0 bg-white z-20 pt-safe">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("home")}
                  className="p-1 text-black hover:text-[#00AFF2]"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-black">Composer son plat</h2>
              </div>
              <span className="text-xs font-bold text-[#00AFF2]">Sur-mesure</span>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-28 text-xs sm:text-sm">
            {/* 1. Base */}
            <div>
              <p className="font-bold text-slate-900 mb-2">1. Choisir votre pâte / base (Obligatoire)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: "Pâte noire", price: 500 },
                  { name: "Pâte blanche", price: 400 },
                  { name: "Pâte rouge (Amiwo)", price: 600 },
                  { name: "Riz au gras", price: 600 },
                  { name: "Gari au lait", price: 200 },
                  { name: "Tapioca chaud", price: 200 },
                ].map((b) => (
                  <div
                    key={b.name}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeBase(b.name);
                      setComposeBasePrice(b.price);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      composeBase === b.name
                        ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                        : "border-slate-200"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{b.price} FCFA</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sauce */}
            <div>
              <p className="font-bold text-slate-900 mb-2">2. Choisir la sauce</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Sauce Gombo crincrin", "Sauce Graine", "Sauce Tomate pimentée", "Sauce Légume", "Sauce d'arachide"].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeSauce(s);
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                      composeSauce === s
                        ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                        : "border-slate-200"
                    }`}
                  >
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Protéines */}
            <div>
              <p className="font-bold text-slate-900 mb-2">3. Protéines / Garnitures</p>
              <div className="space-y-2">
                {[
                  { name: "Poisson braisé", price: 500 },
                  { name: "Poulet bicyclette doré", price: 700 },
                  { name: "Viande de bœuf", price: 600 },
                  { name: "Fromage Wagashi frit", price: 400 },
                ].map((p) => {
                  const has = composeProteins.includes(p.name);
                  return (
                    <div
                      key={p.name}
                      onClick={() => {
                        hapticFeedback("light");
                        setComposeProteins(
                          has
                            ? composeProteins.filter((x) => x !== p.name)
                            : [...composeProteins, p.name]
                        );
                      }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
                        has
                          ? "border-[#00AFF2] bg-sky-50/50 text-[#00AFF2] font-bold"
                          : "border-slate-200"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span>+ {p.price} FCFA</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Suppléments */}
            <div>
              <p className="font-bold text-slate-900 mb-2">4. Suppléments (Optionnel)</p>
              <div className="space-y-2">
                {[
                  { name: "Alloco doré", price: 400 },
                  { name: "Piment noir maison", price: 200 },
                  { name: "Oeuf dur", price: 200 },
                ].map((extra) => {
                  const has = composeExtras.includes(extra.name);
                  return (
                    <div
                      key={extra.name}
                      onClick={() => {
                        hapticFeedback("light");
                        setComposeExtras(
                          has
                            ? composeExtras.filter((x) => x !== extra.name)
                            : [...composeExtras, extra.name]
                        );
                      }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
                        has
                          ? "border-[#00AFF2] bg-sky-50/50 text-[#00AFF2] font-bold"
                          : "border-slate-200"
                      }`}
                    >
                      <span>{extra.name}</span>
                      <span>+ {extra.price} FCFA</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          <div className="fixed bottom-0 inset-x-0 p-3 bg-white border-t border-slate-200 z-20 pb-safe">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-slate-500">Total estimé :</span>
                <p className="text-sm sm:text-base font-bold text-[#00AFF2]">
                  {composeTotal} FCFA
                </p>
              </div>
              <button
                onClick={() => {
                  hapticFeedback("success");
                  setSelectedDishes([
                    ...selectedDishes,
                    {
                      id: `composed-${Date.now()}`,
                      name: `${composeBase} (Sur-mesure)`,
                      price: `${composeTotal} FCFA`,
                      priceNum: composeTotal,
                      img: "/images/dish_pate_noire.jpg",
                    },
                  ]);
                  setScreen("checkout");
                }}
                className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md shadow-[#00AFF2]/30"
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. ÉCRAN FINALISATION / CHECKOUT (Capture 152446.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "checkout" && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          <header className="p-4 border-b border-slate-100 sticky top-0 bg-white z-20 pt-safe">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("free_food")}
                  className="p-1 text-black hover:text-[#00AFF2]"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-black">Finalisation</h2>
              </div>
              <span className="px-3 py-1 bg-sky-100 text-[#00AFF2] rounded-full text-xs font-bold flex items-center gap-1">
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>0 F</span>
              </span>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-28">
            {/* Étape 1 : Plats */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 1 ? 2 : 1)}
                className="bg-[#00AFF2] text-white p-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-[#00AFF2] flex items-center justify-center text-[11px] font-black">
                    1
                  </span>
                  <span>
                    Plats : {selectedDishes.map((d) => d.name).join(", ") || "Aucun plat"}
                  </span>
                </div>
                {expandedStep === 1 ? (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>

              {expandedStep === 1 && (
                <div className="p-4 bg-white flex items-center gap-3 overflow-x-auto">
                  {selectedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="relative w-28 shrink-0 rounded-xl border border-slate-200 overflow-hidden shadow-xs text-center p-1 bg-white"
                    >
                      <button
                        onClick={() => toggleSelectDish(dish)}
                        className="absolute top-1 right-1 z-10 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                        aria-label="Supprimer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="w-full h-16 relative my-1 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={dish.img}
                          alt={dish.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[11px] font-bold truncate">{dish.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {dish.isFree && selectedDishes.findIndex((d) => d.id === dish.id) === 0
                          ? "0 F CFA (Offert)"
                          : dish.price}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => setScreen("free_food")}
                    className="w-20 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-[#00AFF2] hover:text-[#00AFF2] shrink-0 text-xs gap-1"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Étape 2 : Destinataire */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 2 ? 3 : 2)}
                className="bg-white text-slate-800 p-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-black">
                    2
                  </span>
                  <span>Destinataire : {recipient}</span>
                </div>
                {expandedStep === 2 ? (
                  <ChevronUp className="w-4 h-4 stroke-[2]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
                )}
              </div>

              {expandedStep === 2 && (
                <div className="p-4 bg-white space-y-2 text-xs">
                  {["Moi seul(e)", "Offrir à un proche", "Groupe d'amis"].map((r) => (
                    <div
                      key={r}
                      onClick={() => {
                        hapticFeedback("light");
                        setRecipient(r);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        recipient === r
                          ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{r}</span>
                      </div>
                      {recipient === r && <Check className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Étape 3 : Adresse & Paiement */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 3 ? 1 : 3)}
                className="bg-white text-slate-800 p-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-black">
                    3
                  </span>
                  <span>Adresse & Mode de Paiement</span>
                </div>
                {expandedStep === 3 ? (
                  <ChevronUp className="w-4 h-4 stroke-[2]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
                )}
              </div>

              {expandedStep === 3 && (
                <div className="p-4 bg-white space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Adresse de livraison à Akpakpa :
                    </label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <MapPin className="w-4 h-4 text-[#00AFF2]" />
                      <span className="font-medium text-slate-800">{deliveryAddress}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Mode de paiement sécurisé :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 border-2 border-[#00AFF2] bg-sky-50/40 rounded-xl text-center font-bold text-slate-900 cursor-pointer">
                        <p className="text-xs">MTN / Moov Money</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Instantané (Bénin)
                        </p>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-xl text-center font-bold text-slate-500 hover:border-slate-300 cursor-pointer">
                        <p className="text-xs">Paiement à la livraison</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Espèces au livreur</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Récapitulatif Tarifaire Officiel */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total plats ({cartItemsCount})</span>
                <span className="font-semibold text-slate-900">{formatFCFA(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Frais de livraison (
                  {cartItemsCount <= 2
                    ? "1-2 plats"
                    : cartItemsCount <= 5
                    ? "3-5 plats"
                    : cartItemsCount <= 10
                    ? "6-10 plats"
                    : ">10 plats"}
                  )
                </span>
                <span className="font-semibold text-slate-900">
                  {deliveryFee === 0 ? "Gratuit" : formatFCFA(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total à payer</span>
                <span className="text-[#00AFF2] text-base font-black">
                  {formatFCFA(cartTotal)}
                </span>
              </div>
            </div>
          </main>

          <div className="fixed bottom-0 inset-x-0 p-3 bg-white border-t border-slate-200 z-20 pb-safe">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-slate-500">Montant net :</span>
                <p className="text-sm sm:text-base font-black text-[#00AFF2]">
                  {formatFCFA(cartTotal)}
                </p>
              </div>
              <button
                onClick={() => {
                  hapticFeedback("success");
                  setOrderConfirmed(true);
                }}
                disabled={selectedDishes.length === 0}
                className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-md shadow-[#00AFF2]/30 flex items-center gap-2"
              >
                <span>Confirmer commande</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Modale Succès Commande */}
          {orderConfirmed && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl w-full max-w-xs sm:max-w-sm p-6 text-center shadow-2xl animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Commande Confirmée !
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Votre commande a été transmise aux restaurateurs partenaires d&apos;Akpakpa. Un livreur ClicBouffe se met en route dès que les plats sont chauds.
                </p>
                <div className="my-4 p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1">
                  <p className="font-semibold text-slate-800">
                    Livraison : {deliveryAddress}
                  </p>
                  <p className="text-slate-600">Total : {formatFCFA(cartTotal)}</p>
                  <p className="text-[#00AFF2] font-bold">Délai estimé : 20 - 30 minutes</p>
                </div>
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setOrderConfirmed(false);
                    setSelectedDishes([]);
                    setScreen("home");
                  }}
                  className="w-full py-3 bg-[#00AFF2] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
