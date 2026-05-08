import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TYPE_RAPPORT_CONFIG } from "@/lib/types";
import type { TypeRapport } from "@/lib/types";

type EtatControle = "ok" | "correction" | "prevention" | "na";

const ETAT_CONFIG: Record<EtatControle, { label: string; classe: string }> = {
  ok:         { label: "OK",        classe: "bg-green-100 text-green-700" },
  correction: { label: "Correction", classe: "bg-red-100 text-red-700" },
  prevention: { label: "Prévention", classe: "bg-amber-100 text-amber-700" },
  na:         { label: "N/A",       classe: "bg-slate-100 text-slate-500" },
};

export default async function HistoriqueInstallationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Charger l'installation avec son site et client
  const { data: installation } = await supabase
    .from("installations")
    .select(`
      id,
      repere,
      type_porte,
      modele,
      avec_batterie,
      commentaire,
      site:sites(
        id,
        nom,
        client:clients(id, nom)
      )
    `)
    .eq("id", id)
    .single();

  if (!installation) notFound();

  const site = Array.isArray(installation.site) ? installation.site[0] : installation.site;
  const client = site ? (Array.isArray(site.client) ? site.client[0] : site.client) : null;

  // Charger tous les rapports impliquant cette installation
  // 1. Maintenances (via controles)
  const { data: controles } = await supabase
    .from("controles")
    .select(`
      id,
      points_controle,
      points_erp,
      note_supplementaire,
      rapport:rapports(
        id,
        numero_cm,
        date_intervention,
        type_rapport,
        statut,
        technicien,
        archived_at
      )
    `)
    .eq("installation_id", id)
    .order("created_at", { ascending: false });

  // 2. Interventions directes sur cette installation
  const { data: interventions } = await supabase
    .from("rapports")
    .select(`
      id,
      numero_cm,
      date_intervention,
      type_rapport,
      statut,
      technicien,
      demande_client,
      description_probleme,
      diagnostic,
      travaux_effectues,
      pieces_utilisees,
      archived_at
    `)
    .eq("installation_id", id)
    .eq("type_rapport", "intervention")
    .order("date_intervention", { ascending: false });

  // Construire la timeline unifiée
  interface RapportBase {
    id: string;
    numero_cm: string;
    date_intervention: string;
    type_rapport: string;
    statut: string;
    technicien: string | null;
    archived_at: string | null;
  }
  interface RapportIntervention extends RapportBase {
    demande_client: string | null;
    description_probleme: string | null;
    diagnostic: string | null;
    travaux_effectues: string | null;
    pieces_utilisees: unknown[] | null;
  }
  interface ControleAvecRapport {
    id: string;
    points_controle: unknown;
    points_erp: unknown;
    note_supplementaire: string | null;
    rapport: RapportBase | null;
  }

  type EvenementTimeline =
    | { type: "maintenance"; date: string; rapport: RapportBase; controle: ControleAvecRapport }
    | { type: "intervention"; date: string; rapport: RapportIntervention };

  const timeline: EvenementTimeline[] = [];

  for (const c of controles ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = (Array.isArray(c.rapport) ? c.rapport[0] : c.rapport) as RapportBase | undefined;
    if (!r) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeline.push({ type: "maintenance", date: r.date_intervention, rapport: r, controle: c as unknown as ControleAvecRapport });
  }
  for (const r of interventions ?? []) {
    timeline.push({ type: "intervention", date: r.date_intervention, rapport: r as unknown as RapportIntervention });
  }

  timeline.sort((a, b) => b.date.localeCompare(a.date));

  // Stats rapides
  const nbMaint = timeline.filter((e) => e.type === "maintenance").length;
  const nbInter = timeline.filter((e) => e.type === "intervention").length;
  const dernierEvenement = timeline[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Fil d'Ariane */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/clients" className="hover:text-foreground">Clients</Link>
        <span>›</span>
        {client && <span className="text-foreground font-medium">{client.nom}</span>}
        {site && <><span>›</span><span>{site.nom}</span></>}
        <span>›</span>
        <span className="text-foreground font-medium">{installation.repere}</span>
      </nav>

      {/* En-tête installation */}
      <div className="mb-6 rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              🚪 {installation.repere}
              {installation.avec_batterie && (
                <span className="text-sm font-normal text-amber-600">🔋 Batterie</span>
              )}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              {installation.type_porte}
              {installation.modele ? ` · ${installation.modele}` : ""}
            </p>
            {installation.commentaire && (
              <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                📝 {installation.commentaire}
              </p>
            )}
          </div>
          {/* Bouton intervention rapide */}
          <Link
            href={`/rapports/nouveau?site_id=${site?.id}&client_id=${client?.id}&type=intervention`}
            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shrink-0 ml-4"
          >
            ⚡ Intervention
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{nbMaint}</p>
            <p className="text-xs text-muted">Maintenance{nbMaint > 1 ? "s" : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{nbInter}</p>
            <p className="text-xs text-muted">Intervention{nbInter > 1 ? "s" : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {dernierEvenement
                ? new Date(dernierEvenement.date + "T12:00:00").toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-xs text-muted">Dernière visite</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-white p-10 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm text-muted">Aucun rapport pour cette installation.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {timeline.map((evt, i) => {
              const cfg = TYPE_RAPPORT_CONFIG[evt.type as TypeRapport];
              const rapport = evt.type === "maintenance" ? evt.rapport : evt.rapport;
              const r = Array.isArray(rapport) ? rapport[0] : rapport;
              if (!r) return null;

              const date = new Date(evt.date + "T12:00:00").toLocaleDateString("fr-FR", {
                weekday: "short", day: "numeric", month: "long", year: "numeric",
              });

              return (
                <div key={`${evt.type}-${i}`} className="flex gap-4">
                  {/* Point de timeline */}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${
                    evt.type === "maintenance" ? "bg-blue-100" : "bg-purple-100"
                  }`}>
                    <span className="text-sm">{evt.type === "maintenance" ? "🔧" : "⚡"}</span>
                  </div>

                  {/* Carte */}
                  <div className={`flex-1 mb-1 rounded-xl border bg-white p-4 shadow-sm ${
                    r.archived_at ? "opacity-60" : "border-border"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${cfg?.couleurTexte ?? "text-blue-700"}`}>
                            {cfg?.label} · {date}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.statut === "finalise"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {r.statut === "finalise" ? "Finalisé" : "Brouillon"}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{r.numero_cm} · {r.technicien}</p>
                      </div>
                      <Link
                        href={`/rapports/${r.id}`}
                        className="shrink-0 rounded border border-border px-2 py-1 text-xs text-muted hover:bg-slate-50 hover:text-foreground transition-colors"
                      >
                        Voir →
                      </Link>
                    </div>

                    {/* Détails maintenance : points en anomalie */}
                    {evt.type === "maintenance" && (() => {
                      const controle = evt.controle;
                      const pts = (controle.points_controle ?? []) as { etat: EtatControle; nom: string; observation: string }[];
                      const anomalies = pts.filter(
                        (p) => p.etat !== "ok" && p.etat !== "na"
                      );
                      return (
                        <div className="mt-3 space-y-1.5">
                          {anomalies.length === 0 ? (
                            <p className="text-xs text-green-700 font-medium">✅ Tous points OK</p>
                          ) : (
                            anomalies.map((p, j: number) => {
                              const etatCfg = ETAT_CONFIG[p.etat];
                              return (
                                <div key={j} className="flex items-start gap-2">
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${etatCfg.classe}`}>
                                    {etatCfg.label}
                                  </span>
                                  <p className="text-xs text-muted">
                                    {p.nom}{p.observation ? ` — ${p.observation}` : ""}
                                  </p>
                                </div>
                              );
                            })
                          )}
                          {controle.note_supplementaire && (
                            <p className="text-xs text-muted border-t border-border pt-1.5 mt-1.5">
                              📝 {controle.note_supplementaire}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Détails intervention */}
                    {evt.type === "intervention" && (() => {
                      const r2 = evt.rapport;
                      return (
                        <div className="mt-3 space-y-1">
                          {r2.demande_client && (
                            <p className="text-xs"><span className="text-muted">Demande :</span> {r2.demande_client}</p>
                          )}
                          {r2.diagnostic && (
                            <p className="text-xs"><span className="text-muted">Diagnostic :</span> {r2.diagnostic}</p>
                          )}
                          {r2.travaux_effectues && (
                            <p className="text-xs"><span className="text-muted">Travaux :</span> {r2.travaux_effectues}</p>
                          )}
                          {r2.pieces_utilisees && Array.isArray(r2.pieces_utilisees) && r2.pieces_utilisees.length > 0 && (
                            <p className="text-xs text-muted">
                              🔩 {(r2.pieces_utilisees as { nom: string; quantite: number }[]).map((p) => `${p.nom} ×${p.quantite}`).join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
