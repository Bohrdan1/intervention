"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rattacherRapportDossier } from "@/app/actions/rapports";

// ── Types ──────────────────────────────────────────────────────────────────

export type RapportChoix = {
  id: string;
  numero_cm: string;
  clientNom: string;
  siteNom: string | null;
  typeRapport: string;
  currentDossierId: string | null;
  currentDossierRef: string | null;
};

const TYPE_RAPPORT_LABELS: Record<string, string> = {
  maintenance:  "CM",
  intervention: "Intervention",
  visite:       "VT",
};

type Props = {
  dossierId: string;
  rapports: RapportChoix[];
  open: boolean;
  onClose: () => void;
};

// ── Component ──────────────────────────────────────────────────────────────

export function AjouterRapportModal({
  dossierId,
  rapports,
  open,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset quand le modal s'ouvre (ajustement d'état pendant le rendu)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSelectedId("");
  }

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

  const selected = rapports.find((r) => r.id === selectedId) ?? null;

  function handleAjouter() {
    if (!selectedId) return;
    startTransition(async () => {
      await rattacherRapportDossier(
        selectedId,
        dossierId,
        selected?.currentDossierId ?? null
      );
      router.refresh();
      onClose();
    });
  }

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
          <h2 className="text-base font-semibold">Ajouter un rapport existant</h2>
          <p className="mt-1 text-sm text-muted">
            Rattacher un rapport existant à ce dossier.
          </p>
        </div>

        {/* Select */}
        <div className="px-6 pb-5">
          {rapports.length === 0 ? (
            <p className="text-sm text-muted py-2">
              Aucun rapport disponible à rattacher.
            </p>
          ) : (
            <>
              <label htmlFor="rapport-select" className="mb-2 block text-sm font-medium">
                Rapport
              </label>
              <select
                id="rapport-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] disabled:opacity-60"
              >
                <option value="">Sélectionner un rapport…</option>
                {rapports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.numero_cm} — {r.clientNom}
                    {r.siteNom ? ` — ${r.siteNom}` : ""}{" "}
                    ({TYPE_RAPPORT_LABELS[r.typeRapport] ?? r.typeRapport})
                  </option>
                ))}
              </select>

              {/* Avertissement si rapport déjà dans un autre dossier */}
              {selected?.currentDossierRef && (
                <p className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                  ⚠️ Ce rapport est actuellement dans le dossier{" "}
                  <strong>{selected.currentDossierRef}</strong>. Il sera déplacé.
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-border px-6 py-4">
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
            onClick={handleAjouter}
            disabled={isPending || !selectedId}
            className="flex-1 min-h-[44px] rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {isPending ? "Ajout…" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
