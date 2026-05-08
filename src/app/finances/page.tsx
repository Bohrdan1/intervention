import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FinancesClient } from "./finances-client";
import { revalidatePath } from "next/cache";

function formatCFP(n: number): string {
  return n.toLocaleString("fr-FR") + " CFP";
}

export default async function FinancesPage() {
  const supabase = await createClient();

  // ── Tous les rapports finalisés avec montant ──
  const { data: rapports } = await supabase
    .from("rapports")
    .select(`
      id,
      numero_cm,
      type_rapport,
      date_intervention,
      montant_ht,
      client:clients(id, nom),
      site:sites(nom)
    `)
    .eq("statut", "finalise")
    .is("archived_at", null)
    .order("date_intervention", { ascending: false });

  // ── Mise à jour montant d'un rapport ──
  async function updateMontant(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const montant = formData.get("montant_ht") as string;
    if (!id) return;
    const val = montant ? parseInt(montant.replace(/\s/g, ""), 10) : null;
    await supabase.from("rapports").update({
      montant_ht: isNaN(val ?? NaN) ? null : val,
    }).eq("id", id);
    revalidatePath("/finances");
  }

  // ── Calculs stats ──
  const anneeEnCours = new Date().getFullYear();
  const moisEnCours = new Date().getMonth(); // 0-based

  const rapportsAvecMontant = (rapports ?? []).filter((r) => r.montant_ht != null);
  const caTotalAnnuel = rapportsAvecMontant
    .filter((r) => new Date(r.date_intervention).getFullYear() === anneeEnCours)
    .reduce((sum, r) => sum + (r.montant_ht ?? 0), 0);

  const caMoisEnCours = rapportsAvecMontant
    .filter((r) => {
      const d = new Date(r.date_intervention);
      return d.getFullYear() === anneeEnCours && d.getMonth() === moisEnCours;
    })
    .reduce((sum, r) => sum + (r.montant_ht ?? 0), 0);

  // CA par mois sur 12 mois
  const mois12: { mois: string; ca: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(anneeEnCours, moisEnCours - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const ca = rapportsAvecMontant
      .filter((r) => {
        const rd = new Date(r.date_intervention);
        return rd.getFullYear() === year && rd.getMonth() === month;
      })
      .reduce((sum, r) => sum + (r.montant_ht ?? 0), 0);
    mois12.push({
      mois: `${year}-${String(month + 1).padStart(2, "0")}`,
      ca,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    });
  }

  // CA par type (année en cours)
  const caParType = ["maintenance", "intervention", "visite"].map((type) => ({
    type,
    ca: rapportsAvecMontant
      .filter(
        (r) =>
          r.type_rapport === type &&
          new Date(r.date_intervention).getFullYear() === anneeEnCours
      )
      .reduce((sum, r) => sum + (r.montant_ht ?? 0), 0),
    count: (rapports ?? []).filter(
      (r) =>
        r.type_rapport === type &&
        new Date(r.date_intervention).getFullYear() === anneeEnCours
    ).length,
  }));

  // Top clients (année en cours)
  const caParClient = new Map<string, { nom: string; ca: number; count: number }>();
  for (const r of rapportsAvecMontant) {
    if (new Date(r.date_intervention).getFullYear() !== anneeEnCours) continue;
    const client = Array.isArray(r.client) ? r.client[0] : r.client;
    if (!client) continue;
    const existing = caParClient.get(client.id) ?? { nom: client.nom, ca: 0, count: 0 };
    caParClient.set(client.id, {
      nom: client.nom,
      ca: existing.ca + (r.montant_ht ?? 0),
      count: existing.count + 1,
    });
  }
  const topClients = [...caParClient.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 5);

  // Rapports sans montant
  const sansMontant = (rapports ?? []).filter((r) => r.montant_ht == null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finances</h1>
          <p className="text-sm text-muted">Chiffre d&apos;affaires en CFP — {anneeEnCours}</p>
        </div>
        <Link
          href={`/export`}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ⬇️ Export CSV
        </Link>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted mb-1">CA mois en cours</p>
          <p className="text-2xl font-black text-primary">
            {caMoisEnCours.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted">CFP HT</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted mb-1">CA {anneeEnCours}</p>
          <p className="text-2xl font-black text-green-600">
            {caTotalAnnuel.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted">CFP HT</p>
        </div>
      </div>

      {/* CA par type */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Par type — {anneeEnCours}</h2>
        <div className="space-y-2">
          {caParType.map(({ type, ca, count }) => {
            const pct = caTotalAnnuel > 0 ? Math.round((ca / caTotalAnnuel) * 100) : 0;
            const colors: Record<string, string> = {
              maintenance: "bg-blue-500",
              intervention: "bg-purple-500",
              visite: "bg-teal-500",
            };
            const labels: Record<string, string> = {
              maintenance: "🔧 Maintenance",
              intervention: "⚡ Intervention",
              visite: "📐 Visite",
            };
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{labels[type]}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{ca.toLocaleString("fr-FR")} CFP</span>
                    <span className="text-xs text-muted ml-2">({count} rapports · {pct}%)</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[type] || "bg-slate-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphique mensuel */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Évolution mensuelle (12 mois)</h2>
        <div className="flex items-end gap-1 h-24">
          {mois12.map(({ mois, ca, label }) => {
            const maxCa = Math.max(...mois12.map((m) => m.ca), 1);
            const height = Math.round((ca / maxCa) * 80);
            const isCurrentMonth = mois === `${anneeEnCours}-${String(moisEnCours + 1).padStart(2, "0")}`;
            return (
              <div key={mois} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative group flex-1 flex items-end w-full">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isCurrentMonth ? "bg-primary" : "bg-blue-200"
                    }`}
                    style={{ height: `${height}px`, minHeight: ca > 0 ? "4px" : "0px" }}
                    title={`${ca.toLocaleString("fr-FR")} CFP`}
                  />
                </div>
                <span className="text-[9px] text-muted text-center leading-tight">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top clients */}
      {topClients.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Top clients — {anneeEnCours}</h2>
          <div className="space-y-2">
            {topClients.map(({ id, nom, ca, count }, rank) => (
              <div key={id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted w-4">{rank + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{nom}</p>
                  <p className="text-xs text-muted">{count} rapport{count > 1 ? "s" : ""}</p>
                </div>
                <span className="text-sm font-semibold text-right shrink-0">
                  {ca.toLocaleString("fr-FR")} CFP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rapports sans montant — saisie rapide */}
      <FinancesClient
        rapports={(rapports ?? []).map((r) => ({
          id: r.id,
          numero_cm: r.numero_cm,
          type_rapport: r.type_rapport,
          date_intervention: r.date_intervention,
          montant_ht: r.montant_ht,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          client_nom: (Array.isArray(r.client) ? (r.client as any)[0]?.nom : (r.client as any)?.nom) ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          site_nom: (Array.isArray(r.site) ? (r.site as any)[0]?.nom : (r.site as any)?.nom) ?? null,
        }))}
        sansMontantCount={sansMontant.length}
        updateMontantAction={updateMontant}
      />
    </div>
  );
}
