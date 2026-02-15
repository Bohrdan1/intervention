"use server";

import { createClient } from "@/lib/supabase/server";
import type { PointControle, PointERP, PhotoItem } from "@/lib/types";

export async function saveControle(
  controleId: string,
  points_controle: PointControle[],
  points_erp: PointERP[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("controles")
    .update({
      points_controle,
      points_erp,
    })
    .eq("id", controleId);

  if (error) {
    console.error("Erreur sauvegarde contrôle:", error);
    return { success: false, error: "Erreur lors de la sauvegarde du contrôle" };
  }

  return { success: true };
}

export async function savePhotos(
  rapportId: string,
  photos: PhotoItem[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rapports")
    .update({ photos })
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur sauvegarde photos:", error);
    return { success: false, error: "Erreur lors de la sauvegarde des photos" };
  }

  return { success: true };
}
