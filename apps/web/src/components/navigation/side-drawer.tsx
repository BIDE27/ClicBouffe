"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  User,
  ChefHat,
  Settings,
  Heart,
  ShoppingBag,
  CalendarCheck,
  Clock,
  Wallet,
  Truck,
  Sun,
  Moon,
  Headphones,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "../../lib/types/database";
import { hapticFeedback } from "../../lib/native/haptics";
import { LogoMarmite } from "../ui/logo-marmite";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  walletBalance: number;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenWallet: () => void;
  onOpenDeliveryRates: () => void;
  onNavigateToScreen: (screen: "home" | "explorer" | "plus_tard" | "abonnements") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  currentViewMode?: "marketplace" | "kds";
  onToggleViewMode?: () => void;
}

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

export function SideDrawer({
  isOpen,
  onClose,
  currentUser,
  walletBalance,
  onOpenAuth,
  onSignOut,
  onOpenWallet,
  onOpenDeliveryRates,
  onNavigateToScreen,
  theme,
  onToggleTheme,
  currentViewMode = "marketplace",
  onToggleViewMode,
}: SideDrawerProps) {
  // Machine d'états d'animation (maintien dans le DOM pendant la fermeture douce)
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const closingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronisation lors des changements de props
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }

  // Fermeture automatique en fin d'animation de sortie (300ms)
  useEffect(() => {
    if (isClosing) {
      closingTimeoutRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 300);
      return () => {
        if (closingTimeoutRef.current) {
          clearTimeout(closingTimeoutRef.current);
          closingTimeoutRef.current = null;
        }
      };
    }
  }, [isClosing]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
      }
    };
  }, []);

  // Déclencheur unifié de fermeture douce avec animation fluide
  const handleClose = useCallback(
    (callback?: () => void) => {
      hapticFeedback("light");
      if (isClosing) return;
      setIsClosing(true);
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
      }
      closingTimeoutRef.current = setTimeout(() => {
        callback?.();
        onClose();
        setIsRendered(false);
        setIsClosing(false);
      }, 300);
    },
    [isClosing, onClose]
  );

  // Interception de la touche Échap
  useEffect(() => {
    if (!isOpen || isClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isClosing ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Arrière-plan assombri (Backdrop) avec fondu progressif et doux */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs drawer-backdrop ${
          isClosing ? "drawer-backdrop-out" : "drawer-backdrop-in"
        }`}
        onClick={() => handleClose()}
        aria-hidden="true"
      />

      {/* Tiroir latéral (Sliding Drawer) avec glissement fluide et accélération matérielle GPU */}
      <aside
        className={`relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-l border-slate-100 dark:border-slate-800 drawer-panel ${
          isClosing ? "drawer-panel-out" : "drawer-panel-in"
        }`}
        role="dialog"
        aria-label="Menu latéral"
      >
        {/* En-tête du tiroir avec Logo Authentique (Marmite + Curseur) et bouton Fermer */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90 pt-safe">
          <div className="flex items-center gap-2.5">
            {/* Logo officiel ClicBouffe : Marmite avec curseur à l'intérieur */}
            <LogoMarmite className="w-8 h-8 shrink-0 shadow-xs" size={32} withBackground shape="circle" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                ClicBouffe
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Menu Principal</p>
            </div>
          </div>
          <button
            onClick={() => handleClose()}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Section Profil Utilisateur ou Bouton Connexion */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-b from-sky-50/50 dark:from-sky-950/20 to-transparent">
          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00AFF2] to-sky-400 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {currentUser.full_name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#00AFF2] shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00AFF2] border border-sky-200 dark:border-sky-800">
                    {currentUser.role === "restaurant_owner" ? "Restaurateur Partenaire" : "Client Gourmet"}
                  </span>
                </div>
              </div>

              {/* Si restaurateur, bouton rapide de bascule Marketplace / KDS */}
              {currentUser.role === "restaurant_owner" && onToggleViewMode && (
                <button
                  onClick={() => {
                    handleClose(() => {
                      onToggleViewMode();
                    });
                  }}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-300" />
                    <span>Mode : {currentViewMode === "kds" ? "Espace KDS Cuisine" : "Marketplace Client"}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Solde Portefeuille ClicBouffe */}
              <div
                onClick={() => {
                  handleClose(() => {
                    onOpenWallet();
                  });
                }}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 shadow-xs hover:border-[#00AFF2] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#00AFF2]" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Solde Portefeuille</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00AFF2] group-hover:underline">Recharger +</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatFCFA(walletBalance)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-base shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bienvenue sur ClicBouffe</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connectez-vous pour suivre vos commandes et recharger votre portefeuille.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleClose(() => {
                    onOpenAuth();
                  });
                }}
                className="w-full py-2.5 bg-[#00AFF2] hover:bg-[#0098d4] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Se connecter / Créer un compte</span>
              </button>
            </div>
          )}
        </div>

        {/* Section Navigation & Liens Principaux */}
        <div className="p-3 sm:p-4 space-y-1 flex-1">
          {/* Mon Portefeuille */}
          <button
            onClick={() => {
              handleClose(() => {
                onOpenWallet();
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#00AFF2] flex items-center justify-center group-hover:bg-[#00AFF2] group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mon Portefeuille</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Paiements 1-clic & recharges</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#00AFF2] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900">
              {formatFCFA(walletBalance)}
            </span>
          </button>

          {/* Mes Favoris */}
          <button
            onClick={() => {
              handleClose(() => {
                onNavigateToScreen("home");
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mes Favoris</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Plats et adresses préférés</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Mes Commandes */}
          <button
            onClick={() => {
              handleClose(() => {
                onNavigateToScreen("home");
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mes Commandes</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Historique et livraisons en cours</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Mes Abonnements */}
          <button
            onClick={() => {
              handleClose(() => {
                onNavigateToScreen("abonnements");
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mes Abonnements</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Formules repas programmées</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Commandes Plus Tard */}
          <button
            onClick={() => {
              handleClose(() => {
                onNavigateToScreen("plus_tard");
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Commandes Plus Tard</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Planifiées pour ce soir ou demain</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Grille Tarifs de Livraison */}
          <button
            onClick={() => {
              handleClose(() => {
                onOpenDeliveryRates();
              });
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Tarifs de Livraison</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Dès 80 FCFA • Gratuit dès 10 plats</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Séparateur */}
          <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80 my-2" />

          {/* Mode Sombre / Mode Clair (Bascule interactive) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-2xs">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-[#00AFF2]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {theme === "dark" ? "Mode Sombre" : "Mode Clair"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {theme === "dark" ? "Thème sombre actif" : "Thème clair actif"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                hapticFeedback("light");
                onToggleTheme();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                theme === "dark" ? "bg-[#00AFF2]" : "bg-slate-300 dark:bg-slate-700"
              }`}
              aria-label="Basculer le thème"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Paramètres & Sécurité */}
          <button
            onClick={() => handleClose()}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Paramètres & Sécurité</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Profil, adresse et notifications</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>

          {/* Support WhatsApp */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open("https://wa.me/22997000000?text=Bonjour%20ClicBouffe", "_blank");
              }
              handleClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Assistance Client</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Support WhatsApp 7j/7</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
          </button>
        </div>

        {/* Pied du tiroir : Déconnexion ou Version */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pb-safe">
          {currentUser ? (
            <button
              onClick={() => {
                handleClose(() => {
                  onSignOut();
                });
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/90 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>Se déconnecter</span>
            </button>
          ) : (
            <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
              <p className="font-bold text-slate-600 dark:text-slate-300">ClicBouffe Marketplace</p>
              <p>Livraison express • Cotonou, Bénin</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
