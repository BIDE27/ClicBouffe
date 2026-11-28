"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  Flame,
  ImagePlus,
  Loader2,
  MapPin,
  Minus,
  Moon,
  PenLine,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  Store,
  Sun,
  Trash2,
  Truck,
  Upload,
  UtensilsCrossed,
  VolumeX,
} from "lucide-react";
import {
  CreateRestaurantDishDraft,
  RestaurantEntity,
  RestaurantSalesMode,
} from "../../lib/types/database";
import { restaurantService } from "../../lib/services/restaurant-service";
import { processAndUploadRestaurantMedia } from "../../lib/services/media-upload";
import { hapticFeedback } from "../../lib/native/haptics";
import { LogoMarmite } from "../ui/logo-marmite";
import { QrCodeDisplay } from "../ui/qr-code-display";
import { AppSelect } from "../ui/app-select";
import {
  BANNER_PRESETS,
  BENIN_CULINARY_SPECIALTIES,
  DISH_PHOTO_PRESETS,
  MENU_COURSE_CATEGORIES,
  PREP_TIME_OPTIONS,
  QUICK_LOCATIONS,
  STANDARD_CLICBOUFFE_LOGOS,
  SUGGESTED_MENU_STARTERS,
  ZONE_OPTIONS,
} from "./restaurant-presets";
import { RestaurantLivePreview } from "./restaurant-live-preview";

