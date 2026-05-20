import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientDetailClient } from "./client-detail-client";
import type { DossierOption } from "@/components/rdvs/rdv-types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // ── Client ──
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  // ── Sites du client avec installations ──
  const { data: sites } = await supabase
    .from("sites")
    .select(`*, equipements(*)`)
    .eq("client_id", id)
    .order("nom");

  const siteIds = (sites ?? []).map((s) => s.id);

  // ── Dernière CM finalisée par site ──
  const { data: dernieresCM } = await supabase
    .from("rapports")
    .select("site_id, date_intervention")
    .in("site_id", siteIds.length > 0 ? siteIds : ["_"])
    .eq("type_rapport", "maintenance")
    .eq("statut", "finalise")
    .order("date_intervention", { ascending: false });

  const derniereCMMap: Record<string, string> = {};
  for (const r of dernieresCM ?? []) {
    if (!derniereCMMap[r.site_id]) derniereCMMap[r.site_id] = r.date_intervention;
  }

  // ── Dernière intervention par équipement ──
  const equipementIds = (sites ?? []).flatMap(
    (s) => (s.equipements ?? []).map((i: { id: string }) => i.id)
  );

  const { data: dernieresInterventions } = await supabase
    .from("rapports")
    .select("equipement_id, date_intervention, type_rapport")
    .in("equipement_id", equipementIds.length > 0 ? equipementIds : ["_"])
    .in("type_rapport", ["maintenance", "intervention"])
    .eq("statut", "finalise")
    .order("date_intervention", { ascending: false });

  const derniereVisiteMap: Record<string, { date: string; type: string }> = {};
  for (const r of dernieresInterventions ?? []) {
    if (r.equipement_id && !derniereVisiteMap[r.equipement_id]) {
      derniereVisiteMap[r.equipement_id] = { date: r.date_intervention, type: r.type_rapport };
    }
  }

  // ── Prochains RDV du client (à partir d'aujourd'hui heure Nouméa) ──
  const NC_OFFSET_MS = 11 * 60 * 60 * 1000;
  const nowNC = new Date(Date.now() + NC_OFFSET_MS);
  const debutJourNC = new Date(
    Date.UTC(nowNC.getUTCFullYear(), nowNC.getUTCMonth(), nowNC.getUTCDate()) - NC_OFFSET_MS
  ).toISOString();

  const { data: prochainRdvs } = await supabase
    .from("rdvs")
    .select("id, date_rdv, duree_minutes, type_rdv, statut, notes, dossier_id, dossier:dossiers(id, reference)")
    .eq("client_id", id)
    .gte("date_rdv", debutJourNC)
    .neq("statut", "annule")
    .order("date_rdv")
    .limit(10);

  // ── Dossiers actifs du client (pour RdvModal) ──
  const { data: rawDossiers } = await supabase
    .from("dossiers")
    .select("id, reference, site:sites(nom)")
    .eq("client_id", id)
    .not("statut", "in", '("termine","annule")')
    .order("date_ouverture", { ascending: false });

  const dossierOptions: DossierOption[] = (rawDossiers ?? []).map((d) => {
    const raw = d as unknown as {
      id: string;
      reference: string;
      site: { nom: string } | { nom: string }[] | null;
    };
    const site = Array.isArray(raw.site) ? raw.site[0] : raw.site;
    return {
      id: raw.id,
      reference: raw.reference,
      clientNom: client.nom,
      siteNom: site?.nom ?? null,
    };
  });

  // ── Stats globales ──
  const { count: nbRapports } = await supabase
    .from("rapports")
    .select("id", { count: "exact", head: true })
    .eq("client_id", id);

  const nbSites = sites?.length ?? 0;
  const nbInstallations = equipementIds.length;

  // Normaliser les sites pour le composant client
  const sitesData = (sites ?? []).map((s) => ({
    id: s.id,
    nom: s.nom,
    adresse: s.adresse ?? null,
    periodicite_maintenance: s.periodicite_maintenance ?? null,
    contact_nom: s.contact_nom ?? null,
    contact_telephone: s.contact_telephone ?? null,
    contact_mail: s.contact_mail ?? null,
    memo_prive: s.memo_prive ?? null,
    contact_fonction: s.contact_fonction ?? null,
    horaires: s.horaires ?? null,
    code_acces: s.code_acces ?? null,
    notes_site: s.notes_site ?? null,
    equipements: (s.equipements ?? []).map((i: {
      id: string; repere: string; type_porte: string; modele: string | null;
    }) => ({
      id: i.id,
      repere: i.repere,
      type_porte: i.type_porte,
      modele: i.modele ?? null,
    })),
  }));

  return (
    <div className="pb-24">
      {/* Fil d'Ariane */}
      <div className="mb-4 flex items-center gap-1 text-xs text-muted">
        <Link href="/clients" className="hover:underline">Clients</Link>
        <span>›</span>
        <span className="font-medium text-foreground">{client.nom}</span>
      </div>

      {/* Client + Sites (édition inline) */}
      <ClientDetailClient
        client={client}
        clientId={id}
        sites={sitesData}
        derniereCMParSite={derniereCMMap}
        derniereVisiteParInstallation={derniereVisiteMap}
        dossierOptions={dossierOptions}
      />

      {/* Stats */}
      <div className="mt-6 mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Sites", value: nbSites, icon: "📍" },
          { label: "Équipements", value: nbInstallations, icon: "🚪" },
          { label: "Rapports", value: nbRapports ?? 0, icon: "📋" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-border bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted">{icon} {label}</p>
          </div>
        ))}
      </div>

      {/* Prochains RDV */}
      {(() => {
        const NC_OFFSET = 11 * 60 * 60 * 1000;
        const typeColors: Record<string, string> = {
          diagnostic:   "border-gray-200 bg-gray-50 text-gray-700",
          intervention: "border-purple-200 bg-purple-50 text-purple-700",
          maintenance:  "border-blue-200 bg-blue-50 text-blue-700",
          visite:       "border-teal-200 bg-teal-50 text-teal-700",
        };
        const typeLabels: Record<string, string> = {
          diagnostic:   "Diagnostic",
          intervention: "Intervention",
          maintenance:  "Maintenance",
          visite:       "Visite",
        };
        const formatNC = (iso: string) => {
          const nc = new Date(new Date(iso).getTime() + NC_OFFSET);
          const day = String(nc.getUTCDate()).padStart(2, "0");
          const month = String(nc.getUTCMonth() + 1).padStart(2, "0");
          const year = nc.getUTCFullYear();
          const hh = String(nc.getUTCHours()).padStart(2, "0");
          const mm = String(nc.getUTCMinutes()).padStart(2, "0");
          return { date: `${day}/${month}/${year}`, time: `${hh}h${mm}` };
        };
        return (
          <div className="mt-6 mb-4">
            <h2 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Prochains RDV</h2>
            {(prochainRdvs ?? []).length === 0 ? (
              <p className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted shadow-sm">
                Aucun RDV à venir
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {(prochainRdvs ?? []).map((rdv) => {
                  const { date, time } = formatNC(rdv.date_rdv);
                  const colorClass = typeColors[rdv.type_rdv] ?? typeColors.diagnostic;
                  const label = typeLabels[rdv.type_rdv] ?? rdv.type_rdv;
                  const dossier = Array.isArray(rdv.dossier) ? rdv.dossier[0] : rdv.dossier;
                  return (
                    <div key={rdv.id} className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{date}</span>
                            <span className="text-sm text-muted">{time}</span>
                            {rdv.duree_minutes && (
                              <span className="text-xs text-muted">({rdv.duree_minutes} min)</span>
                            )}
                          </div>
                          {dossier && (
                            <Link
                              href={`/dossiers/${dossier.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Dossier {dossier.reference}
                            </Link>
                          )}
                          {rdv.notes && (
                            <p className="text-xs text-muted mt-0.5 line-clamp-2">{rdv.notes}</p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Actions rapides */}
      <div className="mb-4 flex gap-2">
        <Link href={`/rapports/nouveau?client_id=${id}&type=intervention`}
          className="flex-1 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-center text-sm font-semibold text-purple-700 hover:bg-purple-100">
          ⚡ Intervention
        </Link>
        <Link href={`/rapports/nouveau?client_id=${id}&type=maintenance`}
          className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100">
          🔧 Maintenance
        </Link>
        <Link href={`/rapports/nouveau?client_id=${id}&type=visite`}
          className="flex-1 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-center text-sm font-semibold text-teal-700 hover:bg-teal-100">
          📐 Visite
        </Link>
      </div>

      {/* Historique */}
      <Link href={`/?client_id=${id}`}
        className="mb-6 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-sm hover:bg-slate-50">
        <span className="text-sm font-medium">Voir tous les rapports</span>
        <span className="text-xs text-muted">{nbRapports ?? 0} rapport{(nbRapports ?? 0) > 1 ? "s" : ""} →</span>
      </Link>
    </div>
  );
}
