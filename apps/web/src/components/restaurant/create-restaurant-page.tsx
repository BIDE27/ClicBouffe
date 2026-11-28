"use client";

import React, { useState, useMemo } from "react";
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
  FileText,
  Flame,
  Loader2,
  MapPin,
  Minus,
  Moon,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  Store,
  Sun,
  Truck,
  UtensilsCrossed,
  VolumeX,
} from "lucide-react";
import { RestaurantEntity, RestaurantSalesMode } from "../../lib/types/database";
import { restaurantService } from "../../lib/services/restaurant-service";
import { hapticFeedback } from "../../lib/native/haptics";
import { LogoMarmite } from "../ui/logo-marmite";
import { QrCodeDisplay } from "../ui/qr-code-display";

export interface CreateRestaurantPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (restaurant: RestaurantEntity) => void;
  currentUserId: string;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const CATEGORY_OPTIONS = [
  "Cuisine Locale & Pâtes (Amiwo, Pâte noire)",
  "Maquis & Grillades (Poissons, Brochettes)",
  "Chawarma & Wraps",
  "Fast-Food & Burgers",
  "Poissons Braisés & Fruits de Mer",
  "Douceurs, Boissons & Gari",
];

const QUICK_LOCATIONS = [
  "Akpakpa, Terrain Zico",
  "Akpakpa, Zone Portuaire",
  "Enagnon, Cotonou",
  "Haie Vive, Cotonou",
  "Cadjehoun, Cotonou",
  "Fidjrossè, Route des Pêches",
];

const BANNER_PRESETS = [
  { label: "Maquis & Grillades", img: "/images/restau_maquis.jpg" },
  { label: "Cuisine Locale", img: "/images/restau_cecile.jpg" },
  { label: "Saveurs du Terroir", img: "/images/restau_saveurs.jpg" },
  { label: "Burger Gourmet", img: "/images/amberger_banner.jpg" },
  { label: "Chawarma & Grill", img: "/images/restau_chawarma.jpg" },
  { label: "Festin Africain", img: "/images/restau_delice.jpg" },
];

const ZONE_OPTIONS = [
  "Salle Principale",
  "Terrasse",
  "Espace VIP",
  "Comptoir",
  "Jardin",
  "Étage",
];

const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45];

