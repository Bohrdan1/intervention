import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { NouveauDossierForm } from "@/components/dossiers/NouveauDossierForm";

// ── Types ──────────────────────────────────────────────────────────────────

type SiteRow = { id: string; nom: string };
type ClientRow = { id: string; nom: string; type?: string; sites: SiteRow[] };

// ── Page ───────────────────────────────────────────────────────────────────

export default async function NouveauDossierPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;
  const supabase = await createClient();

  const { data: rawClients } = await supabase
    .from("clients")
    .select("id, nom, type, sites(id, nom)")
    .order("nom");

  // Normalise la jointure sites (reverse FK → toujours un tableau)
  const clients: ClientRow[] = (rawClients ?? []).map((c) => {
    const raw = c as unknown as {
      id: string;
      nom: string;
      type?: string;
      sites: SiteRow[] | null;
    };
    return {
      id: raw.id,
      nom: raw.nom,
      type: raw.type,
      sites: Array.isArray(raw.sites) ? raw.sites : [],
    };
  });

  return (
    <div>
      {/* ── En-tête ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:underline">
            Dossiers
          </Link>
          <span>/</span>
          <span>Nouveau</span>
        </div>
        <h1 className="text-2xl font-bold">Nouveau dossier</h1>
      </div>

      {/* ── Formulaire ────────────────────────────────────────────────── */}
      <NouveauDossierForm clients={clients} preselectedClientId={client_id} />
    </div>
  );
}
