---
name: infinite-loop-carousel
description: >-
  Conception et implémentation d'un carrousel de cartes et bannières en boucle infinie continue sans
  aucun rembobinage (Infinite Seamless Looping Carousel) : tampon virtuel triplé (Set 0 clone-prev,
  Set 1 main, Set 2 clone-next), recalage silencieux en 0 ms sans flash optique, élimination du piège
  scroll-smooth CSS, trajectoire continue la plus courte pour les indicateurs (dots) et flèches,
  prise en charge du swipe tactile avec snap-mandatory et Dark Mode first-class.
---

# Infinite Seamless Looping Carousel (Architecture Mobile Native Pixel-Perfect)

Ce skill enseigne à l'agent comment concevoir, implémenter et tester un carrousel horizontal de cartes ou bannières à **défilement infini continu et sans couture**, éliminant définitivement l'effet de rembobinage brutal (*rewind animation*) lorsque le défilement atteint la dernière diapositive.

---

## 1. 📖 Termes Techniques Fondamentaux

Quand vous concevez, déboguez ou référencez ce système de carrousel, utilisez ces termes précis :

1. **Infinite Seamless Looping (Boucle Infinie sans Couture)** :
   * Système où l'utilisateur ou l'autoplay peut avancer indéfiniment vers la droite (ou reculer vers la gauche) sans jamais subir un rembobinage brusque traversant toutes les cartes en sens inverse pour revenir au début.
2. **Tampon Triplé / Triplicated Buffer** :
   * Technique d'ingénierie consistant à projeter le tableau de $N$ éléments en 3 jeux consécutifs :
     * **Set 0 (`clone-prev`)** : indices $0$ à $N-1$ (tampon de sécurité arrière).
     * **Set 1 (`main` / central)** : indices $N$ à $2N-1$ (espace de lecture actif principal).
     * **Set 2 (`clone-next`)** : indices $2N$ à $3N-1$ (tampon de continuité avant).
3. **Recalage Silencieux en 0 ms (Silent Instant Normalization)** :
   * Opération déclenchée immédiatement après qu'une glissade fluide vers un clone a atteint sa position de repos : la vue saute instantanément (`behavior: "instant"` / `scrollLeft = ...`) vers la diapositive identique située dans le Set 1 central. Comme les deux cartes partagent un contenu, une géométrie et des marges identiques, ce saut est **100 % invisible à l'œil nu**.
4. **Index Réel vs Index Virtuel** :
   * **Index Virtuel (`virtualIndex`)** : Position physique absolue du nœud DOM dans le conteneur (`0` à $3N-1$).
   * **Index Réel (`currentIndex`)** : Index logique compris strictement entre $0$ et $N-1$ (`((virtualIndex % N) + N) % N`), utilisé pour afficher les compteurs (`3 / 6`), les pastilles indicatrices (*dots*) et les bordures actives.
5. **Trajectoire Continue la Plus Courte (Shortest Continuous Path)** :
   * Algorithme pour la navigation directe par pastille (*dot*) : si l'utilisateur est sur la carte 6 et clique sur le point 1, le carrousel avance de $+1$ cran vers la droite au lieu de reculer de $-5$ crans vers la gauche.
6. **Verrouillage de Transition (`isScrollingByCode`)** :
   * Drapeau de synchronisation empêchant les événements de défilement natifs (`onScroll`) d'interférer ou d'écraser l'index pendant qu'une animation programmatique ou un recalage instantané est en cours.
7. **Pause Tactile & Reprise Douce (`onTouchStart` / `onTouchEnd`)** :
   * Suspension immédiate de la rotation automatique (*autoplay*) dès que l'utilisateur pose le doigt ou survole la zone, avec un délai de courtoisie (ex: 2 500 ms) avant la reprise du défilement automatique.

---

## 2. ⚠️ Les 4 Pièges Techniques Majeurs

### Piège A : Le Rembobinage Brutal Classique ("Rewind Animation")
* **Le problème** : Dans un carrousel naïf de 6 cartes, arrivé à la carte 6 (`index = 5`), le code fait `nextIndex = (5 + 1) % 6 = 0` et appelle `scrollTo({ left: 0, behavior: "smooth" })`. Le navigateur rembobine les 6 cartes à toute vitesse vers la gauche. Plus la liste contient de cartes, plus ce rembobinage est long, disgracieux et perturbant pour l'utilisateur.
* **La solution obligatoire** : Utiliser un tampon étendu avec clones. Arrivé à la carte $N-1$ du Set 1, l'avancement glisse naturellement vers la droite sur la carte $0$ du Set 2. Une fois le glissement achevé, normaliser silencieusement en 0 ms vers la carte $0$ du Set 1.

