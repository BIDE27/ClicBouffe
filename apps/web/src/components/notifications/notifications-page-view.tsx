"use client";

import React from "react";
import { ArrowLeft, BellOff, X, Sun, Moon, ArrowRight, User } from "lucide-react";
import { UserProfile } from "../../lib/types/database";
import { hapticFeedback } from "../../lib/native/haptics";

export interface NotificationsPageViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function NotificationsPageView({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  theme = "dark",
  onToggleTheme,
}: NotificationsPageViewProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-page-title"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Barre supérieure avec bouton Retour et raccourcis */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 pt-safe flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour</span>
          </button>
          <h1
            id="notifications-page-title"
            className="text-base sm:text-lg font-black text-slate-900 dark:text-white"
          >
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleTheme && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onToggleTheme();
              }}
              aria-label="Basculer le thème"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            aria-label="Fermer la page des notifications"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Contenu principal : État vide pour le moment (aucune notification) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full my-auto">
        <div className="w-20 h-20 rounded-full bg-sky-50 dark:bg-slate-900 border-2 border-sky-100 dark:border-slate-800 flex items-center justify-center mb-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#00AFF2]/10 dark:bg-[#00AFF2]/20 flex items-center justify-center text-[#00AFF2]">
            <BellOff className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
          Aucune notification pour le moment
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-xs">
          {currentUser
            ? "Vos alertes de commandes, réductions exclusives, statuts de livraison et actualités de vos restaurants préférés apparaîtront ici dès qu'elles seront disponibles."
            : "Connectez-vous à votre compte ClicBouffe pour suivre vos commandes en temps réel, profiter de réductions exclusives et recevoir vos alertes personnalisées."}
        </p>

        {currentUser ? (
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Découvrir les plats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
              if (onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        )}
      </main>
    </div>
  );
}
