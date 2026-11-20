"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Star,
  Clock,
  MapPin,
  Plus,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Restaurant, DishItem, INITIAL_GRID_DISHES } from "@/lib/data/clicbouffe-data";
import { hapticFeedback } from "@/lib/native/haptics";

interface ScannedRestaurantModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDishes: DishItem[];
  onToggleDish: (dish: DishItem) => void;
  onGoToExplorer: () => void;
}

export function ScannedRestaurantModal({
  restaurant,
  isOpen,
  onClose,
  selectedDishes,
  onToggleDish,
  onGoToExplorer,
}: ScannedRestaurantModalProps) {
  if (!isOpen || !restaurant) return null;

  // Récupération des plats du catalogue associés ou pertinents pour ce restaurant
  const matchingDishes = INITIAL_GRID_DISHES.filter((dish) => {
    return restaurant.popularDishes.some((pop) =>
      pop.toLowerCase().includes(dish.name.toLowerCase()) ||
      dish.name.toLowerCase().includes(pop.toLowerCase())
    );
  });

  const displayDishes = matchingDishes.length > 0 ? matchingDishes : INITIAL_GRID_DISHES.slice(0, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanned-restaurant-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Bannière et En-tête du restaurant scanné */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-900">
          <Image
            src={restaurant.img}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Bouton fermeture */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Badge Scanné via QR Code */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Menu QR Table Détecté</span>
          </div>

          {/* Titre et badges au bas de la bannière */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h2
              id="scanned-restaurant-title"
              className="text-lg sm:text-xl font-black drop-shadow-xs"
            >
              {restaurant.name}
            </h2>
            <p className="text-xs text-slate-200 flex items-center gap-2 mt-0.5">
              <span>{restaurant.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {restaurant.rating} ({restaurant.reviewsCount})
              </span>
            </p>
          </div>
        </div>

        {/* Détails logistiques (Adresse, Délai, Frais) */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-[#00AFF2] shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {restaurant.deliveryTime}
            </span>
            <span className="font-bold text-[#00AFF2]">
              Livraison {restaurant.deliveryFee}
            </span>
          </div>
        </div>

        {/* Liste des plats du menu */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Menu & Plats du restaurant
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {displayDishes.length} plats disponibles
            </span>
          </div>

          <div className="space-y-2.5">
            {displayDishes.map((dish) => {
              const isSelected = selectedDishes.some((d) => d.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] flex items-center justify-between gap-3 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {dish.name}
                        </h4>
                        {dish.isFree && (
                          <span className="px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00AFF2] text-[9px] font-bold shrink-0">
                            1er Offert
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#00AFF2] mt-0.5">
                        {dish.price}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Préparé à la commande • Frais du jour
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      onToggleDish(dish);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-[#00AFF2] hover:text-white text-slate-700 dark:text-slate-300"
                    }`}
                    title={isSelected ? "Retirer du panier" : "Ajouter au panier"}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied de page avec bouton Explorer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback("medium");
              onClose();
              onGoToExplorer();
            }}
            className="px-4 py-2 bg-[#00AFF2] hover:bg-[#009bd6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explorer tous les restos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
