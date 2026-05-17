import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RapportList } from "@/components/dashboard/rapport-list";
import { MaintenanceAlerts } from "@/components/dashboard/maintenance-alerts";
import type { AlerteMaintenance } from "@/components/dashboard/maintenance-alerts";
import { TYPE_RAPPORT_CONFIG } from "@/lib/types";
import type { TypeRapport } from "@/lib/types";

type SearchParams = {
  type?: string;
  statut?: string;
  archive?: string;
  q?: string;
  page?: string;
  client_id?: string;
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // ── Requête stats globales (toujours sans filtre) ──
  const { data: allRapports } = await supabase
    .from("rapports")
    .select("id, type_rapport, statut, archived_at");

  const all = allRapports || [];
  const actifs = all.filter((r) => !r.archived_at);
  const nbFinalises = actifs.filter((r) => r.statut === "finalise").length;
  const nbMaintenance = actifs.filter((r) => r.type_rapport === "maintenance").length;
  const nbIntervention = actifs.filter((r) => r.type_rapport === "intervention").length;
  const nbVisite = actifs.filter((r) => r.type_rapport === "visite").length;
  const totalActifs = actifs.length;

  // ── Alertes de maintenance préventive ──
  // Sites ayant un contrat (periodicite_maintenance non null)
  const { data: sitesAvecContrat } = await supabase
    .from("sites")
    .select(`
      id,
      nom,
      periodicite_maintenance,
      client:clients(id, nom)
    `)
    .not("periodicite_maintenance", "is", null);

  // Dernière CM finalisée par site
  const { data: dernieresCM } = await supabase
    .from("rapports")
    .select("site_id, date_intervention")
    .eq("type_rapport", "maintenance")
    .eq("statut", "finalise")
    .is("archived_at", null)
    .order("date_intervention", { ascending: false });

  // Construire un Map site_id → date dernière CM
  const derniereCMParSite = new Map<string, string>();
  for (const r of dernieresCM ?? []) {
    if (!derniereCMParSite.has(r.site_id)) {
      derniereCMParSite.set(r.site_id, r.date_intervention);
    }
  }

  // Calculer les alertes : sites en retard ou à moins de 60 jours
  const SEUIL_JOURS = 60;
  const aujourd_hui = new Date();

  const alertes: AlerteMaintenance[] = [];
  for (const site of sitesAvecContrat ?? []) {
    const client = Array.isArray(site.client) ? site.client[0] : site.client;
    if (!client) continue;
    const derniereCM = derniereCMParSite.get(site.id) ?? null;
    let joursRestants: number | null = null;
    let prochaineCM: string | null = null;

    if (derniereCM) {
      const dateProchaine = new Date(derniereCM + "T12:00:00");
      dateProchaine.setMonth(dateProchaine.getMonth() + (site.periodicite_maintenance ?? 12));
      prochaineCM = dateProchaine.toISOString().split("T")[0];
      joursRestants = Math.round((dateProchaine.getTime() - aujourd_hui.getTime()) / 86_400_000);
    }

    // Afficher si : jamais faite, en retard, ou échéance < SEUIL_JOURS jours
    const doitAlerter = joursRestants === null || joursRestants <= SEUIL_JOURS;
    if (doitAlerter) {
      alertes.push({
        siteId: site.id,
        siteNom: site.nom,
        clientNom: client.nom,
        clientId: client.id,
        periodicite: site.periodicite_maintenance ?? 12,
        derniereCM,
        prochaineCM,
        joursRestants,
      });
    }
  }

  // Trier : en retard d'abord, puis jamais faite, puis par date croissante
  alertes.sort((a, b) => {
    if (a.joursRestants === null && b.joursRestants === null) return 0;
    if (a.joursRestants === null) return -1;
    if (b.joursRestants === null) return 1;
    return a.joursRestants - b.joursRestants;
  });

  // ── Requête liste filtrée côté serveur ──
  const showArchived = params.archive === "1";
  const typeFilter = params.type as TypeRapport | undefined;
  const statutFilter = params.statut;
  const clientIdFilter = params.client_id;

  let query = supabase
    .from("rapports")
    .select(`
      id,
      numero_cm,
      date_intervention,
      type_rapport,
      statut,
      archived_at,
      client_id,
      client:clients(id, nom),
      site:sites(nom),
      controles(id)
    `)
    .order("date_intervention", { ascending: false });

  // Filtre archivage
  if (showArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  // Filtre type
  if (typeFilter && ["maintenance", "intervention", "visite"].includes(typeFilter)) {
    query = query.eq("type_rapport", typeFilter);
  }

  // Filtre statut
  if (statutFilter === "brouillon" || statutFilter === "finalise") {
    query = query.eq("statut", statutFilter);
  }

  // Filtre client
  if (clientIdFilter) {
    query = query.eq("client_id", clientIdFilter);
  }

  const { data: rapports } = await query;
  const liste = rapports || [];

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-sm text-muted">
            {totalActifs} rapport{totalActifs > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/rapports/nouveau"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-light active:scale-95 transition-all"
        >
          + Nouveau rapport
        </Link>
      </div>

      {/* Stats cliquables — appliquent le filtre côté serveur */}
      {totalActifs > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Link
            href="/rapports"
            className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
              !typeFilter && !statutFilter && !showArchived
                ? "border-primary bg-primary/5"
                : "border-border bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-foreground">{totalActifs}</p>
            <p className="text-xs text-muted">Total</p>
          </Link>
          <Link
            href="/rapports?statut=finalise"
            className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
              statutFilter === "finalise" ? "border-green-400 bg-green-50" : "border-border bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-green-600">{nbFinalises}</p>
            <p className="text-xs text-muted">Finalisés</p>
          </Link>
          {(Object.entries(TYPE_RAPPORT_CONFIG) as [TypeRapport, typeof TYPE_RAPPORT_CONFIG[TypeRapport]][]).map(
            ([type, cfg]) => {
              const count = type === "maintenance" ? nbMaintenance : type === "intervention" ? nbIntervention : nbVisite;
              const isActive = typeFilter === type;
              return (
                <Link
                  key={type}
                  href={`/rapports?type=${type}`}
                  className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                    isActive ? `border-current bg-white` : "border-border bg-white"
                  }`}
                >
                  <p className={`text-2xl font-bold ${cfg.couleurTexte}`}>{count}</p>
                  <p className="text-xs text-muted">{cfg.label}</p>
                </Link>
              );
            }
          )}
        </div>
      )}

      {/* Alertes maintenance préventive */}
      <MaintenanceAlerts alertes={alertes} />

      {/* Liste des rapports */}
      {totalActifs === 0 ? (
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
        <RapportList
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rapports={liste as any}
          activeType={typeFilter}
          activeStatut={statutFilter}
          showArchived={showArchived}
        />
      )}
    </div>
  );
}
