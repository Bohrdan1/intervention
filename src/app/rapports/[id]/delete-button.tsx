"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRapport } from "./actions";

export function DeleteButton({
  rapportId,
  isFinalise = false,
}: {
  rapportId: string;
  isFinalise?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "confirm2">("idle");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteRapport(rapportId);
    router.push("/");
  }

  function handleFirstClick() {
    if (isFinalise) {
      setStep("confirm");
    } else {
      setStep("confirm");
    }
  }

  function handleConfirm() {
    if (isFinalise) {
      // Double confirmation pour les rapports finalisés
      setStep("confirm2");
    } else {
      handleDelete();
    }
  }

  if (step === "confirm2") {
    return (
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-800 mb-1">
          ⚠️ Suppression définitive
        </p>
        <p className="text-xs text-red-700 mb-3">
          Ce rapport est finalisé. Cette action est irréversible et supprimera
          toutes les données, photos et contrôles associés.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Suppression..." : "Supprimer définitivement"}
          </button>
          <button
            onClick={() => setStep("idle")}
            disabled={deleting}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Suppression..." : "Confirmer la suppression"}
        </button>
        <button
          onClick={() => setStep("idle")}
          disabled={deleting}
          className="rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleFirstClick}
      className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      🗑 Supprimer le rapport
    </button>
  );
}
