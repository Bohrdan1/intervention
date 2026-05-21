"use client";

import { useState } from "react";
import { DossierCard, type DossierRow } from "./DossierCard";

// ── Types ──────────────────────────────────────────────────────────────────

type TypeFilter =
  | "all"
  | "contrat"
  | "visite"
  | "maintenance"
  | "installation"
  | "remplacement"
  | "intervention"
  | "autre";

type StatutFilter = "all" | "ouvert" | "en_cours" | "en_attente";

const TYPE_LABELS: Record<TypeFilter, string> = {
  all:           "Tous",
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
};

// ── Component ──────────────────────────────────────────────────────────────

export function DossierFilters({ dossiers }: { dossiers: DossierRow[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [showTermine, setShowTermine] = useState(false);

  // Types present in this dataset (skip "all" guard), preserve order
  const typeOrder: TypeFilter[] = [
    "contrat", "visite", "maintenance",
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

  // Colonne droite — facturés en attente de règlement (toujours affichés)
  const facturesColonne = dossiers.filter((d) => d.statut === "facture");
  // Colonne gauche — résultat filtré sans les facturés
  const filteredGauche = filtered.filter((d) => d.statut !== "facture");

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
        {(["all", "ouvert", "en_cours", "en_attente"] as StatutFilter[]).map(
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
          {filteredGauche.length} dossier{filteredGauche.length !== 1 ? "s" : ""}
          {!showTermine && ` actif${filteredGauche.length !== 1 ? "s" : ""}`}
          {typeFilter !== "all" && ` · ${TYPE_LABELS[typeFilter]}`}
          {statutFilter !== "all" && ` · ${STATUT_LABELS[statutFilter]}`}
        </p>
      )}
      {typeFilter === "all" && statutFilter === "all" && !showTermine && (
        <p className="text-xs text-muted mb-3">
          {nbActifs} dossier{nbActifs !== 1 ? "s" : ""} actif{nbActifs !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Deux colonnes ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">

        {/* Colonne gauche — dossiers actifs filtrés hors facturés */}
        <div className="flex-1 min-w-0 space-y-3">
          {filteredGauche.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted">Aucun dossier pour ce filtre.</p>
            </div>
          ) : (
            filteredGauche.map((d) => <DossierCard key={d.id} dossier={d} />)
          )}
        </div>

        {/* Colonne droite — facturés en attente de règlement */}
        {facturesColonne.length > 0 && (
          <div className="w-full sm:w-72 shrink-0 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-700">
                💰 En attente de règlement
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {facturesColonne.length}
              </span>
            </div>
            {facturesColonne.map((d) => (
              <DossierCard key={d.id} dossier={d} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