### Piège B : Le Conflit Fatal avec la Classe CSS `scroll-smooth`
* **Le problème** : Si la classe Tailwind `scroll-smooth` (`scroll-behavior: smooth;`) est appliquée en dur sur la balise conteneur, toute assignation programmatique de `container.scrollLeft = X` ou `scrollTo({ behavior: "instant" })` est interceptée par le moteur du navigateur qui l'anime ! Le saut de normalisation silencieux de l'index 12 vers l'index 6 se transforme alors en une animation arrière visible.
* **La solution obligatoire** : **Bannir `scroll-smooth` du conteneur CSS**. Déclencher le défilement doux uniquement via l'API JavaScript explicite `container.scrollTo({ left, behavior: "smooth" })`, et le recalage silencieux via `container.scrollTo({ left, behavior: "instant" })`.

### Piège C : Les Erreurs de Clés React Dupliquées (`duplicate key error`)
* **Le problème** : Si le composant duplique simplement `[...slides, ...slides, ...slides]` en utilisant `key={slide.id}`, React émet un avertissement d'erreur de clé dupliquée dans la console et désynchronise le Virtual DOM.
* **La solution obligatoire** : Générer une clé unique par partition virtuelle : `${slide.id}-clone-prev`, `${slide.id}-main`, `${slide.id}-clone-next`.

### Piège D : La Désynchronisation Géométrique lors du Redimensionnement
* **Le problème** : Si les cartes utilisent des largeurs fluides (ex: `w-[86%] sm:w-[420px]`), une rotation d'écran mobile ou un redimensionnement de fenêtre modifie la valeur en pixels de `offsetLeft`. L'utilisateur se retrouve arrêté à cheval entre deux cartes.
* **La solution obligatoire** : Écouter l'événement `window.resize` et réaligner instantanément le conteneur sur `currentCard.offsetLeft - container.offsetLeft` avec `behavior: "instant"`.

---

## 3. 🏗️ Algorithme & Cycle de Vie du Défilement Infini

```
[ Set 0 : Clones Précédents ]    [ Set 1 : Cartes Principales ]    [ Set 2 : Clones Suivants ]
  [0] [1] [2] [3] [4] [5]          [6] [7] [8] [9] [10] [11]        [12] [13] [14] [15] [16] [17]
                                    ^ Départ initial                  ^ Cible après carte 11
                                    
Étape 1 : On est sur la carte 11 (Diapositive 6/6).
Étape 2 : L'autoplay ou l'utilisateur clique sur ">".
Étape 3 : On glisse en douceur vers la droite vers l'index virtuel 12 (Diapositive 1/6).
          -> L'utilisateur voit la carte 1 entrer doucement par la droite !
          -> L'indicateur affiche immédiatement "1 / 6" et active le dot 0.
Étape 4 : À 550 ms (glissade finie), recalage silencieux en 0 ms : index virtuel 12 -> 6.
Étape 5 : L'étape suivante glissera de 6 vers 7, poursuivant la boucle infinie sans jamais rembobiner !
```

---

## 4. 🛠️ Composant React 19 / TypeScript Prêt à l'Emploi

Voici l'implémentation complète et optimisée du composant `PromoCarousel` :

```tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { PromoSlide } from "@/lib/data/clicbouffe-data";
import { hapticFeedback } from "@/lib/native/haptics";

interface PromoCarouselProps {
  slides: PromoSlide[];
  onSelectSlide?: (slide: PromoSlide) => void;
  onOrderDish?: (dishRefName: string) => void;
  autoPlayInterval?: number;
  className?: string;
  variant?: "mobile" | "web";
}

export function PromoCarousel({
  slides,
  onSelectSlide,
  onOrderDish,
  autoPlayInterval = 4500,
  className = "",
  variant = "web",
}: PromoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Index réel logique (0 à totalCards - 1)
  const [isPaused, setIsPaused] = useState(false);
  const isScrollingByCode = useRef(false);
  const currentVirtualIndexRef = useRef(0);
  const normalizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualScrollEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalCards = slides.length;

  // 1. Triplication du tampon de diapositives avec clés uniques
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

  // 2. Normalisation silencieuse instantanée vers le Set 1 central
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

  // 3. Défilement doux vers un index virtuel
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

  // 4. Positionnement initial sur le premier élément du bloc central (Set 1)
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

  // 5. Recalage géométrique lors d'un redimensionnement ou rotation d'écran
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

  // 6. Navigation vers la carte suivante (toujours vers l'avant)
  const nextCard = useCallback(() => {
    if (totalCards <= 1) return;
    const nextVirtual = currentVirtualIndexRef.current + 1;
    scrollToVirtualCard(nextVirtual, true);
  }, [totalCards, scrollToVirtualCard]);

  // 7. Navigation vers la carte précédente
  const prevCard = useCallback(() => {
    if (totalCards <= 1) return;
    const prevVirtual = currentVirtualIndexRef.current - 1;
    scrollToVirtualCard(prevVirtual, true);
  }, [totalCards, scrollToVirtualCard]);

  // 8. Navigation directe par point indicateur (trajectoire la plus courte)
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

  // 9. Rotation automatique périodique
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;

    const timer = setInterval(() => {
      nextCard();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextCard, totalCards]);

  // 10. Synchronisation tactile manuelle (Swipe)
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

  // Nettoyage des timers
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
      {/* Conteneur sans scroll-smooth CSS pour autoriser le recalage en 0 ms */}
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
              className={`snap-start shrink-0 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200/90 dark:border-slate-800 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[#00AFF2]/60 ${
                variant === "mobile"
                  ? "w-[86%] sm:w-[340px] h-44 sm:h-50"
                  : "w-[86%] sm:w-[420px] md:w-[460px] h-48 sm:h-56"
              } ${isCurrent ? "ring-2 ring-[#00AFF2]/40" : "opacity-95"}`}
            >
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                priority={totalCards > 1 ? idx === totalCards : idx === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 flex flex-col justify-between p-3.5 sm:p-4 text-white">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                      slide.tagBg || "bg-[#00AFF2]"
                    }`}
                  >
                    {slide.tag}
                  </span>
                  {slide.isSponsored && (
                    <div className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 border border-white/20">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Annonce Partenaire</span>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between gap-2 mt-auto">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <p className="text-[10px] sm:text-xs text-slate-300 font-semibold truncate">
                      {slide.partnerName}
                    </p>
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight line-clamp-1">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-300 font-extrabold">
                      {slide.price}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback("medium");
                      if (onOrderDish) onOrderDish(slide.dishRefName);
                    }}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#00AFF2] hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
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

      {/* Flèches de navigation et indicateurs */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              hapticFeedback("light");
              prevCard();
            }}
            aria-label="Carte précédente"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#00AFF2] hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#00AFF2] text-slate-700 flex items-center justify-center transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => {
              hapticFeedback("light");
              nextCard();
            }}
            aria-label="Carte suivante"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#00AFF2] hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#00AFF2] text-slate-700 flex items-center justify-center transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium ml-1">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>

        {/* Indicateurs dots interactifs */}
        <div className="flex items-center gap-1.5">
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
                  isActive ? "w-5 bg-[#00AFF2]" : "w-1.5 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## 5. 🧪 Protocole de Tests Automatisés (Vitest)

Voici le test unitaire validant l'absence de rembobinage et la trajectoire de plus court chemin :

```ts
describe("Carrousel infini continu sans rembobinage", () => {
  it("calcule correctement la transition continue vers la première carte", () => {
    const N = 6;
    const lastVirtualIndex = 2 * N - 1; // 11 (dernière carte du Set 1)
    const nextVirtualIndex = lastVirtualIndex + 1; // 12 (première carte du Set 2)

    // L'index logique reste 0 (carte 1/6)
    const realIndex = ((nextVirtualIndex % N) + N) % N;
    expect(realIndex).toBe(0);

    // Normalisation silencieuse après transition : 12 -> 6 (Set 1)
    const normalizedIndex = N + realIndex;
    expect(normalizedIndex).toBe(6);
  });

  it("choisit le chemin le plus court pour les indicateurs (dots)", () => {
    const computeShortestPath = (fromReal: number, toReal: number, total: number) => {
      let diff = toReal - fromReal;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;
      return diff;
    };

    // De la carte 5 vers la carte 0 : +1 (avance d'1 cran) au lieu de -5 (rembobinage)
    expect(computeShortestPath(5, 0, 6)).toBe(1);

    // De la carte 0 vers la carte 5 : -1 (recule d'1 cran) au lieu de +5
    expect(computeShortestPath(0, 5, 6)).toBe(-1);
  });
});
```

---

## 6. 🌓 Standards Dark Mode & ClicBouffe

* **Surfaces Sombres** : `dark:bg-slate-900` avec bordures `dark:border-slate-800`.
* **Points Indicateurs** : Inactifs `bg-slate-200 dark:bg-slate-700`, actifs en bleu marque `w-5 bg-[#00AFF2]`.
* **Zéro Émoji** : Utilisation exclusive de composants d'icônes Lucide (`ChevronLeft`, `ChevronRight`, `Plus`, `Sparkles`).
* **Tarifs** : Toujours au format `FCFA` avec espace insécable.
