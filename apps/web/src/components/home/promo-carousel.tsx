"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0); // Index réel actif (0 à totalCards - 1)
  const [isPaused, setIsPaused] = useState(false);
  const isScrollingByCode = useRef(false);
  const currentVirtualIndexRef = useRef(0);
  const normalizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualScrollEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalCards = slides.length;

  // Triplication du tampon de diapositives pour un défilement infini sans rembobinage
  // Set 0 (clone-prev), Set 1 (main / central), Set 2 (clone-next)
  const extendedSlides = useMemo(() => {
    if (totalCards <= 1) {
      return slides.map((s) => ({ ...s, _uniqueKey: s.id, _realIndex: 0 }));
    }
    return [
      ...slides.map((s, i) => ({ ...s, _uniqueKey: `${s.id}-clone-prev`, _realIndex: i })),
      ...slides.map((s, i) => ({ ...s, _uniqueKey: `${s.id}-main`, _realIndex: i })),
      ...slides.map((s, i) => ({ ...s, _uniqueKey: `${s.id}-clone-next`, _realIndex: i })),
    ];
  }, [slides, totalCards]);

  // Normalisation silencieuse (en 0 ms) vers le bloc central (Set 1) quand on pénètre le Set 0 ou le Set 2
  const normalizeVirtualPosition = useCallback(() => {
    if (!scrollRef.current || totalCards <= 1) return;
    const container = scrollRef.current;
    const cards = container.children;
    const vIndex = currentVirtualIndexRef.current;

    if (vIndex >= 2 * totalCards || vIndex < totalCards) {
      const realIndex = ((vIndex % totalCards) + totalCards) % totalCards;
      const normalizedIndex = totalCards + realIndex;
      const normalizedCard = cards[normalizedIndex] as HTMLElement | undefined;

      if (normalizedCard) {
        isScrollingByCode.current = true;
        currentVirtualIndexRef.current = normalizedIndex;
        const targetLeft = normalizedCard.offsetLeft - container.offsetLeft;
        container.scrollTo({
          left: targetLeft,
          behavior: "instant",
        });
        setTimeout(() => {
          isScrollingByCode.current = false;
        }, 50);
      }
    }
  }, [totalCards]);

  // Défilement doux vers un index virtuel donné
  const scrollToVirtualCard = useCallback(
    (targetVirtualIndex: number, smooth = true) => {
      if (!scrollRef.current || totalCards <= 1) return;
      const container = scrollRef.current;
      const cards = container.children;
      const targetCard = cards[targetVirtualIndex] as HTMLElement | undefined;

      if (targetCard) {
        isScrollingByCode.current = true;
        const targetLeft = targetCard.offsetLeft - container.offsetLeft;

        container.scrollTo({
          left: targetLeft,
          behavior: smooth ? "smooth" : "instant",
        });

        currentVirtualIndexRef.current = targetVirtualIndex;
        const realIndex = ((targetVirtualIndex % totalCards) + totalCards) % totalCards;
        setCurrentIndex(realIndex);

        if (smooth) {
          if (normalizeTimeoutRef.current) {
            clearTimeout(normalizeTimeoutRef.current);
          }
          normalizeTimeoutRef.current = setTimeout(() => {
            normalizeVirtualPosition();
            isScrollingByCode.current = false;
          }, 550);
        } else {
          isScrollingByCode.current = false;
        }
      }
    },
    [totalCards, normalizeVirtualPosition]
  );

  // Positionnement initial au montage sur le premier élément du bloc central (Set 1)
  useEffect(() => {
    if (!scrollRef.current || totalCards <= 1) return;
    const container = scrollRef.current;

    const setupInitialPosition = () => {
      const cards = container.children;
      const initialCard = cards[totalCards] as HTMLElement | undefined;
      if (initialCard) {
        const initialLeft = initialCard.offsetLeft - container.offsetLeft;
        container.scrollTo({
          left: initialLeft,
          behavior: "instant",
        });
        currentVirtualIndexRef.current = totalCards;
        setCurrentIndex(0);
      }
    };

    setupInitialPosition();
    const rafId = requestAnimationFrame(setupInitialPosition);
    return () => cancelAnimationFrame(rafId);
  }, [totalCards]);

  // Recalage lors du redimensionnement de la fenêtre pour éviter tout décalage géométrique
  useEffect(() => {
    const handleResize = () => {
      if (!scrollRef.current || totalCards <= 1) return;
      const container = scrollRef.current;
      const cards = container.children;
      const currentCard = cards[currentVirtualIndexRef.current] as HTMLElement | undefined;
      if (currentCard) {
        container.scrollTo({
          left: currentCard.offsetLeft - container.offsetLeft,
          behavior: "instant",
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [totalCards]);

  // Navigation vers la carte suivante (toujours vers l'avant, sans jamais rembobiner)
  const nextCard = useCallback(() => {
    if (totalCards <= 1) return;
    const nextVirtual = currentVirtualIndexRef.current + 1;
    scrollToVirtualCard(nextVirtual, true);
  }, [totalCards, scrollToVirtualCard]);

  // Navigation vers la carte précédente
  const prevCard = useCallback(() => {
    if (totalCards <= 1) return;
    const prevVirtual = currentVirtualIndexRef.current - 1;
    scrollToVirtualCard(prevVirtual, true);
  }, [totalCards, scrollToVirtualCard]);

  // Navigation directe depuis un dot indicateur (chemin continu le plus court)
  const goToRealSlide = useCallback(
    (targetRealIndex: number) => {
      if (totalCards <= 1) return;
      const currentReal = ((currentVirtualIndexRef.current % totalCards) + totalCards) % totalCards;
      let diff = targetRealIndex - currentReal;
      if (diff > totalCards / 2) {
        diff -= totalCards;
      } else if (diff < -totalCards / 2) {
        diff += totalCards;
      }
      const targetVirtual = currentVirtualIndexRef.current + diff;
      scrollToVirtualCard(targetVirtual, true);
    },
    [totalCards, scrollToVirtualCard]
  );

  // Défilement automatique périodique continu
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;

    const timer = setInterval(() => {
      nextCard();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextCard, totalCards]);

  // Synchronisation des indicateurs et normalisation lors du défilement manuel (swipe tactile)
  const handleScroll = useCallback(() => {
    if (isScrollingByCode.current || !scrollRef.current || totalCards <= 1) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cards = Array.from(container.children) as HTMLElement[];
    if (cards.length === 0) return;

    let closestVirtual = currentVirtualIndexRef.current;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardLeft = card.offsetLeft - container.offsetLeft;
      const diff = Math.abs(cardLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestVirtual = idx;
      }
    });

    currentVirtualIndexRef.current = closestVirtual;
    const realIndex = ((closestVirtual % totalCards) + totalCards) % totalCards;
    if (realIndex !== currentIndex) {
      setCurrentIndex(realIndex);
    }

    if (manualScrollEndTimeoutRef.current) {
      clearTimeout(manualScrollEndTimeoutRef.current);
    }
    manualScrollEndTimeoutRef.current = setTimeout(() => {
      normalizeVirtualPosition();
    }, 150);
  }, [currentIndex, totalCards, normalizeVirtualPosition]);

  // Nettoyage des timers au démontage
  useEffect(() => {
    return () => {
      if (normalizeTimeoutRef.current) clearTimeout(normalizeTimeoutRef.current);
      if (manualScrollEndTimeoutRef.current) clearTimeout(manualScrollEndTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`relative w-full select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Rail de cartes distinctes défilant horizontalement en boucle infinie */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsPaused(false), 2500);
        }}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1 px-0.5"
      >
        {extendedSlides.map((slide, idx) => {
          const isCurrent = slide._realIndex === currentIndex;
          return (
            <div
              key={slide._uniqueKey}
              onClick={() => {
                hapticFeedback("light");
                if (onSelectSlide) {
                  onSelectSlide(slide);
                } else if (onOrderDish) {
                  onOrderDish(slide.dishRefName);
                }
              }}
              className={`snap-start shrink-0 flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[#00AFF2]/60 ${
                variant === "mobile"
                  ? "w-[86%] sm:w-[340px] h-[280px] sm:h-[310px]"
                  : "w-[86%] sm:w-[400px] md:w-[440px] h-[295px] sm:h-[330px]"
              } ${isCurrent ? "ring-2 ring-[#00AFF2]/40 border-[#00AFF2]/60 shadow-md" : "opacity-95"}`}
            >
              {/* Photo du plat / restaurant (Pure photo sans aucun texte superposé) */}
              <div className="relative w-full h-34 sm:h-40 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80">
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  priority={totalCards > 1 ? idx === totalCards : idx === 0}
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Bloc d'informations stylé situé en bas de l'image */}
              <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 min-h-0 bg-white dark:bg-slate-900">
                {/* Ligne Supérieure : Tag de catégorie & Badge Annonce Partenaire */}
                <div className="flex items-center justify-between gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-2xs ${
                        slide.tagBg || "bg-[#00AFF2]"
                      }`}
                    >
                      {slide.tag}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {slide.partnerLocation}
                    </span>
                  </div>

                  {slide.isSponsored && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 text-[9px] sm:text-[10px] font-semibold tracking-wide flex items-center gap-1 border border-amber-500/25 dark:border-amber-400/20 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                      <span>Annonce Partenaire</span>
                    </div>
                  )}
                </div>

                {/* Corps : Nom du restaurant partenaire, Titre du plat & Détails */}
                <div className="space-y-0.5 min-w-0 my-auto">
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold truncate">
                    {slide.partnerName}
                  </p>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#00AFF2] transition-colors">
                    {slide.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {slide.priceDetails}
                  </p>
                </div>

                {/* Pied : Prix et Bouton Commander */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none mb-0.5">
                      Prix
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {slide.price}
                    </span>
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
                    className="px-3 sm:px-3.5 py-1.5 bg-[#00AFF2] hover:bg-[#009bd6] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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
      <div
        className={`flex items-center ${
          variant === "mobile" ? "justify-center" : "justify-center sm:justify-between"
        } mt-2.5 px-1`}
      >
        {/* Contrôles de navigation (flèches et compteur) : masqués sur mobile, affichés sur desktop */}
        <div
          className={`${
            variant === "mobile" ? "hidden" : "hidden sm:flex"
          } items-center gap-1.5`}
        >
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

        {/* Indicateurs dots/pills interactifs : centrés sur mobile */}
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  hapticFeedback("light");
                  goToRealSlide(idx);
                }}
                aria-label={`Afficher la carte ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-5 bg-[#00AFF2]"
                    : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
