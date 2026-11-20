import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthPageView } from "../components/auth/auth-page-view";
import { AuthModal } from "../components/auth/auth-modal";

// Polyfill minimal localStorage pour l'environnement Node.js de test
const memoryStore: Record<string, string> = {};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      for (const k in memoryStore) delete memoryStore[k];
    },
    key: (index: number) => Object.keys(memoryStore)[index] || null,
    length: 0,
  };
}

describe("AuthPageView - Page Plein Écran d'Authentification & Gestion de Session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ne s'affiche pas lorsque isOpen est false", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AuthPageView, {
        isOpen: false,
        onClose: () => {},
        onSuccess: () => {},
      })
    );
    expect(markup).toBe("");
  });

  it("affiche la page entière avec les onglets de connexion et d'inscription", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AuthPageView, {
        isOpen: true,
        onClose: () => {},
        onSuccess: () => {},
      })
    );

    // Titre et identité
    expect(markup).toContain("ClicBouffe");
    expect(markup).toContain("Connexion à ClicBouffe");
    expect(markup).toContain("Retour");

    // Onglets
    expect(markup).toContain("Se connecter");
    expect(markup).toContain("Créer un compte");

    // Champ mot de passe et icône œil
    expect(markup).toContain('placeholder="Votre mot de passe"');
    expect(markup).toContain('aria-label="Afficher le mot de passe"');
  });

  it("affiche le champ de confirmation de mot de passe et l'icône oeil en mode inscription", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AuthPageView, {
        isOpen: true,
        initialTab: "signup",
        onClose: () => {},
        onSuccess: () => {},
      })
    );

    // Vérification des libellés
    expect(markup).toContain("Nom complet");
    expect(markup).toContain("Adresse Email");
    expect(markup).toContain("Mot de passe");
    expect(markup).toContain("Confirmer le mot de passe");

    // Vérification des placeholders
    expect(markup).toContain('placeholder="Au moins 6 caractères"');
    expect(markup).toContain('placeholder="Répétez votre mot de passe"');

    // Vérification de la présence des boutons pour afficher le mot de passe
    expect(markup).toContain('aria-label="Afficher le mot de passe"');
    expect(markup).toContain('aria-label="Afficher la confirmation du mot de passe"');
  });

  it("affiche la vue pleine page de déconnexion et gestion de compte lorsque l'utilisateur est connecté", () => {
    const mockUser = {
      id: "usr_123",
      email: "koffi@test.bj",
      full_name: "Koffi Mensah",
      role: "customer" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const markup = renderToStaticMarkup(
      React.createElement(AuthPageView, {
        isOpen: true,
        currentUser: mockUser,
        onClose: () => {},
        onSuccess: () => {},
        onSignOut: () => {},
      })
    );

    // Profil affiché
    expect(markup).toContain("Koffi Mensah");
    expect(markup).toContain("koffi@test.bj");
    expect(markup).toContain("Membre ClicBouffe");

    // Bouton de déconnexion plein écran
    expect(markup).toContain("Se déconnecter de ClicBouffe");
  });

  it("garantit que AuthModal est un alias compatible pour AuthPageView", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AuthModal, {
        isOpen: true,
        onClose: () => {},
        onSuccess: () => {},
      })
    );

    expect(markup).toContain("ClicBouffe");
    expect(markup).toContain("Connexion à ClicBouffe");
  });
});
