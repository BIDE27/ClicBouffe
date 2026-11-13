"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Gift,
  Home,
  Info,
  MapPin,
  Menu as MenuIcon,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";

export type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "free_food"
  | "compose_dish"
  | "checkout";

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

interface DishItem {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: number;
  img: string;
  isFree?: boolean;
}

const INITIAL_GRID_DISHES: DishItem[] = [
  { id: "1", name: "Pâte noire", price: "2 000 FCFA", priceNum: 2000, originalPrice: 200, img: "/images/dish_pate_noire.png", isFree: true },
  { id: "2", name: "Tapioca chaud", price: "100 FCFA", priceNum: 100, originalPrice: 100, img: "/images/dish_tapioca.png", isFree: true },
  { id: "3", name: "Chawarma", price: "1 000 FCFA", priceNum: 1000, originalPrice: 1000, img: "/images/dish_chawarma.png", isFree: false },
  { id: "4", name: "Pâte blanche", price: "200 FCFA", priceNum: 200, originalPrice: 200, img: "/images/dish_pate_blanche.png", isFree: true },
  { id: "5", name: "Gari au lait", price: "200 FCFA", priceNum: 200, originalPrice: 200, img: "/images/dish_gari.png", isFree: true },
  { id: "6", name: "Pâte rouge", price: "1 000 FCFA", priceNum: 1000, originalPrice: 200, img: "/images/dish_pate_rouge.png", isFree: true },
  { id: "7", name: "Riz au gras", price: "1 000 FCFA", priceNum: 1000, originalPrice: 1000, img: "/images/onboarding_2.png", isFree: false },
  { id: "8", name: "Amberger", price: "5 000 FCFA", priceNum: 5000, originalPrice: 5000, img: "/images/amberger_banner.png", isFree: false },
];

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

  // Paramètres de commande & Finalisation
  const [expandedStep, setExpandedStep] = useState<1 | 2 | 3>(1);
  const [deliveryAddress, setDeliveryAddress] = useState("Terrain Zico, Akpakpa");
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

  // Grille officielle : 1-2 = 80 FCFA, 3-5 = 130 FCFA, 6-10 = 170 FCFA, >10 = Gratuit
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

  // Toggle sélection d'un plat
  const toggleSelectDish = (dish: DishItem) => {
    hapticFeedback("light");
    setSelectedDishes((prev) => {
      const exists = prev.some((d) => d.id === dish.id);
      if (exists) {
        return prev.filter((d) => d.id !== dish.id);
      } else {
        return [...prev, dish];
      }
    });
  };

  // Composer son plat total
  const composeTotal =
    composeBasePrice +
    composeProteins.reduce((acc, p) => acc + (p === "Poisson braisé" ? 1000 : 1200), 0) +
    composeExtras.reduce((acc) => acc + 400, 0);

  // Filtrage des plats
  const displayedHomeDishes = INITIAL_GRID_DISHES.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Logo vectoriel officiel extrait du fichier PSD avec son curseur central */}
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
            {/* Section visuelle des 3 plats en triangle */}
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

            {/* Titre Pixel-Perfect */}
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight whitespace-pre-line leading-tight">
              {onboardingSteps[onboardingIndex].title}
            </h2>

            {/* Description Pixel-Perfect */}
            <p className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed max-w-sm px-2">
              {onboardingSteps[onboardingIndex].desc}
            </p>
          </div>

          {/* Pagination & Contrôles */}
          <div className="w-full max-w-md pb-4 pt-6">
            {/* 3 Dots */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setOnboardingIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    onboardingIndex === idx
                      ? "bg-[#00AFF2] border-[#00AFF2] scale-110"
                      : "bg-white border-slate-800"
                  }`}
                  aria-label={`Étape ${idx + 1}`}
                />
              ))}
            </div>

            {/* Barre de navigation basse */}
            <div className="flex items-center justify-between h-12 px-2">
              {/* Flèche gauche */}
              <div className="w-10 flex items-center">
                {onboardingIndex > 0 ? (
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setOnboardingIndex(onboardingIndex - 1);
                    }}
                    className="p-1 text-black hover:opacity-70 active:scale-95 transition-transform"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>

              {/* Bouton central (SAUTER / COMMENCER) */}
              <button
                onClick={() => {
                  hapticFeedback("medium");
                  setScreen("home");
                  setTimeout(() => setShowFreeFoodModal(true), 800);
                }}
                className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-8 py-2.5 rounded-lg text-xs font-bold tracking-wider shadow-sm transition-all uppercase"
              >
                {onboardingIndex === 2 ? "COMMENCER" : "SAUTER"}
              </button>

              {/* Flèche droite */}
              <div className="w-10 flex items-center justify-end">
                {onboardingIndex < 2 ? (
                  <button
                    onClick={() => {
                      hapticFeedback("light");
                      setOnboardingIndex(onboardingIndex + 1);
                    }}
                    className="p-1 text-black hover:opacity-70 active:scale-95 transition-transform"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="w-8 h-8 stroke-[2.5]" />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 3. ÉCRAN PRINCIPAL D'ACCUEIL (Capture 151615.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "home" && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          {/* Top Bar Responsive */}
          <header className="p-4 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 pt-safe">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-[#00AFF2] tracking-tight">
                  ClicBouffe
                </h1>
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#00AFF2]" />
                  <span>{deliveryAddress}</span>
                </div>
              </div>

              {/* Barre de recherche sur grand écran */}
              <div className="hidden md:flex flex-1 max-w-sm relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, une pâte..."
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

          {/* Contenu Scrollable Principal */}
          <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4 pb-28">
            {/* Bannière Carrousel Amberger */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-hidden">
              <div className="w-8 sm:w-16 h-32 sm:h-44 rounded-2xl bg-slate-100 shrink-0 opacity-40 border" />
              <div
                onClick={() => setScreen("free_food")}
                className="flex-1 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:border-[#00AFF2] transition-all"
              >
                <div className="h-28 sm:h-44 bg-black relative flex items-center justify-center">
                  <Image
                    src="/images/amberger_banner.png"
                    alt="Amberger Signature"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-2.5 sm:p-4 text-center bg-white border-t border-slate-100">
                  <p className="text-xs sm:text-base font-bold text-slate-900">Amberger</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">5 000 FCFA</p>
                </div>
              </div>
              <div className="w-8 sm:w-16 h-32 sm:h-44 rounded-2xl bg-slate-100 shrink-0 opacity-40 border" />
            </div>

            {/* Titre section */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Plats pouvant vous intéresser
              </p>
              <button
                onClick={() => setScreen("free_food")}
                className="text-xs font-bold text-[#00AFF2] hover:underline"
              >
                Tout voir &gt;
              </button>
            </div>

            {/* Grille des plats (3 colonnes mobile, 4-6 colonnes desktop) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
              {displayedHomeDishes.slice(0, 6).map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => {
                    hapticFeedback("light");
                    setPreviewDish(dish);
                    setShowDishPreviewModal(true);
                  }}
                  className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-col items-center justify-between text-center shadow-xs cursor-pointer hover:border-[#00AFF2] hover:shadow-md transition-all"
                >
                  <div className="w-full h-16 sm:h-24 relative my-1 flex items-center justify-center">
                    {dish.img ? (
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="w-full pt-1.5 border-t border-slate-100">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-900 truncate">
                      {dish.name}
                    </p>
                    <p className="text-[9px] sm:text-[11px] font-semibold text-slate-700">
                      {dish.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Barre Navigation Basse Pixel-Perfect avec FAB (+) Composer plat */}
          <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-2 z-30 pb-safe">
            <div className="max-w-lg w-full mx-auto flex items-center justify-around">
              <button
                onClick={() => setScreen("home")}
                className="flex flex-col items-center gap-0.5 text-[#00AFF2]"
              >
                <Home className="w-5 h-5 stroke-[2]" />
                <span className="text-[9px] font-bold">Accueil</span>
              </button>
              <button
                onClick={() => setScreen("free_food")}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#00AFF2]"
              >
                <Compass className="w-5 h-5 stroke-[2]" />
                <span className="text-[9px]">Explorer</span>
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

              <button
                onClick={() => setShowDeliveryRatesModal(true)}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#00AFF2]"
              >
                <Clock className="w-5 h-5 stroke-[2]" />
                <span className="text-[9px]">Plus tard</span>
              </button>
              <button
                onClick={() => setScreen("checkout")}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#00AFF2]"
              >
                <Calendar className="w-5 h-5 stroke-[2]" />
                <span className="text-[9px]">Abonnements</span>
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

            {/* Illustration Cadeau + Badge 100% GRATUIT */}
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
          {/* Header */}
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

          {/* Corps de page */}
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

            {/* Grille des plats (2 colonnes mobile, 4 colonnes desktop) */}
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
                        className="w-24 sm:w-28 h-24 sm:h-28 relative my-1 flex items-center justify-center"
                      >
                        {dish.img ? (
                          <Image
                            src={dish.img}
                            alt={dish.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Footer carte (Cyan si sélectionné) */}
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

            {/* Lien Voir plus de bouffes */}
            <div className="text-center pt-4">
              <button
                onClick={() => setShowMoreDishes(!showMoreDishes)}
                className="text-xs font-semibold text-[#00AFF2] underline hover:opacity-80"
              >
                {showMoreDishes ? "Voir moins de bouffes" : "Voir plus de bouffes"}
              </button>
            </div>
          </main>

          {/* Bouton Flottant Total (0 F CFA (1) -> Finalisation) */}
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
                <div className="w-full h-full flex items-center justify-center">
                  <Utensils className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent p-3.5 flex justify-between text-white text-xs font-bold">
                <span>{previewDish.name}</span>
                <span>{previewDish.price}</span>
              </div>
            </div>

            {/* Barre d'action sombre #333333 */}
            <div className="bg-[#333333] p-3.5 flex items-center justify-around text-xs font-bold text-[#00AFF2]">
              <button
                onClick={() => {
                  hapticFeedback("success");
                  if (!selectedDishes.some((d) => d.id === previewDish.id)) {
                    setSelectedDishes([...selectedDishes, previewDish]);
                  }
                  setShowDishPreviewModal(false);
                  setScreen("free_food");
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span>Ajouter</span>
                <span className="w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </button>
              <div className="w-[1px] h-4 bg-white/20" />
              <button
                onClick={() => {
                  setShowDishPreviewModal(false);
                  setShowDeliveryRatesModal(true);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span>À propos</span>
                <span className="w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center">
                  <Info className="w-3 h-3 stroke-[3]" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. ÉCRAN COMPOSER SON PLAT */}
      {/* ============================================================== */}
      {currentScreen === "compose_dish" && (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between">
          <header className="p-4 border-b border-slate-100 sticky top-0 bg-white z-20 pt-safe">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <button
                onClick={() => setScreen("home")}
                className="p-1 text-black hover:text-[#00AFF2]"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-black">Composer son plat sur-mesure</h2>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-28 text-xs sm:text-sm">
            <div className="p-3 bg-sky-50 rounded-2xl text-[#00AFF2] font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Composez votre plat préféré avec votre base, sauce et viande locale !</span>
            </div>

            {/* 1. Base */}
            <div>
              <p className="font-bold text-slate-900 mb-2">1. Choisissez votre base (Obligatoire)</p>
              <div className="space-y-2">
                {[
                  { name: "Pâte noire", price: 500 },
                  { name: "Pâte blanche (Akassa)", price: 400 },
                  { name: "Pâte rouge (Amiwo)", price: 600 },
                  { name: "Riz au gras", price: 800 },
                ].map((b) => (
                  <div
                    key={b.name}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeBase(b.name);
                      setComposeBasePrice(b.price);
                    }}
                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
                      composeBase === b.name
                        ? "border-[#00AFF2] bg-sky-50/50 text-[#00AFF2] font-bold"
                        : "border-slate-200"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span>{b.price} FCFA</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sauce */}
            <div>
              <p className="font-bold text-slate-900 mb-2">2. Choisissez votre sauce (Obligatoire)</p>
              <div className="space-y-2">
                {["Sauce Gombo", "Sauce Tomate fraîche", "Sauce Légumes (Gboma)"].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeSauce(s);
                    }}
                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
                      composeSauce === s
                        ? "border-[#00AFF2] bg-sky-50/50 text-[#00AFF2] font-bold"
                        : "border-slate-200"
                    }`}
                  >
                    <span>{s}</span>
                    {composeSauce === s && <Check className="w-4 h-4 text-[#00AFF2]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Protéines */}
            <div>
              <p className="font-bold text-slate-900 mb-2">3. Viande ou Poisson</p>
              <div className="space-y-2">
                {[
                  { name: "Poisson braisé", price: 1000 },
                  { name: "Poulet bicyclette", price: 1500 },
                  { name: "Fromage local (Wagashi)", price: 500 },
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
                  { name: "Alloco", price: 400 },
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

          {/* Footer Total & Valider */}
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
                      img: "/images/dish_pate_noire.png",
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
      {/* 9. ÉCRAN FINALISATION / CHECKOUT (Capture 152446.jpg) */}
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
            {/* Étape 1 : Plats (Bleu Déplié par défaut) */}
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
                      <div className="w-full h-16 relative my-1">
                        <Image
                          src={dish.img}
                          alt={dish.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="bg-[#00AFF2] text-white py-1 px-0.5 rounded-b-lg">
                        <p className="text-[10px] font-bold truncate">{dish.name}</p>
                        <p className="text-[9px] line-through opacity-80">{dish.price}</p>
                      </div>
                    </div>
                  ))}

                  {/* Bouton (+) Ajouter */}
                  <div
                    onClick={() => setScreen("free_food")}
                    className="w-24 h-28 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-[#00AFF2] hover:text-[#00AFF2] cursor-pointer transition-colors"
                  >
                    <Plus className="w-6 h-6 stroke-[2]" />
                    <span className="text-[10px] font-bold mt-1">Ajouter</span>
                  </div>
                </div>
              )}
            </div>

            {/* Étape 2 : Lieu de livraison (Replié/Dépliable) */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 2 ? 1 : 2)}
                className="bg-slate-100 p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Lieu de livraison :</span>
                    <MapPin className="w-3.5 h-3.5 text-[#00AFF2]" />
                    <span className="text-slate-900">{deliveryAddress}</span>
                  </div>
                </div>
                {expandedStep === 2 ? (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>

              {expandedStep === 2 && (
                <div className="p-4 bg-white space-y-2 text-xs sm:text-sm">
                  <p className="font-semibold text-slate-700">Sélectionnez votre quartier :</p>
                  {[
                    "Terrain Zico, Akpakpa",
                    "Haie Vive, Cotonou",
                    "Fidjrossè Calvaire",
                    "Cadjehoun",
                  ].map((loc) => (
                    <div
                      key={loc}
                      onClick={() => {
                        hapticFeedback("light");
                        setDeliveryAddress(loc);
                        setExpandedStep(3);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${
                        deliveryAddress === loc
                          ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                          : "border-slate-200"
                      }`}
                    >
                      <span>{loc}</span>
                      {deliveryAddress === loc && <Check className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Étape 3 : Destinataires (Replié/Dépliable) */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 3 ? 1 : 3)}
                className="bg-slate-100 p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[11px] font-bold">
                    3
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Destinataires :</span>
                    <Users className="w-3.5 h-3.5 text-[#00AFF2]" />
                    <span className="text-slate-900">{recipient}</span>
                  </div>
                </div>
                {expandedStep === 3 ? (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>

              {expandedStep === 3 && (
                <div className="p-4 bg-white space-y-2 text-xs sm:text-sm">
                  <p className="font-semibold text-slate-700">Pour qui commandez-vous ?</p>
                  {["Moi seul(e)", "Un ami / Collègue", "Groupe de personnes"].map((rec) => (
                    <div
                      key={rec}
                      onClick={() => {
                        hapticFeedback("light");
                        setRecipient(rec);
                        setExpandedStep(1);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${
                        recipient === rec
                          ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                          : "border-slate-200"
                      }`}
                    >
                      <span>{rec}</span>
                      {recipient === rec && <Check className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Récapitulatif Tarifaire */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total plats ({cartItemsCount}) :</span>
                <span>{cartSubtotal} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison :</span>
                <span className={deliveryFee === 0 ? "font-bold text-emerald-600" : ""}>
                  {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} FCFA`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm sm:text-base text-slate-900">
                <span>Total à payer :</span>
                <span className="text-[#00AFF2]">{cartTotal} FCFA</span>
              </div>
            </div>

            {orderConfirmed && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800 animate-fadeIn">
                <Check className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold text-sm sm:text-base">Commande validée avec succès !</p>
                <p className="text-xs sm:text-sm">
                  Votre repas sera livré à <span className="font-bold">{deliveryAddress}</span> sous 20 minutes.
                </p>
              </div>
            )}
          </main>

          {/* Bouton de confirmation */}
          <div className="fixed bottom-0 inset-x-0 p-3 bg-white border-t border-slate-200 z-20 pb-safe">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => {
                  hapticFeedback("success");
                  setOrderConfirmed(true);
                }}
                disabled={selectedDishes.length === 0 || orderConfirmed}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                  orderConfirmed
                    ? "bg-emerald-600 text-white"
                    : "bg-[#00AFF2] hover:bg-[#009bd6] text-white shadow-[#00AFF2]/30"
                }`}
              >
                {orderConfirmed
                  ? "Commande envoyée avec succès ✓"
                  : `Confirmer et Commander (${cartTotal} FCFA)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
