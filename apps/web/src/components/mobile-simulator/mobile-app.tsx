"use client";

import React, { useState, useEffect } from "react";
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
  | "free_food"
  | "compose_dish"
  | "checkout";

export interface MobileAppProps {
  forcedScreen?: Screen;
  onScreenChange?: (screen: Screen) => void;
  className?: string;
}

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

export default function MobileApp({
  forcedScreen,
  onScreenChange,
  className = "",
}: MobileAppProps) {
  const [internalScreen, setInternalScreen] = useState<Screen>(forcedScreen || "splash");
  const currentScreen = forcedScreen ?? internalScreen;
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Modales
  const [showFreeFoodModal, setShowFreeFoodModal] = useState(false);
  const [showDeliveryRatesModal, setShowDeliveryRatesModal] = useState(false);
  const [showDishPreviewModal, setShowDishPreviewModal] = useState(false);
  const [previewDish, setPreviewDish] = useState<DishItem | null>(null);

  // Sélection de plats
  const [selectedDishes, setSelectedDishes] = useState<DishItem[]>([
    INITIAL_GRID_DISHES[0], // Pâte noire sélectionnée par défaut
  ]);
  const [showMoreDishes, setShowMoreDishes] = useState(false);

  // Onglet actif de navigation basse
  const [activeNavTab, setActiveNavTab] = useState<"home" | "explorer" | "plus_tard" | "abonnements">("home");

  // Accordéons finalisation
  const [expandedStep, setExpandedStep] = useState<1 | 2 | 3>(1);
  const [deliveryAddress, setDeliveryAddress] = useState("Terrain Zico");
  const [recipient, setRecipient] = useState("Moi seul(e)");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Composer son plat
  const [composeBase, setComposeBase] = useState("Pâte noire");
  const [composeBasePrice, setComposeBasePrice] = useState(500);
  const [composeSauce, setComposeSauce] = useState("Sauce Gombo");
  const [composeProteins, setComposeProteins] = useState<string[]>(["Poisson braisé"]);
  const [composeExtras, setComposeExtras] = useState<string[]>([]);

  const setScreen = React.useCallback(
    (s: Screen) => {
      hapticFeedback("light");
      setInternalScreen(s);
      if (onScreenChange) onScreenChange(s);
    },
    [onScreenChange]
  );

  // Redirection automatique Splash vers Onboarding
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setScreen("onboarding");
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, setScreen]);

  // Onboarding screens configuration
  const onboardingSteps = [
    {
      title: "Des plats familiers",
      desc: "Composez à votre convenance des plats que vous avez l'habitude de manger chez vous et qui ne sont pas forcément accessibles dans les restaurants.",
      img: "/images/onboarding_1.png",
      items: ["Pâte noire traditionnelle", "Riz aux haricots", "Tapioca au lait crémeux"],
    },
    {
      title: "Des plats courants",
      desc: "Des plats plus ou moins bourgeois que vous trouvez souvent dans les restaurants ou que vous cuisinez à la maison.",
      img: "/images/onboarding_2.png",
      items: ["Riz au gras poisson", "Pâte rouge poulet", "Sauce graine amala"],
    },
    {
      title: "Des plats soutenus\net exotiques",
      desc: "Des plats bourgeois que vous et votre famille mangez pour votre plaisir.",
      img: "/images/onboarding_3.png",
      items: ["Amberger Gourmet", "Chawarma Royal", "Pizza au feu de bois"],
    },
  ];

  // Calcul des totaux et des frais de livraison (grille officielle)
  const cartItemsCount = selectedDishes.length;
  const cartSubtotal = selectedDishes.reduce((acc, dish) => {
    // Si c'est le 1er plat gratuit, prix = 0, sinon prix normal
    if (dish.isFree && selectedDishes.findIndex((d) => d.id === dish.id) === 0) {
      return acc + 0;
    }
    return acc + dish.priceNum;
  }, 0);

  // Grille officielle : 1-2 plats = 80 FCFA, 3-5 = 130 FCFA, 6-10 = 170 FCFA, >10 = 0 FCFA
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
        // Garde au moins un plat ou vide
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

  return (
    <div
      className={`w-full h-full bg-white select-none relative overflow-hidden flex flex-col text-slate-900 font-sans ${className}`}
    >
      {/* ============================================================== */}
      {/* 1. ÉCRAN SPLASH SCREEN (Capture d’écran 2026-10-20 150947.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "splash" && (
        <div
          onClick={() => setScreen("onboarding")}
          className="w-full h-full bg-[#00AFF2] flex flex-col items-center justify-center p-6 cursor-pointer relative"
        >
          {/* Logo vectoriel officiel extrait du PSD avec son curseur central */}
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-44 h-40 flex items-center justify-center">
              <Image
                src="/images/logo_splash.png"
                alt="ClicBouffe Logo"
                width={180}
                height={165}
                priority
                className="object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight mt-3 drop-shadow-sm font-sans">
              ClicBouffe
            </h1>
          </div>

          {/* Bouton discret passer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScreen("onboarding");
            }}
            className="absolute bottom-10 text-xs text-white/80 font-medium tracking-wide hover:text-white transition-opacity"
          >
            Passer l&apos;introduction &gt;
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ÉCRANS ONBOARDING (Captures 151155, 151227, 151522.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "onboarding" && (
        <div className="w-full h-full bg-white flex flex-col justify-between p-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-2">
            {/* Section visuelle des 3 plats en triangle */}
            <div className="relative w-72 h-52 mb-6 flex items-center justify-center">
              {onboardingSteps[onboardingIndex].img ? (
                <Image
                  src={onboardingSteps[onboardingIndex].img}
                  alt={onboardingSteps[onboardingIndex].title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                /* Placeholder stylisé si l'image est en cours de chargement */
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-4">
                  <UtensilsCrossed className="w-12 h-12 text-[#00AFF2] mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">
                    Emplacement photo {onboardingIndex + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Titre Pixel-Perfect */}
            <h2 className="text-2xl font-black text-black tracking-tight whitespace-pre-line leading-tight">
              {onboardingSteps[onboardingIndex].title}
            </h2>

            {/* Description Pixel-Perfect */}
            <p className="text-xs text-slate-700 mt-3 leading-relaxed max-w-xs px-2">
              {onboardingSteps[onboardingIndex].desc}
            </p>
          </div>

          {/* Pagination à 3 points & Barre de navigation basse */}
          <div className="pb-4">
            {/* Dots */}
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
                  setTimeout(() => setShowFreeFoodModal(true), 700);
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ÉCRAN ACCUEIL (Capture d’écran 2026-10-20 151615.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "home" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header TopBar */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10 pt-safe">
            <div
              onClick={() => setScreen("home")}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Image
                src="/images/cursor_icon.png"
                alt="Logo ClicBouffe"
                width={22}
                height={22}
                priority
                className="w-5 h-5 object-contain"
              />
              <h1 className="text-xl font-black text-[#00AFF2] tracking-tight">ClicBouffe</h1>
            </div>
            <div className="flex items-center gap-3 text-slate-800">
              <button
                onClick={() => setShowFreeFoodModal(true)}
                className="p-1 hover:text-[#00AFF2] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
                <span className="w-2 h-2 rounded-full bg-[#00AFF2] absolute top-1 right-1" />
              </button>
              <button
                onClick={() => setScreen("free_food")}
                className="p-1 hover:text-[#00AFF2] transition-colors"
                aria-label="Recherche"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button
                onClick={() => setShowDeliveryRatesModal(true)}
                className="p-1 hover:text-[#00AFF2] transition-colors"
                aria-label="Menu"
              >
                <MenuIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Contenu Scrollable */}
          <div className="flex-1 p-3 space-y-3 pb-24">
            {/* Bannière Carrousel Amberger */}
            <div className="flex items-center gap-2 overflow-x-hidden">
              <div className="w-8 h-32 rounded-xl bg-slate-100 shrink-0 opacity-40 border" />
              <div
                onClick={() => setScreen("free_food")}
                className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:border-[#00AFF2] transition-all"
              >
                <div className="h-28 bg-black relative flex items-center justify-center">
                  <Image
                    src="/images/amberger_banner.png"
                    alt="Amberger"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2 text-center bg-white border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Amberger</p>
                  <p className="text-xs font-semibold text-slate-700">5 000 FCFA</p>
                </div>
              </div>
              <div className="w-8 h-32 rounded-xl bg-slate-100 shrink-0 opacity-40 border" />
            </div>

            {/* Titre section */}
            <p className="text-[11px] font-medium text-slate-700 pt-1">
              Plats pouvant vous intéresser
            </p>

            {/* Grille 6 plats (3 colonnes x 2 rangées) */}
            <div className="grid grid-cols-3 gap-2">
              {INITIAL_GRID_DISHES.slice(0, 6).map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => {
                    hapticFeedback("light");
                    setPreviewDish(dish);
                    setShowDishPreviewModal(true);
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-col items-center justify-between text-center shadow-xs cursor-pointer hover:border-[#00AFF2] transition-all"
                >
                  <div className="w-full h-16 relative my-1 flex items-center justify-center">
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
                  <div className="w-full pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-900 truncate">{dish.name}</p>
                    <p className="text-[9px] font-semibold text-slate-700">{dish.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre Navigation Basse Pixel-Perfect avec FAB (+) Composer plat */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-20 pb-safe">
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
                setScreen("free_food");
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

            {/* Bouton central surélevé (+) Composer plat */}
            <div
              className="relative -top-5 flex flex-col items-center cursor-pointer"
              onClick={() => {
                hapticFeedback("medium");
                setScreen("compose_dish");
              }}
            >
              <div className="w-12 h-12 bg-[#00AFF2] rounded-full flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/40 hover:scale-105 active:scale-95 transition-transform">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-bold text-black mt-1">Composer plat</span>
            </div>

            {/* Plus tard */}
            <button
              onClick={() => {
                setActiveNavTab("plus_tard");
                setShowDeliveryRatesModal(true);
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
                setScreen("checkout");
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALE BOUFFE GRATUITE (Capture d’écran 2026-10-20 151714.jpg) */}
      {/* ============================================================== */}
      {showFreeFoodModal && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 relative shadow-xl text-center animate-scaleUp">
            <button
              onClick={() => setShowFreeFoodModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-black tracking-wider uppercase mt-1">
              BOUFFE GRATUITE
            </h3>

            {/* Illustration Cadeau + Badge 100% GRATUIT */}
            <div className="my-4 flex flex-col items-center">
              <div className="relative w-28 h-24 flex items-center justify-center">
                <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center text-[#00AFF2] border border-sky-100">
                  <Gift className="w-12 h-12 stroke-[1.8]" />
                </div>
                {/* Badge Rosette */}
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
              className="mt-5 w-full bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Profiter
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ÉCRAN CHOIX BOUFFE GRATUITE (Captures 151956, 152219, 152335, 152403) */}
      {/* ============================================================== */}
      {currentScreen === "free_food" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100 sticky top-0 bg-white z-10 pt-safe">
            <button
              onClick={() => setScreen("home")}
              className="p-1 hover:text-[#00AFF2]"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight">
              Choix de la bouffe gratuite
            </h2>
          </div>

          {/* Explications & Lien tarifs */}
          <div className="p-4 space-y-3 pb-28">
            <p className="text-xs text-slate-700 leading-relaxed">
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

            {/* Grille 2 colonnes des plats gratuits / sélectionnables */}
            <div className="grid grid-cols-2 gap-3 pt-1">
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
                        <span className="text-[10px] text-slate-400 self-start ml-1">Gratuit</span>
                      )}

                      {/* Photo cliquable pour voir l'aperçu */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticFeedback("light");
                          setPreviewDish(dish);
                          setShowDishPreviewModal(true);
                        }}
                        className="w-24 h-24 relative my-1 flex items-center justify-center"
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

                      {/* Footer de carte (devient bleu si sélectionné) */}
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
            <div className="text-center pt-3">
              <button
                onClick={() => setShowMoreDishes(!showMoreDishes)}
                className="text-xs font-medium text-[#00AFF2] underline hover:opacity-80"
              >
                {showMoreDishes ? "Voir moins de bouffes" : "Voir plus de bouffes"}
              </button>
            </div>
          </div>

          {/* Bouton Flottant Total (ex: 0 F CFA (1) -> Envoi) */}
          <div className="fixed bottom-4 right-4 z-20 pb-safe">
            <button
              onClick={() => {
                if (selectedDishes.length > 0) {
                  hapticFeedback("medium");
                  setScreen("checkout");
                }
              }}
              disabled={selectedDishes.length === 0}
              className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                selectedDishes.length > 0
                  ? "bg-[#00AFF2] hover:bg-[#009bd6] text-white cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>
                {selectedDishes.length === 1 && selectedDishes[0].isFree
                  ? "0 F CFA (1)"
                  : `${cartSubtotal} F CFA (${selectedDishes.length})`}
              </span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODALE TARIF DE LIVRAISON (Capture d’écran 2026-10-20 152247.jpg) */}
      {/* ============================================================== */}
      {showDeliveryRatesModal && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 relative shadow-xl text-center animate-scaleUp">
            <button
              onClick={() => setShowDeliveryRatesModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-black tracking-wider uppercase mb-4">
              TARIF DE LIVRAISON
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
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
              className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#00AFF2] mx-auto hover:underline"
            >
              <Info className="w-3.5 h-3.5" />
              Politique d&apos;utilisation et conditions
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODALE APERÇU PLAT (Capture d’écran 2026-10-20 152030.jpg) */}
      {/* ============================================================== */}
      {showDishPreviewModal && previewDish && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl animate-scaleUp">
            {/* Image avec Overlay nom & prix */}
            <div className="relative h-48 bg-slate-100">
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
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent p-3 flex justify-between text-white text-xs font-bold">
                <span>{previewDish.name}</span>
                <span>{previewDish.price}</span>
              </div>
            </div>

            {/* Barre d'action sombre #333333 */}
            <div className="bg-[#333333] p-3 flex items-center justify-around text-xs font-bold text-[#00AFF2]">
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
      {/* 8. ÉCRAN "COMPOSER SON PLAT" (Via bouton central +) */}
      {/* ============================================================== */}
      {currentScreen === "compose_dish" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100 sticky top-0 bg-white z-10 pt-safe">
            <button
              onClick={() => setScreen("home")}
              className="p-1 hover:text-[#00AFF2]"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h2 className="text-sm font-bold text-black">Composer son plat</h2>
          </div>

          <div className="p-4 space-y-4 pb-24 text-xs">
            <div className="p-3 bg-sky-50 rounded-xl text-[#00AFF2] font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Composez votre plat sur-mesure comme au maquis ou chez vous !</span>
            </div>

            {/* Base */}
            <div>
              <p className="font-bold text-slate-900 mb-2">1. Choisissez votre base (Obligatoire)</p>
              <div className="space-y-1.5">
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
                    className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
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

            {/* Sauce */}
            <div>
              <p className="font-bold text-slate-900 mb-2">2. Choisissez votre sauce (Obligatoire)</p>
              <div className="space-y-1.5">
                {["Sauce Gombo", "Sauce Tomate fraîche", "Sauce Légumes (Gboma)"].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      hapticFeedback("light");
                      setComposeSauce(s);
                    }}
                    className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
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

            {/* Protéines */}
            <div>
              <p className="font-bold text-slate-900 mb-2">3. Viande ou Poisson</p>
              <div className="space-y-1.5">
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
                      className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
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

            {/* Suppléments */}
            <div>
              <p className="font-bold text-slate-900 mb-2">4. Suppléments (Optionnel)</p>
              <div className="space-y-1.5">
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
                      className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${
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
          </div>

          {/* Footer Total & Valider */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 flex items-center justify-between z-20 pb-safe">
            <div>
              <span className="text-[10px] text-slate-500">Total :</span>
              <p className="text-sm font-bold text-[#00AFF2]">{composeTotal} FCFA</p>
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
              className="bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              Commander
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. ÉCRAN FINALISATION (Capture d’écran 2026-10-20 152446.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "checkout" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10 pt-safe">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScreen("free_food")}
                className="p-1 hover:text-[#00AFF2]"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5 text-black" />
              </button>
              <h2 className="text-sm font-bold text-black">Finalisation</h2>
            </div>
            <span className="px-2.5 py-1 bg-sky-100 text-[#00AFF2] rounded-full text-xs font-bold flex items-center gap-1">
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>0 F</span>
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 pb-28">
            {/* Étape 1 : Plats (Bleu Déplié par défaut) */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 1 ? 2 : 1)}
                className="bg-[#00AFF2] text-white p-2.5 flex items-center justify-between text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-[#00AFF2] flex items-center justify-center text-[10px] font-black">
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
                <div className="p-3 bg-white flex items-center gap-3 overflow-x-auto">
                  {/* Cartes des plats sélectionnés */}
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

                  {/* Bouton (+) Ajouter un autre plat */}
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
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 2 ? 1 : 2)}
                className="bg-slate-100 p-2.5 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <div className="flex items-center gap-1">
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
                <div className="p-3 bg-white space-y-2 text-xs">
                  <p className="font-semibold text-slate-700">Sélectionnez votre quartier :</p>
                  {["Terrain Zico, Akpakpa", "Haie Vive, Cotonou", "Fidjrossè Calvaire", "Cadjehoun"].map(
                    (loc) => (
                      <div
                        key={loc}
                        onClick={() => {
                          hapticFeedback("light");
                          setDeliveryAddress(loc);
                          setExpandedStep(3);
                        }}
                        className={`p-2 rounded-lg border cursor-pointer flex justify-between items-center ${
                          deliveryAddress === loc
                            ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold"
                            : "border-slate-200"
                        }`}
                      >
                        <span>{loc}</span>
                        {deliveryAddress === loc && <Check className="w-4 h-4" />}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Étape 3 : Destinataires (Replié/Dépliable) */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedStep(expandedStep === 3 ? 1 : 3)}
                className="bg-slate-100 p-2.5 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  <div className="flex items-center gap-1">
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
                <div className="p-3 bg-white space-y-2 text-xs">
                  <p className="font-semibold text-slate-700">Pour qui commandez-vous ?</p>
                  {["Moi seul(e)", "Un ami / Collègue", "Groupe de personnes"].map((rec) => (
                    <div
                      key={rec}
                      onClick={() => {
                        hapticFeedback("light");
                        setRecipient(rec);
                        setExpandedStep(1);
                      }}
                      className={`p-2 rounded-lg border cursor-pointer flex justify-between items-center ${
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
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
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
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total à payer :</span>
                <span className="text-[#00AFF2]">{cartTotal} FCFA</span>
              </div>
            </div>

            {orderConfirmed && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-800 animate-fadeIn">
                <Check className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold text-sm">Commande validée avec succès !</p>
                <p className="text-xs">
                  Votre repas sera livré à <span className="font-bold">{deliveryAddress}</span> sous 20 minutes.
                </p>
              </div>
            )}
          </div>

          {/* Bouton de confirmation en bas */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-20 pb-safe">
            <button
              onClick={() => {
                hapticFeedback("success");
                setOrderConfirmed(true);
              }}
              disabled={selectedDishes.length === 0 || orderConfirmed}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                orderConfirmed
                  ? "bg-emerald-600 text-white"
                  : "bg-[#00AFF2] hover:bg-[#009bd6] text-white"
              }`}
            >
              {orderConfirmed ? "Commande envoyée ✓" : `Confirmer et Commander (${cartTotal} FCFA)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
