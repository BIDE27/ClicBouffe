import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isCapacitor } from "./platform";

export async function hapticFeedback(
  type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light"
): Promise<void> {
  if (typeof window === "undefined") return;

  if (isCapacitor()) {
    try {
      if (type === "success") {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === "warning") {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === "error") {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (type === "heavy") {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === "medium") {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      return;
    } catch {
      // Échec silencieux
    }
  }

  // Fallback web standard (navigator.vibrate) si supporté
  if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
    try {
      if (type === "success") navigator.vibrate([20, 40, 20]);
      else if (type === "error") navigator.vibrate([50, 50, 50]);
      else navigator.vibrate(15);
    } catch {
      // Ignorer si non supporté
    }
  }
}
