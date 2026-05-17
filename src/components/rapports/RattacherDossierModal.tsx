"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rattacherRapportDossier, detacherRapportDossier } from "@/app/actions/rapports";

// ── Types ──────────────────────────────────────────────────────────────────

export type DossierChoix = {
  id: string;
  reference: string;
  clientNom: string;
  siteNom: string | null;
  typeDossier: string;
};

const TYPE_LABELS: Record<string, string> = {
  urgent:       "Urgent",
  contrat:      "Contrat",
  visite:       "Visite",
  maintenance:  "Maintenance",
  installation: "Installation",
  remplacement: "Remplacement",
  intervention: "Intervention",
  autre:        "Autre",
};

type Props = {
  rapportId: string;
  currentDossierId: string | null;
  dossiers: DossierChoix[];
  open: boolean;
  onClose: () => void;
};

// ── Component ──────────────────────────────────────────────────────────────

export function RattacherDossierModal({
  rapportId,
  currentDossierId,
  dossiers,
  open,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState(currentDossierId ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset selection quand le modal s'ouvre
  useEffect(() => {
    if (open) setSelectedId(currentDossierId ?? "");
  }, [open, currentDossierId]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isPending, onClose]);

  if (!open) return null;

  function handleRattacher() {
    if (!selectedId) return;
    startTransition(async () => {
      await rattacherRapportDossier(rapportId, selectedId, currentDossierId);
      router.refresh();
      onClose();
    });
  }

  function handleDetacher() {
    startTransition(async () => {
      await detacherRapportDossier(rapportId, currentDossierId);
      router.refresh();
      onClose();
    });
  }

  const changed = selectedId !== (currentDossierId ?? "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold">Rattacher à un dossier</h2>
          <p className="mt-1 text-sm text-muted">
            Associer ce rapport à un dossier existant.
          </p>
        </div>

        {/* Select */}
        <div className="px-6 pb-5">
          <label htmlFor="dossier-select" className="mb-2 block text-sm font-medium">
            Dossier
          </label>
          <select
            id="dossier-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] disabled:opacity-60"
          >
            <option value="">— Aucun dossier —</option>
            {dossiers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.reference} — {d.clientNom}
                {d.siteNom ? ` — ${d.siteNom}` : ""}
                {" "}— {TYPE_LABELS[d.typeDossier] ?? d.typeDossier}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-border px-6 py-4">
          {/* Détacher (si rapport actuellement rattaché) */}
          {currentDossierId && (
            <button
              type="button"
              onClick={handleDetacher}
              disabled={isPending}
              className="min-h-[44px] rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isPending ? "…" : "Détacher"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 min-h-[44px] rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleRattacher}
            disabled={isPending || !selectedId || !changed}
            className="flex-1 min-h-[44px] rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {isPending ? "Enregistrement…" : "Rattacher"}
          </button>
        </div>
      </div>
    </div>
  );
}
