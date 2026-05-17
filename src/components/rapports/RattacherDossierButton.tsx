"use client";

import { useState } from "react";
import { RattacherDossierModal } from "./RattacherDossierModal";
import type { DossierChoix } from "./RattacherDossierModal";

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  rapportId: string;
  currentDossierId: string | null;
  dossiers: DossierChoix[];
};

// ── Component ──────────────────────────────────────────────────────────────

export function RattacherDossierButton({
  rapportId,
  currentDossierId,
  dossiers,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-[44px] rounded-xl border border-border bg-white py-2.5 text-sm font-medium text-foreground hover:bg-slate-50 transition-colors"
      >
        {currentDossierId ? "Changer de dossier" : "Rattacher à un dossier"}
      </button>

      <RattacherDossierModal
        rapportId={rapportId}
        currentDossierId={currentDossierId}
        dossiers={dossiers}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
