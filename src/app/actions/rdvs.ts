"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convertit une valeur datetime-local saisie en heure Nouméa (UTC+11)
 * vers une ISO string UTC pour stockage dans Supabase (timestamptz).
 * Ex : "2026-05-18T19:15" → "2026-05-18T08:15:00.000Z"
 */
function ncLocalToUtc(datetimeLocal: string): string {
  return new Date(`${datetimeLocal}:00+11:00`).toISOString();
}

function invalidate(dossier_id?: string | null) {
  revalidatePath("/agenda");
  revalidatePath("/");
  if (dossier_id) {
    revalidatePath(`/dossiers/${dossier_id}`);
  }
}

// ── Actions ────────────────────────────────────────────────────────────────

export async function createRdv(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const dossier_id = formData.get("dossier_id") as string;
  const date_rdv = ncLocalToUtc(formData.get("date_rdv") as string);
  const duree_raw = parseInt(formData.get("duree_minutes") as string, 10);
  const type_rdv = (formData.get("type_rdv") as string) || "intervention";
  const statut = (formData.get("statut") as string) || "planifie";
  const notes = (formData.get("notes") as string) || null;

  if (!dossier_id || !date_rdv) return;

  // Résoudre client_id (et site_id optionnel) depuis le dossier
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("client_id, site_id")
    .eq("id", dossier_id)
    .single();

  if (!dossier?.client_id) return;

  await supabase.from("rdvs").insert({
    dossier_id,
    client_id: dossier.client_id,
    site_id: dossier.site_id ?? null,
    date_rdv,
    duree_minutes: isNaN(duree_raw) ? null : duree_raw,
    type_rdv,
    statut,
    notes: notes || null,
  });

  // RDV créé → passer le dossier en_cours s'il est encore ouvert
  await supabase
    .from("dossiers")
    .update({ statut: "en_cours" })
    .eq("id", dossier_id)
    .eq("statut", "ouvert");

  invalidate(dossier_id);
}

export async function updateRdv(
  id: string,
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const date_rdv = ncLocalToUtc(formData.get("date_rdv") as string);
  const duree_raw = parseInt(formData.get("duree_minutes") as string, 10);
  const type_rdv = (formData.get("type_rdv") as string) || "intervention";
  const statut = (formData.get("statut") as string) || "planifie";
  const notes = (formData.get("notes") as string) || null;

  const { data: rdv } = await supabase
    .from("rdvs")
    .update({
      date_rdv,
      duree_minutes: isNaN(duree_raw) ? null : duree_raw,
      type_rdv,
      statut,
      notes: notes || null,
    })
    .eq("id", id)
    .select("dossier_id")
    .single();

  invalidate(rdv?.dossier_id);
}

export async function updateRdvStatut(
  id: string,
  statut: string
): Promise<void> {
  const supabase = await createClient();

  const { data: rdv } = await supabase
    .from("rdvs")
    .update({ statut })
    .eq("id", id)
    .select("dossier_id")
    .single();

  invalidate(rdv?.dossier_id);
}

export async function deleteRdv(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: rdv } = await supabase
    .from("rdvs")
    .delete()
    .eq("id", id)
    .select("dossier_id")
    .single();

  invalidate(rdv?.dossier_id);
}
