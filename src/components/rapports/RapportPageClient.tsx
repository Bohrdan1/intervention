"use client";
import { useState } from "react";
import { RapportLecture } from "./RapportLecture";
import { RapportEdition } from "./RapportEdition";
import type { RapportComplet } from "@/lib/types";
import type { DossierChoix } from "./RattacherDossierModal";

type Props = {
  rapport: RapportComplet;
  currentDossier: { id: string; reference: string } | null;
  dossierChoix: DossierChoix[];
};

export function RapportPageClient({ rapport, currentDossier, dossierChoix }: Props) {
  const [modeEdition, setModeEdition] = useState(false);
  if (!modeEdition) {
    return (
      <RapportLecture
        rapport={rapport}
        currentDossier={currentDossier}
        dossierChoix={dossierChoix}
        onModifier={() => setModeEdition(true)}
      />
    );
  }
  return (
    <RapportEdition
      rapport={rapport}
      currentDossier={currentDossier}
      dossierChoix={dossierChoix}
      onAnnuler={() => setModeEdition(false)}
    />
  );
}
