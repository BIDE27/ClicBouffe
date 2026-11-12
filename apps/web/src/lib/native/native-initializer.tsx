"use client";

import { useEffect, useState } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App as CapApp } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { isCapacitor } from "./platform";
import { WifiOff } from "lucide-react";

export function NativeInitializer() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!isCapacitor()) return;

    let cleanupAppListener: (() => void) | null = null;
    let cleanupNetworkListener: (() => void) | null = null;

    async function initNative() {
      try {
        // 1. Splash Screen & Status Bar
        await SplashScreen.hide();
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#00AFF2" });

        // 2. Gestion du bouton Retour physique Android
        const backHandle = await CapApp.addListener("backButton", ({ canGoBack }) => {
          // Fermer les modales ou tiroirs ouverts en premier
          const closeButton = document.querySelector<HTMLButtonElement>(
            "[data-drawer-close], [data-modal-close]"
          );
          if (closeButton) {
            closeButton.click();
            return;
          }

          if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
        cleanupAppListener = () => backHandle.remove();

        // 3. Détection de connectivité réseau
        const status = await Network.getStatus();
        setIsOffline(!status.connected);

        const netHandle = await Network.addListener("networkStatusChange", (netStatus) => {
          setIsOffline(!netStatus.connected);
        });
        cleanupNetworkListener = () => netHandle.remove();
      } catch (err) {
        console.warn("Erreur initialisation native Capacitor:", err);
      }
    }

    initNative();

    return () => {
      cleanupAppListener?.();
      cleanupNetworkListener?.();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 pt-safe shadow-md"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Mode hors-ligne — Vos données locales restent disponibles</span>
    </div>
  );
}
