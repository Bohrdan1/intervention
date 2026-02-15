import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RapportList } from "@/components/dashboard/rapport-list";

export default async function Dashboard() {
  const supabase = await createClient();

  // Récupérer tous les rapports avec client et site
  const { data: rapports } = await supabase
    .from("rapports")
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      controles(id)
    `)
    .order("date_intervention", { ascending: false });

  const all = rapports || [];

  // Stats
  const totalRapports = all.length;
  const nbFinalises = all.filter((r) => r.statut === "finalise").length;
  const nbBrouillons = all.filter((r) => r.statut === "brouillon").length;
  const nbMaintenance = all.filter((r) => r.type_rapport === "maintenance").length;
  const nbIntervention = all.filter((r) => r.type_rapport === "intervention").length;
  const nbVisite = all.filter((r) => r.type_rapport === "visite").length;

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-sm text-muted">
            {totalRapports} rapport{totalRapports > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/rapports/nouveau"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-light active:scale-95 transition-all"
        >
          + Nouveau rapport
        </Link>
      </div>

      {/* Stats */}
      {totalRapports > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{totalRapports}</p>
            <p className="text-xs text-muted">Total</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{nbFinalises}</p>
            <p className="text-xs text-muted">Finalisés</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{nbMaintenance}</p>
            <p className="text-xs text-muted">Maintenance</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{nbIntervention}</p>
            <p className="text-xs text-muted">Interventions</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-teal-600">{nbVisite}</p>
            <p className="text-xs text-muted">Visites</p>
          </div>
        </div>
      )}

      {/* Liste des rapports */}
      {totalRapports === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <h2 className="text-lg font-semibold mb-2">Aucun rapport</h2>
          <p className="text-sm text-muted mb-6">
            Commencez par créer un client, puis générez votre premier rapport.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/clients"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Gérer les clients
            </Link>
            <Link
              href="/rapports/nouveau"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
            >
              Créer un rapport
            </Link>
          </div>
        </div>
      ) : (
        <RapportList rapports={all} />
      )}
    </div>
  );
}
