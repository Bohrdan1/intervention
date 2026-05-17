import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RapportPageClient } from "@/components/rapports/RapportPageClient";
import type { RapportComplet } from "@/lib/types";
import type { DossierChoix } from "@/components/rapports/RattacherDossierModal";

export default async function RapportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("rapports")
    .select(`*, client:clients(*), site:sites(*), controles(*, equipement:equipements(*))`)
    .eq("id", id)
    .single();

  if (!raw) notFound();

  // Normaliser les FK joins (reverse FK peut retourner un tableau)
  function normalise<T>(val: T | T[] | null | undefined): T | null {
    if (val === null || val === undefined) return null;
    return Array.isArray(val) ? (val[0] ?? null) : val;
  }

  const controles = ((raw as { controles?: unknown[] }).controles ?? []).map((c) => {
    const cc = c as Record<string, unknown>;
    return {
      ...cc,
      equipement: normalise(cc.equipement as unknown),
      installation: normalise(cc.equipement as unknown),
    };
  });

  const rapport = {
    ...raw,
    client: normalise((raw as Record<string, unknown>).client),
    site: normalise((raw as Record<string, unknown>).site),
    controles,
  } as unknown as RapportComplet;

  // Dossier courant
  let currentDossier: { id: string; reference: string } | null = null;
  if (rapport.dossier_id) {
    const { data } = await supabase
      .from("dossiers")
      .select("id, reference")
      .eq("id", rapport.dossier_id)
      .single();
    currentDossier = data ?? null;
  }

  // Dossiers pour RattacherDossierButton
  type DossierRow = {
    id: string;
    reference: string;
    type_dossier: string;
    client: { nom: string } | { nom: string }[] | null;
    site: { nom: string } | { nom: string }[] | null;
  };
  const { data: rawDossiers } = await supabase
    .from("dossiers")
    .select("id, reference, type_dossier, client:clients(nom), site:sites(nom)")
    .in("statut", ["ouvert", "en_cours", "en_attente"])
    .order("reference", { ascending: false });

  const dossierChoix: DossierChoix[] = (rawDossiers ?? []).map((d) => {
    const raw2 = d as unknown as DossierRow;
    const clientNom = Array.isArray(raw2.client)
      ? (raw2.client[0]?.nom ?? "—")
      : (raw2.client?.nom ?? "—");
    const siteNom = Array.isArray(raw2.site)
      ? (raw2.site[0]?.nom ?? null)
      : (raw2.site?.nom ?? null);
    return {
      id: raw2.id,
      reference: raw2.reference,
      clientNom,
      siteNom,
      typeDossier: raw2.type_dossier,
    };
  });

  return (
    <RapportPageClient
      rapport={rapport}
      currentDossier={currentDossier}
      dossierChoix={dossierChoix}
    />
  );
}
