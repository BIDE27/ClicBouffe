"use client";

import React from "react";
import { CreateRestaurantPageView, CreateRestaurantPageProps } from "./create-restaurant-page";

/**
 * Rétrocompatibilité : redirige vers la nouvelle page complète CreateRestaurantPageView.
 */
export function CreateRestaurantModal(props: CreateRestaurantPageProps) {
  return <CreateRestaurantPageView {...props} />;
}
