import { createClient } from "@/lib/supabase/server";
import { AgendaClient } from "@/components/rdvs/AgendaClient";
import type { RdvWithDossier, DossierOption } from "@/components/rdvs/rdv-types";

// ── Types pour la normalisation ────────────────────────────────────────────

type RawRdv = {
  id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: string;
  statut: string;
  notes: string | null;
  dossier_id: string | null;
  dossier:
    | {
        id: string;
        reference: string;
        client: { nom: string } | { nom: string }[] | null;
        site: { nom: string } | { nom: string }[] | null;
      }
    | {
        id: string;
        reference: string;
        client: { nom: string } | { nom: string }[] | null;
        site: { nom: string } | { nom: string }[] | null;
      }[]
    | null;
};

type RawDossier = {
  id: string;
  reference: string;
  client: { nom: string } | { nom: string }[] | null;
  site: { nom: string } | { nom: string }[] | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function normaliseFK<T>(val: T | T[] | null): T | null {
  if (val === null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function normaliseRdv(raw: RawRdv): RdvWithDossier {
  const dossier = normaliseFK(raw.dossier);
  return {
    id: raw.id,
    date_rdv: raw.date_rdv,
    duree_minutes: raw.duree_minutes,
    type_rdv: raw.type_rdv,
    statut: raw.statut,
    notes: raw.notes,
    dossier_id: raw.dossier_id,
    dossier: dossier
      ? {
          id: dossier.id,
          reference: dossier.reference,
          client: normaliseFK(dossier.client),
          site: normaliseFK(dossier.site),
        }
      : null,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AgendaPage() {
  const supabase = await createClient();

  const maintenant = new Date().toISOString();

  // RDV à venir (non annulés)
  const { data: rawRdvs } = await supabase
    .from("rdvs")
    .select(`
      id,
      date_rdv,
      duree_minutes,
      type_rdv,
      statut,
      notes,
      dossier_id,
      dossier:dossiers(
        id,
        reference,
        client:clients(nom),
        site:sites(nom)
      )
    `)
    .gte("date_rdv", maintenant)
    .neq("statut", "annule")
    .order("date_rdv");

  const rdvs: RdvWithDossier[] = (rawRdvs ?? []).map((r) =>
    normaliseRdv(r as unknown as RawRdv)
  );

  // Dossiers ouverts pour le modal de création
  const { data: rawDossiers } = await supabase
    .from("dossiers")
    .select(`
      id,
      reference,
      client:clients(nom),
      site:sites(nom)
    `)
    .in("statut", ["ouvert", "en_cours", "en_attente"])
    .order("reference");

  const dossiers: DossierOption[] = (rawDossiers ?? []).map((d) => {
    const raw = d as unknown as RawDossier;
    const client = normaliseFK(raw.client);
    const site = normaliseFK(raw.site);
    return {
      id: raw.id,
      reference: raw.reference,
      clientNom: client?.nom ?? "—",
      siteNom: site?.nom ?? null,
    };
  });

  return (
    <div>
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-sm text-muted">
          {rdvs.length} RDV à venir
        </p>
      </div>

      <AgendaClient rdvs={rdvs} dossiers={dossiers} />
    </div>
  );
}
