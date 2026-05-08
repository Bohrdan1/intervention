import { createClient } from "@/lib/supabase/server";
import { ExportClient } from "./export-client";

export default async function ExportPage() {
  const supabase = await createClient();

  // Stats pour orienter l'export
  const { count: nbFinalise } = await supabase
    .from("rapports")
    .select("id", { count: "exact", head: true })
    .eq("statut", "finalise")
    .is("archived_at", null);

  // Premier et dernier rapport finalisé
  const { data: premier } = await supabase
    .from("rapports")
    .select("date_intervention")
    .eq("statut", "finalise")
    .is("archived_at", null)
    .order("date_intervention", { ascending: true })
    .limit(1)
    .single();

  const { data: dernier } = await supabase
    .from("rapports")
    .select("date_intervention")
    .eq("statut", "finalise")
    .is("archived_at", null)
    .order("date_intervention", { ascending: false })
    .limit(1)
    .single();

  // Début du mois en cours (pour valeur par défaut)
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Export comptable</h1>
        <p className="text-sm text-muted">
          {nbFinalise ?? 0} rapport{(nbFinalise ?? 0) > 1 ? "s" : ""} finalisé{(nbFinalise ?? 0) > 1 ? "s" : ""} disponible{(nbFinalise ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      <ExportClient
        debutMois={debutMois}
        finMois={finMois}
        premierRapport={premier?.date_intervention ?? debutMois}
        dernierRapport={dernier?.date_intervention ?? finMois}
        nbFinalise={nbFinalise ?? 0}
      />
    </div>
  );
}
