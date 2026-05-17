import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DossierFilters } from "@/components/dossiers/DossierFilters";
import type { DossierRow } from "@/components/dossiers/DossierCard";
import {
  RDV_TYPE_CONFIG,
  RDV_STATUT_CONFIG,
  formatRdvDate,
  formatDuree,
} from "@/components/rdvs/rdv-types";

// ── Types locaux ───────────────────────────────────────────────────────────

type RdvAujourdhui = {
  id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: string;
  statut: string;
  dossier: { id: string; reference: string } | null;
  client: { id: string; nom: string } | null;
};

export default async function DossiersDashboard() {
  const supabase = await createClient();

  // ── Dossiers ────────────────────────────────────────────────────────────
  const { data: rawDossiers } = await supabase
    .from("dossiers")
    .select(`
      id,
      reference,
      titre,
      type_dossier,
      statut,
      date_ouverture,
      date_cloture,
      montant_total_ht,
      client:clients(id, nom),
      site:sites(nom),
      rapports(id)
    `)
    .order("date_ouverture", { ascending: false });

  const dossiers: DossierRow[] = (rawDossiers ?? []).map((d) => {
    const raw = d as unknown as {
      id: string;
      reference: string;
      titre: string | null;
      type_dossier: string;
      statut: string;
      date_ouverture: string;
      date_cloture: string | null;
      montant_total_ht: number | null;
      client: { id: string; nom: string } | { id: string; nom: string }[] | null;
      site: { nom: string } | { nom: string }[] | null;
      rapports: { id: string }[];
    };
    return {
      id: raw.id,
      reference: raw.reference,
      titre: raw.titre,
      type_dossier: raw.type_dossier,
      statut: raw.statut,
      date_ouverture: raw.date_ouverture,
      date_cloture: raw.date_cloture,
      montant_total_ht: raw.montant_total_ht,
      client: Array.isArray(raw.client) ? (raw.client[0] ?? null) : raw.client,
      site: Array.isArray(raw.site) ? (raw.site[0] ?? null) : raw.site,
      rapports: Array.isArray(raw.rapports) ? raw.rapports : [],
    };
  });

  // ── RDV du jour ─────────────────────────────────────────────────────────
  // Calcul de la plage du jour en heure Nouméa (UTC+11, pas de DST)
  const NC_OFFSET_MS = 11 * 60 * 60 * 1000;
  const nowNC = new Date(Date.now() + NC_OFFSET_MS);
  const debutJourNC = new Date(
    Date.UTC(nowNC.getUTCFullYear(), nowNC.getUTCMonth(), nowNC.getUTCDate()) - NC_OFFSET_MS
  );
  const finJourNC = new Date(
    Date.UTC(nowNC.getUTCFullYear(), nowNC.getUTCMonth(), nowNC.getUTCDate() + 1) - NC_OFFSET_MS
  );

  const { data: rawRdvsDuJour } = await supabase
    .from("rdvs")
    .select(`
      id,
      date_rdv,
      duree_minutes,
      type_rdv,
      statut,
      dossier:dossiers(id, reference),
      client:clients(id, nom)
    `)
    .gte("date_rdv", debutJourNC.toISOString())
    .lt("date_rdv", finJourNC.toISOString())
    .neq("statut", "annule")
    .order("date_rdv");

  const rdvsDuJour: RdvAujourdhui[] = (rawRdvsDuJour ?? []).map((r) => {
    const raw = r as unknown as {
      id: string;
      date_rdv: string;
      duree_minutes: number | null;
      type_rdv: string;
      statut: string;
      dossier: { id: string; reference: string } | { id: string; reference: string }[] | null;
      client: { id: string; nom: string } | { id: string; nom: string }[] | null;
    };
    const dossier = Array.isArray(raw.dossier) ? (raw.dossier[0] ?? null) : raw.dossier;
    const client = Array.isArray(raw.client) ? (raw.client[0] ?? null) : raw.client;
    return {
      id: raw.id,
      date_rdv: raw.date_rdv,
      duree_minutes: raw.duree_minutes,
      type_rdv: raw.type_rdv,
      statut: raw.statut,
      dossier,
      client,
    };
  });

  // ── Stats dossiers ───────────────────────────────────────────────────────
  const actifs = dossiers.filter(
    (d) => d.statut !== "termine" && d.statut !== "annule"
  );
  const nbUrgents = actifs.filter((d) => d.type_dossier === "urgent").length;
  const nbContrats = actifs.filter((d) => d.type_dossier === "contrat").length;
  const nbEnCours = actifs.filter((d) => d.statut === "en_cours").length;

  return (
    <div>
      {/* ── RDV du jour ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted">
            📅 RDV du jour
          </h2>
          <Link
            href="/agenda"
            className="text-xs text-primary hover:underline"
          >
            Voir l&apos;agenda →
          </Link>
        </div>

        {rdvsDuJour.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted">
            Aucun RDV aujourd&apos;hui.
          </div>
        ) : (
          <div className="space-y-2">
            {rdvsDuJour.map((rdv) => {
              const typeCfg =
                RDV_TYPE_CONFIG[rdv.type_rdv as keyof typeof RDV_TYPE_CONFIG] ??
                ({
                  label: rdv.type_rdv,
                  badge: "bg-gray-100 text-gray-600",
                } as const);
              const statutCfg =
                RDV_STATUT_CONFIG[rdv.statut as keyof typeof RDV_STATUT_CONFIG] ??
                ({ label: rdv.statut, badge: "bg-gray-100 text-gray-500" } as const);

              return (
                <div
                  key={rdv.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatRdvDate(rdv.date_rdv)}
                      <span className="ml-2 text-xs text-muted font-normal">
                        {formatDuree(rdv.duree_minutes)}
                      </span>
                    </p>
                    <p className="text-xs text-muted truncate">
                      {rdv.client ? (
                        <Link
                          href={`/clients/${rdv.client.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {rdv.client.nom}
                        </Link>
                      ) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeCfg.badge}`}
                    >
                      {typeCfg.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statutCfg.badge}`}
                    >
                      {statutCfg.label}
                    </span>
                    {rdv.dossier && (
                      <Link
                        href={`/dossiers/${rdv.dossier.id}`}
                        className="text-xs text-primary hover:underline hidden sm:block"
                      >
                        {rdv.dossier.reference}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── En-tête Dossiers ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dossiers</h1>
          <p className="text-sm text-muted">
            {actifs.length} dossier{actifs.length !== 1 ? "s" : ""} actif
            {actifs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dossiers/new"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-light active:scale-95 transition-all"
        >
          + Nouveau dossier
        </Link>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      {dossiers.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{actifs.length}</p>
            <p className="text-xs text-muted">Actifs</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-700">{nbEnCours}</p>
            <p className="text-xs text-muted">En cours</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-700">{nbUrgents}</p>
            <p className="text-xs text-muted">Urgents</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-700">{nbContrats}</p>
            <p className="text-xs text-muted">Contrats</p>
          </div>
        </div>
      )}

      {/* ── Liste dossiers ──────────────────────────────────────────────── */}
      {dossiers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
          <p className="text-4xl mb-4">📁</p>
          <h2 className="text-lg font-semibold mb-2">Aucun dossier</h2>
          <p className="text-sm text-muted mb-6">
            Créez votre premier dossier pour organiser vos interventions et
            contrats.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/clients"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Gérer les clients
            </Link>
            <Link
              href="/dossiers/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
            >
              Créer un dossier
            </Link>
          </div>
        </div>
      ) : (
        <DossierFilters dossiers={dossiers} />
      )}
    </div>
  );
}
