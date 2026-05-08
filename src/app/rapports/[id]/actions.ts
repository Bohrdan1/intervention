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

  // Supprimer les fichiers du storage (best-effort : ne bloque pas la suppression)
  if (rapport?.photos && Array.isArray(rapport.photos) && rapport.photos.length > 0) {
    const paths = rapport.photos
      .map((p: { path?: string }) => p.path)
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      const admin = createAdminClient();
      await admin.storage.from("photos").remove(paths);
    }
  }

  // Les contrôles sont supprimés automatiquement via ON DELETE CASCADE
  const { error } = await supabase
    .from("rapports")
    .delete()
    .eq("id", rapportId);

  if (error) throw new Error(`Erreur suppression rapport : ${error.message}`);

  revalidatePath("/");
}

export async function archiveRapport(rapportId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("rapports")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", rapportId);

  if (error) throw new Error(`Erreur archivage rapport : ${error.message}`);

  revalidatePath("/");
  revalidatePath(`/rapports/${rapportId}`);
}

export async function restoreRapport(rapportId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("rapports")
    .update({ archived_at: null })
    .eq("id", rapportId);

  if (error) throw new Error(`Erreur restauration rapport : ${error.message}`);

  revalidatePath("/");
  revalidatePath(`/rapports/${rapportId}`);
}
