"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveRapport, restoreRapport } from "./actions";

export function ArchiveButton({
  rapportId,
  isArchived,
}: {
  rapportId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleArchive() {
    setLoading(true);
    await archiveRapport(rapportId);
    setLoading(false);
    router.push("/");
  }

  async function handleRestore() {
    setLoading(true);
    await restoreRapport(rapportId);
    setLoading(false);
    router.refresh();
  }

  if (isArchived) {
    return (
      <button
        onClick={handleRestore}
        disabled={loading}
        className="w-full rounded-xl border border-amber-300 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        {loading ? "Restauration..." : "↩ Restaurer le rapport"}
      </button>
    );
  }

  if (confirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleArchive}
          disabled={loading}
          className="flex-1 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Archivage..." : "Confirmer l'archivage"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-full rounded-xl border border-amber-200 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50"
    >
      📦 Archiver le rapport
    </button>
  );
}
