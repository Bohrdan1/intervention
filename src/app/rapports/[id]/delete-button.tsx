"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRapport } from "./actions";

export function DeleteButton({ rapportId }: { rapportId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteRapport(rapportId);
    router.push("/");
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Suppression..." : "Confirmer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
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
      onClick={() => setConfirming(true)}
      className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      🗑 Supprimer le brouillon
    </button>
  );
}
