import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClientSearch } from "./client-search";
import { TypePorteSelect } from "./type-porte-select";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select(`
      *,
      sites(
        *,
        installations(*)
      )
    `)
    .order("nom");

  if (q?.trim()) {
    query = query.ilike("nom", `%${q.trim()}%`);
  }

  const { data: clients } = await query;

  // ── Actions serveur ──

  async function createClient_action(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const nom = formData.get("nom") as string;
    const sous_titre = formData.get("sous_titre") as string;
    if (!nom?.trim()) return;
    await supabase.from("clients").insert({ nom: nom.trim(), sous_titre: sous_titre?.trim() || null });
    revalidatePath("/clients");
  }

  async function createSite(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const client_id = formData.get("client_id") as string;
    const nom = formData.get("nom") as string;
    if (!nom?.trim() || !client_id) return;
    await supabase.from("sites").insert({ client_id, nom: nom.trim() });
    revalidatePath("/clients");
  }

  async function createInstallation(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const site_id = formData.get("site_id") as string;
    const repere = formData.get("repere") as string;
    const type_porte = formData.get("type_porte") as string;
    const modele = formData.get("modele") as string;
    if (!repere?.trim() || !site_id) return;
    await supabase.from("installations").insert({
      site_id,
      repere: repere.trim(),
      type_porte: type_porte?.trim() || "coulissante deux vantaux",
      modele: modele?.trim() || null,
    });
    revalidatePath("/clients");
  }

  async function deleteClient(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    await supabase.from("clients").delete().eq("id", id);
    revalidatePath("/clients");
  }

  async function deleteSite(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    await supabase.from("sites").delete().eq("id", id);
    revalidatePath("/clients");
  }

  async function deleteInstallation(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    await supabase.from("installations").delete().eq("id", id);
    revalidatePath("/clients");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clients & Sites</h1>
        <p className="text-sm text-muted">Gérez vos clients, sites et installations</p>
      </div>

      {/* Recherche */}
      <ClientSearch initialQuery={q || ""} />

      {/* Formulaire ajout client */}
      <form action={createClient_action} className="mb-8 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-muted mb-3">Nouveau client</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="nom"
            placeholder="Nom du client (ex: SOCIETE D'EXPLOITATION DU PK6)"
            required
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            name="sous_titre"
            placeholder="Sous-titre (ex: Casino Les Halles + Vinothèque)"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            Ajouter
          </button>
        </div>
      </form>

      {/* Liste clients */}
      {!clients || clients.length === 0 ? (
        <p className="text-center text-muted py-8">
          {q ? `Aucun client trouvé pour "${q}"` : "Aucun client enregistré"}
        </p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="rounded-xl border border-border bg-white shadow-sm">
              {/* Client header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-bold">{client.nom}</h3>
                  {client.sous_titre && (
                    <p className="text-xs text-muted">{client.sous_titre}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/rapports/nouveau?client_id=${client.id}&type=maintenance`}
                    className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    title="Nouvelle maintenance"
                  >
                    🔧
                  </Link>
                  <Link
                    href={`/rapports/nouveau?client_id=${client.id}&type=intervention`}
                    className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                    title="Nouvelle intervention"
                  >
                    ⚡
                  </Link>
                  <form action={deleteClient}>
                    <input type="hidden" name="id" value={client.id} />
                    <button type="submit" className="text-xs text-danger hover:underline">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>

              {/* Sites */}
              <div className="p-4 space-y-3">
                {client.sites?.map((site: any) => (
                  <div key={site.id} className="rounded-lg border border-border p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">📍 {site.nom}</h4>
                      <form action={deleteSite}>
                        <input type="hidden" name="id" value={site.id} />
                        <button type="submit" className="text-xs text-danger hover:underline">×</button>
                      </form>
                    </div>

                    {/* Installations */}
                    {site.installations?.map((inst: any) => (
                      <div key={inst.id} className="ml-4 flex items-center justify-between border-b border-border py-1.5 last:border-0">
                        <span className="text-sm">
                          🚪 {inst.repere}
                          <span className="text-xs text-muted ml-1">
                            ({inst.type_porte}{inst.modele ? ` - ${inst.modele}` : ""})
                          </span>
                        </span>
                        <form action={deleteInstallation}>
                          <input type="hidden" name="id" value={inst.id} />
                          <button type="submit" className="text-xs text-danger hover:underline">×</button>
                        </form>
                      </div>
                    ))}

                    {/* Ajout installation */}
                    <form action={createInstallation} className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="site_id" value={site.id} />
                      <input
                        name="repere"
                        placeholder="Repère (ex: Porte entrée)"
                        required
                        className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                      />
                      <TypePorteSelect />
                      <input
                        name="modele"
                        placeholder="Modèle (ex: SOFTICA)"
                        className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded bg-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-600"
                      >
                        + Porte
                      </button>
                    </form>
                  </div>
                ))}

                {/* Ajout site */}
                <form action={createSite} className="flex gap-2">
                  <input type="hidden" name="client_id" value={client.id} />
                  <input
                    name="nom"
                    placeholder="Nom du site (ex: Casino Les Halles)"
                    required
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    + Site
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
