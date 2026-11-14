"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { PromoSlide, PROMOTIONAL_CAROUSEL_SLIDES } from "@/lib/data/clicbouffe-data";
import { hapticFeedback } from "@/lib/native/haptics";

interface PromoCarouselProps {
  slides?: PromoSlide[];
  onSelectSlide?: (slide: PromoSlide) => void;
  onOrderDish?: (dishRefName: string) => void;
  autoPlayInterval?: number;
  className?: string;
  variant?: "mobile" | "web";
}

export function PromoCarousel({
  slides = PROMOTIONAL_CAROUSEL_SLIDES,
  onSelectSlide,
  onOrderDish,
  autoPlayInterval = 4500,
  className = "",
  variant = "web",
}: PromoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((index + totalSlides) % totalSlides);
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Défilement automatique
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide, totalSlides]);

  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      const isSwipe = Math.abs(distance) > 40;
      if (isSwipe) {
        hapticFeedback("light");
        if (distance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  const currentSlide = slides[currentIndex];

  const handleCardClick = () => {
    hapticFeedback("light");
    if (onSelectSlide) {
      onSelectSlide(currentSlide);
    } else if (onOrderDish) {
      onOrderDish(currentSlide.dishRefName);
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback("medium");
    if (onOrderDish) {
      onOrderDish(currentSlide.dishRefName);
    } else if (onSelectSlide) {
      onSelectSlide(currentSlide);
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group cursor-pointer border border-slate-200 select-none ${
        variant === "mobile" ? "h-44 sm:h-52" : "h-48 sm:h-64"
      } ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
    >
      {/* Diapositives avec transition fluide */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          );
        })}
      </div>

      {/* Dégradé de lisibilité haute définition */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex flex-col justify-between p-3.5 sm:p-5 text-white pointer-events-none">
        {/* Ligne Supérieure : Tag catégorie & Badge Annonce Sponsorisée */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider shadow-xs ${
                currentSlide.tagBg || "bg-[#00AFF2]"
              }`}
            >
              {currentSlide.tag}
            </span>
            <span className="text-[10px] sm:text-xs text-white/85 font-medium truncate max-w-[200px] sm:max-w-none">
              {currentSlide.partnerLocation}
            </span>
          </div>

          {currentSlide.isSponsored && (
            <div className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] font-semibold tracking-wide flex items-center gap-1 border border-white/20 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>Annonce Partenaire</span>
            </div>
          )}
        </div>

        {/* Ligne Inférieure : Titre, Détails & Bouton Action */}
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug line-clamp-1 drop-shadow-sm">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/95 font-bold flex items-center gap-1 flex-wrap drop-shadow-xs">
              <span className="text-amber-300 font-extrabold">{currentSlide.price}</span>
              <span className="font-normal text-white/80 text-[10px] sm:text-xs line-clamp-1">
                • {currentSlide.priceDetails}
              </span>
            </p>
          </div>

          <button
            onClick={handleOrderClick}
            className="pointer-events-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#00AFF2] hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
          >
            <span>{currentSlide.ctaText || "Commander"}</span>
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Flèches de navigation manuelles (subtiles et réactives) */}
      <div className="absolute inset-y-0 left-2 z-20 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            hapticFeedback("light");
            prevSlide();
          }}
          aria-label="Diapositive précédente"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/35 hover:bg-black/65 text-white/90 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-80 active:scale-90"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-2 z-20 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            hapticFeedback("light");
            nextSlide();
          }}
          aria-label="Diapositive suivante"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/35 hover:bg-black/65 text-white/90 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-80 active:scale-90"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Indicateurs de pagination (dots / pills actifs animés) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {slides.map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                hapticFeedback("light");
                goToSlide(idx);
              }}
              aria-label={`Aller à la diapositive ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-[#00AFF2]" : "w-1.5 bg-white/60 hover:bg-white"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
