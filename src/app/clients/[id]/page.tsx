import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientDetailClient } from "./client-detail-client";
import { CodeAccesToggle } from "./code-acces-toggle";

const PERIODICITE_LABEL: Record<number, string> = {
  3: "Trim.",
  6: "Semes.",
  12: "Annuel",
  24: "Bienn.",
};

function periodiciteLabel(mois: number | null): string {
  if (!mois) return "";
  return PERIODICITE_LABEL[mois] ?? `${mois} mois`;
}

function joursAvant(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function MaintenanceBadge({ jours }: { jours: number | null }) {
  if (jours === null) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        Jamais
      </span>
    );
  }
  if (jours < 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        Retard {Math.abs(jours)} j
      </span>
    );
  }
  if (jours <= 30) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Dans {jours} j
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
      Dans {jours} j
    </span>
  );
}

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
    .select(`
      *,
      installations(*)
    `)
    .eq("client_id", id)
    .order("nom");

  const siteIds = (sites ?? []).map((s) => s.id);

  // ── Derniers rapports par site (maintenance) ──
  const { data: dernieresCM } = await supabase
    .from("rapports")
    .select("site_id, date_intervention, statut")
    .in("site_id", siteIds.length > 0 ? siteIds : ["_"])
    .eq("type_rapport", "maintenance")
    .eq("statut", "finalise")
    .order("date_intervention", { ascending: false });

  const derniereCMParSite = new Map<string, string>();
  for (const r of dernieresCM ?? []) {
    if (!derniereCMParSite.has(r.site_id)) {
      derniereCMParSite.set(r.site_id, r.date_intervention);
    }
  }

  // ── Dernière intervention par installation ──
  const installationIds = (sites ?? []).flatMap(
    (s) => (s.installations ?? []).map((i: { id: string }) => i.id)
  );

  const { data: dernieresInterventions } = await supabase
    .from("rapports")
    .select("installation_id, date_intervention, type_rapport")
    .in(
      "installation_id",
      installationIds.length > 0 ? installationIds : ["_"]
    )
    .in("type_rapport", ["maintenance", "intervention"])
    .eq("statut", "finalise")
    .order("date_intervention", { ascending: false });

  const derniereVisiteParInstallation = new Map<
    string,
    { date: string; type: string }
  >();
  for (const r of dernieresInterventions ?? []) {
    if (r.installation_id && !derniereVisiteParInstallation.has(r.installation_id)) {
      derniereVisiteParInstallation.set(r.installation_id, {
        date: r.date_intervention,
        type: r.type_rapport,
      });
    }
  }

  // ── Stats globales ──
  const { count: nbRapports } = await supabase
    .from("rapports")
    .select("id", { count: "exact", head: true })
    .eq("client_id", id);

  const nbSites = sites?.length ?? 0;
  const nbInstallations = installationIds.length;

  return (
    <div className="pb-24">
      {/* Fil d'Ariane */}
      <div className="mb-4 flex items-center gap-1 text-xs text-muted">
        <Link href="/clients" className="hover:underline">
          Clients
        </Link>
        <span>›</span>
        <span className="font-medium text-foreground">{client.nom}</span>
      </div>

      {/* En-tête client — édition inline */}
      <ClientDetailClient client={client} />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Sites", value: nbSites, icon: "📍" },
          { label: "Équipements", value: nbInstallations, icon: "🚪" },
          { label: "Rapports", value: nbRapports ?? 0, icon: "📋" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-white px-3 py-3 text-center shadow-sm"
          >
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted">
              {icon} {label}
            </p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="mb-4 flex gap-2">
        <Link
          href={`/rapports/nouveau?client_id=${id}&type=intervention`}
          className="flex-1 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-center text-sm font-semibold text-purple-700 hover:bg-purple-100"
        >
          ⚡ Intervention
        </Link>
        <Link
          href={`/rapports/nouveau?client_id=${id}&type=maintenance`}
          className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          🔧 Maintenance
        </Link>
        <Link
          href={`/rapports/nouveau?client_id=${id}&type=visite`}
          className="flex-1 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-center text-sm font-semibold text-teal-700 hover:bg-teal-100"
        >
          📐 Visite
        </Link>
      </div>

      {/* Historique des rapports */}
      <Link
        href={`/?client_id=${id}`}
        className="mb-6 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-sm hover:bg-slate-50"
      >
        <span className="text-sm font-medium">Voir tous les rapports</span>
        <span className="text-xs text-muted">{nbRapports ?? 0} rapport{(nbRapports ?? 0) > 1 ? "s" : ""} →</span>
      </Link>

      {/* Sites */}
      <h2 className="mb-3 text-sm font-bold text-muted uppercase tracking-wide">
        Sites &amp; équipements
      </h2>

      {(sites ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted">
          Aucun site enregistré pour ce client.
        </div>
      ) : (
        <div className="space-y-4">
          {(sites ?? []).map((site) => {
            const derniereCM = derniereCMParSite.get(site.id) ?? null;
            let prochaineCM: string | null = null;
            let joursAvantCM: number | null = null;

            if (site.periodicite_maintenance) {
              if (derniereCM) {
                const d = new Date(derniereCM + "T12:00:00");
                d.setMonth(d.getMonth() + site.periodicite_maintenance);
                prochaineCM = d.toISOString().split("T")[0];
                joursAvantCM = joursAvant(prochaineCM);
              } else {
                joursAvantCM = null;
              }
            }

            const installations: Array<{
              id: string;
              repere: string;
              type_porte: string;
              modele: string | null;
            }> = site.installations ?? [];

            return (
              <div
                key={site.id}
                className="rounded-xl border border-border bg-white shadow-sm overflow-hidden"
              >
                {/* En-tête du site */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{site.nom}</p>
                      {site.adresse && (
                        <p className="text-xs text-muted mt-0.5">{site.adresse}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {site.periodicite_maintenance && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          🔄 {periodiciteLabel(site.periodicite_maintenance)}
                        </span>
                      )}
                      <Link
                        href={`/rapports/nouveau?client_id=${id}&site_id=${site.id}&type=maintenance`}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        + CM
                      </Link>
                    </div>
                  </div>

                  {/* Maintenance info */}
                  {site.periodicite_maintenance && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      {derniereCM ? (
                        <>
                          <span>
                            Dernière CM :{" "}
                            {new Date(derniereCM + "T12:00:00").toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                          {prochaineCM && (
                            <>
                              <span>·</span>
                              <span>
                                Prochaine :{" "}
                                {new Date(prochaineCM + "T12:00:00").toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span>Aucune CM enregistrée</span>
                      )}
                      <MaintenanceBadge jours={joursAvantCM} />
                    </div>
                  )}

                  {/* Contact + nouveaux champs site */}
                  {(site.contact_nom || site.contact_telephone || site.contact_mail || site.contact_fonction) && (
                    <p className="mt-1 text-xs text-muted">
                      👤 {[site.contact_nom, site.contact_fonction].filter(Boolean).join(" · ")}
                      {site.contact_telephone && (
                        <> · <a href={`tel:${site.contact_telephone}`} className="hover:text-primary">{site.contact_telephone}</a></>
                      )}
                      {site.contact_mail && (
                        <> · <a href={`mailto:${site.contact_mail}`} className="hover:text-primary">{site.contact_mail}</a></>
                      )}
                    </p>
                  )}
                  {site.horaires && (
                    <p className="mt-0.5 text-xs text-muted">🕐 {site.horaires}</p>
                  )}
                  {site.code_acces && (
                    <div className="mt-0.5">
                      <CodeAccesToggle code={site.code_acces} />
                    </div>
                  )}
                  {site.notes_site && (
                    <div className="mt-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                      📝 {site.notes_site}
                    </div>
                  )}
                </div>

                {/* Installations */}
                {installations.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted italic">
                    Aucun équipement enregistré
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {installations.map((inst) => {
                      const derniere = derniereVisiteParInstallation.get(inst.id);
                      return (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              🚪 {inst.repere}
                            </p>
                            <p className="text-xs text-muted">
                              {inst.type_porte}
                              {inst.modele ? ` · ${inst.modele}` : ""}
                              {derniere ? (
                                <> · {derniere.type === "maintenance" ? "CM" : "Intervention"}{" "}
                                  {new Date(derniere.date + "T12:00:00").toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </>
                              ) : (
                                <> · Aucune visite</>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <Link
                              href={`/installations/${inst.id}`}
                              className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:bg-slate-50"
                            >
                              📋 Historique
                            </Link>
                            <Link
                              href={`/rapports/nouveau?client_id=${id}&site_id=${site.id}&installation_id=${inst.id}&type=intervention`}
                              className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100"
                            >
                              ⚡
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
