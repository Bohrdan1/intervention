import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProspectsClient } from "./prospects-client";

export type Statut =
  | "a_contacter"
  | "en_cours"
  | "devis_envoye"
  | "gagne"
  | "perdu"
  | "en_pause";

export interface Prospect {
  id: string;
  nom: string;
  contact_nom: string | null;
  telephone: string | null;
  mail: string | null;
  adresse: string | null;
  statut: Statut;
  source: string | null;
  notes: string | null;
  prochaine_action: string | null;
  montant_estime: number | null;
  created_at: string;
  updated_at: string;
}

export default async function ProspectsPage() {
  const supabase = await createClient();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("statut")
    .order("prochaine_action", { ascending: true, nullsFirst: false })
    .order("nom");

  // ── Actions serveur ──

  async function ajouterProspect(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const nom = formData.get("nom") as string;
    if (!nom?.trim()) return;
    await supabase.from("prospects").insert({
      nom: nom.trim(),
      contact_nom: (formData.get("contact_nom") as string)?.trim() || null,
      telephone: (formData.get("telephone") as string)?.trim() || null,
      mail: (formData.get("mail") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
      statut: (formData.get("statut") as Statut) || "a_contacter",
    });
    revalidatePath("/prospects");
  }

  async function updateProspect(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    if (!id) return;
    const prochaine = (formData.get("prochaine_action") as string)?.trim() || null;
    const montant = formData.get("montant_estime") as string;
    await supabase.from("prospects").update({
      nom: (formData.get("nom") as string)?.trim() || undefined,
      contact_nom: (formData.get("contact_nom") as string)?.trim() || null,
      telephone: (formData.get("telephone") as string)?.trim() || null,
      mail: (formData.get("mail") as string)?.trim() || null,
      adresse: (formData.get("adresse") as string)?.trim() || null,
      source: (formData.get("source") as string)?.trim() || null,
      statut: (formData.get("statut") as Statut) || "a_contacter",
      notes: (formData.get("notes") as string)?.trim() || null,
      prochaine_action: prochaine || null,
      montant_estime: montant ? parseInt(montant, 10) : null,
    }).eq("id", id);
    revalidatePath("/prospects");
  }

  async function deleteProspect(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    if (!id) return;
    await supabase.from("prospects").delete().eq("id", id);
    revalidatePath("/prospects");
  }

  // Compter les relances urgentes (prochaine_action <= aujourd'hui)
  const today = new Date().toISOString().split("T")[0];
  const relancesUrgentes = (prospects ?? []).filter(
    (p) =>
      p.prochaine_action &&
      p.prochaine_action <= today &&
      !["gagne", "perdu"].includes(p.statut)
  ).length;

  return (
    <ProspectsClient
      prospects={(prospects ?? []) as Prospect[]}
      relancesUrgentes={relancesUrgentes}
      ajouterAction={ajouterProspect}
      updateAction={updateProspect}
      deleteAction={deleteProspect}
    />
  );
}
