"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
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
 * - Bottom-sheet tactile sur mobile (< sm)
 * - Popover flottant sur desktop (>= sm)
 * Remplace systématiquement les <select> natifs navigateur/OS.
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
            isOpen ? "rotate-180 text-[#00AFF2]" : darkSurfaceOnly ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop mobile */}
          <div
            className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom-sheet sur mobile / Popover flottant sur desktop */}
          <div
            role="listbox"
            aria-label={ariaLabel || label || placeholder}
            className={`fixed inset-x-0 bottom-0 z-[70] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:right-0 sm:mt-1.5 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70dvh] sm:max-h-64 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-1 duration-150 ${
              darkSurfaceOnly
                ? "bg-slate-900 border-t sm:border border-slate-700 text-white"
                : "bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            }`}
          >
            {/* En-tête mobile du bottom-sheet */}
            <div
              className={`sm:hidden flex items-center justify-between px-4 pt-3 pb-2.5 border-b ${
                darkSurfaceOnly ? "border-slate-800" : "border-slate-100 dark:border-slate-800"
              }`}
            >
              <span className="text-sm font-black truncate">
                {label || ariaLabel || "Choisir une option"}
              </span>
              <button
                type="button"
                data-modal-close
                onClick={() => setIsOpen(false)}
                aria-label="Fermer la liste"
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                  darkSurfaceOnly
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-1.5 sm:p-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-1.5 space-y-0.5">
              {normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
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
        </>
      )}
    </div>
  );
}
