import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LogoMarmite } from "../components/ui/logo-marmite";

describe("Composant LogoMarmite (Logo Officiel ClicBouffe)", () => {
  it("rend un élément SVG vectoriel conforme avec viewBox 0 0 1024 1024", () => {
    const markup = renderToStaticMarkup(React.createElement(LogoMarmite));
    expect(markup).toContain("<svg");
    expect(markup).toContain('viewBox="0 0 1024 1024"');
  });

  it("intègre les groupes anatomiques clés : Anses, Marmite, Couvercle-et-Couronne et Curseur", () => {
    const markup = renderToStaticMarkup(React.createElement(LogoMarmite));
    expect(markup).toContain('id="Anses"');
    expect(markup).toContain('id="Marmite"');
    expect(markup).toContain('id="Couvercle-et-Couronne"');
    expect(markup).toContain('id="Curseur"');
  });

  it("génère un rendu transparent (sans rect de fond) par défaut pour le Splash Screen", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LogoMarmite, { withBackground: false })
    );
    expect(markup).not.toContain("<rect");
    // Marmite et anses blanches pour contraste optimal sur fond cyan du Splash
    expect(markup).toContain('fill="#ffffff"');
    // Curseur cyan de marque
    expect(markup).toContain('fill="#00AFF2"');
  });

  it("génère un fond circulaire lorsque withBackground est activé avec shape='circle' pour le Menu Latéral", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LogoMarmite, { withBackground: true, shape: "circle" })
    );
    expect(markup).toContain("<rect");
    expect(markup).toContain('rx="512"');
    expect(markup).toContain('fill="#00AFF2"');
  });

  it("génère un fond squircle lorsque withBackground est activé avec shape='squircle'", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LogoMarmite, { withBackground: true, shape: "squircle" })
    );
    expect(markup).toContain("<rect");
    expect(markup).toContain('rx="224"');
  });
});
