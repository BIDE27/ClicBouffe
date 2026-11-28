"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { hapticFeedback } from "../../lib/native/haptics";

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | AppSelectOption)[];
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  darkSurfaceOnly?: boolean;
  compact?: boolean;
}

/**
 * Liste déroulante 100% personnalisée ClicBouffe :
 * - Toujours ancrée directement sous le champ (liste déroulante fluide, jamais en modale)
 * - Design natif ClicBouffe (clair & sombre), tactile (>= 44px) et sans <select> OS standard.
 */
export function AppSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Sélectionner...",
  ariaLabel,
  className = "",
  triggerClassName = "",
  darkSurfaceOnly = false,
  compact = false,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: AppSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    hapticFeedback("light");
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        onClick={() => {
          hapticFeedback("light");
          setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 text-left transition-all cursor-pointer outline-none ${
          compact
            ? "min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black"
            : "min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium"
        } ${
          darkSurfaceOnly
            ? `bg-slate-800 border ${
                isOpen ? "border-[#00AFF2] ring-2 ring-[#00AFF2]/20" : "border-slate-700"
              } text-white`
            : `bg-slate-50 dark:bg-slate-800 border ${
                isOpen
                  ? "border-[#00AFF2] ring-2 ring-[#00AFF2]/20"
                  : "border-slate-200 dark:border-slate-700"
              } text-slate-900 dark:text-white`
        } ${triggerClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-[#00AFF2]"
              : darkSurfaceOnly
              ? "text-slate-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || label || placeholder}
          className={`absolute left-0 right-0 mt-1.5 z-50 min-w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${
            darkSurfaceOnly
              ? "bg-slate-900 border border-slate-700 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          }`}
        >
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? darkSurfaceOnly
                        ? "bg-[#00AFF2]/15 text-[#00AFF2] font-bold"
                        : "bg-sky-50 dark:bg-sky-950/50 text-[#00AFF2] font-bold"
                      : darkSurfaceOnly
                      ? "text-slate-200 hover:bg-slate-800 font-medium"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  }`}
                >
                  <span className="leading-snug">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#00AFF2] shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
