import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChecklistClient } from "./checklist-client";

export default async function ControlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Charger le rapport avec contrôles et installations
  const { data: rapport } = await supabase
    .from("rapports")
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      controles(
        *,
        installation:installations(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!rapport) {
    redirect("/");
  }

  // Trier les contrôles par page_number
  const controles = (rapport.controles || []).sort(
    (a: any, b: any) => a.page_number - b.page_number
  );

  return (
    <ChecklistClient
      rapportId={rapport.id}
      numeroCm={rapport.numero_cm}
      siteName={rapport.site?.nom || ""}
      controles={controles}
      initialPhotos={rapport.photos || []}
    />
  );
}
