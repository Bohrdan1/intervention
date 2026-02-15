"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PieceUtilisee, PhotoItem } from "@/lib/types";

export async function saveIntervention(
  rapportId: string,
  description_probleme: string,
  travaux_effectues: string,
  pieces_utilisees: PieceUtilisee[],
  photos?: PhotoItem[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    description_probleme,
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

  revalidatePath(`/rapports/${rapportId}`);
  return { success: true };
}
