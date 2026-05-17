"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────

export type CreateDossierResult =
  | { ok: true; dossierId: string }
  | { ok: false; error: string };

// ── Helper : génère la prochaine référence D-YYYY-NNN ─────────────────────

async function nextReference(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from("dossiers")
    .select("reference")
    .like("reference", `D-${year}-%`);

  let nextNum = 1;
  if (data && data.length > 0) {
    const nums = data.map((d) => {
      const parts = d.reference.split("-");
      return parseInt(parts[2] ?? "0", 10) || 0;
    });
    nextNum = Math.max(...nums) + 1;
  }
  return `D-${year}-${String(nextNum).padStart(3, "0")}`;
}

// ── Action principale ──────────────────────────────────────────────────────

export async function createDossier(
  formData: FormData
): Promise<CreateDossierResult> {
  const supabase = await createClient();

  // ── 1. Résoudre client_id ──────────────────────────────────────────────
  let client_id: string;

  const existingClientId = (formData.get("client_id") as string) || "";
  const newClientNom = ((formData.get("new_client_nom") as string) || "").trim();

  if (existingClientId) {
    client_id = existingClientId;
  } else if (newClientNom) {
    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({ nom: newClientNom })
      .select("id")
      .single();

    if (error || !newClient) {
      return { ok: false, error: "Impossible de créer le client." };
    }
    client_id = newClient.id;
  } else {
    return { ok: false, error: "Un client est obligatoire." };
  }

  // ── 2. Résoudre site_id (optionnel) ────────────────────────────────────
  let site_id: string | null = null;

  const existingSiteId = (formData.get("site_id") as string) || "";
  const newSiteNom = ((formData.get("new_site_nom") as string) || "").trim();

  if (existingSiteId) {
    site_id = existingSiteId;
  } else if (newSiteNom) {
    const { data: newSite, error } = await supabase
      .from("sites")
      .insert({ nom: newSiteNom, client_id })
      .select("id")
      .single();

    if (error || !newSite) {
      return { ok: false, error: "Impossible de créer le site." };
    }
    site_id = newSite.id;
  }

  // ── 3. Créer le dossier ────────────────────────────────────────────────
  const reference = await nextReference(supabase);
  const type_dossier = (formData.get("type_dossier") as string) || "autre";
  const titre = ((formData.get("titre") as string) || "").trim() || null;
  const description =
    ((formData.get("description") as string) || "").trim() || null;

  const { data: dossier, error: errDossier } = await supabase
    .from("dossiers")
    .insert({
      reference,
      type_dossier,
      client_id,
      site_id,
      titre,
      description,
      statut: "ouvert",
      date_ouverture: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (errDossier || !dossier) {
    return { ok: false, error: "Impossible de créer le dossier." };
  }

  revalidatePath("/");
  return { ok: true, dossierId: dossier.id };
}
