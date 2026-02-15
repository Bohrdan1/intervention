import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DEFAULT_POINTS_CONTROLE, DEFAULT_POINTS_ERP, DEFAULT_CONSTAT } from "@/lib/types";
import { ClientSiteSelectorClient } from "./client-selector";

export default async function NouveauRapportPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select(`*, sites(*, installations(*))`)
    .order("nom");

  async function creerRapport(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const type_rapport = (formData.get("type_rapport") as string) || "maintenance";
    const client_id = formData.get("client_id") as string;
    const site_id = formData.get("site_id") as string;
    const date_intervention = formData.get("date_intervention") as string;
    const installationIds = formData.getAll("installations") as string[];

    if (!client_id || !site_id) return;
    if (type_rapport === "maintenance" && installationIds.length === 0) return;

    let numero: string;
    const dateStr = (date_intervention || new Date().toISOString().split("T")[0]).replace(/-/g, "");

    if (type_rapport === "maintenance") {
      // Numérotation CM YYYY/N
      const currentYear = new Date().getFullYear();
      const { data: existingRapports } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `CM ${currentYear}/%`);

      let nextNum = 1;
      if (existingRapports && existingRapports.length > 0) {
        const nums = existingRapports.map((r) => {
          const parts = r.numero_cm.replace("CM ", "").split("/");
          return parseInt(parts[1]) || 0;
        });
        nextNum = Math.max(...nums) + 1;
      }
      numero = `CM ${currentYear}/${nextNum}`;
    } else if (type_rapport === "visite") {
      // Numérotation VT-YYYYMMDD(-N)
      const { data: existingVT } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `VT-${dateStr}%`);

      if (existingVT && existingVT.length > 0) {
        numero = `VT-${dateStr}-${existingVT.length + 1}`;
      } else {
        numero = `VT-${dateStr}`;
      }
    } else {
      // Numérotation INT-YYYYMMDD(-N)
      const { data: existingInt } = await supabase
        .from("rapports")
        .select("numero_cm")
        .like("numero_cm", `INT-${dateStr}%`);

      if (existingInt && existingInt.length > 0) {
        numero = `INT-${dateStr}-${existingInt.length + 1}`;
      } else {
        numero = `INT-${dateStr}`;
      }
    }

    // Créer le rapport
    const { data: rapport, error } = await supabase
      .from("rapports")
      .insert({
        numero_cm: numero,
        type_rapport,
        date_intervention: date_intervention || new Date().toISOString().split("T")[0],
        client_id,
        site_id,
        constat_general: type_rapport === "maintenance" ? DEFAULT_CONSTAT : [],
      })
      .select()
      .single();

    if (error || !rapport) {
      console.error("Erreur création rapport:", error);
      return;
    }

    if (type_rapport === "maintenance") {
      // Créer les contrôles (un par porte sélectionnée)
      const controles = installationIds.map((installation_id, index) => ({
        rapport_id: rapport.id,
        installation_id,
        page_number: index + 1,
        points_controle: DEFAULT_POINTS_CONTROLE,
        points_erp: DEFAULT_POINTS_ERP,
      }));

      await supabase.from("controles").insert(controles);
      redirect(`/rapports/${rapport.id}/controle`);
    } else if (type_rapport === "visite") {
      redirect(`/rapports/${rapport.id}/visite`);
    } else {
      redirect(`/rapports/${rapport.id}/intervention`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouveau rapport</h1>

      {!clients || clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
          <p className="text-4xl mb-4">👤</p>
          <h2 className="text-lg font-semibold mb-2">Aucun client</h2>
          <p className="text-sm text-muted mb-4">
            Vous devez d&apos;abord créer un client et ses installations.
          </p>
          <a
            href="/clients"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            Créer un client
          </a>
        </div>
      ) : (
        <form action={creerRapport} className="space-y-6">
          {/* Sélecteur de type */}
          <Suspense fallback={null}>
            <ClientSiteSelectorClient clients={clients} />
          </Suspense>

          {/* Bouton création */}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-md hover:bg-primary-light active:scale-[0.98] transition-all"
          >
            Commencer →
          </button>
        </form>
      )}
    </div>
  );
}
