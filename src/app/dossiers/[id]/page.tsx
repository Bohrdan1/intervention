import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DossierRdvSection } from "@/components/rdvs/DossierRdvSection";
import { FacturationSection } from "./facturation-section";
import type { FacturationStatut, ReglementMode } from "@/lib/types";
import type { RdvSimple, DossierOption } from "@/components/rdvs/rdv-types";
import { DeleteDossierButton } from "@/components/dossiers/DeleteDossierButton";
import { AjouterRapportButton } from "@/components/dossiers/AjouterRapportButton";
import type { RapportChoix } from "@/components/dossiers/AjouterRapportModal";
import { DossierStatutActions } from "./statut-actions";

// ── Config ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  urgent:        "Urgent",
  contrat:       "Contrat de maintenance",
  visite:        "Visite technique",
  maintenance:   "Maintenance",
  installation:  "Installation",
  remplacement:  "Remplacement",
  intervention:  "Intervention",
  autre:         "Autre",
};

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  ouvert:     { label: "Ouvert",     badge: "bg-yellow-100 text-yellow-800" },
  en_cours:   { label: "En cours",   badge: "bg-orange-100 text-orange-800" },
  en_attente: { label: "En attente", badge: "bg-gray-100 text-gray-600" },
  facture:    { label: "Facturé",    badge: "bg-blue-100 text-blue-700" },
  termine:    { label: "Terminé",    badge: "bg-green-100 text-green-700" },
  annule:     { label: "Annulé",     badge: "bg-red-50 text-red-500" },
};

const RAPPORT_TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  maintenance:  { label: "CM",          badge: "bg-blue-100 text-blue-700" },
  intervention: { label: "Intervention",badge: "bg-purple-100 text-purple-700" },
  visite:       { label: "VT",          badge: "bg-teal-100 text-teal-700" },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = dateStr.split("T")[0].split("-");
  if (d.length < 3) return dateStr;
  return `${d[2]}/${d[1]}/${d[0]}`;
}

// ── Types locaux ───────────────────────────────────────────────────────────

type ClientJoin = {
  id: string;
  nom: string;
  telephone: string | null;
  mail: string | null;
} | null;

type SiteJoin = {
  id: string;
  nom: string;
  adresse: string | null;
} | null;

type RapportJoin = {
  id: string;
  numero_cm: string;
  date_intervention: string;
  type_rapport: string | null;
  statut: string;
  archived_at: string | null;
};

