import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientDetailClient } from "./client-detail-client";

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
    .select(`*, installations(*)`)
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

  // ── Dernière intervention par installation ──
  const installationIds = (sites ?? []).flatMap(
    (s) => (s.installations ?? []).map((i: { id: string }) => i.id)
  );

  const { data: dernieresInterventions } = await supabase
    .from("rapports")
    .select("installation_id, date_intervention, type_rapport")
    .in("installation_id", installationIds.length > 0 ? installationIds : ["_"])
    .in("type_rapport", ["maintenance", "intervention"])
    .eq("statut", "finalise")
    .order("date_intervention", { ascending: false });

  const derniereVisiteMap: Record<string, { date: string; type: string }> = {};
  for (const r of dernieresInterventions ?? []) {
    if (r.installation_id && !derniereVisiteMap[r.installation_id]) {
      derniereVisiteMap[r.installation_id] = { date: r.date_intervention, type: r.type_rapport };
    }
  }

  // ── Stats globales ──
  const { count: nbRapports } = await supabase
    .from("rapports")
    .select("id", { count: "exact", head: true })
    .eq("client_id", id);

  const nbSites = sites?.length ?? 0;
  const nbInstallations = installationIds.length;

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
    installations: (s.installations ?? []).map((i: {
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
