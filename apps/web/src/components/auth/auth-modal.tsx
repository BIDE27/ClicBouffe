"use client";

import React, { useState } from "react";
import { X, User, ChefHat, Lock, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { UserProfile, UserRole } from "@/lib/types/database";
import { authService } from "@/lib/services/auth-service";
import { hapticFeedback } from "@/lib/native/haptics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  initialRole?: UserRole;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialRole = "customer",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantCategory, setRestaurantCategory] = useState("Cuisine Locale & Grillades");
  const [restaurantAddress, setRestaurantAddress] = useState("Akpakpa, Cotonou");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    hapticFeedback("medium");

    try {
      if (tab === "login") {
        const { profile, error } = await authService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (profile) {
          onSuccess(profile);
          onClose();
        }
      } else {
        const { profile, error } = await authService.signUp({
          email,
          password,
          fullName: fullName || (role === "restaurant_owner" ? "Chef Propriétaire" : "Client ClicBouffe"),
          phone: phone || "+229 97 00 00 00",
          role,
          restaurantName,
          restaurantCategory,
          restaurantAddress,
        });

        if (error) {
          setErrorMsg(error);
        } else if (profile) {
          onSuccess(profile);
          onClose();
        }
      }
    } catch {
      setErrorMsg("Une erreur est survenue lors de l'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/90">
          <div>
            <h2 className="text-xl font-black text-[#00AFF2] tracking-tight">ClicBouffe</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tab === "login" ? "Accédez à votre espace sécurisé" : "Rejoignez la marketplace culinaire"}
            </p>
          </div>
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Corps déroulant */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Bascule Connexion / Inscription */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                hapticFeedback("light");
                setTab("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === "login"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => {
                hapticFeedback("light");
                setTab("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === "signup"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Choix du rôle (Client ou Restaurateur) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Vous êtes :
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setRole("customer");
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  role === "customer"
                    ? "border-[#00AFF2] bg-sky-50/50 dark:bg-sky-950/30 text-[#00AFF2] ring-1 ring-[#00AFF2]"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    role === "customer" ? "bg-[#00AFF2] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Client</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Commander des plats</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setRole("restaurant_owner");
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  role === "restaurant_owner"
                    ? "border-[#00AFF2] bg-sky-50/50 dark:bg-sky-950/30 text-[#00AFF2] ring-1 ring-[#00AFF2]"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    role === "restaurant_owner" ? "bg-[#00AFF2] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Restaurateur</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Gérer son restaurant</p>
                </div>
              </button>
            </div>
          </div>

          {/* Message d'erreur éventuel */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                />
              </div>
            </div>

            {tab === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Téléphone (Bénin / Togo)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 11 22"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Champs additionnels si Restaurateur lors de l'inscription */}
            {tab === "signup" && role === "restaurant_owner" && (
              <div className="p-3 bg-sky-50/40 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00AFF2]">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Informations de l&apos;établissement</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block">
                    Nom du restaurant / maquis
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Le Maquis du Port"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-[#00AFF2] outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block">Catégorie</label>
                    <select
                      value={restaurantCategory}
                      onChange={(e) => setRestaurantCategory(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none transition-colors"
                    >
                      <option value="Cuisine Locale & Sauces" className="dark:bg-slate-800">Cuisine Locale & Pâtes</option>
                      <option value="Cuisine Locale & Poissons Braisés" className="dark:bg-slate-800">Maquis & Grillades</option>
                      <option value="Chawarma & Fast-Food" className="dark:bg-slate-800">Chawarma & Fast-Food</option>
                      <option value="Fast-Food & Burgers" className="dark:bg-slate-800">Burgers & Amberger</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 block">Quartier</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Terrain Zico, Akpakpa"
                        value={restaurantAddress}
                        onChange={(e) => setRestaurantAddress(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{isLoading ? "Vérification..." : tab === "login" ? "Se connecter" : "Créer mon compte"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
