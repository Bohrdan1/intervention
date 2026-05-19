"use client";

import { useTransition, useState } from "react";
import {
  setDossierEnAttente,
  setDossierAnnule,
  setDossierReouvert,
} from "@/app/actions/dossiers";

interface Props {
  dossierId: string;
  statut: string;
  noteAttente: string | null;
}

export function DossierStatutActions({ dossierId, statut, noteAttente }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showAttente, setShowAttente] = useState(false);
  const [noteInput, setNoteInput] = useState(noteAttente ?? "");
  const [confirmAnnuler, setConfirmAnnuler] = useState(false);

  // Dossier annulé → rien à afficher
  if (statut === "annulé") return null;

  function handleEnAttente() {
    startTransition(async () => {
      await setDossierEnAttente(dossierId, noteInput.trim() || null);
      setShowAttente(false);
    });
  }

  function handleReouvert() {
    startTransition(async () => {
      await setDossierReouvert(dossierId);
    });
  }

  function handleAnnuler() {
    startTransition(async () => {
      await setDossierAnnule(dossierId);
      setConfirmAnnuler(false);
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Dossier en attente : afficher la note + bouton Réouvrir */}
      {statut === "en_attente" && (
        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2">
          {noteAttente && (
            <p className="mb-1.5 text-xs text-amber-800">
              <span className="font-semibold">Note : </span>
              {noteAttente}
            </p>
          )}
          <button
            type="button"
            onClick={handleReouvert}
            disabled={isPending}
            className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isPending ? "…" : "↩ Réouvrir le dossier"}
          </button>
        </div>
      )}

      {/* Pour tout statut sauf en_attente et terminé : proposer mise en attente */}
      {statut !== "en_attente" && statut !== "terminé" && (
        <>
          {showAttente ? (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 space-y-2">
              <label className="block text-xs font-semibold text-amber-800">
                Raison de la mise en attente (optionnel)
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={2}
                placeholder="Ex : En attente de pièce, de retour client…"
                className="w-full rounded border border-amber-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEnAttente}
                  disabled={isPending}
                  className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isPending ? "…" : "⏸ Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAttente(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAttente(true)}
              className="self-start text-xs text-amber-700 hover:underline"
            >
              ⏸ Mettre en attente
            </button>
          )}
        </>
      )}

      {/* Annuler le dossier (sauf si déjà terminé) */}
      {statut !== "terminé" && (
        <>
          {confirmAnnuler ? (
            <div className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-3 py-2">
              <span className="text-xs text-red-700">Annuler ce dossier ?</span>
              <button
                type="button"
                onClick={handleAnnuler}
                disabled={isPending}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "…" : "Confirmer"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmAnnuler(false)}
                className="text-xs text-muted hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmAnnuler(true)}
              className="self-start text-xs text-danger hover:underline"
            >
              × Annuler le dossier
            </button>
          )}
        </>
      )}
    </div>
  );
}
