"use client";

import React from "react";
import { AuthPageView, AuthPageViewProps } from "./auth-page-view";

export type AuthModalProps = AuthPageViewProps;

/**
 * Composant d'authentification plein écran ClicBouffe.
 * Ré-exporte AuthPageView pour compatibilité ascendante avec les imports existants.
 */
export function AuthModal(props: AuthModalProps) {
  return <AuthPageView {...props} />;
}

export { AuthPageView };