export interface CreateRestaurantPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (restaurant: RestaurantEntity) => void;
  currentUserId: string;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function CreateRestaurantPageView({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
  theme = "light",
  onToggleTheme,
}: CreateRestaurantPageProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  // Étape 1 : Modèle & Identité
  const [salesMode, setSalesMode] = useState<RestaurantSalesMode>("hybrid");
  const [showModeDetails, setShowModeDetails] = useState<RestaurantSalesMode | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(BENIN_CULINARY_SPECIALTIES[0]);

  // Étape 2 : Marque, Logo, Couverture & Présentation
  const [logoUrl, setLogoUrl] = useState(STANDARD_CLICBOUFFE_LOGOS[0].url);
  const [bannerUrl, setBannerUrl] = useState(BANNER_PRESETS[0].img);
  const [description, setDescription] = useState("");
  const [uploadingTarget, setUploadingTarget] = useState<"logo" | "banner" | "dish" | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const dishPhotoInputRef = useRef<HTMLInputElement>(null);

  // Étape 3 : Constructeur du Menu de Plats
  const [menuDishes, setMenuDishes] = useState<CreateRestaurantDishDraft[]>([]);
  const [draftDishName, setDraftDishName] = useState("");
  const [draftDishCategory, setDraftDishCategory] = useState(MENU_COURSE_CATEGORIES[1]);
  const [draftDishPrice, setDraftDishPrice] = useState("1500");
  const [draftDishPrepMin, setDraftDishPrepMin] = useState(15);
  const [draftDishDesc, setDraftDishDesc] = useState("");
  const [draftDishPhoto, setDraftDishPhoto] = useState(DISH_PHOTO_PRESETS[0].img);
  const [draftDishCustomizable, setDraftDishCustomizable] = useState(true);
  const [draftDishFreeEligible, setDraftDishFreeEligible] = useState(false);

  // Étape 4 : Localisation, Horaires & Salle QR
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [avgPrepTimeMin, setAvgPrepTimeMin] = useState<number>(20);
  const [tablesCount, setTablesCount] = useState<number>(10);
  const [tableZones, setTableZones] = useState<string[]>(["Salle Principale", "Terrasse"]);
  const [allowsDineInComposition, setAllowsDineInComposition] = useState(true);
  const [allowsWaiterCall, setAllowsWaiterCall] = useState(true);
  const [acceptsCashOnSite, setAcceptsCashOnSite] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewSlug = useMemo(() => {
    const base = (name.trim() || "mon-restaurant")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "mon-restaurant";
  }, [name]);

  const previewQrUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://clicbouffe-web.vercel.app";
    return `${origin}/?resto=${previewSlug}&table=Table-1`;
  }, [previewSlug]);

  // Menu regroupé par catégorie pour l'affichage en carte de restaurant dans l'éditeur
  const groupedMenu = useMemo(() => {
    return menuDishes.reduce<Record<string, { item: CreateRestaurantDishDraft; index: number }[]>>(
      (acc, dish, idx) => {
        const key = dish.categoryLabel || "Plats Principaux";
        if (!acc[key]) acc[key] = [];
        acc[key].push({ item: dish, index: idx });
        return acc;
      },
      {}
    );
  }, [menuDishes]);

  if (!isOpen) return null;

  const isCustomLogo = !STANDARD_CLICBOUFFE_LOGOS.some((l) => l.url === logoUrl);
  const isCustomBanner = !BANNER_PRESETS.some((b) => b.img === bannerUrl);
  const isCustomDishPhoto = !DISH_PHOTO_PRESETS.some((p) => p.img === draftDishPhoto);
  const isDineInEnabled = salesMode === "hybrid" || salesMode === "dine_in_only";

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "banner" | "dish"
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setErrorMsg(null);
    setUploadingTarget(target);
    const folder = target === "logo" ? "logos" : target === "banner" ? "covers" : "dishes";
    const { url, error } = await processAndUploadRestaurantMedia(file, folder);
    setUploadingTarget(null);

    if (error || !url) {
      setErrorMsg(error || "Impossible d'importer cette photo.");
      return;
    }

    hapticFeedback("medium");
    if (target === "logo") setLogoUrl(url);
    if (target === "banner") setBannerUrl(url);
    if (target === "dish") setDraftDishPhoto(url);
  };

  const handleAddMenuDish = () => {
    setErrorMsg(null);
    if (draftDishName.trim().length < 2) {
      setErrorMsg("Veuillez saisir le nom du plat (2 caractères minimum).");
      return;
    }
    const parsedPrice = parseInt(draftDishPrice.replace(/\D/g, ""), 10);
    const safePrice = Number.isFinite(parsedPrice) ? Math.min(500000, Math.max(0, parsedPrice)) : 0;

    hapticFeedback("medium");
    setMenuDishes((prev) => [
      ...prev,
      {
        name: draftDishName.trim(),
        description: draftDishDesc.trim(),
        price: safePrice,
        categoryLabel: draftDishCategory,
        prepTimeMin: draftDishPrepMin,
        imageUrl: draftDishPhoto,
        isFreeEligible: draftDishFreeEligible,
        allowsCustomization: draftDishCustomizable,
      },
    ]);

    setDraftDishName("");
    setDraftDishDesc("");
    setDraftDishPrice("1500");
    setDraftDishFreeEligible(false);
  };

  const handleRemoveMenuDish = (indexToRemove: number) => {
    hapticFeedback("light");
    setMenuDishes((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLoadSuggestedMenu = () => {
    hapticFeedback("medium");
    setMenuDishes((prev) => {
      const existingNames = new Set(prev.map((d) => d.name.toLowerCase()));
      const additions = SUGGESTED_MENU_STARTERS.filter((s) => !existingNames.has(s.name.toLowerCase()));
      return [...prev, ...additions];
    });
  };

  const toggleZone = (zone: string) => {
    hapticFeedback("light");
    setTableZones((prev) => {
      if (prev.includes(zone)) {
        return prev.length > 1 ? prev.filter((z) => z !== zone) : prev;
      }
      return [...prev, zone];
    });
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    hapticFeedback("light");
    if (step === 1) {
      if (name.trim().length < 2) {
        setErrorMsg("Veuillez renseigner le nom de votre établissement (2 caractères min).");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setStep(1);
      setMobileView("editor");
      setErrorMsg("Veuillez renseigner le nom de votre restaurant.");
      return;
    }
    if (address.trim().length < 3) {
      setStep(4);
      setMobileView("editor");
      setErrorMsg("Veuillez renseigner le quartier ou l'adresse.");
      return;
    }
    if (phoneNumber.trim().length < 8) {
      setStep(4);
      setMobileView("editor");
      setErrorMsg("Veuillez renseigner un numéro de téléphone de contact valide.");
      return;
    }

    setIsLoading(true);
    hapticFeedback("medium");

    try {
      const { restaurant, error } = await restaurantService.createRestaurant({
        ownerId: currentUserId,
        name: name.trim(),
        category,
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        openTime,
        closeTime,
        description: description.trim(),
        bannerUrl,
        logoUrl,
        salesMode,
        tablesCount: salesMode === "online_only" ? 0 : tablesCount,
        tableZones,
        avgPrepTimeMin,
        allowsDineInComposition,
        allowsWaiterCall: salesMode === "online_only" ? false : allowsWaiterCall,
        acceptsCashOnSite,
        initialDishes: menuDishes,
      });

      if (error || !restaurant) {
        setErrorMsg(error || "Une erreur est survenue lors de la création du restaurant.");
      } else {
        hapticFeedback("heavy");
        onSuccess(restaurant);
        onClose();
      }
    } catch {
      setErrorMsg("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-restaurant-page-title"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200"
    >
      {/* Inputs fichiers cachés pour importation Galerie */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleGalleryUpload(e, "logo")}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleGalleryUpload(e, "banner")}
      />
      <input
        ref={dishPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleGalleryUpload(e, "dish")}
      />

      {/* En-tête Sticky Pleine Largeur */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            data-modal-close={step === 1 ? "" : undefined}
            onClick={() => {
              hapticFeedback("light");
              if (mobileView === "preview") {
                setMobileView("editor");
                return;
              }
              if (step > 1) {
                setStep((prev) => (prev === 4 ? 3 : prev === 3 ? 2 : 1));
                setErrorMsg(null);
              } else {
                onClose();
              }
            }}
            aria-label={mobileView === "preview" ? "Revenir à l'éditeur" : step > 1 ? "Étape précédente" : "Retour"}
            className="w-11 h-11 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center justify-center gap-2 min-w-0">
            <LogoMarmite
              size={28}
              withBackground={false}
              potColor={theme === "dark" ? "#ffffff" : "#00AFF2"}
              cursorColor={theme === "dark" ? "#00AFF2" : "#ffffff"}
              className="w-6 h-6 shrink-0"
            />
            <span
              id="create-restaurant-page-title"
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap"
            >
              Créer mon Restaurant
            </span>
          </div>

          <div className="w-11 h-11 shrink-0 flex items-center justify-end">
            {onToggleTheme && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  onToggleTheme();
                }}
                aria-label="Basculer le thème"
                className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Barre Stepper 4 étapes + Bascule Mobile Éditeur / Aperçu Live */}
        <div className="max-w-6xl mx-auto mt-3 space-y-2">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { id: 1 as const, short: "1. Modèle", label: "1. Modèle & Nom" },
              { id: 2 as const, short: "2. Marque", label: "2. Logo & Couverture" },
              { id: 3 as const, short: "3. Menu", label: `3. Menu (${menuDishes.length})` },
              { id: 4 as const, short: "4. Lieu QR", label: "4. Lieu & Salle QR" },
            ].map((item) => {
              const isActive = step === item.id;
              const isCompleted = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    hapticFeedback("light");
                    setErrorMsg(null);
                    setMobileView("editor");
                    setStep(item.id);
                  }}
                  className={`min-h-[42px] py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all truncate cursor-pointer ${
                    isActive
                      ? "bg-[#00AFF2] text-white border-[#00AFF2] shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Switcher Mobile Éditeur <-> Aperçu en direct */}
          <div className="lg:hidden grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setMobileView("editor");
              }}
              className={`min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "editor"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <PenLine className="w-3.5 h-3.5 text-[#00AFF2]" />
              <span>Éditeur ({step}/4)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setMobileView("preview");
              }}
              className={`min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "preview"
                  ? "bg-white dark:bg-slate-900 text-[#00AFF2] shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#00AFF2]" />
              <span>Aperçu page ({menuDishes.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu Principal : Split Formulaire + Aperçu Live Sticky sur Desktop */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne Formulaire */}
          <form
            onSubmit={handleSubmit}
            className={`lg:col-span-7 space-y-5 ${mobileView === "preview" ? "hidden lg:block" : "block"}`}
          >
            {/* Bandeau mini-aperçu instantané visible sur mobile pendant l'édition */}
            <div className="lg:hidden p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    unoptimized={logoUrl.startsWith("data:") || logoUrl.startsWith("http")}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {name.trim() || "Mon Restaurant ClicBouffe"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {menuDishes.length} {menuDishes.length > 1 ? "plats ajoutés" : "plat ajouté"} •{" "}
                    {salesMode === "hybrid" ? "Salle QR + App" : salesMode === "dine_in_only" ? "Salle QR" : "En ligne"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setMobileView("preview");
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] border border-sky-200 dark:border-sky-800 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* ÉTAPE 1 : MODÈLE D'EXPLOITATION & IDENTITÉ CULINAIRE */}
            {/* ============================================================== */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00AFF2]">
                      Configuration de votre espace
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      Comment souhaitez-vous utiliser ClicBouffe ?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Vendez simplement vos plats en ligne ou digitalisez entièrement votre restaurant pour servir vos clients assis en salle.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "hybrid" as RestaurantSalesMode,
                        title: "Complet (Salle QR + App)",
                        badge: "Recommandé",
                        desc: "Livraison sur l'app + Menu QR à table, commande autonome, composition et appel serveur.",
                        icon: Store,
                        advantages: [
                          "Visibilité maximale : Marketplace livraison + Recherche + Salle QR",
                          "Menu interactif par table, composition sur mesure et appel serveur silencieux",
                          "Gestion unifiée en temps réel dans un seul tableau de bord KDS",
                        ],
                        limits: [] as string[],
                      },
                      {
                        id: "online_only" as RestaurantSalesMode,
                        title: "Vente en ligne simple",
                        badge: "Marketplace",
                        desc: "Publiez vos plats sur l'app pour la livraison express et les commandes à emporter.",
                        icon: Truck,
                        advantages: [
                          "Mise en ligne immédiate sans aucune installation en salle",
                          "Commandes de livraison et à emporter avec tarif officiel FCFA",
                          "Idéal pour dark kitchens, traiteurs ou vendeurs à domicile",
                        ],
                        limits: [
                          "Pas de QR codes de tables ni de prise de commande assise sur place",
                          "Pas de bouton d'appel serveur ou de demandes silencieuses en salle",
                        ],
                      },
                      {
                        id: "dine_in_only" as RestaurantSalesMode,
                        title: "Service en salle (QR)",
                        badge: "Restau connecté",
                        desc: "Vos clients scannent le QR à leur table, composent leur plat et appellent le serveur.",
                        icon: QrCode,
                        advantages: [
                          "Zéro frais de livraison : vos clients commandent directement depuis leur table",
                          "Réduit la charge des serveurs grâce à la commande autonome et aux demandes en sourdine",
                          "QR codes et liens directs générés automatiquement pour chaque table",
                        ],
                        limits: [
                          "Aucune commande en livraison à domicile depuis la marketplace",
                          "Accessible uniquement aux clients présents sur place ou via votre lien direct",
                        ],
                      },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const active = salesMode === mode.id;
                      const isDetailsOpen = active && showModeDetails === mode.id;
                      return (
                        <div
                          key={mode.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={active}
                          onClick={() => {
                            hapticFeedback("light");
                            if (salesMode !== mode.id) {
                              setShowModeDetails(null);
                            }
                            setSalesMode(mode.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              hapticFeedback("light");
                              if (salesMode !== mode.id) {
                                setShowModeDetails(null);
                              }
                              setSalesMode(mode.id);
                            }
                          }}
                          className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            active
                              ? "border-[#00AFF2] bg-sky-50/70 dark:bg-sky-950/40 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                active
                                  ? "bg-[#00AFF2] text-white"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                active
                                  ? "bg-[#00AFF2] text-white"
                                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {mode.badge}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {mode.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                              {mode.desc}
                            </p>

                            {active && (
                              <div className="mt-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    hapticFeedback("light");
                                    setShowModeDetails((prev) => (prev === mode.id ? null : mode.id));
                                  }}
                                  aria-expanded={isDetailsOpen}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AFF2] hover:underline py-1 cursor-pointer"
                                >
                                  <span>{isDetailsOpen ? "Masquer les avantages" : "Voir les avantages"}</span>
                                  {isDetailsOpen ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {isDetailsOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-2 p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150"
                                  >
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                                        Avantages
                                      </p>
                                      <ul className="space-y-1">
                                        {mode.advantages.map((adv) => (
                                          <li
                                            key={adv}
                                            className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 leading-snug"
                                          >
                                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{adv}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {mode.limits.length > 0 && (
                                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                                          Limites à connaître
                                        </p>
                                        <ul className="space-y-1">
                                          {mode.limits.map((lim) => (
                                            <li
                                              key={lim}
                                              className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-snug"
                                            >
                                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                              <span>{lim}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Identité & Spécialité Culinaires */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#00AFF2]" />
                    <span>Identité de votre établissement</span>
                  </h2>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Nom du restaurant <span className="text-[#00AFF2]">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={80}
                        placeholder="Ex: Le Maquis du Port, Chez Maman Cécile..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#00AFF2] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Spécialité culinaire principale (Mets africains & béninois)
                    </label>
                    <AppSelect
                      value={category}
                      onChange={setCategory}
                      options={BENIN_CULINARY_SPECIALTIES}
                      label="Spécialité culinaire principale"
                    />
                  </div>
                </section>
              </div>
            )}

            {/* ============================================================== */}
            {/* ÉTAPE 2 : LOGO, PHOTO DE COUVERTURE (GALERIE) & PRÉSENTATION */}
            {/* ============================================================== */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Sélection ou Importation du Logo */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#00AFF2]" />
                        <span>Logo de votre restaurant</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Choisissez un logo standard ClicBouffe ou importez le vôtre depuis votre galerie.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingTarget === "logo"}
                      onClick={() => {
                        hapticFeedback("light");
                        logoInputRef.current?.click();
                      }}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-950 text-[#00AFF2] border border-sky-200 dark:border-sky-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {uploadingTarget === "logo" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Importer mon logo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {STANDARD_CLICBOUFFE_LOGOS.map((preset) => {
                      const selected = logoUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            hapticFeedback("light");
                            setLogoUrl(preset.url);
                          }}
                          className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            selected
                              ? "border-[#00AFF2] bg-sky-50/70 dark:bg-sky-950/40 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300"
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                            {selected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight line-clamp-1">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isCustomLogo && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-white shrink-0">
                          <Image
                            src={logoUrl}
                            alt="Logo importé"
                            fill
                            unoptimized={logoUrl.startsWith("data:") || logoUrl.startsWith("http")}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            Logo personnalisé importé depuis votre galerie
                          </p>
                          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
                            Optimisé automatiquement pour un affichage rapide.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer shrink-0"
                      >
                        Changer
                      </button>
                    </div>
                  )}
                </section>

                {/* Photo de Couverture (Presets + Galerie) & Présentation */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <ImagePlus className="w-4 h-4 text-[#00AFF2]" />
                        <span>Photo de couverture</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Sélectionnez une image ou importez la photo de votre restaurant depuis la galerie.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingTarget === "banner"}
                      onClick={() => {
                        hapticFeedback("light");
                        bannerInputRef.current?.click();
                      }}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-950 text-[#00AFF2] border border-sky-200 dark:border-sky-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {uploadingTarget === "banner" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Depuis la galerie</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {BANNER_PRESETS.map((preset) => {
                      const selected = bannerUrl === preset.img;
                      return (
                        <button
                          key={preset.img}
                          type="button"
                          onClick={() => {
                            hapticFeedback("light");
                            setBannerUrl(preset.img);
                          }}
                          className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            selected
                              ? "border-[#00AFF2] ring-2 ring-[#00AFF2]/30 scale-[1.02]"
                              : "border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image src={preset.img} alt={preset.label} fill className="object-cover" />
                          {selected && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isCustomBanner && (
                    <div className="relative h-28 rounded-2xl overflow-hidden border-2 border-[#00AFF2]">
                      <Image
                        src={bannerUrl}
                        alt="Couverture personnalisée"
                        fill
                        unoptimized={bannerUrl.startsWith("data:") || bannerUrl.startsWith("http")}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-between px-3 py-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#00AFF2] text-white text-[10px] font-bold">
                          Photo galerie sélectionnée
                        </span>
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold cursor-pointer"
                        >
                          Changer
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Présentation & Plats phares
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Décrivez votre cuisine, vos plats signatures, vos sauces maison et l'ambiance de votre salle..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#00AFF2] outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ============================================================== */}
            {/* ÉTAPE 3 : CRÉATEUR DE MENU & AFFICHAGE CARTE DE RESTAURANT */}
            {/* ============================================================== */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#00AFF2]" />
                        <span>Créer votre Menu de Plats</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ajoutez vos mets avec leur catégorie, description, prix et photo. Tout est synchronisé dès l&apos;ouverture.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoadSuggestedMenu}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-[#00AFF2]" />
                      <span>Idées béninoises</span>
                    </button>
                  </div>

                  {/* Formulaire d'ajout d'un met */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Titre du met <span className="text-[#00AFF2]">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          placeholder="Ex: Amiwo Poulet, Atassi complet, Dakouin..."
                          value={draftDishName}
                          onChange={(e) => setDraftDishName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-[#00AFF2]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Catégorie sur la carte
                        </label>
                        <AppSelect
                          value={draftDishCategory}
                          onChange={setDraftDishCategory}
                          options={MENU_COURSE_CATEGORIES}
                          label="Catégorie sur la carte"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Prix (FCFA) <span className="text-[#00AFF2]">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={500000}
                          step={50}
                          value={draftDishPrice}
                          onChange={(e) => setDraftDishPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#00AFF2]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Temps de prép. (min)
                        </label>
                        <AppSelect
                          value={String(draftDishPrepMin)}
                          onChange={(val) => setDraftDishPrepMin(Number(val) || 15)}
                          options={["5", "10", "15", "20", "30", "45"].map((m) => ({
                            value: m,
                            label: `${m} min`,
                          }))}
                          label="Temps de préparation"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Description & accompagnements
                      </label>
                      <textarea
                        rows={2}
                        maxLength={300}
                        placeholder="Ex: Servi chaud avec sauce tomate pimentée, oignons confits et wagashi frit..."
                        value={draftDishDesc}
                        onChange={(e) => setDraftDishDesc(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#00AFF2] resize-none"
                      />
                    </div>

                    {/* Photo du met : Galerie ou Presets */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Photo du plat
                        </label>
                        <button
                          type="button"
                          disabled={uploadingTarget === "dish"}
                          onClick={() => dishPhotoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 text-[#00AFF2] border border-sky-200 dark:border-sky-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {uploadingTarget === "dish" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>Depuis la galerie</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {isCustomDishPhoto && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#00AFF2] shrink-0">
                            <Image
                              src={draftDishPhoto}
                              alt="Plat importé"
                              fill
                              unoptimized={draftDishPhoto.startsWith("data:") || draftDishPhoto.startsWith("http")}
                              className="object-cover"
                            />
                            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          </div>
                        )}
                        {DISH_PHOTO_PRESETS.map((preset) => {
                          const selected = draftDishPhoto === preset.img;
                          return (
                            <button
                              key={preset.img}
                              type="button"
                              title={preset.label}
                              onClick={() => {
                                hapticFeedback("light");
                                setDraftDishPhoto(preset.img);
                              }}
                              className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                selected
                                  ? "border-[#00AFF2] ring-2 ring-[#00AFF2]/30"
                                  : "border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
                              }`}
                            >
                              <Image src={preset.img} alt={preset.label} fill className="object-cover" />
                              {selected && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00AFF2] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftDishCustomizable}
                            onChange={(e) => setDraftDishCustomizable(e.target.checked)}
                            className="w-4 h-4 accent-[#00AFF2]"
                          />
                          <span>Personnalisable</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftDishFreeEligible}
                            onChange={(e) => setDraftDishFreeEligible(e.target.checked)}
                            className="w-4 h-4 accent-[#00AFF2]"
                          />
                          <span>1er plat offert</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddMenuDish}
                        className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#00AFF2] dark:hover:bg-[#0098d4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Ajouter ce plat au menu</span>
                      </button>
                    </div>
                  </div>

                  {/* Carte de Restaurant Structurée des Plats Ajoutés */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Votre Carte Actuelle ({menuDishes.length})
                      </h3>
                    </div>

                    {menuDishes.length === 0 ? (
                      <div className="p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Votre carte est encore vide
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ajoutez vos plats ci-dessus ou cliquez sur <strong>Idées béninoises</strong> pour démarrer vite.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                        {Object.entries(groupedMenu).map(([catLabel, entries]) => (
                          <div key={catLabel} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-[#00AFF2]">
                                {catLabel}
                              </span>
                              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                              {entries.map(({ item, index }) => (
                                <div
                                  key={`${item.name}-${index}`}
                                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                      <Image
                                        src={item.imageUrl || "/images/dish_pate_rouge.jpg"}
                                        alt={item.name}
                                        fill
                                        unoptimized={Boolean(item.imageUrl?.startsWith("data:") || item.imageUrl?.startsWith("http"))}
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                          {item.name}
                                        </p>
                                        {item.isFreeEligible && (
                                          <span className="px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-[#00AFF2] text-[9px] font-bold shrink-0">
                                            1er Offert
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs font-black text-[#00AFF2]">
                                        {item.price.toLocaleString("fr-FR")}&nbsp;FCFA • {item.prepTimeMin} min
                                      </p>
                                      {item.description && (
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMenuDish(index)}
                                    aria-label={`Retirer ${item.name}`}
                                    className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* ============================================================== */}
            {/* ÉTAPE 4 : LOCALISATION, DÉLAIS, SALLE & QR CODE */}
            {/* ============================================================== */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00AFF2]" />
                    <span>Localisation & Coordonnées</span>
                  </h2>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Quartier & Adresse complète <span className="text-[#00AFF2]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={160}
                        placeholder="Ex: Akpakpa, Terrain Zico..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00AFF2] outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {QUICK_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            hapticFeedback("light");
                            setAddress(loc);
                          }}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/40 text-slate-600 dark:text-slate-300 hover:text-[#00AFF2] text-[10px] font-semibold border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Téléphone & WhatsApp du restaurant <span className="text-[#00AFF2]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={30}
                        placeholder="+229 97 00 11 22"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00AFF2] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Heure d&apos;ouverture
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Heure de fermeture
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Délai moyen de préparation */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>Délai moyen de préparation & service</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Affiché au client sur place ou en ligne dès validation de la commande.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] text-xs font-black border border-sky-200 dark:border-sky-800">
                      {avgPrepTimeMin} min
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {PREP_TIME_OPTIONS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          hapticFeedback("light");
                          setAvgPrepTimeMin(mins);
                        }}
                        className={`min-h-[44px] py-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                          avgPrepTimeMin === mins
                            ? "bg-[#00AFF2] text-white border-[#00AFF2] shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </section>

                {isDineInEnabled && (
                  <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#00AFF2]" />
                        <span>Tables, Zones de Salle & QR Code</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Chaque table dispose d&apos;un QR code unique et d&apos;un lien direct.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Nombre de tables en salle
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Table 1 à Table {tablesCount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            hapticFeedback("light");
                            setTablesCount((c) => Math.max(1, c - 1));
                          }}
                          className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
                          aria-label="Diminuer le nombre de tables"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-black text-[#00AFF2]">
                          {tablesCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            hapticFeedback("light");
                            setTablesCount((c) => Math.min(200, c + 1));
                          }}
                          className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
                          aria-label="Augmenter le nombre de tables"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        Zones disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ZONE_OPTIONS.map((z) => {
                          const selected = tableZones.includes(z);
                          return (
                            <button
                              key={z}
                              type="button"
                              onClick={() => toggleZone(z)}
                              className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                selected
                                  ? "bg-[#00AFF2] text-white border-[#00AFF2] shadow-2xs"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {selected && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{z}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

                {/* Services Clients Activés */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#00AFF2]" />
                    <span>Services Clients Activés</span>
                  </h2>

                  <div className="space-y-2.5">
                    <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <UtensilsCrossed className="w-4 h-4 text-[#00AFF2] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Composition libre de plat sur place & en ligne
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Les clients peuvent choisir base, sauce, protéines et suppléments.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowsDineInComposition}
                        onChange={(e) => setAllowsDineInComposition(e.target.checked)}
                        className="w-4 h-4 accent-[#00AFF2] shrink-0"
                      />
                    </label>

                    {isDineInEnabled && (
                      <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <VolumeX className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              Appel serveur & Demandes silencieuses (En sourdine)
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Appels en 1 clic ou messages discrets transmis instantanément en cuisine/comptoir.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={allowsWaiterCall}
                          onChange={(e) => setAllowsWaiterCall(e.target.checked)}
                          className="w-4 h-4 accent-[#00AFF2] shrink-0"
                        />
                      </label>
                    )}

                    <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <BellRing className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Paiement sur place / à la livraison en plus de Mobile Money
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Autorise le règlement à table/caisse ou à la réception.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={acceptsCashOnSite}
                        onChange={(e) => setAcceptsCashOnSite(e.target.checked)}
                        className="w-4 h-4 accent-[#00AFF2] shrink-0"
                      />
                    </label>
                  </div>
                </section>

                {/* Aperçu Pass QR */}
                {isDineInEnabled && (
                  <section className="bg-linear-to-br from-sky-500/10 via-white to-emerald-500/10 dark:from-sky-950/40 dark:via-slate-900 dark:to-emerald-950/30 rounded-3xl p-4 sm:p-5 border border-sky-200/80 dark:border-sky-800/60 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                    <QrCodeDisplay
                      value={previewQrUrl}
                      size={112}
                      label={`${name.trim() || "Mon Restaurant"} • Table 1`}
                      className="shrink-0"
                    />
                    <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00AFF2] text-white text-[10px] font-black uppercase">
                        <QrCode className="w-3 h-3" />
                        <span>Prêt dès l&apos;ouverture</span>
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        QR Code Salle & Lien Direct générés automatiquement
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Retrouvez toutes vos affichettes par table dans l&apos;onglet <strong>Salle & QR Codes</strong> de votre tableau de bord KDS.
                      </p>
                    </div>
                  </section>
                )}
              </div>
            )}
          </form>

          {/* Colonne Aperçu Global Temps Réel (Sticky Desktop / Plein Écran Mobile) */}
          <aside
            className={`lg:col-span-5 lg:sticky lg:top-32 ${
              mobileView === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <RestaurantLivePreview
              name={name}
              category={category}
              description={description}
              address={address}
              openTime={openTime}
              closeTime={closeTime}
              bannerUrl={bannerUrl}
              logoUrl={logoUrl}
              salesMode={salesMode}
              avgPrepTimeMin={avgPrepTimeMin}
              tablesCount={tablesCount}
              allowsDineInComposition={allowsDineInComposition}
              allowsWaiterCall={allowsWaiterCall}
              dishes={menuDishes}
            />
          </aside>
        </div>
      </main>

      {/* Barre d'Action Fixe en Bas (Mobile-First Safe Area) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-3 sm:px-4 sm:pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {mobileView === "preview" ? (
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setMobileView("editor");
              }}
              className="w-full min-h-[44px] py-2.5 px-5 bg-slate-900 dark:bg-[#00AFF2] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Continuer la modification</span>
            </button>
          ) : (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback("light");
                    setErrorMsg(null);
                    setStep((prev) => (prev === 4 ? 3 : prev === 3 ? 2 : 1));
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Précédent
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="min-h-[44px] flex-1 sm:flex-initial sm:min-w-[210px] py-2.5 px-5 bg-[#00AFF2] hover:bg-[#0098d4] active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="min-h-[44px] flex-1 sm:flex-initial sm:min-w-[240px] py-2.5 px-5 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ouverture en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Ouvrir mon restaurant</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
