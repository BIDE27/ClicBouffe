"use client";

import React, { useMemo } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Génère et affiche un véritable QR Code SVG vectoriel ISO-18004 pur React (zéro dangerouslySetInnerHTML).
 */
export function QrCodeDisplay({ value, size = 180, label, className = "" }: QrCodeDisplayProps) {
  const qrData = useMemo(() => {
    if (!value || !value.trim()) return null;
    try {
      const symbol = QRCode.create(value, { errorCorrectionLevel: "M" });
      const modules = symbol.modules;
      const count = modules.size;
      let pathD = "";
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (modules.get(r, c)) {
            pathD += `M${c},${r}h1v1h-1z`;
          }
        }
      }
      return { count, pathD };
    } catch {
      return null;
    }
  }, [value]);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs ${className}`}
    >
      {qrData ? (
        <div
          style={{ width: size, height: size }}
          className="rounded-xl overflow-hidden bg-white p-1.5 flex items-center justify-center"
          role="img"
          aria-label={label || "Code QR ClicBouffe"}
        >
          <svg
            viewBox={`-1 -1 ${qrData.count + 2} ${qrData.count + 2}`}
            className="w-full h-full"
            shapeRendering="crispEdges"
          >
            <rect x={-1} y={-1} width={qrData.count + 2} height={qrData.count + 2} fill="#ffffff" />
            <path d={qrData.pathD} fill="#0f172a" />
          </svg>
        </div>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500"
        >
          <QrCode className="w-10 h-10" />
        </div>
      )}
      {label && (
        <span className="mt-2 text-[11px] font-black text-slate-900 dark:text-white tracking-tight">
          {label}
        </span>
      )}
    </div>
  );
}
