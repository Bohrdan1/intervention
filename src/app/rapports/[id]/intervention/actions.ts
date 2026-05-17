"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PieceUtilisee, PhotoItem } from "@/lib/types";
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
