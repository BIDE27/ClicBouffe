"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BellOff,
  BellRing,
  CheckCheck,
  ChefHat,
  Clock,
  Sun,
  Moon,
  ArrowRight,
  User,
  VolumeX,
  X,
} from "lucide-react";
import { AppNotificationEntity, RestaurantEntity, UserProfile } from "../../lib/types/database";
import { restaurantService } from "../../lib/services/restaurant-service";
import { hapticFeedback } from "../../lib/native/haptics";

export interface NotificationsPageViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  userRestaurants?: RestaurantEntity[];
  onOpenAuth?: () => void;
  onOpenKds?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

function formatRelTime(iso: string): string {
  try {
    const diffMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Récent";
  }
}

export function NotificationsPageView({
  isOpen,
  onClose,
  currentUser,
  userRestaurants = [],
  onOpenAuth,
  onOpenKds,
  theme = "dark",
  onToggleTheme,
}: NotificationsPageViewProps) {
  const [notifications, setNotifications] = useState<AppNotificationEntity[]>([]);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    let mounted = true;
    const ownedIds = userRestaurants.map((r) => r.id);

    const loadNotifs = async () => {
      const list = await restaurantService.getNotifications(currentUser.id, ownedIds);
      if (mounted) setNotifications(list);
    };
    loadNotifs();

    const unsubscribe = restaurantService.subscribeToUserNotifications(currentUser.id, loadNotifs);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isOpen, currentUser, userRestaurants]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    hapticFeedback("light");
    const ownedIds = userRestaurants.map((r) => r.id);
    await restaurantService.markAllNotificationsRead(currentUser.id, ownedIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-page-title"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Barre supérieure avec bouton Retour et raccourcis */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
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
          {currentUser && notifications.some((n) => !n.is_read) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="min-h-[44px] px-3 py-2 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] text-[11px] font-bold flex items-center gap-1 border border-sky-200 dark:border-sky-800 cursor-pointer"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tout lire</span>
            </button>
          )}
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                onToggleTheme();
              }}
              aria-label="Basculer le thème"
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
          <button
            type="button"
            data-modal-close
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            aria-label="Fermer la page des notifications"
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Liste des Notifications en Temps Réel ou État Vide */}
      {currentUser && notifications.length > 0 ? (
        <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
          {notifications.map((notif) => {
            const isWaiter = notif.type === "waiter_call" || notif.type === "silent_request";
            const isOrder = notif.type === "new_dine_in_order" || notif.type === "new_delivery_order";
            const isInteractive = Boolean((isWaiter || isOrder) && onOpenKds);
            return (
              <div
                key={notif.id}
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={() => {
                  if (isInteractive && onOpenKds) {
                    hapticFeedback("light");
                    onClose();
                    onOpenKds();
                  }
                }}
                onKeyDown={(e) => {
                  if (isInteractive && onOpenKds && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    hapticFeedback("light");
                    onClose();
                    onOpenKds();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isWaiter || isOrder ? "cursor-pointer hover:border-[#00AFF2]" : ""
                } ${
                  notif.is_read
                    ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-85"
                    : "bg-white dark:bg-slate-900 border-[#00AFF2]/50 ring-1 ring-[#00AFF2]/20 shadow-xs"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isWaiter
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                      : isOrder
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2]"
                  }`}
                >
                  {notif.type === "silent_request" ? (
                    <VolumeX className="w-5 h-5" />
                  ) : isWaiter ? (
                    <BellRing className="w-5 h-5" />
                  ) : isOrder ? (
                    <ChefHat className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatRelTime(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                </div>
              </div>
            );
          })}
        </main>
      ) : (
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
              ? "Vos alertes de commandes, appels serveur en salle, réductions exclusives et statuts de service apparaîtront ici dès qu'ils seront disponibles."
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
      )}
    </div>
  );
}
