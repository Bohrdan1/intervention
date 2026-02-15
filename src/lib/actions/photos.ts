"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function uploadPhoto(
  formData: FormData
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file || !path) {
      return { success: false, error: "Fichier ou chemin manquant" };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deletePhoto(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from("photos").remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