type DossierDetail = {
  id: string;
  reference: string;
  titre: string | null;
  type_dossier: string;
  statut: string;
  date_ouverture: string;
  date_cloture: string | null;
  description: string | null;
  notes: string | null;
  note_attente: string | null;
  montant_total_ht: number | null;
  facture_statut: string;
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  reglement_date: string | null;
  reglement_mode: string | null;
  offert: boolean;
  client: ClientJoin | ClientJoin[];
  site: SiteJoin | SiteJoin[];
  rapports: RapportJoin[];
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RDV du dossier (toutes statuts, triés par date)
  const { data: rawRdvs } = await supabase
    .from("rdvs")
    .select("id, date_rdv, duree_minutes, type_rdv, statut, notes")
    .eq("dossier_id", id)
    .order("date_rdv");

  const rdvs: RdvSimple[] = (rawRdvs ?? []).map((r) => ({
    id: r.id,
    date_rdv: r.date_rdv,
    duree_minutes: r.duree_minutes,
    type_rdv: r.type_rdv,
    statut: r.statut,
    notes: r.notes,
  }));

  const { data: rawDossier } = await supabase
    .from("dossiers")
    .select(`
      id,
      reference,
      titre,
      type_dossier,
      statut,
      date_ouverture,
      date_cloture,
      description,
      notes,
      note_attente,
      montant_total_ht,
      facture_statut,
      facture_numero,
      facture_date,
      facture_montant_ttc,
      reglement_date,
      reglement_mode,
      offert,
      client:clients(id, nom, telephone, mail),
      site:sites(id, nom, adresse),
      rapports(
        id,
        numero_cm,
        date_intervention,
        type_rapport,
        statut,
        archived_at
      )
    `)
    .eq("id", id)
    .single();

  if (!rawDossier) notFound();

  const dossier = rawDossier as unknown as DossierDetail;

  // Rapports disponibles à rattacher (pas dans ce dossier, non archivés)
  type RapportDispoRow = {
    id: string;
    numero_cm: string;
    type_rapport: string | null;
    dossier_id: string | null;
    dossier: { reference: string } | { reference: string }[] | null;
    client: { nom: string } | { nom: string }[] | null;
    site: { nom: string } | { nom: string }[] | null;
  };
  const { data: rawRapportsDispo } = await supabase
    .from("rapports")
    .select("id, numero_cm, type_rapport, dossier_id, dossier:dossiers(reference), client:clients(nom), site:sites(nom)")
    .is("archived_at", null)
    .or(`dossier_id.is.null,dossier_id.neq.${id}`)
    .order("numero_cm", { ascending: false });

  const rapportsDispo: RapportChoix[] = (rawRapportsDispo ?? []).map((r) => {
    const raw = r as unknown as RapportDispoRow;
    const clientNom = Array.isArray(raw.client)
      ? (raw.client[0]?.nom ?? "—")
      : (raw.client?.nom ?? "—");
    const siteNom = Array.isArray(raw.site)
      ? (raw.site[0]?.nom ?? null)
      : (raw.site?.nom ?? null);
    const currentDossierRef = Array.isArray(raw.dossier)
      ? (raw.dossier[0]?.reference ?? null)
      : (raw.dossier?.reference ?? null);
    return {
      id: raw.id,
      numero_cm: raw.numero_cm,
      clientNom,
      siteNom,
      typeRapport: raw.type_rapport ?? "maintenance",
      currentDossierId: raw.dossier_id,
      currentDossierRef,
    };
  });

  // Normalise FK joins
  const client = (
    Array.isArray(dossier.client) ? dossier.client[0] : dossier.client
  ) as ClientJoin;
  const site = (
    Array.isArray(dossier.site) ? dossier.site[0] : dossier.site
  ) as SiteJoin;
  const rapports: RapportJoin[] = Array.isArray(dossier.rapports)
    ? dossier.rapports
    : [];
  const rapportsActifs = rapports.filter((r) => !r.archived_at);
  const rapportsArchives = rapports.filter((r) => r.archived_at);

  const statutCfg =
    STATUT_CONFIG[dossier.statut] ??
    ({ label: dossier.statut, badge: "bg-gray-100 text-gray-600" } as const);

  return (
    <div>
      {/* ── Fil d'Ariane ──────────────────────────────────────────────── */}
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:underline">
          Dossiers
        </Link>
        <span>/</span>
        <span>{dossier.reference}</span>
      </div>

      {/* ── En-tête ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {dossier.titre ??
              TYPE_LABELS[dossier.type_dossier] ??
              dossier.type_dossier}
          </h1>
          <p className="text-sm text-muted">
            {dossier.reference} · Ouvert le {formatDate(dossier.date_ouverture)}
            {dossier.date_cloture && (
              <> · Clôturé le {formatDate(dossier.date_cloture)}</>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${statutCfg.badge}`}
          >
            {statutCfg.label}
          </span>
          <DossierStatutActions
            dossierId={dossier.id}
            statut={dossier.statut}
            noteAttente={dossier.note_attente}
          />
        </div>
      </div>

      {/* ── Infos principales ─────────────────────────────────────────── */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {/* Client / Site */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase text-muted">
            Client &amp; Site
          </h2>
          {client ? (
            <div className="mb-3">
              <Link
                href={`/clients/${client.id}`}
                className="font-semibold text-primary hover:underline"
              >
                {client.nom}
              </Link>
              {client.telephone && (
                <p className="mt-0.5 text-sm text-muted">{client.telephone}</p>
              )}
              {client.mail && (
                <p className="text-sm text-muted">{client.mail}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun client</p>
          )}
          {site && (
            <div className="border-t border-border/50 pt-3">
              <p className="text-sm font-medium">{site.nom}</p>
              {site.adresse && (
                <p className="text-sm text-muted">{site.adresse}</p>
              )}
            </div>
          )}
        </div>

        {/* Détails dossier */}
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase text-muted">
            Détails
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-muted">Type</dt>
              <dd className="text-sm font-medium">
                {TYPE_LABELS[dossier.type_dossier] ?? dossier.type_dossier}
              </dd>
            </div>
            {dossier.description && (
              <div>
                <dt className="text-sm text-muted">Description</dt>
                <dd className="mt-1 text-sm">{dossier.description}</dd>
              </div>
            )}
            {dossier.notes && (
              <div>
                <dt className="text-sm text-muted">Notes</dt>
                <dd className="mt-1 text-sm text-muted">{dossier.notes}</dd>
              </div>
            )}
            {dossier.montant_total_ht != null && (
              <div className="flex justify-between border-t border-border/50 pt-2">
                <dt className="text-sm text-muted">Montant HT</dt>
                <dd className="text-sm font-semibold">
                  {dossier.montant_total_ht.toLocaleString("fr-FR")} CFP
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* ── Rapports ──────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">
            Rapports{" "}
            <span className="ml-1 text-sm font-normal text-muted">
              ({rapportsActifs.length})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <AjouterRapportButton
              dossierId={dossier.id}
              rapports={rapportsDispo}
            />
            <Link
              href={`/rapports/nouveau?dossier_id=${dossier.id}`}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-light"
            >
              + Rapport
            </Link>
          </div>
        </div>

        {rapportsActifs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted">
              Aucun rapport dans ce dossier.
            </p>
            <Link
              href={`/rapports/nouveau?dossier_id=${dossier.id}`}
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Créer le premier rapport →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rapportsActifs.map((r) => {
              const rCfg =
                RAPPORT_TYPE_CONFIG[r.type_rapport ?? ""] ??
                ({
                  label: r.type_rapport ?? "Rapport",
                  badge: "bg-gray-100 text-gray-600",
                } as const);
              return (
                <Link
                  key={r.id}
                  href={`/rapports/${r.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 hover:shadow-sm transition-all"
                >
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${rCfg.badge}`}
                  >
                    {rCfg.label}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {r.numero_cm}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(r.date_intervention)}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      r.statut === "finalise"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.statut === "finalise" ? "Finalisé" : "Brouillon"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {rapportsArchives.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            + {rapportsArchives.length} rapport
            {rapportsArchives.length > 1 ? "s" : ""} archivé
            {rapportsArchives.length > 1 ? "s" : ""} —{" "}
            <Link href="/rapports?archive=1" className="hover:underline">
              voir dans Rapports
            </Link>
          </p>
        )}
      </div>

      {/* ── RDV ───────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <DossierRdvSection
          dossierId={dossier.id}
          lockedDossier={{
            id: dossier.id,
            reference: dossier.reference,
            clientNom: client?.nom ?? "—",
            siteNom: site?.nom ?? null,
          } satisfies DossierOption}
          rdvs={rdvs}
        />
      </div>

      {/* ── Facturation ───────────────────────────────────────────────── */}
      <div className="mb-4">
        <FacturationSection
          dossierId={dossier.id}
          statut={dossier.statut}
          facturation={{
            facture_statut: (dossier.facture_statut || "non_facture") as FacturationStatut,
            facture_numero: dossier.facture_numero,
            facture_date: dossier.facture_date,
            facture_montant_ttc: dossier.facture_montant_ttc,
            reglement_date: dossier.reglement_date,
            reglement_mode: (dossier.reglement_mode as ReglementMode | null),
            offert: dossier.offert ?? false,
          }}
        />
      </div>

      {/* ── Zone danger ─────────────────────────────────────────────────── */}
      <div className="mt-8 flex justify-center border-t border-border/50 pt-6">
        <DeleteDossierButton
          dossierId={dossier.id}
          dossierReference={dossier.reference}
        />
      </div>
    </div>
  );
}
