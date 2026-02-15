"use server";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Upload une signature (canvas data URL) vers Supabase Storage
 * Convertit base64 en blob et l'uploade comme image PNG
 */
export async function uploadSignature(
  dataUrl: string,
  rapportId: string,
  type: 'technicien' | 'client'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Extraire les données base64
    const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: "Format de signature invalide" };
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Path: signatures/{rapportId}/{type}.png
    const path = `${rapportId}/${type}.png`;

    const supabase = createAdminClient();
    
    // Upload sur Storage
    const { error: uploadError } = await supabase.storage
      .from("signatures")
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true, // Écrase si existe déjà
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Récupérer URL publique
    const { data: urlData } = supabase.storage
      .from("signatures")
      .getPublicUrl(path);

    return { success: true, url: urlData.publicUrl };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Supprime une signature du Storage
 */
export async function deleteSignature(
  rapportId: string,
  type: 'technicien' | 'client'
): Promise<{ success: boolean; error?: string }> {
  try {
    const path = `${rapportId}/${type}.png`;
    const supabase = createAdminClient();
    
    const { error } = await supabase.storage
      .from("signatures")
      .remove([path]);
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
