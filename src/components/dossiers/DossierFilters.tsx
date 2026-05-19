"use client";

import { useState } from "react";
import { DossierCard, type DossierRow } from "./DossierCard";

// ── Types ──────────────────────────────────────────────────────────────────

type TypeFilter =
  | "all"
  | "urgent"
  | "contrat"
  | "visite"
  | "maintenance"
  | "installation"
  | "remplacement"
  | "intervention"
  | "autre";

type StatutFilter = "all" | "ouvert" | "en_cours" | "en_attente" | "facture";

const TYPE_LABELS: Record<TypeFilter, string> = {
  all:           "Tous",
  urgent:        "Urgents",
  contrat:       "Contrats",
  visite:        "Visites",
  maintenance:   "Maintenance",
  installation:  "Installations",
  remplacement:  "Remplacement",
  intervention:  "Interventions",
  autre:         "Autres",
};

const STATUT_LABELS: Record<StatutFilter, string> = {
  all:        "Tous statuts",
  ouvert:     "Ouvert",
  en_cours:   "En cours",
  en_attente: "En attente",
  facture:    "Facturé",
};

// ── Component ──────────────────────────────────────────────────────────────

export function DossierFilters({ dossiers }: { dossiers: DossierRow[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [showTermine, setShowTermine] = useState(false);

  // Types present in this dataset (skip "all" guard), preserve order
  const typeOrder: TypeFilter[] = [
    "urgent", "contrat", "visite", "maintenance",
    "installation", "remplacement", "intervention", "autre",
  ];
  const presentTypes = typeOrder.filter((t) =>
    dossiers.some((d) => d.type_dossier === t)
  );

  // ── Filtering ──────────────────────────────────────────────────────────
  let filtered = dossiers;

  if (!showTermine) {
    filtered = filtered.filter(
      (d) => d.statut !== "termine" && d.statut !== "annule"
    );
  }
  if (typeFilter !== "all") {
    filtered = filtered.filter((d) => d.type_dossier === typeFilter);
  }
  if (statutFilter !== "all") {
    filtered = filtered.filter((d) => d.statut === statutFilter);
  }

  // Stats for display
  const nbActifs = dossiers.filter(
    (d) => d.statut !== "termine" && d.statut !== "annule"
  ).length;
  const nbTermines = dossiers.filter(
    (d) => d.statut === "termine" || d.statut === "annule"
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Filtres types ─────────────────────────────────────────────── */}
      {presentTypes.length > 1 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              typeFilter === "all"
                ? "bg-primary text-white"
                : "border border-border bg-white text-muted hover:bg-slate-50"
            }`}
          >
            {TYPE_LABELS.all}
          </button>
          {presentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                typeFilter === t
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:bg-slate-50"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* ── Filtres statut + toggle terminés ──────────────────────────── */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {(["all", "ouvert", "en_cours", "en_attente", "facture"] as StatutFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                statutFilter === s
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:bg-slate-50"
              }`}
            >
              {STATUT_LABELS[s]}
            </button>
          )
        )}

        {nbTermines > 0 && (
          <button
            onClick={() => setShowTermine((v) => !v)}
            className={`ml-auto rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
              showTermine
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-border bg-white text-muted hover:bg-slate-50"
            }`}
          >
            {showTermine
              ? `Masquer terminés (${nbTermines})`
              : `+ Afficher terminés (${nbTermines})`}
          </button>
        )}
      </div>

      {/* ── Compteur ──────────────────────────────────────────────────── */}
      {(typeFilter !== "all" || statutFilter !== "all" || showTermine) && (
        <p className="text-xs text-muted mb-3">
          {filtered.length} dossier{filtered.length !== 1 ? "s" : ""}
          {!showTermine && ` actif${filtered.length !== 1 ? "s" : ""}`}
          {typeFilter !== "all" && ` · ${TYPE_LABELS[typeFilter]}`}
          {statutFilter !== "all" && ` · ${STATUT_LABELS[statutFilter]}`}
        </p>
      )}
      {typeFilter === "all" && statutFilter === "all" && !showTermine && (
        <p className="text-xs text-muted mb-3">
          {nbActifs} dossier{nbActifs !== 1 ? "s" : ""} actif{nbActifs !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Liste ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">Aucun dossier pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((d) => (
            <DossierCard key={d.id} dossier={d} />
          ))}
        </div>
      )}
    </div>
  );
}
