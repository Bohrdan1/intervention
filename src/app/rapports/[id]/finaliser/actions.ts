"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ConstatItem } from "@/lib/types";

export async function saveConstatAndFinalize(
  rapportId: string,
  constat_general: ConstatItem[],
  signature_data: string | null,
  signature_client: string | null,
  nom_signataire_client?: string | null,
  date_signature?: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rapports")
    .update({
      constat_general,
      signature_data,
      signature_client,
      nom_signataire_client: nom_signataire_client ?? null,
      date_signature: date_signature ?? new Date().toISOString(),
      statut: "finalise",
    })
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur finalisation:", error);
    throw new Error("Erreur de finalisation");
  }

  revalidatePath("/");
  revalidatePath(`/rapports/${rapportId}`);
}

export async function validerRapport(
  rapportId: string,
  constat_general: ConstatItem[],
  signature_data: string | null,
  signature_client: string | null,
  nom_signataire_client?: string | null,
  date_signature?: string | null
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rapports")
    .update({
      constat_general,
      signature_data,
      signature_client,
      nom_signataire_client: nom_signataire_client ?? null,
      date_signature: date_signature ?? new Date().toISOString(),
      statut: "finalise",
    })
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur validerRapport:", error);
    throw new Error(`Finalisation impossible : ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/rapports/${rapportId}`);
}

export async function saveConstatDraft(
  rapportId: string,
  constat_general: ConstatItem[],
  signature_data: string | null,
  signature_client: string | null,
  nom_signataire_client?: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rapports")
    .update({
      constat_general,
      signature_data,
      signature_client,
      nom_signataire_client: nom_signataire_client ?? null,
    })
    .eq("id", rapportId);

  if (error) {
    console.error("Erreur saveConstatDraft:", error);
    throw new Error(`Sauvegarde brouillon impossible : ${error.message}`);
  }
}
