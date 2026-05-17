"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PieceUtilisee, PhotoItem, InterventionEquipement } from "@/lib/types";
import { incrementerUsages } from "@/lib/actions/catalogue";

export async function saveIntervention(
  rapportId: string,
  equipement_id: string | null,
  description_probleme: string,
  diagnostic: string,
  travaux_effectues: string,
  pieces_utilisees: PieceUtilisee[],
  photos?: PhotoItem[],
  incrementUsage = false
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: Record<string, string | null | PieceUtilisee[] | PhotoItem[]> = {
    equipement_id,
    description_probleme,
    diagnostic,
    travaux_effectues,
    pieces_utilisees,
  };

  if (photos !== undefined) {
    updateData.photos = photos;
  }

  const { error } = await supabase
    .from("rapports")
    .update(updateData)
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur sauvegarde intervention:", error);
    return { success: false, error: "Erreur lors de la sauvegarde de l'intervention" };
  }

  // Incrémenter les compteurs d'usage uniquement à la finalisation
  if (incrementUsage && pieces_utilisees.length > 0) {
    const noms = pieces_utilisees.map((p) => p.nom);
    await incrementerUsages(noms);
  }

  revalidatePath(`/rapports/${rapportId}`);
  return { success: true };
}

export async function saveInterventionMulti(
  rapportId: string,
  interventions_equipements: InterventionEquipement[],
  photos?: PhotoItem[],
  incrementUsage = false
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: Record<string, InterventionEquipement[] | PhotoItem[]> = {
    interventions_equipements,
  };

  if (photos !== undefined) {
    updateData.photos = photos;
  }

  const { error } = await supabase
    .from("rapports")
    .update(updateData)
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur sauvegarde intervention multi:", error);
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }

  if (incrementUsage) {
    const noms = interventions_equipements.flatMap((ie) =>
      ie.pieces_utilisees.map((p) => p.nom)
    );
    if (noms.length > 0) await incrementerUsages(noms);
  }

  revalidatePath(`/rapports/${rapportId}`);
  return { success: true };
}
