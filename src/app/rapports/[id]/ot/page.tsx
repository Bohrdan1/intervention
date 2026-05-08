import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrdreTravauxClient } from "./ot-client";

export default async function OrdreTravailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from("rapports")
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      installation:installations(*)
    `)
    .eq("id", id)
    .single();

  if (!rapport) notFound();

  // Installations du site pour la liste
  const { data: installations } = await supabase
    .from("installations")
    .select("id, repere, type_porte, modele")
    .eq("site_id", rapport.site_id)
    .order("repere");

  const client = Array.isArray(rapport.client) ? rapport.client[0] : rapport.client;
  const site = Array.isArray(rapport.site) ? rapport.site[0] : rapport.site;
  const installation = Array.isArray(rapport.installation)
    ? rapport.installation[0]
    : rapport.installation;

  return (
    <OrdreTravauxClient
      rapport={rapport}
      client={client}
      site={site}
      installation={installation}
      installations={installations ?? []}
      rapportId={id}
    />
  );
}
