"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Beef,
  Bell,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Flame,
  Gift,
  Info,
  MapPin,
  Menu as MenuIcon,
  Plus,
  QrCode,
  Sandwich,
  Search,
  Send,
  Soup,
  Sparkles,
  Star,
  Trash2,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { PromoCarousel } from "@/components/home/promo-carousel";
import { AuthModal } from "@/components/auth/auth-modal";
import { SideDrawer } from "@/components/navigation/side-drawer";
import { WalletModal } from "@/components/wallet/wallet-modal";
import { QrScannerModal } from "@/components/qr/qr-scanner-modal";
import { ScannedRestaurantModal } from "@/components/qr/scanned-restaurant-modal";
import { RestaurantDashboard } from "@/components/restaurant-dashboard/restaurant-dashboard";
import { authService } from "@/lib/services/auth-service";
import { UserProfile } from "@/lib/types/database";
import { hapticFeedback } from "@/lib/native/haptics";
import {
  HomeNavIcon,
  ExplorerNavIcon,
  ClockNavIcon,
  CalendarNavIcon,
} from "@/components/navigation-icons";

type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "explorer"
  | "plus_tard"
  | "abonnements"
  | "free_food"
  | "compose_dish"
  | "checkout";

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

import {
  INITIAL_GRID_DISHES,
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
  EXPLORER_CATEGORIES,
  PROMOTIONAL_CAROUSEL_SLIDES,
  DishItem,
  Restaurant,
  ScheduledDish,
  MealSubscription,
} from "@/lib/data/clicbouffe-data";

