"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const is_urgent = formData.get("is_urgent") === "true";
  const titre = ((formData.get("titre") as string) || "").trim() || null;
  const description =
    ((formData.get("description") as string) || "").trim() || null;

  const { data: dossier, error: errDossier } = await supabase
    .from("dossiers")
    .insert({
      reference,
      type_dossier,
      is_urgent,
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

// ── Mise à jour facturation ───────────────────────────────────────────────

export type FacturationData = {
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  reglement_date: string | null;
  reglement_mode: string | null;
  offert: boolean;
};

// ── Helper : calcule et applique le statut automatique ────────────────────

async function autoStatut(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string
): Promise<void> {
  const { data } = await supabase
    .from("dossiers")
    .select("statut, facture_numero, reglement_date, offert")
    .eq("id", dossierId)
    .single();
  if (!data) return;
  // Les statuts manuels "en_attente" et "annule" ne sont jamais écrasés
  if (data.statut === "en_attente" || data.statut === "annule") return;
  let newStatut: string = data.statut;
  if (data.offert) newStatut = "termine";
  else if (data.reglement_date) newStatut = "termine";
  else if (data.facture_numero) newStatut = "facture";
  else {
    const { count } = await supabase
      .from("rdvs")
      .select("id", { count: "exact", head: true })
      .eq("dossier_id", dossierId);
    newStatut = (count ?? 0) > 0 ? "en_cours" : "ouvert";
  }
  if (newStatut !== data.statut)
    await supabase
      .from("dossiers")
      .update({ statut: newStatut })
      .eq("id", dossierId);
}

export async function updateFacturation(
  dossierId: string,
  data: FacturationData
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("dossiers").update(data).eq("id", dossierId);
  await autoStatut(supabase, dossierId);
  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/finances");
  revalidatePath("/");
}

// ── Actions manuelles de statut ───────────────────────────────────────────

export async function setDossierEnAttente(
  dossierId: string,
  note: string | null
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("dossiers")
    .update({ statut: "en_attente", note_attente: note })
    .eq("id", dossierId);
  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/");
}

export async function setDossierAnnule(dossierId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("dossiers")
    .update({ statut: "annule" })
    .eq("id", dossierId);
  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/");
}

export async function setDossierReouvert(dossierId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("dossiers")
    .update({ statut: "en_cours", note_attente: null })
    .eq("id", dossierId);
  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/");
}

// ── Suppression d'un dossier ───────────────────────────────────────────────

export async function deleteDossier(id: string): Promise<void> {
  const supabase = await createClient();

  // 1. Détacher les rapports (conservés, mais plus liés au dossier)
  await supabase
    .from("rapports")
    .update({ dossier_id: null })
    .eq("dossier_id", id);

  // 2. Supprimer les RDV du dossier
  await supabase.from("rdvs").delete().eq("dossier_id", id);

  // 3. Supprimer le dossier lui-même
  await supabase.from("dossiers").delete().eq("id", id);

  revalidatePath("/");
  redirect("/");
}
