"use client";

import React, { useState } from "react";
import { X, User, Lock, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/types/database";
import { authService } from "@/lib/services/auth-service";
import { hapticFeedback } from "@/lib/native/haptics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
          hapticFeedback("heavy");
          onSuccess(profile);
          onClose();
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
        } else if (profile) {
          hapticFeedback("heavy");
          onSuccess(profile);
          onClose();
        }
      }
    } catch {
      setErrorMsg("Une erreur inattendue est survenue lors de l'authentification.");
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
        {/* En-tête de la modale */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
          <div>
            <h2 className="text-xl font-black text-[#00AFF2] tracking-tight">ClicBouffe</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tab === "login" ? "Accédez à votre espace sécurisé" : "Rejoignez la communauté ClicBouffe"}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Bascule Connexion / Inscription */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                hapticFeedback("light");
                setTab("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
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
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Message d'erreur éventuel */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Formulaire universel */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === "signup" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nom complet <span className="text-[#00AFF2]">*</span>
                  </label>
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

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Numéro de téléphone (Bénin)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+229 97 00 11 22"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Adresse Email <span className="text-[#00AFF2]">*</span>
              </label>
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

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Mot de passe <span className="text-[#00AFF2]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Au moins 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-850 focus:border-[#00AFF2] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Note informative modèle Facebook */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pt-1">
              {tab === "signup" ? (
                <span>
                  En créant votre compte, vous pourrez commander des plats, recharger votre portefeuille et{" "}
                  <strong>créer autant de pages de restaurant que vous souhaitez</strong> pour vendre sur ClicBouffe.
                </span>
              ) : (
                <span>
                  Connectez-vous pour accéder à vos commandes, votre portefeuille et vos restaurants partenaires.
                </span>
              )}
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <span>{tab === "login" ? "Se connecter" : "Créer mon compte"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