export default function ClicBouffePlatform() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // État Authentification, Portefeuille & Espace Restaurateur Dynamique
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<"marketplace" | "kds">("marketplace");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("clicbouffe_theme") as "light" | "dark" | null;
      if (savedTheme) return savedTheme;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  useEffect(() => {
    authService.getCurrentProfile().then((profile) => {
      if (profile) setCurrentUser(profile);
      setWalletBalance(authService.getWalletBalance());
    });
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    hapticFeedback("light");
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("clicbouffe_theme", next);
      }
      return next;
    });
  };

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

  // État Menu Flottant (Speed Dial FAB) & Scanner QR
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [scannedRestaurant, setScannedRestaurant] = useState<Restaurant | null>(null);
  const [showScannedRestaurantModal, setShowScannedRestaurantModal] = useState(false);

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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans select-none text-slate-900 dark:text-slate-100 transition-colors">
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
                alt="Logo ClicBouffe marmite avec curseur"
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
        <main className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col items-center justify-between p-6 sm:py-12 text-slate-900 dark:text-white transition-colors">
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-4">
                  <UtensilsCrossed className="w-12 h-12 text-[#00AFF2] mb-2" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Emplacement photo {onboardingIndex + 1}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight whitespace-pre-line leading-tight">
              {onboardingSteps[onboardingIndex].title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xs mt-4">
              {onboardingSteps[onboardingIndex].desc}
            </p>

            <div className="flex items-center justify-center gap-3 my-8">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    onboardingIndex === idx
                      ? "w-3 h-3 bg-[#00AFF2]"
                      : "w-2.5 h-2.5 border-2 border-black dark:border-slate-400 bg-transparent"
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
              className={`p-2 text-black dark:text-white transition-opacity ${
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
              className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-wider px-8 py-2.5 rounded-lg shadow-sm uppercase transition-all"
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
              className="p-2 text-black dark:text-white hover:text-[#00AFF2] transition-colors"
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-between transition-colors relative">
          {/* Contenu principal de la page (flouté doucement à l'ouverture du menu FAB) */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
              isFabMenuOpen ? "filter blur-[2px] opacity-40 pointer-events-none select-none" : "filter-none opacity-100"
            }`}
          >
            {/* Top Bar Responsive */}
          <header className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 pt-safe transition-colors">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  onClick={() => setScreen("home")}
                  className="flex items-center cursor-pointer select-none"
                >
                  <h1 className="text-xl sm:text-2xl font-black text-[#00AFF2] tracking-tight">
                    ClicBouffe
                  </h1>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs rounded-full border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-[#00AFF2] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                />
              </div>

              {/* Actions Droite : Portefeuille, Recherche, Notifications & Menu Latéral */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-slate-800 dark:text-slate-200">
                {/* Pilule Portefeuille Utilisateur (0 FCFA au départ ou solde réel) */}
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setShowWalletModal(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-sky-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all active:scale-95 group shadow-2xs"
                  title="Mon Portefeuille ClicBouffe (cliquez pour recharger)"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00AFF2] text-white flex items-center justify-center shrink-0">
                    <Wallet className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#00AFF2] transition-colors">
                    {formatFCFA(walletBalance)}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold text-[#00AFF2] bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded-full border border-sky-100 dark:border-slate-750">
                    +
                  </span>
                </button>

                {/* Si restaurateur, bouton rapide d'accès KDS */}
                {currentUser?.role === "restaurant_owner" && (
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setCurrentViewMode(currentViewMode === "kds" ? "marketplace" : "kds");
                    }}
                    className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      currentViewMode === "kds"
                        ? "bg-[#00AFF2] text-white"
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                    }`}
                  >
                    <ChefHat className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">
                      {currentViewMode === "kds" ? "Boutique" : "KDS"}
                    </span>
                  </button>
                )}

                {/* Si non connecté, bouton rapide Connexion */}
                {!currentUser && (
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setShowAuthModal(true);
                    }}
                    className="px-2.5 sm:px-3 py-1.5 bg-[#00AFF2] hover:bg-[#0098d4] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Connexion</span>
                  </button>
                )}

                {/* Notifications */}
                <button
                  onClick={() => setShowFreeFoodModal(true)}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 stroke-[1.8]" />
                  <span className="w-2 h-2 rounded-full bg-[#00AFF2] absolute top-1.5 right-1.5" />
                </button>

                {/* Recherche */}
                <button
                  onClick={() => setScreen("free_food")}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors"
                  aria-label="Recherche"
                >
                  <Search className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Menu Latéral (Hamburger) */}
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setShowSideDrawer(true);
                  }}
                  className="p-1.5 hover:text-[#00AFF2] transition-colors"
                  aria-label="Menu latéral"
                >
                  <MenuIcon className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>
          </header>

          {/* ============================================================== */}
          {/* VUE KDS RESTAURATEUR OU MARKETPLACE CLIENT */}
          {/* ============================================================== */}
          {currentViewMode === "kds" ? (
            <div className="flex-1 w-full">
              <RestaurantDashboard
                ownerId={currentUser?.id}
                onSwitchToClientMode={() => setCurrentViewMode("marketplace")}
                onSignOut={() => {
                  authService.signOut();
                  setCurrentUser(null);
                  setCurrentViewMode("marketplace");
                }}
              />
            </div>
          ) : (
            <>
              {/* ONGLET 1 : ACCUEIL */}
              {currentScreen === "home" && (
            <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4 pb-36 sm:pb-40 lg:pb-44">
              {/* Carrousel publicitaire automatique rotatif (Partenaires & Vendeurs) */}
              <PromoCarousel
                slides={PROMOTIONAL_CAROUSEL_SLIDES}
                onSelectSlide={(slide) => {
                  const targetDish =
                    INITIAL_GRID_DISHES.find((d) => d.name === slide.dishRefName) || INITIAL_GRID_DISHES[0];
                  setPreviewDish(targetDish);
                  setShowDishPreviewModal(true);
                }}
                onOrderDish={(dishRefName) => {
                  const targetDish =
                    INITIAL_GRID_DISHES.find((d) => d.name === dishRefName) || INITIAL_GRID_DISHES[0];
                  setSelectedDishes((prev) => [...prev, targetDish]);
                }}
              />

              {/* Titre section Plats */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Plats pouvant vous intéresser
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
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

              {/* Grille des plats authentiques, centrés, avec belles cartes adaptées au PC */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {displayedHomeDishes.slice(0, 6).map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setPreviewDish(dish);
                      setShowDishPreviewModal(true);
                    }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-2.5 flex flex-col justify-between text-left shadow-xs hover:shadow-md hover:border-[#00AFF2] dark:hover:border-[#00AFF2] transition-all group cursor-pointer relative"
                  >
                    {/* Conteneur d'image propre, centré, sans coupures sur PC */}
                    <div className="w-full h-24 sm:h-28 md:h-32 aspect-4/3 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
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
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00AFF2] transition-colors">
                          {dish.name}
                        </p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {dish.price}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticFeedback("medium");
                          setSelectedDishes((prev) => [...prev, dish]);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#00AFF2] group-hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shrink-0 shadow-2xs"
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
            <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4 pb-36 sm:pb-40">
              {/* En-tête Sous-région */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Sous-région : Akpakpa & Cotonou Est</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Restaurants & Maquis Disponibles
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Livraison directe chez vous au {deliveryAddress} (dès 80 FCFA)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    6 Ouverts maintenant
                  </span>
                </div>
              </div>

              {/* Filtres thématiques par catégorie (Icônes vectorielles professionnelles, zéro émoji) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                {EXPLORER_CATEGORIES.map((cat) => {
                  const Icon =
                    cat.iconName === "Utensils"
                      ? Utensils
                      : cat.iconName === "Soup"
                      ? Soup
                      : cat.iconName === "Flame"
                      ? Flame
                      : cat.iconName === "Sandwich"
                      ? Sandwich
                      : Beef;
                  const isSelected = selectedExplorerCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        hapticFeedback("light");
                        setSelectedExplorerCategory(cat.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#00AFF2] text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#00AFF2] dark:hover:border-[#00AFF2]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#00AFF2]"}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grille des restaurants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((restau) => (
                  <div
                    key={restau.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-[#00AFF2] dark:hover:border-[#00AFF2] transition-all flex flex-col group cursor-pointer"
                    onClick={() => {
                      hapticFeedback("light");
                      setScreen("free_food");
                    }}
                  >
                    {/* Photo du restaurant */}
                    <div className="h-36 sm:h-44 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-slate-900 dark:text-white text-xs font-bold shadow-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{restau.rating}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">({restau.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Détails du restaurant */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-[#00AFF2] transition-colors truncate">
                          {restau.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {restau.category} • {restau.distance}
                        </p>

                        {/* Plats phares */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {restau.popularDishes.slice(0, 3).map((dish) => (
                            <span
                              key={dish}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{restau.deliveryTime}</span>
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
            <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 pb-36 sm:pb-40">
              {/* En-tête */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <ClockNavIcon active className="w-4 h-4" />
                    <span>Planification des repas</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Plats Programmés pour Plus Tard
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                <div className="bg-gradient-to-r from-[#00AFF2]/10 via-[#00AFF2]/5 to-transparent dark:from-[#00AFF2]/20 dark:via-[#00AFF2]/10 dark:to-transparent rounded-2xl p-3 sm:p-4 border border-[#00AFF2]/20 dark:border-[#00AFF2]/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00AFF2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ClockNavIcon active className="w-5 h-5" cutoutColor="#00AFF2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Prochaine livraison programmée
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 truncate">
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
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 shrink-0">
                        <Image
                          src={item.img}
                          alt={item.dishName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#00AFF2]/15 text-[#00AFF2] text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#00AFF2]" />
                            <span>{item.scheduledDate} à {item.scheduledTime}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.portions} portion(s)
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                          {item.dishName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Restau : <span className="font-semibold text-slate-700 dark:text-slate-300">{item.restaurantName}</span>
                        </p>
                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                            &ldquo;{item.instructions}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2">
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {item.price}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            hapticFeedback("light");
                            alert(`Créneau modifié avec succès pour ${item.dishName} !`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Modifier créneau
                        </button>
                        <button
                          onClick={() => {
                            hapticFeedback("medium");
                            setScheduledDishes((prev) => prev.filter((d) => d.id !== item.id));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
              <div className="bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 transition-colors">
                <Info className="w-4 h-4 text-[#00AFF2] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Tarifs de livraison officiels pour vos commandes programmées :
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
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
            <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 pb-36 sm:pb-40">
              {/* En-tête */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2] uppercase tracking-wide">
                    <CalendarNavIcon active className="w-4 h-4" />
                    <span>Gestion des abonnements</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Mes Abonnements & Formules Repas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vos plats et restaurants réguliers livrés automatiquement à créneau fixe.
                  </p>
                </div>

                {/* Switcher Onglets Mes Abos vs Découvrir */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setActiveSubTab("active");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSubTab === "active"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 shrink-0">
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
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                                sub.status === "actif"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sub.status === "actif" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                }`}
                              />
                              <span>{sub.status === "actif" ? "Actif" : "En pause"}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {sub.renewalDate}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                            {sub.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {sub.targetName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Restau : <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.providerName}</span> • Créneau : <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.frequency} à {sub.scheduledTime}</span>
                          </p>

                          {sub.benefits && (
                            <ul className="mt-2 space-y-0.5">
                              {sub.benefits.map((b) => (
                                <li key={b} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-[#00AFF2]" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 gap-3">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
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
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {sub.status === "actif" ? "Mettre en pause" : "Reprendre"}
                          </button>
                          <button
                            onClick={() => {
                              hapticFeedback("light");
                              alert(`Options d'abonnement pour ${sub.title} modifiées !`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-md hover:border-[#00AFF2] dark:hover:border-[#00AFF2] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-[#00AFF2]/10 dark:bg-[#00AFF2]/20 text-[#00AFF2] text-[10px] font-bold">
                          {formula.badge}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                          {formula.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formula.description}
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-3">
                          {formula.price}
                        </p>
                        <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
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
          </>
          )}
          </div>

          {/* Barre Navigation Basse Pixel-Perfect avec FAB (+) morphing en (X) */}
          <nav
            className={`fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-16 flex items-center justify-around px-2 z-40 pb-safe transition-all duration-300 ${
              currentViewMode === "kds" ? "hidden" : ""
            }`}
          >
            {/* Zone de clic de fermeture sur la barre floutée */}
            {isFabMenuOpen && (
              <div
                className="absolute inset-0 z-40 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  hapticFeedback("light");
                  setIsFabMenuOpen(false);
                }}
              />
            )}

            <div className="max-w-lg w-full mx-auto flex items-center justify-around">
              {/* Accueil */}
              <button
                onClick={() => {
                  setActiveNavTab("home");
                  setScreen("home");
                }}
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                  isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95" : "filter-none opacity-100 scale-100"
                } ${activeNavTab === "home" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"}`}
              >
                <HomeNavIcon
                  active={activeNavTab === "home"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "home" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600 dark:text-slate-400"
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
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                  isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95" : "filter-none opacity-100 scale-100"
                } ${activeNavTab === "explorer" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"}`}
              >
                <ExplorerNavIcon
                  active={activeNavTab === "explorer"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "explorer" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Explorer
                </span>
              </button>

              {/* Bouton central (+) interactif avec morphing en (X) et Speed Dial progressif */}
              <div className="relative -top-5 flex flex-col items-center select-none z-50">
                {/* Options Speed Dial flottantes au-dessus du bouton central avec affichage progressif (Stagger) */}
                <div
                  className={`absolute bottom-16 sm:bottom-18 flex flex-col items-center gap-3.5 z-50 transition-all duration-200 ${
                    isFabMenuOpen ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  {/* Option 2 (Haut) : Composer - Apparition progressive décalée (Stagger #2: 150ms) */}
                  <div
                    className={`relative flex items-center justify-center w-12 sm:w-14 cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isFabMenuOpen
                        ? "translate-y-0 scale-100 opacity-100 delay-150"
                        : "translate-y-8 scale-50 opacity-0 delay-0 pointer-events-none"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback("medium");
                      setIsFabMenuOpen(false);
                      setScreen("compose_dish");
                    }}
                  >
                    <span
                      className={`absolute right-full mr-3.5 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg whitespace-nowrap select-none group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-all duration-300 ${
                        isFabMenuOpen
                          ? "translate-x-0 opacity-100 delay-175"
                          : "translate-x-3 opacity-0 delay-0"
                      }`}
                    >
                      Composer
                    </span>
                    <div
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform shrink-0"
                      title="Composer mon plat"
                    >
                      <ChefHat className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Option 1 (Bas) : Scanner QR - Apparition progressive immédiate (Stagger #1: 75ms) */}
                  <div
                    className={`relative flex items-center justify-center w-12 sm:w-14 cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isFabMenuOpen
                        ? "translate-y-0 scale-100 opacity-100 delay-75"
                        : "translate-y-4 scale-50 opacity-0 delay-0 pointer-events-none"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback("medium");
                      setIsFabMenuOpen(false);
                      setShowQrScannerModal(true);
                    }}
                  >
                    <span
                      className={`absolute right-full mr-3.5 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg whitespace-nowrap select-none group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-all duration-300 ${
                        isFabMenuOpen
                          ? "translate-x-0 opacity-100 delay-100"
                          : "translate-x-3 opacity-0 delay-0"
                      }`}
                    >
                      Scanner QR
                    </span>
                    <div
                      className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform shrink-0"
                      title="Scanner un QR code"
                    >
                      <QrCode className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>
                </div>

                {/* Bouton FAB circulaire unique animé en continu (+ <-> X) */}
                <button
                  type="button"
                  aria-label={isFabMenuOpen ? "Fermer les actions rapides" : "Ouvrir les actions rapides"}
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticFeedback("light");
                    setIsFabMenuOpen(!isFabMenuOpen);
                  }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl relative z-50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 cursor-pointer ${
                    isFabMenuOpen
                      ? "bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 ring-4 ring-black/10 dark:ring-white/10 scale-105"
                      : "bg-[#00AFF2] hover:bg-[#009bd6] ring-0 scale-100"
                  }`}
                >
                  <div
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isFabMenuOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.6]" />
                  </div>
                </button>
              </div>

              {/* Plus tard */}
              <button
                onClick={() => {
                  setActiveNavTab("plus_tard");
                  setScreen("plus_tard");
                }}
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                  isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95" : "filter-none opacity-100 scale-100"
                } ${activeNavTab === "plus_tard" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"}`}
              >
                <ClockNavIcon
                  active={activeNavTab === "plus_tard"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "plus_tard" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600 dark:text-slate-400"
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
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                  isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95" : "filter-none opacity-100 scale-100"
                } ${activeNavTab === "abonnements" ? "text-[#00AFF2]" : "text-slate-600 dark:text-slate-400 hover:text-[#00AFF2]"}`}
              >
                <CalendarNavIcon
                  active={activeNavTab === "abonnements"}
                  className="w-5 h-5 transition-transform active:scale-90"
                />
                <span
                  className={`text-[9px] transition-all ${
                    activeNavTab === "abonnements" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Abonnements
                </span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Voile de flou plein écran (Floute tout le contenu de page tout en laissant la barre de navigation visible et floutée) */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 ease-out ${
          isFabMenuOpen
            ? "bg-black/50 backdrop-blur-md opacity-100 pointer-events-auto"
            : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          hapticFeedback("light");
          setIsFabMenuOpen(false);
        }}
      />

      {/* ============================================================== */}
      {/* 4. MODALE BOUFFE GRATUITE (Capture 151714.jpg) */}
      {/* ============================================================== */}
      {showFreeFoodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs sm:max-w-sm p-6 relative shadow-2xl text-center animate-scaleUp border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setShowFreeFoodModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-black dark:text-white tracking-wider uppercase mt-1">
              BOUFFE GRATUITE
            </h3>

            <div className="my-5 flex flex-col items-center">
              <div className="relative w-28 h-24 flex items-center justify-center">
                <div className="w-20 h-20 bg-sky-50 dark:bg-sky-950/40 rounded-2xl flex items-center justify-center text-[#00AFF2] border border-sky-100 dark:border-sky-900/50">
                  <Gift className="w-12 h-12 stroke-[1.8]" />
                </div>
                <span className="absolute -top-1 -right-1 px-2.5 py-1 bg-[#00AFF2] text-white rounded-full text-[9px] font-black tracking-wide shadow-sm">
                  100% GRATUIT
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-2">
              Profitez d&apos;une bouffe 100% gratuite comme cadeau de bienvenu. Faites votre premier pas gratuitement dans un monde libre en civilisation culinaire.
            </p>

            <button
              onClick={() => {
                hapticFeedback("medium");
                setShowFreeFoodModal(false);
                setScreen("free_food");
              }}
              className="mt-6 w-full bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-wider"
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
          <header className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 pt-safe transition-colors">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button
                onClick={() => setScreen("home")}
                className="p-1 text-black dark:text-white hover:text-[#00AFF2]"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xs sm:text-sm font-black text-black dark:text-white uppercase tracking-tight">
                Choix de la bouffe gratuite
              </h2>
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-36 sm:pb-40">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
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
                          ? "border-[#00AFF2] bg-sky-50/20 dark:bg-sky-950/30 ring-2 ring-[#00AFF2]/30"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {dish.isFree && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 self-start ml-1 font-medium">
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
                        className="w-24 sm:w-28 h-24 sm:h-28 relative my-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                      >
                        {dish.img ? (
                          <Image
                            src={dish.img}
                            alt={dish.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-full py-1.5 px-1 rounded-b-xl transition-colors ${
                          isSelected
                            ? "bg-[#00AFF2] text-white"
                            : "bg-transparent text-slate-900 dark:text-white"
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
                  ? "bg-[#00AFF2] hover:bg-[#009bd6] text-white cursor-pointer"
                  : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs sm:max-w-sm p-6 relative shadow-2xl text-center animate-scaleUp border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setShowDeliveryRatesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-black dark:text-white tracking-wider uppercase mb-5">
              TARIF DE LIVRAISON
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Entre 1F et 200F</span>
                <span className="font-bold text-slate-900 dark:text-white">80 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Entre 03 et 05 plats</span>
                <span className="font-bold text-slate-900 dark:text-white">130 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Entre 06 et 10 plats</span>
                <span className="font-bold text-slate-900 dark:text-white">170 F CFA</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Plus de 10 plats</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratuit</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs sm:max-w-sm overflow-hidden shadow-2xl animate-scaleUp border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <div className="relative h-52 bg-slate-100 dark:bg-slate-800">
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
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{previewDish.name}</h3>
              <p className="text-base font-bold text-[#00AFF2] mt-1">{previewDish.price}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Préparé avec des ingrédients frais du terroir béninois selon la recette traditionnelle. Livré chaud et prêt à déguster chez vous à Akpakpa.
              </p>

              <button
                onClick={() => {
                  hapticFeedback("medium");
                  toggleSelectDish(previewDish);
                  setShowDishPreviewModal(false);
                }}
                className="mt-5 w-full py-3 bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm sm:max-w-md p-5 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#00AFF2] mb-1">
              <ClockNavIcon active className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Programmer un plat pour plus tard
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Choisissez le plat et l&apos;heure à laquelle vous souhaitez être livré.
            </p>

            <div className="space-y-3.5 text-xs">
              {/* Choix du plat */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                          ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg relative overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                        <Image src={d.img} alt={d.name} fill className="object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs truncate text-slate-900 dark:text-white">{d.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix du jour */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix de l'heure */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portions */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  4. Portions :
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSchedulePortions(Math.max(1, schedulePortions - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{schedulePortions}</span>
                  <button
                    type="button"
                    onClick={() => setSchedulePortions(schedulePortions + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  5. Instructions particulières (Optionnel) :
                </label>
                <input
                  type="text"
                  placeholder="Ex : sans piment, sauce à part..."
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-[#00AFF2]"
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
                className="w-full py-3 bg-[#00AFF2] text-white font-bold rounded-xl mt-3 hover:bg-[#0098d4] transition-all shadow-md uppercase tracking-wider text-xs"
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
          <header className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 pt-safe transition-colors">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("home")}
                  className="p-1 text-black dark:text-white hover:text-[#00AFF2]"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-black dark:text-white">Composer son plat</h2>
              </div>
              <span className="text-xs font-bold text-[#00AFF2]">Sur-mesure</span>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-36 sm:pb-40 text-xs sm:text-sm">
            {/* 1. Base */}
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">1. Choisir votre pâte / base (Obligatoire)</p>
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
                        ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.price} FCFA</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sauce */}
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">2. Choisir la sauce</p>
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
                        ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Protéines */}
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">3. Protéines / Garnitures</p>
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
                          ? "border-[#00AFF2] bg-sky-50/50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
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
              <p className="font-bold text-slate-900 dark:text-white mb-2">4. Suppléments (Optionnel)</p>
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
                          ? "border-[#00AFF2] bg-sky-50/50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
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

          <div className="fixed bottom-0 inset-x-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20 pb-safe transition-colors">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Total estimé :</span>
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
                className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md"
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
          <header className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 pt-safe transition-colors">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("free_food")}
                  className="p-1 text-slate-900 dark:text-white hover:text-[#00AFF2]"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Finalisation</h2>
              </div>
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950/50 text-[#00AFF2] rounded-full text-xs font-bold flex items-center gap-1">
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>0 F</span>
              </span>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-36 sm:pb-40">
            {/* Étape 1 : Plats */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
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
                <div className="p-4 bg-white dark:bg-slate-900 flex items-center gap-3 overflow-x-auto">
                  {selectedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="relative w-28 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs text-center p-1 bg-white dark:bg-slate-850"
                    >
                      <button
                        onClick={() => toggleSelectDish(dish)}
                        className="absolute top-1 right-1 z-10 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                        aria-label="Supprimer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="w-full h-16 relative my-1 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image
                          src={dish.img}
                          alt={dish.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{dish.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {dish.isFree && selectedDishes.findIndex((d) => d.id === dish.id) === 0
                          ? "0 F CFA (Offert)"
                          : dish.price}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => setScreen("free_food")}
                    className="w-20 h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-[#00AFF2] hover:text-[#00AFF2] shrink-0 text-xs gap-1"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Étape 2 : Destinataire */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 2 ? 3 : 2)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] font-black">
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
                <div className="p-4 bg-white dark:bg-slate-900 space-y-2 text-xs">
                  {["Moi seul(e)", "Offrir à un proche", "Groupe d'amis"].map((r) => (
                    <div
                      key={r}
                      onClick={() => {
                        hapticFeedback("light");
                        setRecipient(r);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        recipient === r
                          ? "border-[#00AFF2] bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300"
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
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 3 ? 1 : 3)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] font-black">
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
                <div className="p-4 bg-white dark:bg-slate-900 space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Adresse de livraison à Akpakpa :
                    </label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <MapPin className="w-4 h-4 text-[#00AFF2]" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{deliveryAddress}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Mode de paiement sécurisé :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 border-2 border-[#00AFF2] bg-sky-50/40 dark:bg-sky-950/40 rounded-xl text-center font-bold text-slate-900 dark:text-white cursor-pointer">
                        <p className="text-xs">MTN / Moov Money</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Instantané (Bénin)
                        </p>
                      </div>
                      <div className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-center font-bold text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer">
                        <p className="text-xs">Paiement à la livraison</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Espèces au livreur</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Récapitulatif Tarifaire Officiel */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sous-total plats ({cartItemsCount})</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatFCFA(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
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
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? "Gratuit" : formatFCFA(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total à payer</span>
                <span className="text-[#00AFF2] text-base font-black">
                  {formatFCFA(cartTotal)}
                </span>
              </div>
            </div>
          </main>

          <div className="fixed bottom-0 inset-x-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20 pb-safe transition-colors">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Montant net :</span>
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
                className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-md flex items-center gap-2"
              >
                <span>Confirmer commande</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Modale Succès Commande */}
          {orderConfirmed && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs sm:max-w-sm p-6 text-center shadow-2xl animate-scaleUp border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Commande Confirmée !
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Votre commande a été transmise aux restaurateurs partenaires d&apos;Akpakpa. Un livreur ClicBouffe se met en route dès que les plats sont chauds.
                </p>
                <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Livraison : {deliveryAddress}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">Total : {formatFCFA(cartTotal)}</p>
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

      {/* Modale d'Authentification & Création de Compte Dynamique */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          if (profile.role === "restaurant_owner") {
            setCurrentViewMode("kds");
          }
        }}
      />

      {/* Menu Latéral Coulissant (Side Drawer) */}
      <SideDrawer
        isOpen={showSideDrawer}
        onClose={() => setShowSideDrawer(false)}
        currentUser={currentUser}
        walletBalance={walletBalance}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={() => {
          authService.signOut();
          setCurrentUser(null);
          setCurrentViewMode("marketplace");
        }}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenDeliveryRates={() => setShowDeliveryRatesModal(true)}
        onNavigateToScreen={(scr) => setScreen(scr)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentViewMode={currentViewMode}
        onToggleViewMode={() =>
          setCurrentViewMode((prev) => (prev === "marketplace" ? "kds" : "marketplace"))
        }
      />

      {/* Modale de Recharge Portefeuille */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        walletBalance={walletBalance}
        onBalanceUpdated={(newBal) => setWalletBalance(newBal)}
      />

      {/* Modale Scanner QR Code (Table ou Plat) */}
      <QrScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onScanDish={(dish) => {
          setPreviewDish(dish);
          setShowDishPreviewModal(true);
        }}
        onScanRestaurant={(restaurant) => {
          setScannedRestaurant(restaurant);
          setShowScannedRestaurantModal(true);
        }}
      />

      {/* Modale Menu Restaurant Scanné par QR Code */}
      <ScannedRestaurantModal
        isOpen={showScannedRestaurantModal}
        restaurant={scannedRestaurant}
        onClose={() => setShowScannedRestaurantModal(false)}
        selectedDishes={selectedDishes}
        onToggleDish={toggleSelectDish}
        onGoToExplorer={() => {
          setActiveNavTab("explorer");
          setScreen("explorer");
        }}
      />
    </div>
  );
}
