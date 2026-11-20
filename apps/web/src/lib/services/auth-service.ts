"use client";

import { createClient } from "../supabase/client";
import { UserProfile, UserRole } from "../types/database";

const LOCAL_STORAGE_USER_KEY = "clicbouffe_user_profile";
const LOCAL_STORAGE_WALLET_PREFIX = "clicbouffe_wallet_";

export interface SignUpParams {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export const authService = {
  /**
   * Récupère le profil actuellement connecté depuis Supabase
   * Retourne null si aucun utilisateur n'est connecté (aucun profil démo par défaut).
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    if (typeof window === "undefined") return null;

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Récupération du profil depuis la table profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile) {
            const loaded: UserProfile = {
              id: profile.id,
              email: session.user.email || "",
              full_name: profile.full_name,
              phone_number: profile.phone_number,
              role: (profile.role as UserRole) || "customer",
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
            };
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loaded));
            return loaded;
          }

          // Si le profil n'existe pas encore dans la table (ex: trigger n'a pas tourné)
          const fallbackName =
            (session.user.user_metadata?.full_name as string) ||
            session.user.email?.split("@")[0] ||
            "Utilisateur";
          const fallbackPhone = (session.user.user_metadata?.phone as string) || undefined;

          const createdProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: fallbackName,
            phone_number: fallbackPhone,
            role: "customer",
            created_at: new Date().toISOString(),
          };

          try {
            await supabase.from("profiles").upsert({
              id: session.user.id,
              full_name: fallbackName,
              phone_number: fallbackPhone,
              role: "customer",
            });
          } catch {
            // Tolérance
          }

          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(createdProfile));
          return createdProfile;
        }

        // Pas de session Supabase active : on nettoie le cache local si obsolète
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        return null;
      } catch {
        // En cas d'erreur de connexion à Supabase, vérifie le cache local
      }
    }

    // Repli sur le stockage local persistant (tests ou hors-ligne avec session active)
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
   * Inscription d'un nouveau compte utilisateur universel (type unique).
   * Tout le monde démarre comme utilisateur standard ClicBouffe.
   */
  async signUp(params: SignUpParams): Promise<{ profile: UserProfile | null; error: string | null }> {
    const trimmedEmail = params.email.trim().toLowerCase();
    const fullName = params.fullName.trim();
    const phone = params.phone?.trim();
    const password = params.password || "ClicBouffe2026!";

    if (!trimmedEmail) {
      return { profile: null, error: "Veuillez renseigner une adresse email valide." };
    }
    if (!fullName) {
      return { profile: null, error: "Veuillez renseigner votre nom complet." };
    }
    if (password.length < 6) {
      return { profile: null, error: "Le mot de passe doit contenir au moins 6 caractères." };
    }

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || "",
              role: "customer",
            },
          },
        });

        if (authError) {
          const msg = authError.message.toLowerCase();
          if (msg.includes("already registered") || msg.includes("already in use")) {
            return { profile: null, error: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter." };
          }
          if (
            msg.includes("rate limit") ||
            msg.includes("over_email_send_rate_limit") ||
            (authError as { status?: number })?.status === 429
          ) {
            return {
              profile: null,
              error:
                "Limite temporaire d'envoi d'emails atteinte sur Supabase (3/heure). Pour activer les inscriptions instantanées illimitées, désactivez 'Confirm email' dans Authentication -> Providers -> Email sur votre console Supabase.",
            };
          }
          if (msg.includes("invalid api key")) {
            return {
              profile: null,
              error: "Clé d'API Supabase invalide ou non reconnue.",
            };
          }
          return { profile: null, error: authError.message };
        }

        // Cas Supabase GoTrue : l'email existe déjà et a été rejeté silencieusement
        if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
          return {
            profile: null,
            error: "Un compte existe déjà avec cette adresse email. Veuillez passer à l'onglet 'Se connecter'.",
          };
        }

        if (authData.user) {
          const userProfile: UserProfile = {
            id: authData.user.id,
            email: trimmedEmail,
            full_name: fullName,
            phone_number: phone,
            role: "customer",
            created_at: new Date().toISOString(),
          };

          // Synchronisation immédiate dans la table public.profiles
          try {
            await supabase.from("profiles").upsert({
              id: authData.user.id,
              full_name: fullName,
              phone_number: phone || null,
              role: "customer",
            });
          } catch {
            // Le trigger PostgreSQL s'en charge en secours
          }

          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
          }

          return { profile: userProfile, error: null };
        }
      } catch (err: unknown) {
        return {
          profile: null,
          error: (err as Error)?.message || "Impossible de contacter le serveur d'authentification.",
        };
      }
    }

    // Environnement de test local
    const testProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      full_name: fullName,
      phone_number: phone,
      role: params.role || "customer",
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(testProfile));
    }
    return { profile: testProfile, error: null };
  },

  /**
   * Connexion avec Email et Mot de passe
   */
  async signIn(email: string, password?: string): Promise<{ profile: UserProfile | null; error: string | null }> {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPassword = password || "ClicBouffe2026!";

    if (!trimmedEmail) {
      return { profile: null, error: "Veuillez renseigner votre adresse email." };
    }
    if (!cleanPassword) {
      return { profile: null, error: "Veuillez renseigner votre mot de passe." };
    }

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: cleanPassword,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
            return { profile: null, error: "Adresse email ou mot de passe incorrect." };
          }
          if (msg.includes("email not confirmed")) {
            return {
              profile: null,
              error:
                "Votre adresse email n'est pas encore confirmée. Veuillez cliquer sur le lien reçu par email ou désactiver 'Confirm email' dans les paramètres Supabase Auth.",
            };
          }
          if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
            return {
              profile: null,
              error: "Trop de tentatives récentes. Veuillez patienter quelques instants.",
            };
          }
          return { profile: null, error: error.message };
        }

        if (data.user) {
          // Récupération du profil synchronisé
          let profile: UserProfile | null = null;
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          if (profileRow) {
            profile = {
              id: profileRow.id,
              email: data.user.email || trimmedEmail,
              full_name: profileRow.full_name,
              phone_number: profileRow.phone_number,
              role: (profileRow.role as UserRole) || "customer",
              avatar_url: profileRow.avatar_url,
              created_at: profileRow.created_at,
            };
          } else {
            profile = {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              full_name: (data.user.user_metadata?.full_name as string) || trimmedEmail.split("@")[0],
              phone_number: data.user.user_metadata?.phone as string,
              role: "customer",
              created_at: new Date().toISOString(),
            };
            try {
              await supabase.from("profiles").upsert({
                id: data.user.id,
                full_name: profile.full_name,
                phone_number: profile.phone_number || null,
                role: "customer",
              });
            } catch {
              // Tolérance
            }
          }

          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          }

          return { profile, error: null };
        }
      } catch (err: unknown) {
        return {
          profile: null,
          error: (err as Error)?.message || "Erreur de connexion au service d'authentification.",
        };
      }
    }

    // Environnement de test local
    const fallbackProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      full_name: trimmedEmail.split("@")[0],
      role: "customer",
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackProfile));
    }
    return { profile: fallbackProfile, error: null };
  },

  /**
   * Connexion Démo réservée aux tests automatisés
   */
  loginDemo(role: "customer" | "restaurant_owner" = "customer"): UserProfile {
    const profile: UserProfile = {
      id: role === "restaurant_owner" ? "user-resto-001" : "user-cust-001",
      email: role === "restaurant_owner" ? "resto@test.bj" : "client@test.bj",
      full_name: role === "restaurant_owner" ? "Chef Propriétaire" : "Client ClicBouffe",
      phone_number: "+229 97 00 00 00",
      role,
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  },

  /**
   * Récupère le solde du portefeuille (0 FCFA par défaut pour tout vrai utilisateur)
   */
  getWalletBalance(userId?: string): number {
    if (typeof window === "undefined") return 0;
    const key = userId ? `${LOCAL_STORAGE_WALLET_PREFIX}${userId}` : "clicbouffe_wallet_balance";
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 0 : parsed;
  },

  /**
   * Recharge le portefeuille de l'utilisateur
   */
  rechargeWallet(amount: number, userId?: string): number {
    const current = this.getWalletBalance(userId);
    const newBalance = current + amount;
    if (typeof window !== "undefined") {
      const key = userId ? `${LOCAL_STORAGE_WALLET_PREFIX}${userId}` : "clicbouffe_wallet_balance";
      localStorage.setItem(key, newBalance.toString());
      localStorage.setItem("clicbouffe_wallet_balance", newBalance.toString());
    }
    return newBalance;
  },

  /**
   * Déconnexion sécurisée (Supabase Auth + Nettoyage local)
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
