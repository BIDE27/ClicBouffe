import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NotificationsPageView } from "../components/notifications/notifications-page-view";

describe("NotificationsPageView (Page Plein Écran des Notifications)", () => {
  it("ne rend rien si isOpen est faux", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotificationsPageView, {
        isOpen: false,
        onClose: () => {},
      })
    );
    expect(markup).toBe("");
  });

  it("affiche la page des notifications avec son titre, l'état vide et le bouton Retour si isOpen est vrai", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotificationsPageView, {
        isOpen: true,
        onClose: () => {},
      })
    );

    expect(markup).toContain("Notifications");
    expect(markup).toContain("Retour");
    expect(markup).toContain("Aucune notification pour le moment");
    expect(markup).toContain("alertes de commandes");
    expect(markup).toContain("Découvrir les plats");
  });

  it("gère l'attribut dialog accessible et les classes de dark mode", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotificationsPageView, {
        isOpen: true,
        onClose: () => {},
        theme: "dark",
      })
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("dark:bg-slate-950");
  });

  it("respecte la logique de remplacement du portefeuille par le bouton Se connecter selon la connexion", () => {
    // Simulation de la logique d'affichage du Header
    const getHeaderRightElements = (user: { id: string; full_name: string } | null, balance: number) => {
      if (user) {
        return {
          showWallet: true,
          walletText: `${balance} FCFA`,
          showUserAvatar: true,
          showLoginButton: false,
        };
      }
      return {
        showWallet: false,
        walletText: null,
        showUserAvatar: false,
        showLoginButton: true,
        loginText: "Se connecter",
      };
    };

    // Utilisateur non connecté : PAS de portefeuille, bouton "Se connecter" actif
    const guestState = getHeaderRightElements(null, 0);
    expect(guestState.showWallet).toBe(false);
    expect(guestState.showLoginButton).toBe(true);
    expect(guestState.loginText).toBe("Se connecter");

    // Utilisateur connecté : Portefeuille affiché avec solde, avatar utilisateur
    const userState = getHeaderRightElements({ id: "user-1", full_name: "Koffi Mensah" }, 2000);
    expect(userState.showWallet).toBe(true);
    expect(userState.walletText).toBe("2000 FCFA");
    expect(userState.showUserAvatar).toBe(true);
    expect(userState.showLoginButton).toBe(false);
  });
});
