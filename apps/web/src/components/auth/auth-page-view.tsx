"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Store,
  Wallet,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UserProfile, RestaurantEntity } from "../../lib/types/database";
import { authService } from "../../lib/services/auth-service";
import { hapticFeedback } from "../../lib/native/haptics";
import { LogoMarmite } from "../ui/logo-marmite";

export interface AuthPageViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
  initialTab?: "login" | "signup";
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  userRestaurants?: RestaurantEntity[];
  walletBalance?: number;
  onOpenWallet?: () => void;
}

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

export function AuthPageView({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onSignOut,
  initialTab = "login",
  theme = "dark",
  onToggleTheme,
  userRestaurants = [],
  walletBalance = 0,
  onOpenWallet,
}: AuthPageViewProps) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Synchronisation de l'état lors de l'ouverture (Pattern React 19 sans effet en cascade)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }

  // Interception de la touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hapticFeedback("light");
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    hapticFeedback("medium");

    // Validation des mots de passe pour l'inscription
    if (tab === "signup") {
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
        hapticFeedback("light");
        return;
      }
      if (password !== confirmPassword) {
        setIsLoading(false);
        setErrorMsg("Les mots de passe ne correspondent pas. Veuillez vérifier votre saisie.");
        hapticFeedback("light");
        return;
      }
    }

    try {
      if (tab === "login") {
        const { profile, error } = await authService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
          hapticFeedback("light");
        } else if (profile) {
          hapticFeedback("heavy");
          setSuccessMsg("Connexion réussie ! Heureux de vous revoir.");
          setTimeout(() => {
            onSuccess(profile);
            onClose();
          }, 450);
        }
      } else {
        const { profile, error } = await authService.signUp({
          email,
          password,
          fullName: fullName.trim() || "Utilisateur ClicBouffe",
          phone: phone.trim() || undefined,
        });

        if (error) {
          setErrorMsg(error);
          hapticFeedback("light");
        } else if (profile) {
          hapticFeedback("heavy");
          setSuccessMsg("Compte créé avec succès ! Bienvenue sur ClicBouffe.");
          setTimeout(() => {
            onSuccess(profile);
            onClose();
          }, 450);
        }
      }
    } catch {
      setErrorMsg("Une erreur inattendue est survenue lors de l'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    hapticFeedback("medium");
    setIsLoading(true);
    try {
      await authService.signOut();
      if (onSignOut) {
        onSignOut();
      }
      hapticFeedback("heavy");
      setSuccessMsg("Vous avez été déconnecté avec succès.");
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch {
      setErrorMsg("Impossible de finaliser la déconnexion.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-y-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Page d'authentification et gestion de compte"
    >
      {/* 1. BARRE SUPÉRIEURE DE NAVIGATION PLEINE LARGEUR */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between pt-safe transition-colors">
        {/* Bouton Retour élégant */}
        <button
          onClick={() => {
            hapticFeedback("light");
            onClose();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          aria-label="Retour à l'application"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Retour</span>
        </button>

        {/* Identité Visuelle Centrale */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onClose()}>
          <LogoMarmite
            size={32}
            withBackground={false}
            potColor={theme === "dark" ? "#ffffff" : "#00AFF2"}
            cursorColor={theme === "dark" ? "#00AFF2" : "#ffffff"}
            className="w-7 h-7 shrink-0"
          />
          <span className="text-base sm:text-lg font-black text-[#00AFF2] tracking-tight">
            ClicBouffe
          </span>
        </div>

        {/* Contrôles Droite : Mode Sombre + Fermer */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onToggleTheme();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 stroke-[2]" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 2. CORPS PRINCIPAL DE LA PAGE (CENTRÉ PLEIN ÉCRAN) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-xl w-full mx-auto pb-safe">
        {currentUser ? (
          /* ==================================================================== */
          /* ÉTAT CONNECTÉ : PAGE COMPLÈTE DE GESTION DU COMPTE & DÉCONNEXION     */
          /* ==================================================================== */
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-slate-950/60 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Bannière Profil Utilisateur */}
            <div className="text-center space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#00AFF2] to-sky-400 text-white flex items-center justify-center font-black text-3xl shadow-lg">
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentUser.full_name}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-[#00AFF2] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser.email}
                </p>
                {currentUser.phone_number && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {currentUser.phone_number}
                  </p>
                )}
                <div className="mt-2.5">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] border border-sky-200 dark:border-sky-800">
                    {userRestaurants.length > 0
                      ? `Vendeur Partenaire (${userRestaurants.length} restaurant${userRestaurants.length > 1 ? "s" : ""})`
                      : "Membre ClicBouffe"}
                  </span>
                </div>
              </div>
            </div>

            {/* Solde Portefeuille & Restaurants Connectés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Carte Portefeuille */}
              <div
                onClick={() => {
                  if (onOpenWallet) {
                    hapticFeedback("light");
                    onClose();
                    onOpenWallet();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#00AFF2] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#00AFF2]" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Portefeuille
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00AFF2] group-hover:underline">
                    Recharger +
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-2">
                  {formatFCFA(walletBalance)}
                </p>
              </div>

              {/* Carte Restaurants Partenaire */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#00AFF2]" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Mes Restaurants
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-2">
                  {userRestaurants.length}{" "}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    page{userRestaurants.length > 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            </div>

            {/* Messages Retour */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION DÉCONNEXION PLEINE PAGE */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Vous souhaitez vous déconnecter de cette session sur cet appareil ?
              </p>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold rounded-2xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Déconnexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                    <span>Se déconnecter de ClicBouffe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* ÉTAT NON-CONNECTÉ : PAGE COMPLÈTE DE CONNEXION / CRÉATION DE COMPTE  */
          /* ==================================================================== */
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-slate-950/60 space-y-6 animate-in zoom-in-95 duration-200">
            {/* En-tête avec Logo Marmite */}
            <div className="text-center space-y-2">
              <div className="inline-block p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 mb-1">
                <LogoMarmite
                  size={52}
                  withBackground={false}
                  potColor={theme === "dark" ? "#ffffff" : "#00AFF2"}
                  cursorColor={theme === "dark" ? "#00AFF2" : "#ffffff"}
                  className="w-12 h-12"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {tab === "login" ? "Connexion à ClicBouffe" : "Créer votre compte"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                {tab === "login"
                  ? "Accédez à vos commandes, votre portefeuille et vos restaurants en toute sécurité."
                  : "Un seul compte universel pour commander et ouvrir autant de restaurants que vous voulez."}
              </p>
            </div>

            {/* Onglets Élégants Pleine Largeur */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setTab("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  tab === "login"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setTab("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  tab === "signup"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Créer un compte
              </button>
            </div>

            {/* Bannière de Notification Succès / Erreur */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORMULAIRE PLEIN ÉCRAN */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "signup" && (
                <>
                  {/* Nom complet */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Nom complet <span className="text-[#00AFF2]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Koffi Mensah"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Numéro de téléphone (Bénin)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+229 97 00 11 22"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Adresse Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Adresse Email <span className="text-[#00AFF2]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe avec icône d'œil interactif */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Mot de passe <span className="text-[#00AFF2]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={tab === "signup" ? "Au moins 6 caractères" : "Votre mot de passe"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2]" />
                    )}
                  </button>
                </div>
              </div>

              {/* CHAMP SUPPLÉMENTAIRE : CONFIRMATION DU MOT DE PASSE (AVEC ICÔNE D'ŒIL) */}
              {tab === "signup" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Confirmer le mot de passe <span className="text-[#00AFF2]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Répétez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] focus:ring-2 focus:ring-[#00AFF2]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setShowConfirmPassword((prev) => !prev);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label={
                        showConfirmPassword
                          ? "Masquer la confirmation du mot de passe"
                          : "Afficher la confirmation du mot de passe"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Note informative modèle Facebook */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {tab === "signup" ? (
                  <span>
                    En créant votre compte, vous pourrez commander des plats, recharger votre portefeuille et{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      créer autant de pages de restaurant que vous souhaitez
                    </strong>{" "}
                    pour vendre sur ClicBouffe.
                  </span>
                ) : (
                  <span>
                    Connectez-vous pour retrouver vos commandes, recharger votre portefeuille et piloter vos restaurants partenaires.
                  </span>
                )}
              </div>

              {/* Bouton de Soumission Principal */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>{tab === "login" ? "Se connecter" : "Créer mon compte"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
