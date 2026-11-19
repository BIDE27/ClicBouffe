import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GoogleSearchView } from "../components/search/google-search-view";

describe("Composant GoogleSearchView (Recherche Immersive Style Google)", () => {
  it("ne rend rien lorsque isOpen est false", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: false,
        onClose: () => {},
      })
    );
    expect(markup).toBe("");
  });

  it("rend la page complète avec logo ClicBouffe, grande barre de recherche et bouton Retour", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
      })
    );
    expect(markup).toContain('aria-label="Recherche ClicBouffe style Google"');
    expect(markup).toContain("ClicBouffe");
    expect(markup).toContain("Retour");
    expect(markup).toContain('placeholder="Rechercher un plat, un restaurant, un quartier..."');
  });

  it("affiche les 6 raccourcis circulaires culinaires inspirés de Google en l'absence de saisie", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
        initialQuery: "",
      })
    );
    expect(markup).toContain("Cuisine Locale");
    expect(markup).toContain("Chawarma &amp; Grill");
    expect(markup).toContain("Tapioca &amp; Gari");
    expect(markup).toContain("Fast-Food");
    expect(markup).toContain("Maquis du Port");
    expect(markup).toContain("Livraison Express");
  });

  it("affiche les résultats de recherche filtrés en direct avec onglets Plats et Restaurants", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
        initialQuery: "pâte",
      })
    );
    expect(markup).toContain("« pâte »");
    expect(markup).toContain("Plats &amp; Spécialités");
    expect(markup).toContain("Pâte noire");
    expect(markup).toContain("Commander");
  });

  it("gère l'état 'Aucun résultat trouvé' de manière conviviale avec bouton réinitialiser", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
        initialQuery: "platinexistant999",
      })
    );
    expect(markup).toContain("Aucun résultat pour cette recherche");
    expect(markup).toContain("Réinitialiser la recherche");
  });

  it("adapte les couleurs de l'icône SVG du logo selon le thème sans aucun arrière-plan carré", () => {
    // Mode Clair : Marmite cyan #00AFF2, curseur blanc #ffffff, fond transparent
    const lightMarkup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
        theme: "light",
      })
    );
    expect(lightMarkup).toContain('id="Marmite"');
    expect(lightMarkup).toContain('fill="#00AFF2"');

    // Mode Sombre : Marmite blanche #ffffff, curseur cyan #00AFF2, fond transparent
    const darkMarkup = renderToStaticMarkup(
      React.createElement(GoogleSearchView, {
        isOpen: true,
        onClose: () => {},
        theme: "dark",
      })
    );
    expect(darkMarkup).toContain('id="Marmite"');
    expect(darkMarkup).toContain('fill="#ffffff"');
  });
});
