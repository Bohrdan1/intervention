import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InterventionClient } from "./intervention-client";
import { getCatalogues } from "@/lib/actions/catalogue";

export default async function InterventionPage({
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
      site:sites(*)
    `)
    .eq("id", id)
    .single();

  if (!rapport) {
    redirect("/");
  }

  // Charger les installations du site pour le sélecteur de porte
  const { data: installations } = await supabase
    .from("installations")
    .select("*")
    .eq("site_id", rapport.site_id)
    .order("repere");

  // Charger le catalogue de pièces (trié par fréquence d'usage)
  const catalogue = await getCatalogues();

  return (
    <div>
      <InterventionClient
        rapport={rapport}
        installations={installations || []}
        catalogue={catalogue}
      />
    </div>
  );
}
