"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  type RdvForCalendar,
} from "@/lib/google-calendar";

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
  const newStatut = (formData.get("statut") as string) || "planifie";
  const notes = (formData.get("notes") as string) || null;

  // Récupérer l'ancien RDV (statut + google_event_id + données pour l'événement)
  const { data: oldRdv } = await supabase
    .from("rdvs")
    .select(`
      id, statut, google_event_id, date_rdv, duree_minutes, type_rdv, notes,
      dossier:dossiers(
        reference,
        client:clients(nom),
        site:sites(nom, adresse)
      )
    `)
    .eq("id", id)
    .single();

  const { data: rdv } = await supabase
    .from("rdvs")
    .update({
      date_rdv,
      duree_minutes: isNaN(duree_raw) ? null : duree_raw,
      type_rdv,
      statut: newStatut,
      notes: notes || null,
    })
    .eq("id", id)
    .select("dossier_id")
    .single();

  // ── Sync Google Calendar ──────────────────────────────────────────────
  if (oldRdv) {
    const rdvData: RdvForCalendar = {
      id: oldRdv.id,
      date_rdv,
      duree_minutes: isNaN(duree_raw) ? oldRdv.duree_minutes : duree_raw,
      type_rdv,
      notes: notes || null,
      dossier: (() => {
        const raw = Array.isArray(oldRdv.dossier)
          ? oldRdv.dossier[0]
          : oldRdv.dossier;
        if (!raw) return null;
        const d = raw as unknown as {
          reference: string;
          client: { nom: string } | { nom: string }[] | null;
          site: { nom: string; adresse: string | null } | { nom: string; adresse: string | null }[] | null;
        };
        return {
          reference: d.reference,
          client: Array.isArray(d.client) ? (d.client[0] ?? null) : d.client,
          site: Array.isArray(d.site) ? (d.site[0] ?? null) : d.site,
        };
      })(),
    };

    const googleEventId = oldRdv.google_event_id as string | null;

    if (newStatut === "confirme") {
      if (googleEventId) {
        await updateGoogleEvent(googleEventId, rdvData);
      } else {
        const newEventId = await createGoogleEvent(rdvData);
        if (newEventId) {
          await supabase
            .from("rdvs")
            .update({ google_event_id: newEventId })
            .eq("id", id);
        }
      }
    } else if (googleEventId) {
      // planifie ou annule → supprimer l'événement
      await deleteGoogleEvent(googleEventId);
      await supabase
        .from("rdvs")
        .update({ google_event_id: null })
        .eq("id", id);
    }
  }

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

  // Récupérer google_event_id avant suppression
  const { data: existing } = await supabase
    .from("rdvs")
    .select("dossier_id, google_event_id")
    .eq("id", id)
    .single();

  await supabase.from("rdvs").delete().eq("id", id);

  // Supprimer l'événement Google Calendar si présent
  const googleEventId = existing?.google_event_id as string | null | undefined;
  if (googleEventId) {
    await deleteGoogleEvent(googleEventId);
  }

  invalidate(existing?.dossier_id);
}
