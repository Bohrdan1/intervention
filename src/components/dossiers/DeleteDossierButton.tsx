"use client";

import { useState, useTransition, useEffect } from "react";
import { deleteDossier } from "@/app/actions/dossiers";

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  dossierId: string;
  dossierReference: string;
};

// ── Component ──────────────────────────────────────────────────────────────

export function DeleteDossierButton({ dossierId, dossierReference }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fermer avec Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) setModalOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, isPending]);

  function handleDelete() {
    startTransition(async () => {
      await deleteDossier(dossierId);
      // La redirection est gérée par redirect('/') dans l'action
    });
  }

  return (
    <>
      {/* ── Bouton discret ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="min-h-[44px] px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        Supprimer le dossier
      </button>

      {/* ── Modal de confirmation ────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <span className="text-lg">🗑️</span>
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Supprimer le dossier{" "}
                <span className="text-red-600">{dossierReference}</span>&nbsp;?
              </h2>
            </div>

            {/* Avertissement */}
            <div className="mx-6 mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 space-y-1">
              <p className="font-medium">⚠️ Attention</p>
              <p>
                Cette action supprimera également tous les{" "}
                <strong>RDV</strong> associés à ce dossier.
              </p>
              <p>
                Les <strong>rapports</strong> seront conservés mais{" "}
                détachés du dossier.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isPending}
                className="flex-1 min-h-[44px] rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 min-h-[44px] rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
