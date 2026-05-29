"use server";

import { createAdminClient } from "@/lib/supabase/server";

// Le client admin (service_role) contourne RLS : on valide donc strictement
// le chemin pour empêcher tout accès hors de l'arborescence attendue.
const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15 Mo

function isSafePhotoPath(path: string): boolean {
  // Doit rester dans rapports/ et ne contenir aucune remontée de répertoire
  return path.startsWith("rapports/") && !path.includes("..");
}

export async function uploadPhoto(
  formData: FormData
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file || !path) {
      return { success: false, error: "Fichier ou chemin manquant" };
    }

    if (!isSafePhotoPath(path)) {
      return { success: false, error: "Chemin invalide" };
    }

    if (file.type && !file.type.startsWith("image/")) {
      return { success: false, error: "Type de fichier non autorisé" };
    }

    if (file.size > MAX_PHOTO_BYTES) {
      return { success: false, error: "Fichier trop volumineux" };
    }

    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(path);

    return { success: true, url: urlData.publicUrl, path };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deletePhoto(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSafePhotoPath(path)) {
      return { success: false, error: "Chemin invalide" };
    }
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from("photos").remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
