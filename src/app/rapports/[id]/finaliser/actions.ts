"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ConstatItem } from "@/lib/types";

export async function saveConstatAndFinalize(
  rapportId: string,
  constat_general: ConstatItem[],
  signature_data: string | null,
  signature_client: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rapports")
    .update({
      constat_general,
      signature_data,
      signature_client,
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

export async function saveConstatDraft(
  rapportId: string,
  constat_general: ConstatItem[],
  signature_data: string | null,
  signature_client: string | null
) {
  const supabase = await createClient();

  await supabase
    .from("rapports")
    .update({
      constat_general,
      signature_data,
      signature_client,
    })
    .eq("id", rapportId);
}
