"use client";

import { createClient } from "../supabase/client";

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 Mo brut avant compression
const MAX_COMPRESSED_DATA_URL_LEN = 420000; // < 450000 limite Zod

function compressImageOnCanvas(file: File, maxWidth: number): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("Compression disponible uniquement dans le navigateur."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image sélectionné."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Format d'image non pris en charge."));
      img.onload = () => {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.max(1, Math.round(img.width * ratio));
        const targetH = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Contexte graphique indisponible."));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Échec de compression de l'image."));
              return;
            }
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          0.82
        );
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresse une image issue de la galerie et l'envoie vers Supabase Storage (`restaurant-media`),
 * avec repli automatique sur la Data URL compressée (JPEG) en cas de mode hors-ligne.
 */
export async function processAndUploadRestaurantMedia(
  file: File,
  folder: "covers" | "logos" | "dishes"
): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Veuillez sélectionner un fichier image valide (JPG, PNG ou WebP)." };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { url: null, error: "Image trop lourde (maximum 10 Mo avant optimisation)." };
  }

  const maxWidth = folder === "covers" ? 1200 : 512;

  try {
    const { blob, dataUrl } = await compressImageOnCanvas(file, maxWidth);

    if (process.env.NODE_ENV !== "test") {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
          const rand = Math.random().toString(36).slice(2, 8);
          const filePath = `${user.id}/${folder}/${Date.now()}-${rand}.jpg`;
          const { error: uploadErr } = await supabase.storage
            .from("restaurant-media")
            .upload(filePath, blob, {
              contentType: "image/jpeg",
              cacheControl: "31536000",
              upsert: false,
            });

          if (!uploadErr) {
            const { data: pub } = supabase.storage.from("restaurant-media").getPublicUrl(filePath);
            if (pub?.publicUrl) {
              return { url: pub.publicUrl, error: null };
            }
          }
        }
      } catch {
        // Fallback transparent sur Data URL compressée
      }
    }

    if (dataUrl.length > MAX_COMPRESSED_DATA_URL_LEN) {
      return { url: null, error: "Image trop complexe après compression. Essayez une image plus légère." };
    }

    return { url: dataUrl, error: null };
  } catch (err: unknown) {
    return {
      url: null,
      error: (err as Error)?.message || "Impossible de traiter l'image sélectionnée.",
    };
  }
}
