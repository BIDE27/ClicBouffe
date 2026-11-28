"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { hapticFeedback } from "../../lib/native/haptics";

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  multiple?: boolean;
  values?: string[];
  onChangeMultiple?: (values: string[]) => void;
  maxSelections?: number;
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
 * - Supporte sélection simple ET sélection multiple bornée (ex: max 3 spécialités)
 * - Design natif ClicBouffe (clair & sombre), tactile (>= 44px) et sans <select> OS standard.
 */
export function AppSelect({
  value = "",
  onChange,
  multiple = false,
  values = [],
  onChangeMultiple,
  maxSelections = 3,
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

  const handleToggleOption = (val: string) => {
    if (!multiple) {
      hapticFeedback("light");
      onChange?.(val);
      setIsOpen(false);
      return;
    }

    const exists = values.includes(val);
    if (exists) {
      // Toujours garder au moins 1 sélection si on retire, ou autoriser suppression via croix tant qu'il en reste >= 1
      if (values.length <= 1) {
        hapticFeedback("light");
        return;
      }
      hapticFeedback("light");
      onChangeMultiple?.(values.filter((v) => v !== val));
    } else {
      if (values.length >= maxSelections) {
        hapticFeedback("medium");
        return;
      }
      hapticFeedback("light");
      onChangeMultiple?.([...values, val]);
    }
  };

  const triggerText = multiple
    ? values.length === 0
      ? placeholder
      : values.length === 1
      ? normalizedOptions.find((o) => o.value === values[0])?.label || values[0]
      : `${values.length} spécialités sélectionnées`
    : selectedOption
    ? selectedOption.label
    : placeholder;

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
        <span className="truncate flex-1">{triggerText}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {multiple && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                values.length >= maxSelections
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  : "bg-[#00AFF2]/15 text-[#00AFF2]"
              }`}
            >
              {values.length}/{maxSelections}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen
                ? "rotate-180 text-[#00AFF2]"
                : darkSurfaceOnly
                ? "text-slate-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          />
        </div>
      </button>

      {/* Chips des sélections actives en mode multiple */}
      {multiple && values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((val) => {
            const optLabel = normalizedOptions.find((o) => o.value === val)?.label || val;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-[#00AFF2] text-[11px] font-bold max-w-full"
              >
                <span className="truncate">{optLabel}</span>
                {values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleToggleOption(val)}
                    aria-label={`Retirer ${optLabel}`}
                    className="w-4 h-4 rounded-full hover:bg-sky-200/70 dark:hover:bg-sky-800 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable={multiple || undefined}
          aria-label={ariaLabel || label || placeholder}
          className={`absolute left-0 right-0 mt-1.5 z-50 min-w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${
            darkSurfaceOnly
              ? "bg-slate-900 border border-slate-700 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          }`}
        >
          {multiple && (
            <div
              className={`px-3 py-2 border-b flex items-center justify-between text-[11px] ${
                darkSurfaceOnly
                  ? "border-slate-800 text-slate-300"
                  : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <span>Choisissez jusqu&apos;à {maxSelections} spécialités</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#00AFF2] hover:underline cursor-pointer"
              >
                OK
              </button>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = multiple ? values.includes(opt.value) : opt.value === value;
              const isLimitReached = multiple && !isSelected && values.length >= maxSelections;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={isLimitReached}
                  onClick={() => handleToggleOption(opt.value)}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors ${
                    isLimitReached
                      ? "opacity-45 cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
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
                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#00AFF2] shrink-0 stroke-[2.5]" />
                  ) : isLimitReached ? (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Max {maxSelections}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
