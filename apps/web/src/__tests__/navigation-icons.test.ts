import { describe, it, expect } from "vitest";
import React from "react";
import {
  HomeNavIcon,
  ExplorerNavIcon,
  ClockNavIcon,
  CalendarNavIcon,
} from "../components/navigation-icons";

describe("Composants NavigationIcons (Pixel-Perfect & Découpe blanche d'arrière-plan)", () => {
  describe("HomeNavIcon (Accueil)", () => {
    it("génère l'icône active avec le corps bleu #00AFF2 et la porte découpée en blanc", () => {
      const element = HomeNavIcon({ active: true });
      expect(element.type).toBe("svg");
      expect(element.props.fill).toBe("none");

      // Vérifie les enfants SVG
      const children = React.Children.toArray(element.props.children) as React.ReactElement<{
        d?: string;
        fill?: string;
        className?: string;
      }>[];
      expect(children.length).toBe(2);

      // Le corps de la maison doit être rempli en bleu #00AFF2
      expect(children[0].props.fill).toBe("#00AFF2");

      // La porte intérieure doit être découpée à la couleur d'arrière-plan (blanc)
      expect(children[1].props.fill).toBe("white");
      // Et contenir les classes Tailwind adaptatives mode clair / mode sombre (dark:fill-slate-900)
      expect(children[1].props.className).toContain("dark:fill-slate-900");
    });

    it("supporte une couleur de découpe personnalisée si l'arrière-plan change", () => {
      const element = HomeNavIcon({ active: true, cutoutColor: "#F8FAFC" });
      const children = React.Children.toArray(element.props.children) as React.ReactElement<{
        fill?: string;
        className?: string;
      }>[];
      expect(children[1].props.fill).toBe("#F8FAFC");
      expect(children[1].props.className).toBeUndefined();
    });

    it("génère l'icône inactive en mode contour sans remplissage", () => {
      const element = HomeNavIcon({ active: false });
      expect(element.props.stroke).toBe("currentColor");
      expect(element.props.fill).toBe("none");
    });
  });

  describe("ExplorerNavIcon (Explorer)", () => {
    it("génère l'icône active avec le disque bleu et l'aiguille de boussole découpée en blanc", () => {
      const element = ExplorerNavIcon({ active: true });
      const children = React.Children.toArray(element.props.children) as React.ReactElement<{
        fill?: string;
        className?: string;
      }>[];
      expect(children[0].props.fill).toBe("#00AFF2");
      expect(children[1].props.fill).toBe("white");
      expect(children[1].props.className).toContain("dark:fill-slate-900");
    });

    it("génère l'icône inactive en contour", () => {
      const element = ExplorerNavIcon({ active: false });
      expect(element.props.stroke).toBe("currentColor");
      expect(element.props.fill).toBe("none");
    });
  });

  describe("ClockNavIcon (Plus tard)", () => {
    it("génère l'icône active avec le disque d'horloge bleu et les aiguilles en blanc", () => {
      const element = ClockNavIcon({ active: true });
      const children = React.Children.toArray(element.props.children) as React.ReactElement<{
        fill?: string;
        stroke?: string;
        className?: string;
      }>[];
      expect(children[0].props.fill).toBe("#00AFF2");
      expect(children[1].props.stroke).toBe("white");
      expect(children[1].props.className).toContain("dark:stroke-slate-900");
      expect(children[2].props.fill).toBe("white");
      expect(children[2].props.className).toContain("dark:fill-slate-900");
    });

    it("génère l'icône inactive en contour", () => {
      const element = ClockNavIcon({ active: false });
      expect(element.props.stroke).toBe("currentColor");
      expect(element.props.fill).toBe("none");
    });
  });

  describe("CalendarNavIcon (Abonnements)", () => {
    it("génère l'icône active avec le calendrier bleu, les anneaux, la ligne et la grille de 6 points en blanc", () => {
      const element = CalendarNavIcon({ active: true });
      const children = React.Children.toArray(element.props.children) as React.ReactElement<{
        fill?: string;
        stroke?: string;
        className?: string;
      }>[];
      expect(children[0].props.fill).toBe("#00AFF2"); // Corps calendrier
      expect(children[1].props.stroke).toBe("white"); // Anneaux
      expect(children[1].props.className).toContain("dark:stroke-slate-900");
      expect(children[2].props.stroke).toBe("white"); // Ligne de séparation
      expect(children[2].props.className).toContain("dark:stroke-slate-900");
      // 6 points de date en blanc (exactement comme capture 4 de la maquette)
      for (let i = 3; i < 9; i++) {
        expect(children[i].props.fill).toBe("white");
        expect(children[i].props.className).toContain("dark:fill-slate-900");
      }
    });

    it("génère l'icône inactive en contour", () => {
      const element = CalendarNavIcon({ active: false });
      expect(element.props.stroke).toBe("currentColor");
      expect(element.props.fill).toBe("none");
    });
  });
});
