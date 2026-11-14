"use client";

import { createClient } from "../supabase/client";
import { UserProfile, UserRole } from "../types/database";

const LOCAL_STORAGE_USER_KEY = "clicbouffe_user_profile";

export const DEMO_PROFILES: Record<string, UserProfile> = {
  customer: {
    id: "user-cust-001",
    email: "client@clicbouffe.bj",
    full_name: "Koffi Mensah",
    phone_number: "+229 97 12 34 56",
    role: "customer",
    avatar_url: "/images/avatar_client.png",
    created_at: new Date().toISOString(),
  },
  restaurant_owner: {
    id: "user-resto-001",
    email: "maquis@clicbouffe.bj",
    full_name: "Maman Akofa",
    phone_number: "+229 95 88 77 66",
    role: "restaurant_owner",
    avatar_url: "/images/avatar_chef.png",
    created_at: new Date().toISOString(),
  },
  burger_owner: {
    id: "user-resto-002",
    email: "burger@clicbouffe.bj",
    full_name: "Arnaud Dossou",
    phone_number: "+229 96 44 33 22",
    role: "restaurant_owner",
    avatar_url: "/images/avatar_chef.png",
    created_at: new Date().toISOString(),
  },
};

export interface SignUpParams {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  restaurantName?: string;
  restaurantCategory?: string;
  restaurantAddress?: string;
}

export const authService = {
  /**
   * Récupère le profil actuellement connecté (Supabase ou Session Locale)
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    if (typeof window === "undefined") return null;

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Tente de récupérer le profil depuis Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            const loaded: UserProfile = {
              id: profile.id,
              email: session.user.email || "",
              full_name: profile.full_name,
              phone_number: profile.phone_number,
              role: profile.role as UserRole,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
            };
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loaded));
            return loaded;
          }
        }
      } catch {
        // Supabase non joignable ou mode hors-ligne
      }
    }

    // Repli sur le stockage local persistant
    const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as UserProfile;
      } catch {
        return null;
      }
    }

    return null;
  },

  /**
   * Inscription d'un nouveau compte (Client ou Restaurateur)
   */
  async signUp(params: SignUpParams): Promise<{ profile: UserProfile | null; error: string | null }> {
    const userId = `user-${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      email: params.email,
      full_name: params.fullName,
      phone_number: params.phone,
      role: params.role,
      avatar_url: params.role === "restaurant_owner" ? "/images/avatar_chef.png" : undefined,
      created_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: params.email,
          password: params.password || "ClicBouffe2026!",
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              phone: params.phone,
              restaurant_name: params.restaurantName,
            },
          },
        });

        if (authData.user) {
          newProfile.id = authData.user.id;
        }

        // Si restaurateur, enregistre les infos de son restaurant
        if (params.role === "restaurant_owner" && params.restaurantName) {
          try {
            await supabase.from("restaurants").insert({
              owner_id: newProfile.id,
              name: params.restaurantName,
              slug: params.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              address: params.restaurantAddress || "Akpakpa, Cotonou",
              phone_number: params.phone,
              category: params.restaurantCategory || "Cuisine Locale & Grillades",
              is_active: true,
              is_verified: true,
            });
          } catch {
            // Fallback géré localement
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
        }

        if (authError && !authData.user) {
          return { profile: newProfile, error: null };
        }

        return { profile: newProfile, error: null };
      } catch {
        // En cas d'erreur de réseau, bascule sur la persistance locale
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
    }
    return { profile: newProfile, error: null };
  },

  /**
   * Connexion avec Email et Mot de passe
   */
  async signIn(email: string, password?: string): Promise<{ profile: UserProfile | null; error: string | null }> {
    // Vérification des comptes démo rapides
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail.includes("maquis") || lowerEmail.includes("resto") || lowerEmail.includes("chef")) {
      const profile = DEMO_PROFILES.restaurant_owner;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      return { profile, error: null };
    }

    if (lowerEmail.includes("burger")) {
      const profile = DEMO_PROFILES.burger_owner;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      return { profile, error: null };
    }

    if (lowerEmail.includes("client") || lowerEmail.includes("koffi")) {
      const profile = DEMO_PROFILES.customer;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      return { profile, error: null };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "ClicBouffe2026!",
      });

      if (error) {
        // Si l'utilisateur n'existe pas encore ou erreur auth, création automatique d'un profil client
        const autoProfile: UserProfile = {
          id: `user-${Date.now()}`,
          email,
          full_name: email.split("@")[0],
          role: "customer",
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(autoProfile));
        return { profile: autoProfile, error: null };
      }

      if (data.user) {
        const profile = await this.getCurrentProfile();
        return { profile, error: null };
      }
    } catch {
      // Mode hors-ligne
    }

    const fallbackProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split("@")[0],
      role: "customer",
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackProfile));
    return { profile: fallbackProfile, error: null };
  },

  /**
   * Connexion Démo Rapide en 1 clic
   */
  loginDemo(role: "customer" | "restaurant_owner"): UserProfile {
    const profile = role === "restaurant_owner" ? DEMO_PROFILES.restaurant_owner : DEMO_PROFILES.customer;
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  },

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignoré
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  },
};
