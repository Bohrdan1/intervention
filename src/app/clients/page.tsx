import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ClientSearch } from "./client-search";
import { TypePorteSelect } from "./type-porte-select";
import { InstallationEditItem } from "./installation-edit-item";
import { SiteEditItem } from "./site-edit-item";
import { ClientEditHeader } from "./client-edit-header";
import { DEFAULT_POINTS_CONTROLE, DEFAULT_POINTS_ERP, DEFAULT_CONSTAT } from "@/lib/types";

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

  async function updateClient(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const nom = formData.get("nom") as string;
    const sous_titre = formData.get("sous_titre") as string;
    if (!id || !nom?.trim()) return;
    await supabase.from("clients").update({
      nom: nom.trim(),
      sous_titre: sous_titre?.trim() || null,
    }).eq("id", id);
    revalidatePath("/clients");
  }

  async function deleteSite(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    await supabase.from("sites").delete().eq("id", id);
    revalidatePath("/clients");
  }

  async function updateSite(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const nom = formData.get("nom") as string;
    const adresse = formData.get("adresse") as string;
    if (!id || !nom?.trim()) return;
    await supabase.from("sites").update({
      nom: nom.trim(),
      adresse: adresse?.trim() || null,
    }).eq("id", id);
    revalidatePath("/clients");
  }

  async function deleteInstallation(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    await supabase.from("installations").delete().eq("id", id);
    revalidatePath("/clients");
  }

  async function updateInstallation(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const repere = formData.get("repere") as string;
    const type_porte = formData.get("type_porte") as string;
    const modele = formData.get("modele") as string;
    if (!id || !repere?.trim()) return;
    await supabase.from("installations").update({
      repere: repere.trim(),
      type_porte: type_porte?.trim() || "coulissante deux vantaux",
      modele: modele?.trim() || null,
    }).eq("id", id);
    revalidatePath("/clients");
  }

  async function createQuickRapport(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const client_id = formData.get("client_id") as string;
    const site_id = formData.get("site_id") as string;
    const type_rapport = formData.get("type_rapport") as string;
    const installation_id = formData.get("installation_id") as string | null;
    if (!client_id || !site_id) return;

    const dateStr = new Date().toISOString().split("T")[0];
    let numero: string;

    if (type_rapport === "maintenance") {
      const currentYear = new Date().getFullYear();
      const { data: existing } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `CM ${currentYear}/%`);
      let nextNum = 1;
      if (existing && existing.length > 0) {
        const nums = existing.map((r) => {
          const parts = r.numero_cm.replace("CM ", "").split("/");
          return parseInt(parts[1]) || 0;
        });
        nextNum = Math.max(...nums) + 1;
      }
      numero = `CM ${currentYear}/${nextNum}`;
    } else if (type_rapport === "visite") {
      const datePart = dateStr.replace(/-/g, "");
      const { data: existing } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `VT-${datePart}%`);
      numero = existing && existing.length > 0
        ? `VT-${datePart}-${existing.length + 1}`
        : `VT-${datePart}`;
    } else {
      const datePart = dateStr.replace(/-/g, "");
      const { data: existing } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `INT-${datePart}%`);
      numero = existing && existing.length > 0
        ? `INT-${datePart}-${existing.length + 1}`
        : `INT-${datePart}`;
    }

    const { data: rapport, error } = await supabase
      .from("rapports")
      .insert({
        numero_cm: numero,
        type_rapport,
        date_intervention: dateStr,
        client_id,
        site_id,
        constat_general: type_rapport === "maintenance" ? DEFAULT_CONSTAT : [],
        ...(installation_id ? { installation_id } : {}),
      })
      .select()
      .single();

    if (error || !rapport) return;

    if (type_rapport === "maintenance") {
      // Récupérer toutes les portes du site
      const { data: installations } = await supabase
        .from("installations")
        .select("id")
        .eq("site_id", site_id);

      if (installations && installations.length > 0) {
        const controles = installations.map((inst, index) => ({
          rapport_id: rapport.id,
          installation_id: inst.id,
          page_number: index + 1,
          points_controle: DEFAULT_POINTS_CONTROLE,
          points_erp: DEFAULT_POINTS_ERP,
        }));
        await supabase.from("controles").insert(controles);
      }
      redirect(`/rapports/${rapport.id}/controle`);
    } else if (type_rapport === "visite") {
      redirect(`/rapports/${rapport.id}/visite`);
    } else {
      redirect(`/rapports/${rapport.id}/intervention`);
    }
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
              <ClientEditHeader
                client={client}
                updateAction={updateClient}
                deleteAction={deleteClient}
              />

              {/* Sites */}
              <div className="p-4 space-y-3">
                {client.sites?.map((site: { id: string; nom: string; adresse?: string | null; installations?: { id: string; repere: string; type_porte: string; modele: string | null }[] }) => (
                  <SiteEditItem
                    key={site.id}
                    site={site}
                    clientId={client.id}
                    updateAction={updateSite}
                    deleteSiteAction={deleteSite}
                    createRapportAction={createQuickRapport}
                    addInstallationAction={createInstallation}
                    addInstallationForm={
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
                    }
                  >
                    {site.installations?.map((inst: { id: string; repere: string; type_porte: string; modele: string | null }) => (
                      <InstallationEditItem
                        key={inst.id}
                        inst={inst}
                        clientId={client.id}
                        siteId={site.id}
                        updateAction={updateInstallation}
                        deleteAction={deleteInstallation}
                        createRapportAction={createQuickRapport}
                      />
                    ))}
                  </SiteEditItem>
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
