"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteRapport(rapportId: string) {
  const supabase = await createClient();

  // Récupérer les photos du rapport pour nettoyer le storage
  const { data: rapport } = await supabase
    .from("rapports")
    .select("photos")
    .eq("id", rapportId)
    .single();

  // Supprimer les fichiers du storage
  if (rapport?.photos && Array.isArray(rapport.photos) && rapport.photos.length > 0) {
    const paths = rapport.photos
      .map((p: any) => p.path)
      .filter(Boolean);
    if (paths.length > 0) {
      const admin = createAdminClient();
      await admin.storage.from("photos").remove(paths);
    }
  }

  // Supprimer les contrôles associés d'abord
  await supabase.from("controles").delete().eq("rapport_id", rapportId);

  // Supprimer le rapport
  await supabase.from("rapports").delete().eq("id", rapportId);

  revalidatePath("/");
}
