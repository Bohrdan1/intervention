import { createClient } from "@/lib/supabase/server";
import { FinancesClient } from "./finances-client";
import type { DossierFacturationRow } from "./finances-client";

// ── Types locaux ───────────────────────────────────────────────────────────

type RawDossierFacturation = {
  id: string;
  reference: string;
  facture_statut: string | null;
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  client: { id: string; nom: string } | { id: string; nom: string }[] | null;
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function FinancesPage() {
  const supabase = await createClient();

  const { data: rawDossiers } = await supabase
    .from("dossiers")
    .select(`
      id,
      reference,
      facture_statut,
      facture_numero,
      facture_date,
      facture_montant_ttc,
      client:clients(id, nom)
    `)
    .order("facture_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const dossiers: DossierFacturationRow[] = (rawDossiers ?? []).map((d) => {
    const raw = d as unknown as RawDossierFacturation;
    const client = Array.isArray(raw.client)
      ? (raw.client[0] ?? null)
      : raw.client;
    return {
      id: raw.id,
      reference: raw.reference,
      facture_statut: raw.facture_statut ?? "non_facture",
      facture_numero: raw.facture_numero,
      facture_date: raw.facture_date,
      facture_montant_ttc: raw.facture_montant_ttc,
      clientId: client?.id ?? null,
      clientNom: client?.nom ?? "—",
    };
  });

  // ── Compteurs ──────────────────────────────────────────────────────────

  const totalFacture = dossiers
    .filter(
      (d) =>
        d.facture_statut !== "non_facture" && d.facture_montant_ttc != null
    )
    .reduce((sum, d) => sum + (d.facture_montant_ttc ?? 0), 0);

  const totalEncaisse = dossiers
    .filter((d) => d.facture_statut === "paye" && d.facture_montant_ttc != null)
    .reduce((sum, d) => sum + (d.facture_montant_ttc ?? 0), 0);

  const enAttente = dossiers
    .filter(
      (d) =>
        (d.facture_statut === "facture" || d.facture_statut === "en_retard") &&
        d.facture_montant_ttc != null
    )
    .reduce((sum, d) => sum + (d.facture_montant_ttc ?? 0), 0);

  const nbEnRetard = dossiers.filter(
    (d) => d.facture_statut === "en_retard"
  ).length;

  return (
    <div>
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finances</h1>
        <p className="text-sm text-muted">
          Suivi facturation — {dossiers.length} dossier
          {dossiers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs text-muted mb-1">Total facturé</p>
          <p className="text-xl font-black text-blue-700">
            {totalFacture.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted">F CFP TTC</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-xs text-muted mb-1">Encaissé</p>
          <p className="text-xl font-black text-green-700">
            {totalEncaisse.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted">F CFP TTC</p>
        </div>
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            nbEnRetard > 0
              ? "border-red-200 bg-red-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <p className="text-xs text-muted mb-1">En attente</p>
          <p
            className={`text-xl font-black ${
              nbEnRetard > 0 ? "text-red-700" : "text-orange-700"
            }`}
          >
            {enAttente.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted">
            F CFP TTC
            {nbEnRetard > 0 && (
              <span className="ml-1 text-red-600 font-semibold">
                · {nbEnRetard} en retard
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Liste filtrée ───────────────────────────────────────────── */}
      <FinancesClient dossiers={dossiers} />
    </div>
  );
}
