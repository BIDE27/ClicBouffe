"use client";

import React, { useState } from "react";
import { X, Store, MapPin, Phone, Clock, FileText, ArrowRight, Loader2 } from "lucide-react";
import { RestaurantEntity } from "@/lib/types/database";
import { restaurantService } from "@/lib/services/restaurant-service";
import { hapticFeedback } from "@/lib/native/haptics";

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (restaurant: RestaurantEntity) => void;
  currentUserId: string;
}

const CATEGORY_OPTIONS = [
  "Cuisine Locale & Pâtes (Amiwo, Pâte noire)",
  "Maquis & Grillades (Poissons, Brochettes)",
  "Chawarma & Wraps",
  "Fast-Food & Burgers",
  "Poissons Braisés & Fruits de Mer",
  "Douceurs, Boissons & Gari",
];

export function CreateRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}: CreateRestaurantModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Veuillez renseigner le nom de votre restaurant.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Veuillez renseigner le quartier ou l'adresse.");
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg("Veuillez renseigner un numéro de téléphone de contact.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00AFF2] to-sky-400 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Créer mon Restaurant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ouvrez votre page vendeur et gérez vos commandes en direct
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Formulaire avec scroll */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Nom du Restaurant */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Nom de l&apos;établissement <span className="text-[#00AFF2]">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Le Maquis du Port, Chez Maman Cécile..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Catégorie Culinaire */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Spécialité culinaire principale
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none transition-colors"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quartier / Adresse */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Quartier & Adresse à Cotonou <span className="text-[#00AFF2]">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Akpakpa, Terrain Zico (ou Cadjehoun, Haie Vive...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Téléphone / WhatsApp */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Téléphone & WhatsApp pour les commandes <span className="text-[#00AFF2]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="+229 97 00 11 22"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Heure d&apos;ouverture
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Heure de fermeture
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Description de vos spécialités
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="Présentez vos plats phares, votre méthode de cuisson, vos accompagnements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#00AFF2] outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#00AFF2] hover:bg-[#0098d4] disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création du restaurant en cours...</span>
              </>
            ) : (
              <>
                <span>Créer et ouvrir mon restaurant</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
