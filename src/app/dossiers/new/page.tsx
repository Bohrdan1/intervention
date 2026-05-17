import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NouveauDossierPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, nom, sites(id, nom)")
    .order("nom");

  // ── Server Action ─────────────────────────────────────────────────────────
  async function creerDossier(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const type_dossier = (formData.get("type_dossier") as string) || "autre";
    const client_id = formData.get("client_id") as string;
    const site_id = (formData.get("site_id") as string) || null;
    const titre = (formData.get("titre") as string) || null;
    const description = (formData.get("description") as string) || null;

    if (!client_id) return;

    // Générer référence D-YYYY-NNN
    const year = new Date().getFullYear();
    const { data: existing } = await supabase
      .from("dossiers")
      .select("reference")
      .like("reference", `D-${year}-%`);

    let nextNum = 1;
    if (existing && existing.length > 0) {
      const nums = existing.map((d) => {
        const parts = d.reference.split("-");
        return parseInt(parts[2] ?? "0", 10) || 0;
      });
      nextNum = Math.max(...nums) + 1;
    }
    const reference = `D-${year}-${String(nextNum).padStart(3, "0")}`;

    const { data: dossier, error } = await supabase
      .from("dossiers")
      .insert({
        reference,
        type_dossier,
        client_id,
        site_id: site_id || null,
        titre: titre || null,
        description: description || null,
        statut: "ouvert",
        date_ouverture: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (error || !dossier) {
      console.error("Erreur création dossier:", error);
      return;
    }

    redirect(`/dossiers/${dossier.id}`);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
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

      {!clients || clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
          <p className="mb-4 text-4xl">👤</p>
          <h2 className="mb-2 text-lg font-semibold">Aucun client</h2>
          <p className="mb-4 text-sm text-muted">
            Vous devez d&apos;abord créer un client avant d&apos;ouvrir un
            dossier.
          </p>
          <Link
            href="/clients"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            Créer un client
          </Link>
        </div>
      ) : (
        <form action={creerDossier} className="max-w-lg space-y-5">
          {/* Type */}
          <div>
            <label
              htmlFor="type_dossier"
              className="mb-2 block text-sm font-medium"
            >
              Type de dossier <span className="text-red-500">*</span>
            </label>
            <select
              id="type_dossier"
              name="type_dossier"
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="contrat">Contrat de maintenance</option>
              <option value="urgent">Urgent</option>
              <option value="intervention">Intervention</option>
              <option value="installation">Installation</option>
              <option value="remplacement">Remplacement</option>
              <option value="visite">Visite technique</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="titre" className="mb-2 block text-sm font-medium">
              Titre{" "}
              <span className="text-xs font-normal text-muted">(optionnel)</span>
            </label>
            <input
              id="titre"
              name="titre"
              type="text"
              placeholder="ex. Contrat annuel 2026, Panne urgente…"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Client */}
          <div>
            <label
              htmlFor="client_id"
              className="mb-2 block text-sm font-medium"
            >
              Client <span className="text-red-500">*</span>
            </label>
            <select
              id="client_id"
              name="client_id"
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Sélectionner un client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Site */}
          <div>
            <label htmlFor="site_id" className="mb-2 block text-sm font-medium">
              Site{" "}
              <span className="text-xs font-normal text-muted">(optionnel)</span>
            </label>
            <select
              id="site_id"
              name="site_id"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Aucun site spécifique —</option>
              {clients.flatMap((c) =>
                (
                  c.sites as { id: string; nom: string }[] | null ?? []
                ).map((s) => (
                  <option key={s.id} value={s.id}>
                    {c.nom} · {s.nom}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description{" "}
              <span className="text-xs font-normal text-muted">(optionnel)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Contexte, équipements concernés, priorité…"
              className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-md hover:bg-primary-light active:scale-[0.98] transition-all"
          >
            Créer le dossier →
          </button>
        </form>
      )}
    </div>
  );
}
