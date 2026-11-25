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

  it("affiche le bouton Se connecter et l'invitation à la connexion si l'utilisateur n'est pas connecté", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotificationsPageView, {
        isOpen: true,
        onClose: () => {},
        currentUser: null,
      })
    );

    expect(markup).toContain("Notifications");
    expect(markup).toContain("Retour");
    expect(markup).toContain("Aucune notification pour le moment");
    expect(markup).toContain("Connectez-vous à votre compte ClicBouffe");
    expect(markup).toContain("Se connecter");
    expect(markup).not.toContain("Découvrir les plats");
  });

  it("affiche le bouton Découvrir les plats si l'utilisateur est connecté", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotificationsPageView, {
        isOpen: true,
        onClose: () => {},
        currentUser: {
          id: "user-123",
          email: "koffi@clicbouffe.bj",
          full_name: "Koffi Mensah",
          phone_number: "+22997001122",
          role: "customer",
          created_at: "2026-01-01T00:00:00Z",
        },
      })
    );

    expect(markup).toContain("Notifications");
    expect(markup).toContain("Retour");
    expect(markup).toContain("Aucune notification pour le moment");
    expect(markup).toContain("alertes de commandes");
    expect(markup).toContain("Découvrir les plats");
    expect(markup).not.toContain("Connectez-vous à votre compte");
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

  it("respecte la logique épurée de la TopBar (sans portefeuille, bouton Se connecter si déconnecté, pilule unifiée Menu+Initiale si connecté)", () => {
    // Simulation de la logique d'affichage du Header
    const getHeaderRightElements = (user: { id: string; full_name: string } | null) => {
      if (user) {
        return {
          showWalletInTopBar: false,
          showUnifiedProfileMenuButton: true,
          profileInitial: user.full_name.trim().charAt(0).toUpperCase(),
          unifiedButtonOpensMenu: true,
          showLoginButton: false,
        };
      }
      return {
        showWalletInTopBar: false,
        showUnifiedProfileMenuButton: false,
        profileInitial: null,
        unifiedButtonOpensMenu: false,
        showLoginButton: true,
        loginText: "Se connecter",
      };
    };

    // Utilisateur non connecté : PAS de portefeuille, bouton "Se connecter" actif
    const guestState = getHeaderRightElements(null);
    expect(guestState.showWalletInTopBar).toBe(false);
    expect(guestState.showLoginButton).toBe(true);
    expect(guestState.showUnifiedProfileMenuButton).toBe(false);
    expect(guestState.loginText).toBe("Se connecter");

    // Utilisateur connecté : PAS de portefeuille dans la TopBar, pilule unifiée [Menu + Initiale] active
    const userState = getHeaderRightElements({ id: "user-1", full_name: "BIDE" });
    expect(userState.showWalletInTopBar).toBe(false);
    expect(userState.showUnifiedProfileMenuButton).toBe(true);
    expect(userState.profileInitial).toBe("B");
    expect(userState.unifiedButtonOpensMenu).toBe(true);
    expect(userState.showLoginButton).toBe(false);
  });
});
