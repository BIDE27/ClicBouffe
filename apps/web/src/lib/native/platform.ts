import { Capacitor } from "@capacitor/core";

export function isCapacitor(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const p = Capacitor.getPlatform();
  if (p === "ios" || p === "android") return p;
  return "web";
}
