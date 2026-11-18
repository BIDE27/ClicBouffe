import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  REGIONAL_RESTAURANTS,
} from "../lib/data/clicbouffe-data";

describe("Speed Dial FAB, QR Scanner et Conformité Zéro Lueur", () => {
  const pagePath = path.resolve(__dirname, "../app/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  describe("Suppression totale des lueurs colorées (Zero Glow Rule)", () => {
    it("ne contient aucune classe de lueur ou ombre colorée shadow-[#00AFF2]", () => {
      expect(pageContent).not.toContain("shadow-[#00AFF2]");
      expect(pageContent).not.toContain("shadow-[#00AFF2]/40");
      expect(pageContent).not.toContain("shadow-[#00AFF2]/30");
    });

    it("utilise des ombres neutres standards (shadow-md, shadow-lg, shadow-sm)", () => {
      expect(pageContent).toContain("shadow-lg");
      expect(pageContent).toContain("shadow-md");
    });
  });

  describe("Bouton Central FAB sans libellé texte", () => {
    it("ne contient plus le texte 'Composer plat' sous le bouton central", () => {
      expect(pageContent).not.toContain('<span className="text-[9px] font-bold text-black dark:text-white mt-1">Composer plat</span>');
      expect(pageContent).not.toMatch(/<span[^>]*>Composer plat<\/span>/);
    });
  });

  describe("Menu Déroulant Speed Dial Flottant (Speed Dial Actions)", () => {
    it("intègre l'état isFabMenuOpen et la bascule au clic", () => {
      expect(pageContent).toContain("isFabMenuOpen");
      expect(pageContent).toContain("setIsFabMenuOpen");
    });

    it("propose l'action 'Composer' avec icône vectorielle ChefHat", () => {
      expect(pageContent).toContain("Composer");
      expect(pageContent).toContain("ChefHat");
      expect(pageContent).toContain('setScreen("compose_dish")');
    });

    it("propose l'action 'Scanner QR' avec icône vectorielle QrCode", () => {
      expect(pageContent).toContain("Scanner QR");
      expect(pageContent).toContain("QrCode");
      expect(pageContent).toContain("setShowQrScannerModal(true)");
    });

    it("propose un fond tamisé avec flou complet plein écran pour toute la page", () => {
      expect(pageContent).toContain("backdrop-blur-md");
      expect(pageContent).toContain('isFabMenuOpen ? "filter blur-[2px] opacity-40 pointer-events-none select-none"');
      expect(pageContent).toContain("setIsFabMenuOpen(false)");
    });

    it("anime le bouton central avec morphing rotatif (+ vers X)", () => {
      expect(pageContent).toContain('isFabMenuOpen ? "rotate-45" : "rotate-0"');
      expect(pageContent).toContain("cubic-bezier(0.34,1.56,0.64,1)");
    });

    it("propose un affichage progressif en cascade (staggered delay) pour Scanner et Composer", () => {
      expect(pageContent).toContain("delay-75");
      expect(pageContent).toContain("delay-150");
    });

    it("maintient la barre de navigation visible avec flou doux sur ses onglets", () => {
      expect(pageContent).toContain('isFabMenuOpen ? "filter blur-[1.5px] opacity-35 pointer-events-none scale-95"');
    });
  });

  describe("Composant Scanner QR Code (Table & Plats)", () => {
    const scannerPath = path.resolve(__dirname, "../components/qr/qr-scanner-modal.tsx");
    const scannerContent = fs.readFileSync(scannerPath, "utf-8");

    it("le fichier du composant QrScannerModal existe", () => {
      expect(fs.existsSync(scannerPath)).toBe(true);
    });

    it("intègre le support de la caméra et les contrôles torche/caméra", () => {
      expect(scannerContent).toContain("navigator.mediaDevices");
      expect(scannerContent).toContain("Flashlight");
      expect(scannerContent).toContain("Camera");
      expect(scannerContent).toContain("Upload");
    });

    it("intègre le viseur de cadrage avec balayage laser animé", () => {
      expect(scannerContent).toContain("border-[#00AFF2]");
      expect(scannerContent).toContain("animate-bounce");
    });

    it("détecte et associe correctement un restaurant ou un plat scanné", () => {
      const sampleRestaurant = REGIONAL_RESTAURANTS[0];
      expect(sampleRestaurant.name).toBe("Le Maquis du Port");
      expect(scannerContent).toContain("REGIONAL_RESTAURANTS");
      expect(scannerContent).toContain("INITIAL_GRID_DISHES");
      expect(scannerContent).toContain("onScanRestaurant");
      expect(scannerContent).toContain("onScanDish");
    });

    it("respecte la règle zéro émoji avec icônes vectorielles Lucide", () => {
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      expect(emojiRegex.test(scannerContent)).toBe(false);
    });

    it("respecte la règle Dark Mode First-Class", () => {
      expect(scannerContent).toContain("dark:bg-slate-900");
      expect(scannerContent).toContain("dark:border-slate-800");
    });
  });

  describe("Modale Menu Restaurant Scanné", () => {
    const restauModalPath = path.resolve(__dirname, "../components/qr/scanned-restaurant-modal.tsx");
    const restauModalContent = fs.readFileSync(restauModalPath, "utf-8");

    it("le fichier ScannedRestaurantModal existe", () => {
      expect(fs.existsSync(restauModalPath)).toBe(true);
    });

    it("affiche le nom du restaurant, ses badges, note, frais en FCFA et ses plats", () => {
      expect(restauModalContent).toContain("restaurant.name");
      expect(restauModalContent).toContain("restaurant.deliveryFee");
      expect(restauModalContent).toContain("restaurant.rating");
      expect(restauModalContent).toContain("dish.price");
      expect(restauModalContent).toContain("onToggleDish");
    });

    it("respecte la règle zéro émoji et le Dark Mode", () => {
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;
      expect(emojiRegex.test(restauModalContent)).toBe(false);
      expect(restauModalContent).toContain("dark:bg-slate-900");
    });
  });
});
