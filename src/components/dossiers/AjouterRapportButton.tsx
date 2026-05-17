"use client";

import { useState } from "react";
import { AjouterRapportModal } from "./AjouterRapportModal";
import type { RapportChoix } from "./AjouterRapportModal";

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  dossierId: string;
  rapports: RapportChoix[];
};

// ── Component ──────────────────────────────────────────────────────────────

export function AjouterRapportButton({ dossierId, rapports }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-50 transition-colors min-h-[36px]"
      >
        Ajouter existant
      </button>

      <AjouterRapportModal
        dossierId={dossierId}
        rapports={rapports}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
