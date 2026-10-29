"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Gift,
  Home,
  Info,
  Menu as MenuIcon,
  Plus,
  Send,
  X,
  MapPin,
  Users,
} from "lucide-react";

type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "free_food"
  | "compose_dish"
  | "checkout";

export default function MobileApp({
  forcedScreen,
  onScreenChange,
}: {
  forcedScreen?: Screen;
  onScreenChange?: (screen: Screen) => void;
}) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(forcedScreen || "splash");
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Modales
  const [showFreeFoodModal, setShowFreeFoodModal] = useState(false);
  const [showDeliveryRatesModal, setShowDeliveryRatesModal] = useState(false);
  const [showDishPreviewModal, setShowDishPreviewModal] = useState(false);
  const [previewDish, setPreviewDish] = useState<{ name: string; price: string; img: string } | null>(null);

  // Sélection Bouffe Gratuite
  const [selectedFreeDishId, setSelectedFreeDishId] = useState<string>("1"); // Pâte noire par défaut

  // Composer son plat
  const [composeBase, setComposeBase] = useState("Pâte noire");
  const [composeBasePrice, setComposeBasePrice] = useState(500);
  const [composeSauce, setComposeSauce] = useState("Sauce Gombo");
  const [composeProteins, setComposeProteins] = useState<string[]>(["Poisson braisé"]);
  const [composeExtras, setComposeExtras] = useState<string[]>([]);

  // Écran finalisation
  const [deliveryAddress, setDeliveryAddress] = useState("Terrain Zico");
  const [recipient, setRecipient] = useState("Moi seul(e)");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    if (forcedScreen) {
      setCurrentScreen(forcedScreen);
    }
  }, [forcedScreen]);

  // Redirection automatique Splash vers Onboarding
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setScreen("onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const setScreen = (s: Screen) => {
    setCurrentScreen(s);
    if (onScreenChange) onScreenChange(s);
  };

  const onboardingSteps = [
    {
      img: "/images/onboarding_1.png",
      title: "Des plats familiers",
      desc: "Composez à votre convenance des plats que vous avez l'habitude de manger chez vous et qui ne sont pas forcément accessibles dans les restaurants.",
    },
    {
      img: "/images/onboarding_2.png",
      title: "Des plats courants",
      desc: "Des plats plus ou moins bourgeois que vous trouvez souvent dans les restaurants ou que vous cuisinez à la maison.",
    },
    {
      img: "/images/onboarding_3.png",
      title: "Des plats soutenus\net exotiques",
      desc: "Des plats bourgeois que vous et votre famille mangez pour votre plaisir.",
    },
  ];

  const gridDishes = [
    { id: "1", name: "Pâte noire", price: "2 000 FCFA", img: "/images/dish_pate_noire.png", originalPrice: 200, isFree: true },
    { id: "2", name: "Tapioca chaud", price: "100 FCFA", img: "/images/dish_tapioca.png", originalPrice: 100, isFree: true },
    { id: "3", name: "Chawarma", price: "1 000 FCFA", img: "/images/dish_chawarma.png", originalPrice: 1000, isFree: false },
    { id: "4", name: "Pâte blanche", price: "200 FCFA", img: "/images/dish_pate_blanche.png", originalPrice: 200, isFree: true },
    { id: "5", name: "Gari au lait", price: "200 FCFA", img: "/images/dish_gari.png", originalPrice: 200, isFree: true },
    { id: "6", name: "Pâte rouge", price: "1 000 FCFA", img: "/images/dish_pate_rouge.png", originalPrice: 200, isFree: true },
  ];

  const composeTotal =
    composeBasePrice +
    composeProteins.reduce((acc, p) => acc + (p === "Poisson braisé" ? 1000 : 1200), 0) +
    composeExtras.reduce((acc, e) => acc + 400, 0);

  return (
    <div className="w-full h-full bg-white select-none relative overflow-hidden flex flex-col text-slate-900 font-sans">
      {/* ============================================================== */}
      {/* 1. ÉCRAN SPLASH SCREEN (Capture 150947.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "splash" && (
        <div className="w-full h-full bg-[#00AFF2] flex flex-col items-center justify-center p-6 animate-fadeIn">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <Image
              src="/images/logo_splash.png"
              alt="Logo ClicBouffe"
              width={160}
              height={155}
              priority
              className="object-contain"
            />
          </div>
          <button
            onClick={() => setScreen("onboarding")}
            className="mt-8 text-xs text-white/80 underline font-medium"
          >
            Passer l&apos;intro &gt;
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ÉCRANS ONBOARDING (Captures 151155, 151227, 151522.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "onboarding" && (
        <div className="w-full h-full bg-white flex flex-col justify-between p-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-4">
            {/* Image des 3 plats */}
            <div className="relative w-64 h-44 mb-6">
              <Image
                src={onboardingSteps[onboardingIndex].img}
                alt={onboardingSteps[onboardingIndex].title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-black text-black tracking-tight whitespace-pre-line">
              {onboardingSteps[onboardingIndex].title}
            </h2>

            {/* Description */}
            <p className="text-xs text-slate-700 mt-3 leading-relaxed max-w-xs">
              {onboardingSteps[onboardingIndex].desc}
            </p>
          </div>

          {/* Pagination & Boutons de navigation */}
          <div className="pb-4">
            {/* Dots */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    onboardingIndex === idx
                      ? "bg-[#00AFF2] border-[#00AFF2]"
                      : "bg-transparent border-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Barre de navigation basse */}
            <div className="flex items-center justify-between h-12 px-2">
              {/* Flèche gauche */}
              <div className="w-10 flex items-center">
                {onboardingIndex > 0 ? (
                  <button
                    onClick={() => setOnboardingIndex(onboardingIndex - 1)}
                    className="p-1 text-black hover:opacity-70"
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
                  setScreen("home");
                  setTimeout(() => setShowFreeFoodModal(true), 800);
                }}
                className="bg-[#00AFF2] hover:bg-[#009bd6] text-white px-8 py-2.5 rounded-lg text-xs font-bold tracking-wider shadow-sm transition-all"
              >
                {onboardingIndex === 2 ? "COMMENCER" : "SAUTER"}
              </button>

              {/* Flèche droite */}
              <div className="w-10 flex items-center justify-end">
                {onboardingIndex < 2 ? (
                  <button
                    onClick={() => setOnboardingIndex(onboardingIndex + 1)}
                    className="p-1 text-black hover:opacity-70"
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
      {/* 3. ÉCRAN ACCUEIL (Capture 151615.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "home" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
            <h1 className="text-xl font-black text-[#00AFF2] tracking-tight">ClicBouffe</h1>
            <div className="flex items-center gap-3 text-slate-800">
              <button className="p-1">
                <div className="w-5 h-5 border-2 border-slate-800 rounded-t-full rounded-b-sm" />
              </button>
              <button className="p-1">
                <div className="w-4 h-4 border-2 border-slate-800 rounded-full" />
              </button>
              <button className="p-1">
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu Scrollable */}
          <div className="flex-1 p-3 space-y-3 pb-24">
            {/* Carrousel Amberger */}
            <div className="flex items-center gap-2 overflow-x-hidden">
              <div className="w-10 h-32 rounded-xl bg-slate-100 shrink-0 opacity-40 border" />
              <div
                onClick={() => setScreen("free_food")}
                className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm cursor-pointer hover:border-[#00AFF2] transition-colors"
              >
                <div className="h-28 bg-black relative">
                  <Image
                    src="/images/amberger_banner.png"
                    alt="Amberger"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2 text-center bg-white">
                  <p className="text-xs font-bold text-slate-900">Amberger</p>
                  <p className="text-xs font-semibold text-slate-700">5 000 FCFA</p>
                </div>
              </div>
              <div className="w-10 h-32 rounded-xl bg-slate-100 shrink-0 opacity-40 border" />
            </div>

            {/* Titre section */}
            <p className="text-[11px] font-medium text-slate-700 pt-1">
              Plats pouvant vous intéresser
            </p>

            {/* Grille 6 plats */}
            <div className="grid grid-cols-3 gap-2">
              {gridDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => {
                    setPreviewDish({ name: dish.name, price: dish.price, img: dish.img });
                    setShowDishPreviewModal(true);
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-col items-center justify-between text-center shadow-xs cursor-pointer hover:border-[#00AFF2] transition-colors"
                >
                  <div className="w-full h-16 relative my-1">
                    <Image
                      src={dish.img}
                      alt={dish.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="w-full pt-1 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-900 truncate">{dish.name}</p>
                    <p className="text-[9px] font-semibold text-slate-700">{dish.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre Navigation Basse avec FAB (+) Composer plat */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-20">
            <button className="flex flex-col items-center gap-0.5 text-[#00AFF2]">
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-bold">Accueil</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-slate-700">
              <Compass className="w-5 h-5" />
              <span className="text-[9px]">Explorer</span>
            </button>

            {/* Bouton central (+) Composer plat */}
            <div className="relative -top-5 flex flex-col items-center cursor-pointer" onClick={() => setScreen("compose_dish")}>
              <div className="w-12 h-12 bg-[#00AFF2] rounded-full flex items-center justify-center text-white shadow-md shadow-[#00AFF2]/40 hover:scale-105 transition-transform">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-bold text-black mt-1">Composer plat</span>
            </div>

            <button className="flex flex-col items-center gap-0.5 text-slate-700">
              <Clock className="w-5 h-5" />
              <span className="text-[9px]">Plus tard</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-slate-700">
              <Calendar className="w-5 h-5" />
              <span className="text-[9px]">Abonnements</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALE BOUFFE GRATUITE (Capture 151714.jpg) */}
      {/* ============================================================== */}
      {showFreeFoodModal && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 relative shadow-xl text-center animate-scaleUp">
            <button
              onClick={() => setShowFreeFoodModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-black tracking-wider uppercase mt-1">
              BOUFFE GRATUITE
            </h3>

            <div className="my-4 flex flex-col items-center">
              <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center text-[#00AFF2]">
                <Gift className="w-12 h-12" />
              </div>
              <span className="mt-2 px-3 py-1 bg-[#00AFF2] text-white rounded-full text-[10px] font-bold">
                100% GRATUIT
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed px-2">
              Profitez d&apos;une bouffe 100% gratuite comme cadeau de bienvenu. Faites votre premier pas gratuitement dans un monde libre en civilisation culinaire.
            </p>

            <button
              onClick={() => {
                setShowFreeFoodModal(false);
                setScreen("free_food");
              }}
              className="mt-5 w-full bg-[#00AFF2] hover:bg-[#009bd6] text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
            >
              Profiter
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ÉCRAN CHOIX BOUFFE GRATUITE (Captures 151956, 152219, 152403.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "free_food" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <button onClick={() => setScreen("home")} className="p-1">
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h2 className="text-sm font-bold text-black uppercase">Choix de la bouffe gratuite</h2>
          </div>

          {/* Explications & Lien tarifs */}
          <div className="p-4 space-y-3 pb-24">
            <p className="text-xs text-slate-700 leading-relaxed">
              Vous pouvez choisir une seule bouffe gratuite. Pour recevoir votre bouffe choisie, il ne vous suffira que de payer la livraison de cette dernière.{" "}
              <span className="text-[#00AFF2] font-semibold cursor-pointer">Lire plus...</span>
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDeliveryRatesModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#00AFF2]"
              >
                Tarif de livraison
                <MenuIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grille des plats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {gridDishes.map((dish) => {
                const isSelected = selectedFreeDishId === dish.id;
                return (
                  <div
                    key={dish.id}
                    onClick={() => setSelectedFreeDishId(dish.id)}
                    className={`rounded-2xl border p-2 flex flex-col items-center justify-between text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#00AFF2] bg-sky-50/30 ring-2 ring-[#00AFF2]/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {dish.isFree && (
                      <span className="text-[10px] text-slate-400 self-start ml-1">Gratuit</span>
                    )}
                    <div className="w-20 h-20 relative my-1">
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div
                      className={`w-full py-1.5 px-1 rounded-b-xl ${
                        isSelected ? "bg-[#00AFF2] text-white" : "bg-transparent text-slate-900"
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{dish.name}</p>
                      <p
                        className={`text-[11px] ${
                          dish.isFree ? "line-through opacity-70" : "font-semibold"
                        }`}
                      >
                        {dish.originalPrice} FCFA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton Flottant Total (ex: 0 F CFA (1) -> Envoi) */}
          <div className="fixed bottom-4 right-4 z-20">
            <button
              onClick={() => setScreen("checkout")}
              className="bg-[#00AFF2] hover:bg-[#009bd6] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <span>0 F CFA (1)</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODALE TARIF DE LIVRAISON (Capture 152247.jpg) */}
      {/* ============================================================== */}
      {showDeliveryRatesModal && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 relative shadow-xl text-center animate-scaleUp">
            <button
              onClick={() => setShowDeliveryRatesModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
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

            <button className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#00AFF2] mx-auto">
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
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl animate-scaleUp">
            <div className="relative h-44 bg-slate-100">
              <Image
                src={previewDish.img}
                alt={previewDish.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-0 inset-x-0 bg-black/50 p-2 flex justify-between text-white text-xs font-bold">
                <span>{previewDish.name}</span>
                <span>{previewDish.price}</span>
              </div>
            </div>

            <div className="bg-[#333333] p-3 flex items-center justify-around text-xs font-bold text-[#00AFF2]">
              <button
                onClick={() => {
                  setShowDishPreviewModal(false);
                  setScreen("free_food");
                }}
                className="flex items-center gap-1.5 hover:text-white"
              >
                <span>Ajouter</span>
                <Check className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-white/20" />
              <button className="flex items-center gap-1.5 hover:text-white">
                <span>À propos</span>
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. ÉCRAN "COMPOSER SON PLAT" */}
      {/* ============================================================== */}
      {currentScreen === "compose_dish" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <button onClick={() => setScreen("home")} className="p-1">
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h2 className="text-sm font-bold text-black">Composer son plat</h2>
          </div>

          <div className="p-4 space-y-4 pb-24 text-xs">
            <div className="p-3 bg-sky-50 rounded-xl text-[#00AFF2] font-semibold">
              Composez votre plat sur-mesure comme au maquis ou chez vous !
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
                      setComposeBase(b.name);
                      setComposeBasePrice(b.price);
                    }}
                    className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${
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
                    onClick={() => setComposeSauce(s)}
                    className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${
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
                        setComposeProteins(
                          has ? composeProteins.filter((x) => x !== p.name) : [...composeProteins, p.name]
                        );
                      }}
                      className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${
                        has ? "border-[#00AFF2] bg-sky-50/50 text-[#00AFF2] font-bold" : "border-slate-200"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span>+ {p.price} FCFA</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Total & Valider */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 flex items-center justify-between z-20">
            <div>
              <span className="text-[10px] text-slate-500">Total :</span>
              <p className="text-sm font-bold text-[#00AFF2]">{composeTotal} FCFA</p>
            </div>
            <button
              onClick={() => setScreen("checkout")}
              className="bg-[#00AFF2] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              Commander
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. ÉCRAN FINALISATION (Capture 152446.jpg) */}
      {/* ============================================================== */}
      {currentScreen === "checkout" && (
        <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-3 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("free_food")} className="p-1">
                <ArrowLeft className="w-5 h-5 text-black" />
              </button>
              <h2 className="text-sm font-bold text-black">Finalisation</h2>
            </div>
            <span className="px-2.5 py-1 bg-sky-100 text-[#00AFF2] rounded-full text-xs font-bold">
              + 0 F
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Étape 1 : Plats */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#00AFF2] text-white p-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-[#00AFF2] flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Plats : Pâte noire</span>
                </div>
              </div>
              <div className="p-3 flex items-center gap-3 bg-white">
                <div className="w-20 h-20 relative bg-slate-50 rounded-lg overflow-hidden border">
                  <Image src="/images/dish_pate_noire.png" alt="Pâte noire" fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">Pâte noire</p>
                  <p className="text-[11px] text-slate-500 line-through">200 FCFA</p>
                  <span className="text-[10px] font-bold text-emerald-600">Offert (Bienvenue)</span>
                </div>
              </div>
            </div>

            {/* Étape 2 : Lieu de livraison */}
            <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span className="text-slate-600 flex items-center gap-1">
                  Lieu de livraison <MapPin className="w-3.5 h-3.5 text-rose-500 inline" /> :
                </span>
                <span className="font-bold text-slate-900">{deliveryAddress}</span>
              </div>
              <button
                onClick={() => {
                  const val = prompt("Modifier le lieu :", deliveryAddress);
                  if (val) setDeliveryAddress(val);
                }}
                className="text-[#00AFF2] font-semibold text-[11px]"
              >
                Modifier
              </button>
            </div>

            {/* Étape 3 : Destinataires */}
            <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span className="text-slate-600 flex items-center gap-1">
                  Destinataires <Users className="w-3.5 h-3.5 text-slate-500 inline" /> :
                </span>
                <span className="font-bold text-slate-900">{recipient}</span>
              </div>
              <button
                onClick={() => setRecipient(recipient === "Moi seul(e)" ? "Famille / Groupe" : "Moi seul(e)")}
                className="text-[#00AFF2] font-semibold text-[11px]"
              >
                Changer
              </button>
            </div>

            {/* Récapitulatif frais de livraison */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Plat offert :</span>
                <span className="font-bold text-emerald-600">0 FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison (Terrain Zico) :</span>
                <span className="font-bold text-slate-900">80 FCFA</span>
              </div>
              <div className="border-t border-sky-200 pt-1 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total à payer :</span>
                <span className="text-[#00AFF2]">80 FCFA</span>
              </div>
            </div>
          </div>

          {/* Bouton Commander */}
          <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
            <button
              onClick={() => {
                setOrderConfirmed(true);
                setTimeout(() => {
                  setOrderConfirmed(false);
                  setScreen("home");
                }, 2500);
              }}
              className="w-full bg-[#00AFF2] hover:bg-[#009bd6] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Valider & Payer la livraison (80 FCFA)</span>
            </button>
          </div>

          {/* Succès commande */}
          {orderConfirmed && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Commande Confirmée !</h3>
              <p className="text-xs text-slate-600 mt-2">
                Votre plat gratuit arrive à <strong>{deliveryAddress}</strong>. Le coursier est en route !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
