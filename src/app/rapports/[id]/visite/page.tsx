import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisiteClient } from "./visite-client";

export default async function VisitePage({
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

  return (
    <div>
      <VisiteClient rapport={rapport} />
    </div>
  );
}
