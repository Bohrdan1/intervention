"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PhotoItem, VisiteData } from "@/lib/types";

export async function saveVisite(
  rapportId: string,
  observations_visite: string,
  recommandations: string,
  photos?: PhotoItem[],
  visite_data?: VisiteData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    observations_visite,
    recommandations,
  };

  if (photos !== undefined) {
    updateData.photos = photos;
  }

  if (visite_data !== undefined) {
    updateData.visite_data = visite_data;
  }

  const { error } = await supabase
    .from("rapports")
    .update(updateData)
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur sauvegarde visite:", error);
    return { success: false, error: "Erreur lors de la sauvegarde de la visite" };
  }

  revalidatePath(`/rapports/${rapportId}`);
  return { success: true };
}

export async function finalizeVisite(
  rapportId: string,
  observations_visite: string,
  recommandations: string,
  photos?: PhotoItem[],
  visite_data?: VisiteData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    observations_visite,
    recommandations,
    statut: "finalise",
  };

  if (photos !== undefined) {
    updateData.photos = photos;
  }

  if (visite_data !== undefined) {
    updateData.visite_data = visite_data;
  }

  const { error } = await supabase
    .from("rapports")
    .update(updateData)
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur finalisation visite:", error);
    return { success: false, error: "Erreur lors de la finalisation de la visite" };
  }

  revalidatePath(`/rapports/${rapportId}`);
  revalidatePath("/");
  return { success: true };
}
