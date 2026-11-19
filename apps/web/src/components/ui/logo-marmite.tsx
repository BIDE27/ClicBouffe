"use client";

import React from "react";

export interface LogoMarmiteProps {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
  shape?: "circle" | "squircle";
  potColor?: string;
  cursorColor?: string;
  backgroundColor?: string;
  title?: string;
}

/**
 * Logo officiel et permanent ClicBouffe.
 * Marmite (avec ses deux poignées latérales, son couvercle et sa couronne supérieure)
 * contenant le curseur de clic avec ses rayons d'impact à l'intérieur.
 * Issu directement du fichier vectoriel authentique assets/icones/logo.svg.
 */
export function LogoMarmite({
  className = "w-8 h-8",
  size,
  withBackground = false,
  shape = "circle",
  potColor = "#ffffff",
  cursorColor = "#00AFF2",
  backgroundColor = "#00AFF2",
  title = "ClicBouffe",
}: LogoMarmiteProps) {
  const shapeClass = withBackground
    ? shape === "circle"
      ? "rounded-full overflow-hidden"
      : "rounded-2xl overflow-hidden"
    : "";

  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      className={`${shapeClass} ${className}`.trim()}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>

      {/* Arrière-plan optionnel (forme circulaire ou squircle avec couleur de marque ClicBouffe) */}
      {withBackground && (
        <rect
          width="1024"
          height="1024"
          rx={shape === "circle" ? "512" : "224"}
          fill={backgroundColor}
        />
      )}

      {/* Anses (Poignées latérales de la marmite) */}
      <g id="Anses">
        <path
          fill="none"
          stroke={potColor}
          strokeLinecap="round"
          strokeWidth="32"
          fillRule="evenodd"
          d="m192 408c-90 22-90 232 0 254"
        />
        <path
          fill="none"
          stroke={potColor}
          strokeLinecap="round"
          strokeWidth="32"
          fillRule="evenodd"
          d="m832 408c90 22 90 232 0 254"
        />
      </g>

      {/* Corps de la marmite */}
      <g id="Marmite">
        <path
          fill={potColor}
          d="m186 365h652v330c0 100-68 165-163 165h-326c-95 0-163-65-163-165z"
        />
      </g>

      {/* Couvercle et couronne supérieure */}
      <g id="Couvercle-et-Couronne">
        <path
          fill={potColor}
          stroke={potColor}
          strokeLinejoin="round"
          strokeWidth="10"
          d="m148 372c72-99.7 172-150.82 276-161.9l-8-47.72 50 17.04 46-49.42 46 49.42 50-17.04-8 47.72c104 11.08 204 62.2 276 161.9z"
        />
      </g>

      {/* Curseur de clic avec flèche et rayons d'impact */}
      <g id="Curseur">
        <path
          fill={cursorColor}
          stroke={cursorColor}
          strokeLinejoin="round"
          strokeWidth="14"
          d="m444 492l44 144 36-34 38 46 32-28-38-46 42-32z"
        />
        <path
          fill="none"
          stroke={cursorColor}
          strokeLinecap="round"
          strokeWidth="16"
          fillRule="evenodd"
          d="m398 492h24"
        />
        <path
          fill="none"
          stroke={cursorColor}
          strokeLinecap="round"
          strokeWidth="16"
          fillRule="evenodd"
          d="m408 456l18 18"
        />
        <path
          fill="none"
          stroke={cursorColor}
          strokeLinecap="round"
          strokeWidth="16"
          fillRule="evenodd"
          d="m444 444v24"
        />
        <path
          fill="none"
          stroke={cursorColor}
          strokeLinecap="round"
          strokeWidth="16"
          fillRule="evenodd"
          d="m480 456l-18 18"
        />
        <path
          fill="none"
          stroke={cursorColor}
          strokeLinecap="round"
          strokeWidth="16"
          fillRule="evenodd"
          d="m408 528l18-18"
        />
      </g>
    </svg>
  );
}