export function CreateRestaurantPageView({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
  theme = "light",
  onToggleTheme,
}: CreateRestaurantPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [salesMode, setSalesMode] = useState<RestaurantSalesMode>("hybrid");
  const [showModeDetails, setShowModeDetails] = useState<RestaurantSalesMode | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [bannerUrl, setBannerUrl] = useState(BANNER_PRESETS[0].img);
  const [description, setDescription] = useState("");

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

  if (!isOpen) return null;

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
      if (address.trim().length < 3) {
        setErrorMsg("Veuillez indiquer votre quartier ou adresse précise.");
        return;
      }
      if (phoneNumber.trim().length < 8) {
        setErrorMsg("Veuillez renseigner un numéro de téléphone ou WhatsApp valide.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setStep(1);
      setErrorMsg("Veuillez renseigner le nom de votre restaurant.");
      return;
    }
    if (address.trim().length < 3) {
      setStep(2);
      setErrorMsg("Veuillez renseigner le quartier ou l'adresse.");
      return;
    }
    if (phoneNumber.trim().length < 8) {
      setStep(2);
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
        logoUrl: bannerUrl,
        salesMode,
        tablesCount: salesMode === "online_only" ? 0 : tablesCount,
        tableZones,
        avgPrepTimeMin,
        allowsDineInComposition,
        allowsWaiterCall: salesMode === "online_only" ? false : allowsWaiterCall,
        acceptsCashOnSite,
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

  const isDineInEnabled = salesMode === "hybrid" || salesMode === "dine_in_only";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-restaurant-page-title"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200"
    >
      {/* En-tête Sticky Pleine Largeur */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            data-modal-close={step === 1 ? "" : undefined}
            onClick={() => {
              hapticFeedback("light");
              if (step > 1) {
                setStep((prev) => (prev === 3 ? 2 : 1));
                setErrorMsg(null);
              } else {
                onClose();
              }
            }}
            aria-label={step > 1 ? "Étape précédente" : "Retour"}
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

        {/* Stepper interactif à 3 étapes */}
        <div className="max-w-3xl mx-auto mt-3 grid grid-cols-3 gap-2">
          {[
            { id: 1 as const, short: "1. Modèle", label: "1. Modèle & Identité" },
            { id: 2 as const, short: "2. Lieu", label: "2. Lieu & Délais" },
            { id: 3 as const, short: "3. Salle QR", label: "3. Salle & QR Code" },
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
                  setStep(item.id);
                }}
                className={`min-h-[44px] py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all truncate cursor-pointer ${
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
      </header>

      {/* Corps du Formulaire Pleine Page */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-32">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* ÉTAPE 1 : MODÈLE DE SERVICE & IDENTITÉ CULINAIRE */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Choix du mode de fonctionnement ClicBouffe */}
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

              {/* Identité & Vitrine Visuelle */}
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
                      placeholder="Ex: Le Maquis du Port, Chez Maman Cécile..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#00AFF2] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Spécialité culinaire principale
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#00AFF2] outline-none transition-colors"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} className="dark:bg-slate-800">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Choix de la bannière de couverture */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                    Photo de couverture de votre page restaurant
                  </label>
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
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Présentation & Plats phares
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
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
          {/* ÉTAPE 2 : LOCALISATION, CONTACT, HORAIRES & DÉLAI DE SERVICE */}
          {/* ============================================================== */}
          {step === 2 && (
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

              {/* Engagement de Délai de Service */}
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
            </div>
          )}

          {/* ============================================================== */}
          {/* ÉTAPE 3 : SERVICE EN SALLE, APPEL SERVEUR & QR CODE TABLES */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {isDineInEnabled && (
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[#00AFF2]" />
                      <span>Configuration des Tables & Zones de Salle</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Chaque table dispose d&apos;un QR code unique et d&apos;un lien direct pour commander sans attendre un serveur.
                    </p>
                  </div>

                  {/* Nombre de tables */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Nombre de tables en salle
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Génération automatique des QR codes Table 1 à Table {tablesCount}
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

                  {/* Zones */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                      Zones disponibles dans votre établissement
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

              {/* Services Interactifs pour les Clients */}
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
                          Les clients peuvent choisir leur base, sauce, protéines et suppléments sur mesure.
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
                            Les clients peuvent appeler un serveur en 1 clic ou écrire une demande discrète reçue instantanément sur votre tableau de bord.
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
                          Paiement sur place / à la réception en plus de Mobile Money
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Autorise les clients en salle à régler directement à table ou via leur portefeuille ClicBouffe.
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

              {/* Aperçu du Pass QR & Lien Direct (Salle) ou Vitrine en ligne */}
              {isDineInEnabled ? (
                <section className="bg-linear-to-br from-sky-500/10 via-white to-emerald-500/10 dark:from-sky-950/40 dark:via-slate-900 dark:to-emerald-950/30 rounded-3xl p-4 sm:p-5 border border-sky-200/80 dark:border-sky-800/60 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <QrCodeDisplay
                    value={previewQrUrl}
                    size={120}
                    label={`${name.trim() || "Mon Restaurant"} • Table 1`}
                    className="shrink-0"
                  />
                  <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00AFF2] text-white text-[10px] font-black uppercase">
                      <QrCode className="w-3 h-3" />
                      <span>Prêt dès l&apos;ouverture</span>
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Votre QR Code Salle & Lien Direct sont générés automatiquement
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Dès la validation, accédez à l&apos;onglet <strong>Salle & QR Codes</strong> de votre tableau de bord KDS pour imprimer vos affichettes par table et recevoir les commandes et appels en direct.
                    </p>
                  </div>
                </section>
              ) : (
                <section className="bg-linear-to-br from-sky-500/10 via-white to-sky-500/5 dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-4 sm:p-5 border border-sky-200/80 dark:border-sky-800/60 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00AFF2] text-white flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Boutique ClicBouffe en ligne prête
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Votre restaurant sera visible dans la recherche et le catalogue de livraison dès ouverture. Vous pourrez activer le service sur place QR à tout moment.
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </form>
      </main>

      {/* Barre d'Action Fixe en Bas (Mobile-First Safe Area) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-3 sm:px-4 sm:pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setErrorMsg(null);
                setStep((prev) => (prev === 3 ? 2 : 1));
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Précédent
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 sm:flex-initial sm:min-w-[210px] py-2.5 px-5 bg-[#00AFF2] hover:bg-[#0098d4] active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial sm:min-w-[240px] py-2.5 px-5 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
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
        </div>
      </footer>
    </div>
  );
}
