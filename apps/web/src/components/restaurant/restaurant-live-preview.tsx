"use client";

import React from "react";
import Image from "next/image";
import {
  BellRing,
  ChefHat,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  Star,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { CreateRestaurantDishDraft, RestaurantSalesMode } from "../../lib/types/database";

interface RestaurantLivePreviewProps {
  name: string;
  category: string;
  categories?: string[];
  description: string;
  address: string;
  openTime: string;
  closeTime: string;
  bannerUrl: string;
  logoUrl: string;
  salesMode: RestaurantSalesMode;
  avgPrepTimeMin: number;
  tablesCount: number;
  allowsDineInComposition: boolean;
  allowsWaiterCall: boolean;
  dishes: CreateRestaurantDishDraft[];
}

/**
 * Aperçu global temps réel de la page restaurant telle que les clients la verront sur mobile & QR.
 */
export function RestaurantLivePreview({
  name,
  category,
  categories,
  description,
  address,
  openTime,
  closeTime,
  bannerUrl,
  logoUrl,
  salesMode,
  avgPrepTimeMin,
  tablesCount,
  allowsDineInComposition,
  allowsWaiterCall,
  dishes,
}: RestaurantLivePreviewProps) {
  const displayName = name.trim() || "Nom de votre restaurant";
  const displayAddress = address.trim() || "Quartier & Ville (ex: Akpakpa, Cotonou)";
  const displayDesc =
    description.trim() ||
    "Votre présentation apparaîtra ici pour donner envie aux clients sur place et en livraison.";

  // Regroupement authentique des plats sous forme de vraie carte de restaurant
  const groupedMenu = dishes.reduce<Record<string, CreateRestaurantDishDraft[]>>((acc, dish) => {
    const key = dish.categoryLabel || "Plats Principaux";
    if (!acc[key]) acc[key] = [];
    acc[key].push(dish);
    return acc;
  }, {});

  const categoryEntries = Object.entries(groupedMenu);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* En-tête Aperçu */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Aperçu client en direct
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#00AFF2]">
          {dishes.length} {dishes.length > 1 ? "mets sur la carte" : "met sur la carte"}
        </span>
      </div>

      {/* Bannière Immersive + Logo Superposé */}
      <div className="relative h-40 w-full bg-slate-900 shrink-0">
        <Image
          src={bannerUrl || "/images/restau_maquis.jpg"}
          alt={displayName}
          fill
          unoptimized={Boolean(bannerUrl?.startsWith("data:") || bannerUrl?.startsWith("http"))}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />

        {/* Badges mode de vente */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3" />
            <span>
              {salesMode === "hybrid"
                ? "Salle QR + Livraison"
                : salesMode === "dine_in_only"
                ? `Sur place • ${tablesCount} tables`
                : "Livraison & À emporter"}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/55 text-amber-300 text-[10px] font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            5.0
          </span>
        </div>

        {/* Logo + Identité en bas de bannière */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg border-2 border-white dark:border-slate-700 shrink-0 overflow-hidden flex items-center justify-center">
            <Image
              src={logoUrl || "/images/logos/logo-marmite-bleu.svg"}
              alt={`Logo ${displayName}`}
              width={56}
              height={56}
              unoptimized={Boolean(logoUrl?.startsWith("data:") || logoUrl?.startsWith("http"))}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="min-w-0 flex-1 text-white pb-0.5">
            <h3 className="text-base font-black tracking-tight truncate drop-shadow-xs">
              {displayName}
            </h3>
            <p className="text-[11px] text-sky-200 font-semibold truncate">
              {categories && categories.length > 0 ? categories.join(" • ") : category}
            </p>
          </div>
        </div>
      </div>

      {/* Infos Logistiques & Services */}
      <div className="p-3.5 sm:p-4 space-y-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#00AFF2] shrink-0" />
            <span className="truncate">{displayAddress}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {openTime} - {closeTime} • ~{avgPrepTimeMin} min
            </span>
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {displayDesc}
        </p>

        {/* Aperçu des boutons d'action disponibles pour le client */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {salesMode !== "online_only" && (
            <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-[#00AFF2] border border-sky-200/80 dark:border-sky-800 text-[10px] font-bold flex items-center gap-1">
              <QrCode className="w-3 h-3" />
              <span>Menu QR ({tablesCount} tables)</span>
            </span>
          )}
          {salesMode !== "dine_in_only" && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#00AFF2]" />
              <span>Livraison 80&nbsp;FCFA</span>
            </span>
          )}
          {allowsDineInComposition && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              <span>Composition libre</span>
            </span>
          )}
          {salesMode !== "online_only" && allowsWaiterCall && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <BellRing className="w-3 h-3" />
              <span>Appel serveur</span>
            </span>
          )}
        </div>
      </div>

      {/* Carte du Menu Format Restaurant */}
      <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#00AFF2]" />
            <span>La Carte du Restaurant</span>
          </h4>
          {dishes.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {categoryEntries.length} {categoryEntries.length > 1 ? "catégories" : "catégorie"}
            </span>
          )}
        </div>

        {categoryEntries.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
            <Store className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aucun met ajouté pour l&apos;instant
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ajoutez vos plats à l&apos;étape <strong>Menu</strong> pour les voir prendre forme ici comme une vraie carte de restaurant.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {categoryEntries.map(([catName, catDishes]) => (
              <div key={catName} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00AFF2]">
                    {catName}
                  </span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-2">
                  {catDishes.map((dish, idx) => (
                    <div
                      key={`${dish.name}-${idx}`}
                      className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <Image
                          src={dish.imageUrl || "/images/dish_pate_rouge.jpg"}
                          alt={dish.name}
                          fill
                          unoptimized={Boolean(dish.imageUrl?.startsWith("data:") || dish.imageUrl?.startsWith("http"))}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {dish.name}
                          </p>
                          <span className="text-xs font-black text-[#00AFF2] shrink-0">
                            {dish.price.toLocaleString("fr-FR")}&nbsp;FCFA
                          </span>
                        </div>
                        {dish.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
