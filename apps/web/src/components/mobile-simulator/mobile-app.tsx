"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  MapPin,
  Menu as MenuIcon,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { hapticFeedback } from "@/lib/native/haptics";
import {
  HomeNavIcon,
  ExplorerNavIcon,
  ClockNavIcon,
  CalendarNavIcon,
} from "@/components/navigation-icons";
import {
  REGIONAL_RESTAURANTS,
  INITIAL_SCHEDULED_DISHES,
  INITIAL_SUBSCRIPTIONS,
  AVAILABLE_FORMULAS,
  INITIAL_GRID_DISHES,
  DishItem,
  ScheduledDish,
  MealSubscription,
} from "@/lib/data/clicbouffe-data";

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

export interface MobileAppProps {
  forcedScreen?: Screen;
  onScreenChange?: (screen: Screen) => void;
  className?: string;
}

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

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

  // Onglet actif
  const [activeNavTab, setActiveNavTab] = useState<"home" | "explorer" | "plus_tard" | "abonnements">("home");
  const currentTab = (currentScreen === "home" || currentScreen === "explorer" || currentScreen === "plus_tard" || currentScreen === "abonnements")
    ? currentScreen
    : activeNavTab;

  // État Explorer
  const [selectedExplorerCategory, setSelectedExplorerCategory] = useState<"all" | "local" | "maquis" | "chawarma" | "burger">("all");

  // État Plus Tard (Plats programmés)
  const [scheduledDishes, setScheduledDishes] = useState<ScheduledDish[]>(INITIAL_SCHEDULED_DISHES);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDishChoice, setScheduleDishChoice] = useState<DishItem>(INITIAL_GRID_DISHES[0]);
  const [scheduleDay, setScheduleDay] = useState("Aujourd'hui");
  const [scheduleHour, setScheduleHour] = useState("19h30");

  // État Abonnements
  const [subscriptions, setSubscriptions] = useState<MealSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [activeSubTab, setActiveSubTab] = useState<"active" | "discover">("active");

  const deliveryAddress = "Terrain Zico, Akpakpa";
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // État Composer son plat
  const [composeBase, setComposeBase] = useState("Pâte noire");
  const [composeBasePrice, setComposeBasePrice] = useState(500);

  // Synchronisation screen
  const setScreen = (s: Screen) => {
    hapticFeedback("light");
    setInternalScreen(s);
    if (s === "home" || s === "explorer" || s === "plus_tard" || s === "abonnements") {
      setActiveNavTab(s);
    }
    if (onScreenChange) {
      onScreenChange(s);
    }
  };

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

  const composeTotal = composeBasePrice + 500; // base + garniture par défaut

  const toggleSelectDish = (dish: DishItem) => {
    hapticFeedback("light");
    const exists = selectedDishes.some((d) => d.id === dish.id);
    if (exists) {
      setSelectedDishes(selectedDishes.filter((d) => d.id !== dish.id));
    } else {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const filteredRestaurants = REGIONAL_RESTAURANTS.filter((r) => {
    if (selectedExplorerCategory !== "all" && r.categoryId !== selectedExplorerCategory) {
      return false;
    }
    return true;
  });

  return (
    <div
      className={`relative w-full h-full bg-white flex flex-col font-sans select-none overflow-x-hidden ${className}`}
    >
      {/* 1. Splash */}
      {currentScreen === "splash" && (
        <div
          onClick={() => setScreen("onboarding")}
          className="w-full h-full bg-[#00AFF2] flex flex-col items-center justify-center p-6 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-44 h-40 flex items-center justify-center">
              <Image
                src="/images/logo_splash.png"
                alt="Logo ClicBouffe"
                width={190}
                height={170}
                priority
                className="object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-white text-3xl font-extrabold tracking-tight mt-3">
              ClicBouffe
            </h1>
          </div>
        </div>
      )}

      {/* 2. Onboarding */}
      {currentScreen === "onboarding" && (
        <div className="w-full h-full bg-white flex flex-col items-center justify-between p-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-64 h-48 mb-6 flex items-center justify-center">
              <Image
                src={onboardingSteps[onboardingIndex].img}
                alt={onboardingSteps[onboardingIndex].title}
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight whitespace-pre-line leading-tight">
              {onboardingSteps[onboardingIndex].title}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed max-w-xs mt-3">
              {onboardingSteps[onboardingIndex].desc}
            </p>
            <div className="flex items-center justify-center gap-2.5 my-6">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`rounded-full ${
                    onboardingIndex === idx
                      ? "w-2.5 h-2.5 bg-[#00AFF2]"
                      : "w-2 h-2 border border-black bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-full flex items-center justify-between px-2">
            <button
              onClick={() => onboardingIndex > 0 && setOnboardingIndex(onboardingIndex - 1)}
              className={`p-1 text-black ${onboardingIndex > 0 ? "opacity-100" : "opacity-0"}`}
            >
              <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setScreen("home")}
              className="bg-[#00AFF2] text-white font-extrabold text-xs px-6 py-2 rounded-lg"
            >
              SAUTER
            </button>
            <button
              onClick={() =>
                onboardingIndex < 2 ? setOnboardingIndex(onboardingIndex + 1) : setScreen("home")
              }
              className="p-1 text-black"
            >
              <ChevronRight className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Écrans Principaux avec Header & TabBar */}
      {(currentScreen === "home" ||
        currentScreen === "explorer" ||
        currentScreen === "plus_tard" ||
        currentScreen === "abonnements") && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header Mobile */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20 pt-safe">
            <div className="flex items-center gap-1.5" onClick={() => setScreen("home")}>
              <Image src="/images/cursor_icon.png" alt="Logo" width={20} height={20} />
              <h1 className="text-lg font-black text-[#00AFF2]">ClicBouffe</h1>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-[#00AFF2]" />
              <span>{deliveryAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <button onClick={() => setShowFreeFoodModal(true)} className="p-1 relative">
                <Bell className="w-4 h-4 stroke-[1.8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00AFF2] absolute top-1 right-1" />
              </button>
              <button onClick={() => setShowDeliveryRatesModal(true)} className="p-1">
                <MenuIcon className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Onglet Accueil */}
          {currentScreen === "home" && (
            <div className="p-3 space-y-4 pb-24">
              <div
                onClick={() => {
                  const amberger = INITIAL_GRID_DISHES.find((d) => d.name === "Amberger") || INITIAL_GRID_DISHES[0];
                  setPreviewDish(amberger);
                  setShowDishPreviewModal(true);
                }}
                className="w-full h-44 rounded-2xl overflow-hidden relative shadow-sm border border-slate-200 cursor-pointer"
              >
                <Image src="/images/amberger_banner.jpg" alt="Amberger" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3.5 text-white">
                  <span className="px-2 py-0.5 rounded-full bg-[#00AFF2] text-white text-[9px] font-bold w-fit uppercase">
                    Spécialité du Chef
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">Amberger Gourmet</h2>
                  <p className="text-xs text-white/90 font-semibold">5 000 FCFA</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-bold text-slate-800">Plats pouvant vous intéresser</p>
                <button onClick={() => setScreen("free_food")} className="text-xs font-bold text-[#00AFF2]">
                  Tout voir &gt;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {INITIAL_GRID_DISHES.slice(0, 6).map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => {
                      setPreviewDish(dish);
                      setShowDishPreviewModal(true);
                    }}
                    className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col justify-between shadow-2xs relative"
                  >
                    <div className="w-full h-24 relative rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                      <Image src={dish.img} alt={dish.name} fill className="object-cover" />
                      {dish.isFree && (
                        <span className="absolute top-1 right-1 bg-[#00AFF2] text-white text-[8px] font-bold px-1 rounded-full">
                          Offert
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{dish.name}</p>
                        <p className="text-[10px] font-semibold text-slate-600">{dish.price}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDishes((prev) => [...prev, dish]);
                        }}
                        className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Explorer */}
          {currentScreen === "explorer" && (
            <div className="p-3 space-y-3 pb-24">
              <div className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#00AFF2] uppercase">
                  <MapPin className="w-3 h-3" />
                  <span>Akpakpa & Cotonou Est</span>
                </div>
                <h2 className="text-sm font-black text-slate-900 mt-0.5">
                  Restaurants Disponibles
                </h2>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: "all", label: "Tous" },
                  { id: "local", label: "Cuisine Locale" },
                  { id: "maquis", label: "Grillades" },
                  { id: "chawarma", label: "Chawarma" },
                  { id: "burger", label: "Burgers" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedExplorerCategory(cat.id as "all" | "local" | "maquis" | "chawarma" | "burger")}
                    className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                      selectedExplorerCategory === cat.id
                        ? "bg-[#00AFF2] text-white"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredRestaurants.map((restau) => (
                  <div
                    key={restau.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                  >
                    <div className="h-32 w-full relative bg-slate-100">
                      <Image src={restau.img} alt={restau.name} fill className="object-cover" />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/95 text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{restau.rating}</span>
                      </div>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{restau.name}</h3>
                        <p className="text-[10px] text-slate-500">
                          {restau.deliveryTime} • {restau.deliveryFee}
                        </p>
                      </div>
                      <button
                        onClick={() => setScreen("compose_dish")}
                        className="px-2.5 py-1 bg-[#00AFF2] text-white rounded-lg text-xs font-bold"
                      >
                        Commander
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Plus Tard */}
          {currentScreen === "plus_tard" && (
            <div className="p-3 space-y-3 pb-24">
              <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200">
                <div>
                  <h2 className="text-xs font-black text-slate-900">Plats Programmés</h2>
                  <p className="text-[10px] text-slate-500">Commandes pour plus tard</p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3 py-1 bg-[#00AFF2] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Programmer</span>
                </button>
              </div>

              <div className="space-y-2">
                {scheduledDishes.map((item) => (
                  <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-slate-100 shrink-0">
                        <Image src={item.img} alt={item.dishName} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#00AFF2] bg-sky-50 px-1.5 py-0.5 rounded">
                          {item.scheduledDate} {item.scheduledTime}
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{item.dishName}</p>
                        <p className="text-[10px] text-slate-500">{item.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScheduledDishes((prev) => prev.filter((d) => d.id !== item.id))}
                      className="p-1 text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Abonnements */}
          {currentScreen === "abonnements" && (
            <div className="p-3 space-y-3 pb-24">
              <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200">
                <div>
                  <h2 className="text-xs font-black text-slate-900">Mes Abonnements</h2>
                  <p className="text-[10px] text-slate-500">Livraisons régulières</p>
                </div>
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setActiveSubTab("active")}
                    className={`px-2 py-1 rounded ${activeSubTab === "active" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
                  >
                    Actifs
                  </button>
                  <button
                    onClick={() => setActiveSubTab("discover")}
                    className={`px-2 py-1 rounded ${activeSubTab === "discover" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
                  >
                    Formules
                  </button>
                </div>
              </div>

              {activeSubTab === "active" ? (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-slate-100 shrink-0">
                          <Image src={sub.img} alt={sub.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {sub.status === "actif" ? "Actif" : "En pause"}
                          </span>
                          <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{sub.title}</p>
                          <p className="text-[10px] text-slate-500">{sub.frequency} • {sub.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="font-bold text-slate-900">{sub.pricePerPeriod}</span>
                        <button
                          onClick={() => {
                            setSubscriptions((prev) =>
                              prev.map((s) => (s.id === sub.id ? { ...s, status: s.status === "actif" ? "en_pause" : "actif" } : s))
                            );
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700"
                        >
                          {sub.status === "actif" ? "Mettre en pause" : "Reprendre"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {AVAILABLE_FORMULAS.map((f) => (
                    <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[9px] font-bold text-[#00AFF2] uppercase">{f.badge}</p>
                      <h3 className="text-xs font-bold text-slate-900 mt-0.5">{f.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{f.description}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{f.price}</p>
                      <button
                        onClick={() => alert(`Souscription à ${f.title} validée !`)}
                        className="mt-2 w-full py-1.5 bg-[#00AFF2] text-white text-[11px] font-bold rounded-lg"
                      >
                        Souscrire
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Barre de navigation basse */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-20 pb-safe">
            <button
              onClick={() => {
                setActiveNavTab("home");
                setScreen("home");
              }}
              className={`flex flex-col items-center gap-0.5 ${currentTab === "home" ? "text-[#00AFF2]" : "text-slate-600"}`}
            >
              <HomeNavIcon active={currentTab === "home"} className="w-5 h-5" />
              <span className={`text-[9px] ${currentTab === "home" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"}`}>
                Accueil
              </span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab("explorer");
                setScreen("explorer");
              }}
              className={`flex flex-col items-center gap-0.5 ${currentTab === "explorer" ? "text-[#00AFF2]" : "text-slate-600"}`}
            >
              <ExplorerNavIcon active={currentTab === "explorer"} className="w-5 h-5" />
              <span className={`text-[9px] ${currentTab === "explorer" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"}`}>
                Explorer
              </span>
            </button>

            <div
              className="relative -top-5 flex flex-col items-center cursor-pointer"
              onClick={() => setScreen("compose_dish")}
            >
              <div className="w-12 h-12 bg-[#00AFF2] rounded-full flex items-center justify-center text-white shadow-md">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-bold text-black mt-1">Composer plat</span>
            </div>

            <button
              onClick={() => {
                setActiveNavTab("plus_tard");
                setScreen("plus_tard");
              }}
              className={`flex flex-col items-center gap-0.5 ${currentTab === "plus_tard" ? "text-[#00AFF2]" : "text-slate-600"}`}
            >
              <ClockNavIcon active={currentTab === "plus_tard"} className="w-5 h-5" />
              <span className={`text-[9px] ${currentTab === "plus_tard" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"}`}>
                Plus tard
              </span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab("abonnements");
                setScreen("abonnements");
              }}
              className={`flex flex-col items-center gap-0.5 ${currentTab === "abonnements" ? "text-[#00AFF2]" : "text-slate-600"}`}
            >
              <CalendarNavIcon active={currentTab === "abonnements"} className="w-5 h-5" />
              <span className={`text-[9px] ${currentTab === "abonnements" ? "font-bold text-[#00AFF2]" : "font-medium text-slate-600"}`}>
                Abonnements
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Modale Bouffe Gratuite */}
      {showFreeFoodModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 relative text-center">
            <button onClick={() => setShowFreeFoodModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-black tracking-wider uppercase">BOUFFE GRATUITE</h3>
            <div className="my-4 flex justify-center">
              <Gift className="w-12 h-12 text-[#00AFF2]" />
            </div>
            <p className="text-xs text-slate-600">
              Profitez d&apos;une bouffe 100% gratuite comme cadeau de bienvenu.
            </p>
            <button
              onClick={() => {
                setShowFreeFoodModal(false);
                setScreen("free_food");
              }}
              className="mt-4 w-full bg-[#00AFF2] text-white py-2.5 rounded-xl text-xs font-bold"
            >
              Profiter
            </button>
          </div>
        </div>
      )}

      {/* 5. Modale Tarif Livraison */}
      {showDeliveryRatesModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 relative text-xs">
            <button onClick={() => setShowDeliveryRatesModal(false)} className="absolute top-3 right-3 text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-900 mb-2">Tarif de Livraison</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>1-2 plats :</span>
                <span className="font-bold">80 FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>3-5 plats :</span>
                <span className="font-bold">130 FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>6-10 plats :</span>
                <span className="font-bold">170 FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Plus de 10 plats :</span>
                <span className="font-bold text-emerald-600">Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modale Aperçu Plat */}
      {showDishPreviewModal && previewDish && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl">
            <div className="relative h-44 bg-slate-100">
              <Image src={previewDish.img} alt={previewDish.name} fill className="object-cover" />
              <button
                onClick={() => setShowDishPreviewModal(false)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-sm text-slate-900">{previewDish.name}</h3>
              <p className="text-xs font-bold text-[#00AFF2] mt-0.5">{previewDish.price}</p>
              <button
                onClick={() => {
                  toggleSelectDish(previewDish);
                  setShowDishPreviewModal(false);
                }}
                className="mt-3 w-full py-2 bg-[#00AFF2] text-white rounded-lg text-xs font-bold"
              >
                {selectedDishes.some((d) => d.id === previewDish.id) ? "Retirer" : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modale Programmation Plus Tard */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 relative text-xs">
            <button onClick={() => setShowScheduleModal(false)} className="absolute top-3 right-3 text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-900 mb-2">Programmer un plat</h3>
            <label className="font-semibold block mb-1">1. Plat :</label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {INITIAL_GRID_DISHES.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setScheduleDishChoice(d)}
                  className={`p-1.5 rounded-lg border text-left truncate ${
                    scheduleDishChoice.id === d.id ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold" : "border-slate-200"
                  }`}
                >
                  <p className="truncate">{d.name}</p>
                </button>
              ))}
            </div>
            <label className="font-semibold block mb-1">2. Jour :</label>
            <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
              {["Aujourd'hui", "Demain", "Vendredi"].map((day) => (
                <button
                  key={day}
                  onClick={() => setScheduleDay(day)}
                  className={`px-2 py-1 rounded text-[10px] ${scheduleDay === day ? "bg-[#00AFF2] text-white" : "bg-slate-100"}`}
                >
                  {day}
                </button>
              ))}
            </div>
            <label className="font-semibold block mb-1">3. Heure :</label>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {["12h00", "12h30", "19h30"].map((h) => (
                <button
                  key={h}
                  onClick={() => setScheduleHour(h)}
                  className={`py-1 rounded text-center text-[10px] ${scheduleHour === h ? "bg-[#00AFF2] text-white" : "bg-slate-100"}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setScheduledDishes([
                  {
                    id: `sch-${Date.now()}`,
                    dishName: scheduleDishChoice.name,
                    restaurantName: "Saveurs d'Akpakpa",
                    price: scheduleDishChoice.price,
                    priceNum: scheduleDishChoice.priceNum,
                    scheduledDate: scheduleDay,
                    scheduledTime: scheduleHour,
                    portions: 1,
                    instructions: "Livraison soignée",
                    img: scheduleDishChoice.img,
                    status: "confirmé",
                  },
                  ...scheduledDishes,
                ]);
                setShowScheduleModal(false);
              }}
              className="w-full py-2 bg-[#00AFF2] text-white font-bold rounded-lg"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* 8. Choix Bouffe Gratuite */}
      {currentScreen === "free_food" && (
        <div className="w-full h-full bg-white flex flex-col justify-between p-4">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setScreen("home")} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xs font-black uppercase">Choix bouffe gratuite</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pb-16">
            {INITIAL_GRID_DISHES.slice(0, 4).map((dish) => {
              const isSelected = selectedDishes.some((d) => d.id === dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => toggleSelectDish(dish)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center ${
                    isSelected ? "border-[#00AFF2] bg-sky-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-slate-100 my-1">
                    <Image src={dish.img} alt={dish.name} fill className="object-cover" />
                  </div>
                  <p className="text-xs font-bold truncate">{dish.name}</p>
                  <p className="text-[10px] text-slate-500">{dish.price}</p>
                </div>
              );
            })}
          </div>
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setScreen("checkout")}
              className="px-5 py-2.5 bg-[#00AFF2] text-white font-bold rounded-full text-xs shadow-lg"
            >
              Commander ({selectedDishes.length})
            </button>
          </div>
        </div>
      )}

      {/* 9. Composer son plat */}
      {currentScreen === "compose_dish" && (
        <div className="w-full h-full bg-white flex flex-col justify-between p-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setScreen("home")} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold">Composer son plat</h2>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pb-16">
            <div>
              <p className="font-bold mb-1">1. Base :</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Pâte noire", price: 500 },
                  { name: "Pâte blanche", price: 400 },
                  { name: "Pâte rouge", price: 600 },
                  { name: "Riz au gras", price: 600 },
                ].map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      setComposeBase(b.name);
                      setComposeBasePrice(b.price);
                    }}
                    className={`p-2 rounded-xl border ${composeBase === b.name ? "border-[#00AFF2] bg-sky-50 text-[#00AFF2] font-bold" : "border-slate-200"}`}
                  >
                    {b.name} ({b.price} F)
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold mb-1">2. Protéines :</p>
              <div className="space-y-1">
                {["Poisson braisé (500 F)", "Poulet bicyclette (700 F)"].map((p) => (
                  <div key={p} className="p-2 border rounded-xl flex justify-between">
                    <span>{p}</span>
                    <Check className="w-4 h-4 text-[#00AFF2]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="fixed bottom-0 inset-x-0 p-3 bg-white border-t flex items-center justify-between">
            <span className="font-bold">{composeTotal} FCFA</span>
            <button
              onClick={() => {
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
              className="px-4 py-2 bg-[#00AFF2] text-white font-bold rounded-xl"
            >
              Valider
            </button>
          </div>
        </div>
      )}

      {/* 10. Checkout */}
      {currentScreen === "checkout" && (
        <div className="w-full h-full bg-white flex flex-col justify-between p-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setScreen("home")} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold">Finalisation</h2>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pb-16">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="font-bold">Plats ({selectedDishes.length}) :</p>
              <p className="text-slate-600">{selectedDishes.map((d) => d.name).join(", ")}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="font-bold">Livraison à :</p>
              <p className="text-slate-600">{deliveryAddress}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-sm">
              <span>Total :</span>
              <span className="text-[#00AFF2]">{formatFCFA(cartTotal)}</span>
            </div>
          </div>
          <div className="fixed bottom-0 inset-x-0 p-3 bg-white border-t">
            <button
              onClick={() => setOrderConfirmed(true)}
              className="w-full py-2.5 bg-[#00AFF2] text-white font-bold rounded-xl text-center"
            >
              Payer {formatFCFA(cartTotal)}
            </button>
          </div>

          {orderConfirmed && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-5 text-center max-w-xs">
                <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-base">Commande Validée !</h3>
                <p className="text-xs text-slate-500 mt-1">Livraison en cours vers {deliveryAddress}.</p>
                <button
                  onClick={() => {
                    setOrderConfirmed(false);
                    setScreen("home");
                  }}
                  className="mt-4 w-full py-2 bg-[#00AFF2] text-white font-bold rounded-xl"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
