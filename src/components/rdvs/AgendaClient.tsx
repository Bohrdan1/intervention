"use client";

import { useState } from "react";
import { RdvCard } from "./RdvCard";
import { RdvModal } from "./RdvModal";
import { RdvCalendrierSemaine } from "./RdvCalendrierSemaine";
import type { RdvWithDossier, DossierOption } from "./rdv-types";

// ── Types ──────────────────────────────────────────────────────────────────

type View = "liste" | "calendrier";

type Props = {
  rdvs: RdvWithDossier[];
  dossiers: DossierOption[];
};

// ── Component ──────────────────────────────────────────────────────────────

export function AgendaClient({ rdvs, dossiers }: Props) {
  const [view, setView] = useState<View>("liste");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      {/* ── Barre d'outils ──────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between gap-3">
        {/* Toggle vue */}
        <div className="flex rounded-xl border border-border bg-white overflow-hidden">
          <button
            onClick={() => setView("liste")}
            className={`min-h-[44px] px-4 py-2 text-sm font-medium transition-colors ${
              view === "liste"
                ? "bg-primary text-white"
                : "text-muted hover:bg-slate-50"
            }`}
          >
            📋 Liste
          </button>
          <button
            onClick={() => setView("calendrier")}
            className={`min-h-[44px] px-4 py-2 text-sm font-medium transition-colors ${
              view === "calendrier"
                ? "bg-primary text-white"
                : "text-muted hover:bg-slate-50"
            }`}
          >
            📅 Calendrier
          </button>
        </div>

        {/* Nouveau RDV */}
        <button
          onClick={() => setCreateOpen(true)}
          className="min-h-[44px] rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-light active:scale-95 transition-all"
        >
          + Nouveau RDV
        </button>
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────── */}
      {view === "liste" ? (
        rdvs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="font-semibold mb-1">Aucun RDV à venir</p>
            <p className="text-sm text-muted mb-4">
              Créez votre premier RDV depuis un dossier ou ici.
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="min-h-[44px] rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
            >
              + Nouveau RDV
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rdvs.map((rdv) => (
              <RdvCard key={rdv.id} rdv={rdv} dossiers={dossiers} />
            ))}
          </div>
        )
      ) : (
        <RdvCalendrierSemaine rdvs={rdvs} />
      )}

      {/* ── Modal création ──────────────────────────────────────────── */}
      <RdvModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        dossiers={dossiers}
      />
    </div>
  );
}
