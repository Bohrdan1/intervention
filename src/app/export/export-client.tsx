"use client";

import { useState } from "react";

interface Props {
  debutMois: string;
  finMois: string;
  premierRapport: string;
  dernierRapport: string;
  nbFinalise: number;
}

type TypeFiltre = "" | "maintenance" | "intervention" | "visite";

const PRESETS = [
  { label: "Mois en cours", getRange: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    return { from, to };
  }},
  { label: "Mois précédent", getRange: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    return { from, to };
  }},
  { label: "Trimestre en cours", getRange: () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1).toISOString().split("T")[0];
    const to = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split("T")[0];
    return { from, to };
  }},
  { label: "Année en cours", getRange: () => {
    const now = new Date();
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  }},
  { label: "Tout", getRange: () => ({ from: "", to: "" }) },
];

export function ExportClient({
  debutMois,
  finMois,
  premierRapport,
  dernierRapport,
  nbFinalise,
}: Props) {
  const [from, setFrom] = useState(debutMois);
  const [to, setTo] = useState(finMois);
  const [type, setType] = useState<TypeFiltre>("");

  function buildUrl() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (type) params.set("type", type);
    return `/api/export?${params.toString()}`;
  }

  function applyPreset(idx: number) {
    const { from: f, to: t } = PRESETS[idx].getRange();
    setFrom(f);
    setTo(t);
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-2">Format CSV</h2>
        <p className="text-sm text-muted mb-2">
          Le fichier CSV généré est compatible avec Excel (encodage UTF-8 avec BOM, séparateur point-virgule).
          Il contient : numéro, type, date, client, site, technicien, description, montant HT en CFP.
        </p>
        <p className="text-xs text-muted">
          ℹ️ Utilisable directement pour créer des factures dans Facture.net ou importer dans Odoo.
        </p>
      </div>

      {/* Période */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Période</h2>

        {/* Presets rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(i)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Dates personnalisées */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Du</label>
            <input
              type="date"
              value={from}
              min={premierRapport}
              max={to || dernierRapport}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Au</label>
            <input
              type="date"
              value={to}
              min={from || premierRapport}
              max={dernierRapport}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Type de rapport</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            { value: "", label: "Tous" },
            { value: "maintenance", label: "🔧 Maintenance" },
            { value: "intervention", label: "⚡ Intervention" },
            { value: "visite", label: "📐 Visite" },
          ] as { value: TypeFiltre; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                type === opt.value
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Résumé + bouton télécharger */}
      <div className="rounded-xl border border-primary bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">
              {from && to
                ? `${new Date(from + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} → ${new Date(to + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
                : from
                ? `À partir du ${new Date(from + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                : to
                ? `Jusqu&apos;au ${new Date(to + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                : "Tous les rapports"}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {type === "maintenance"
                ? "Maintenances seulement"
                : type === "intervention"
                ? "Interventions seulement"
                : type === "visite"
                ? "Visites techniques seulement"
                : "Tous types"}
              {" · "}Rapports finalisés uniquement
            </p>
          </div>
          <a
            href={buildUrl()}
            download
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          >
            ⬇️ Télécharger CSV
          </a>
        </div>
      </div>

      {/* Instructions Odoo / Facture.net */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Comment utiliser ce fichier</h2>
        <div className="space-y-3 text-sm text-muted">
          <div>
            <p className="font-semibold text-foreground mb-1">📊 Excel / LibreOffice</p>
            <p>Ouvrir le fichier CSV, sélectionner le séparateur &laquo;;&raquo; si demandé. L&apos;encodage UTF-8 est automatiquement détecté.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">🧾 Facture.net</p>
            <p>Créer les factures manuellement en copiant les informations depuis le CSV (numéro, client, description, montant).</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">🔷 Odoo</p>
            <p>Menu <em>Ventes → Importer</em>, ou utiliser le CSV comme référence pour saisir les factures clients dans le module Comptabilité.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
