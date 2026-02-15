import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinaliserClient } from "./finaliser-client";

export default async function FinaliserPage({
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

  // Trier les contrôles
  const controles = (rapport.controles || []).sort(
    (a: any, b: any) => a.page_number - b.page_number
  );

  return (
    <FinaliserClient
      rapport={{ ...rapport, controles }}
    />
  );
}
