import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  // En mode Capacitor, génération d'un export statique complet embarqué dans l'app mobile
  ...(isCapacitorBuild
    ? {
        output: "export",
        images: {
          unoptimized: true,
        },
      }
    : {
        // En mode Web (Vercel), SSR/PPR activés pour un SEO maximal
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
