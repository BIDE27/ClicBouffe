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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isScrollingByCode = useRef(false);

  const totalCards = slides.length;

  const scrollToCard = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cards = container.children;
      const targetIndex = (index + totalCards) % totalCards;
      const targetCard = cards[targetIndex] as HTMLElement | undefined;

      if (targetCard) {
        isScrollingByCode.current = true;
        const targetLeft = targetCard.offsetLeft - container.offsetLeft;
        container.scrollTo({
          left: targetLeft,
          behavior: "smooth",
        });
        setCurrentIndex(targetIndex);
        setTimeout(() => {
          isScrollingByCode.current = false;
        }, 600);
      }
    },
    [totalCards]
  );

  const nextCard = useCallback(() => {
    scrollToCard(currentIndex + 1);
  }, [currentIndex, scrollToCard]);

  const prevCard = useCallback(() => {
    scrollToCard(currentIndex - 1);
  }, [currentIndex, scrollToCard]);

  // Défilement automatique périodique
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;

    const timer = setInterval(() => {
      nextCard();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextCard, totalCards]);

  // Synchronisation des indicateurs lors du défilement manuel (swipe ou tactile)
  const handleScroll = () => {
    if (isScrollingByCode.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cards = Array.from(container.children) as HTMLElement[];
    if (cards.length === 0) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardLeft = card.offsetLeft - container.offsetLeft;
      const diff = Math.abs(cardLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
    }
  };

  return (
    <div
      className={`relative w-full select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Rail de cartes distinctes défilant horizontalement */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsPaused(false), 2500);
        }}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-1 px-0.5"
      >
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={slide.id}
              onClick={() => {
                hapticFeedback("light");
                if (onSelectSlide) {
                  onSelectSlide(slide);
                } else if (onOrderDish) {
                  onOrderDish(slide.dishRefName);
                }
              }}
              className={`snap-start shrink-0 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200/90 dark:border-slate-800 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[#00AFF2]/60 ${
                variant === "mobile"
                  ? "w-[86%] sm:w-[340px] h-44 sm:h-50"
                  : "w-[86%] sm:w-[420px] md:w-[460px] h-48 sm:h-56"
              } ${isCurrent ? "ring-2 ring-[#00AFF2]/40" : "opacity-95"}`}
            >
              {/* Photo du plat / restaurant distinct */}
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dégradé pour lisibilité haute définition */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 flex flex-col justify-between p-3.5 sm:p-4 text-white">
                {/* Ligne Supérieure : Tag catégorie & Badge Annonce Sponsorisée */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        slide.tagBg || "bg-[#00AFF2]"
                      }`}
                    >
                      {slide.tag}
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/85 font-medium truncate max-w-[150px] sm:max-w-none">
                      {slide.partnerLocation}
                    </span>
                  </div>

                  {slide.isSponsored && (
                    <div className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] font-semibold tracking-wide flex items-center gap-1 border border-white/20 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Annonce Partenaire</span>
                    </div>
                  )}
                </div>

                {/* Ligne Inférieure : Titre, Détails & Bouton Action */}
                <div className="flex items-end justify-between gap-2 mt-auto">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <p className="text-[10px] sm:text-xs text-slate-300 font-semibold truncate">
                      {slide.partnerName}
                    </p>
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug line-clamp-1 drop-shadow-sm">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/95 font-bold flex items-center gap-1 flex-wrap drop-shadow-xs">
                      <span className="text-amber-300 font-extrabold">{slide.price}</span>
                      <span className="font-normal text-white/80 text-[10px] sm:text-xs line-clamp-1">
                        • {slide.priceDetails}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback("medium");
                      if (onOrderDish) {
                        onOrderDish(slide.dishRefName);
                      } else if (onSelectSlide) {
                        onSelectSlide(slide);
                      }
                    }}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#00AFF2] hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    <span>{slide.ctaText || "Commander"}</span>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flèches de navigation manuelles et indicateurs */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              hapticFeedback("light");
              prevCard();
            }}
            aria-label="Carte précédente"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#00AFF2] hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#00AFF2] dark:hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => {
              hapticFeedback("light");
              nextCard();
            }}
            aria-label="Carte suivante"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#00AFF2] hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#00AFF2] dark:hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-90"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium ml-1">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>

        {/* Indicateurs dots/pills interactifs */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  hapticFeedback("light");
                  scrollToCard(idx);
                }}
                aria-label={`Afficher la carte ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? "w-5 bg-[#00AFF2]" : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
