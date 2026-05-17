"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Finaliser un rapport et rediriger vers le PDF ────────────────────────

export async function finaliserRapport(rapportId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("rapports")
    .update({ statut: "finalise", updated_at: new Date().toISOString() })
    .eq("id", rapportId);
  revalidatePath(`/rapports/${rapportId}`);
  redirect(`/rapports/${rapportId}/pdf?download=1`);
}

// ── Rattacher un rapport à un dossier ─────────────────────────────────────

export async function rattacherRapportDossier(
  rapportId: string,
  dossierId: string,
  oldDossierId?: string | null
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("rapports")
    .update({ dossier_id: dossierId })
    .eq("id", rapportId);

  revalidatePath(`/rapports/${rapportId}`);
  revalidatePath(`/dossiers/${dossierId}`);
  if (oldDossierId && oldDossierId !== dossierId) {
    revalidatePath(`/dossiers/${oldDossierId}`);
  }
  revalidatePath("/rapports");
  revalidatePath("/");
}

// ── Détacher un rapport de son dossier ───────────────────────────────────

export async function detacherRapportDossier(
  rapportId: string,
  oldDossierId?: string | null
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("rapports")
    .update({ dossier_id: null })
    .eq("id", rapportId);

  revalidatePath(`/rapports/${rapportId}`);
  if (oldDossierId) {
    revalidatePath(`/dossiers/${oldDossierId}`);
  }
  revalidatePath("/rapports");
  revalidatePath("/");
}
