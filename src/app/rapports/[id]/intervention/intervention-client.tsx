"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveIntervention, saveInterventionMulti } from "./actions";
import type { PieceUtilisee, PhotoItem, RapportComplet, Equipement, InterventionEquipement } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import PhotoUpload from "@/components/ui/photo-upload";
import { PiecesInput } from "@/components/ui/pieces-input";

interface PieceCatalogue {
  id: string;
  nom: string;
  reference: string | null;
  prix_ht: number | null;
  unite: string;
  nb_utilisations: number;
}

export function InterventionClient({
  rapport,
  installations,
  catalogue = [],
}: {
  rapport: RapportComplet;
  installations: Equipement[];
  catalogue?: PieceCatalogue[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(
    rapport.equipement_id || null
  );
  const [description, setDescription] = useState(
    rapport.description_probleme || rapport.demande_client || ""
  );
  const [diagnostic, setDiagnostic] = useState(rapport.diagnostic || "");
  const [travaux, setTravaux] = useState(rapport.travaux_effectues || "");
  const [pieces, setPieces] = useState<PieceUtilisee[]>(
    rapport.pieces_utilisees?.length > 0
      ? rapport.pieces_utilisees
      : [{ nom: "", quantite: 1, reference: "" }]
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(rapport.photos || []);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Multi-équipements ──
  const isMultiMode = rapport.interventions_equipements !== null;
  const [interventions, setInterventions] = useState<InterventionEquipement[]>(
    rapport.interventions_equipements ?? []
  );
  const [selectOpen, setSelectOpen] = useState(false);

  function addEquipement(equip: Equipement) {
    setInterventions((prev) => [
      ...prev,
      { equipement_id: equip.id, repere: equip.repere, diagnostic: "", travaux_effectues: "", pieces_utilisees: [] },
    ]);
    setSelectOpen(false);
  }

  function removeEquipement(index: number) {
    setInterventions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateIntervField(
    index: number,
    field: "diagnostic" | "travaux_effectues",
    value: string
  ) {
    setInterventions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function updateIntervPieces(index: number, pieces: PieceUtilisee[]) {
    setInterventions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], pieces_utilisees: pieces };
      return next;
    });
  }

  function handleSelectInstallation(inst: Equipement) {
    setSelectedInstallation(inst.id);
    // Vider le pré-remplissage porte s'il était présent (désormais affiché dans l'en-tête)
    if (description.startsWith("Porte :")) {
      setDescription("");
    }
  }

  function addPiece() {
    setPieces([...pieces, { nom: "", quantite: 1, reference: "" }]);
  }

  function removePiece(index: number) {
    setPieces(pieces.filter((_, i) => i !== index));
  }

  function updatePiece(index: number, field: keyof PieceUtilisee, value: string | number) {
    setPieces((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  const autoSave = useCallback(async () => {
    setAutoSaveStatus("saving");
    try {
      const piecesClean = pieces.filter((p) => p.nom.trim() !== "");
      await saveIntervention(
        rapport.id,
        selectedInstallation,
        description,
        diagnostic,
        travaux,
        piecesClean,
        photos
      );
      setLastSaved(new Date());
      setAutoSaveStatus("saved");
    } catch {
      setAutoSaveStatus("idle");
    }
  }, [rapport.id, selectedInstallation, description, diagnostic, travaux, pieces, photos]);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 45000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [description, diagnostic, travaux, pieces, selectedInstallation, autoSave]);

  async function handleSave() {
    setSaving(true);
    try {
      let result: { success: boolean; error?: string };
      if (isMultiMode) {
        if (interventions.length === 0) {
          toast("Ajoutez au moins une porte", "error");
          return;
        }
        result = await saveInterventionMulti(rapport.id, interventions, photos, true);
      } else {
        const piecesClean = pieces.filter((p) => p.nom.trim() !== "");
        result = await saveIntervention(
          rapport.id, selectedInstallation, description, diagnostic, travaux, piecesClean, photos, true
        );
      }
      if (!result.success) {
        toast(result.error || "Erreur de sauvegarde", "error");
        return;
      }
      toast("Sauvegardé", "success");
      router.push(`/rapports/${rapport.id}/finaliser`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      let result: { success: boolean; error?: string };
      if (isMultiMode) {
        result = await saveInterventionMulti(rapport.id, interventions, photos);
      } else {
        const piecesClean = pieces.filter((p) => p.nom.trim() !== "");
        result = await saveIntervention(
          rapport.id, selectedInstallation, description, diagnostic, travaux, piecesClean, photos
        );
      }
      if (!result.success) {
        toast(result.error || "Erreur de sauvegarde", "error");
        return;
      }
      toast("Brouillon sauvegardé", "success");
      router.push("/");
    } finally {
      setSaving(false);
    }
  }

  // ── JSX partagé : actions bas de page ──────────────────────────────────────
  const actionsBar = (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-5xl gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Brouillon"}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Finaliser →"}
        </button>
      </div>
    </div>
  );

  // ── Mode multi-équipements ──────────────────────────────────────────────────
  if (isMultiMode) {
    const equipementsDisponibles = installations.filter(
      (inst) => !interventions.some((ie) => ie.equipement_id === inst.id)
    );

    return (
      <div className="pb-24">
        <h1 className="text-2xl font-bold mb-2">Rapport d&apos;intervention</h1>
        <p className="text-sm text-muted mb-6">
          {rapport.numero_cm} · {rapport.client?.nom} · {rapport.site?.nom}
        </p>

        {/* Cards équipements */}
        {interventions.map((ie, index) => (
          <div key={ie.equipement_id} className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
            {/* En-tête porte */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">🚪 {ie.repere}</p>
              {interventions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEquipement(index)}
                  className="text-xs text-danger hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Diagnostic */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-muted uppercase mb-1">Diagnostic</label>
              <textarea
                value={ie.diagnostic}
                onChange={(e) => updateIntervField(index, "diagnostic", e.target.value)}
                placeholder="Diagnostic technique..."
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Travaux */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-muted uppercase mb-1">Travaux effectués</label>
              <textarea
                value={ie.travaux_effectues}
                onChange={(e) => updateIntervField(index, "travaux_effectues", e.target.value)}
                placeholder="Décrivez les travaux réalisés..."
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Pièces */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-2">Pièces utilisées</label>
              <PiecesInput
                pieces={ie.pieces_utilisees.filter((p) => p.nom.trim() !== "")}
                catalogue={catalogue}
                onChange={(updated) => updateIntervPieces(index, updated)}
              />
            </div>
          </div>
        ))}

        {/* Bouton ajouter une porte */}
        {equipementsDisponibles.length > 0 && (
          <div className="mb-4">
            {selectOpen ? (
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-sm font-bold mb-3">Choisir une porte</p>
                <div className="space-y-2">
                  {equipementsDisponibles.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => addEquipement(inst)}
                      className="w-full flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium">🚪 {inst.repere}</span>
                      <span className="text-xs text-muted">
                        {inst.type_porte}{inst.modele ? ` · ${inst.modele}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectOpen(false)}
                  className="mt-3 text-xs text-muted hover:underline"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectOpen(true)}
                className="w-full rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5 transition-colors"
              >
                + Ajouter une porte
              </button>
            )}
          </div>
        )}

        {interventions.length === 0 && (
          <p className="text-sm text-muted text-center py-4">
            Aucune porte ajoutée. Appuyez sur &quot;+ Ajouter une porte&quot; pour commencer.
          </p>
        )}

        {/* Photos */}
        <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <PhotoUpload
            rapportId={rapport.id}
            context="intervention"
            photos={photos.filter((p) => p.context === "intervention")}
            onPhotosChange={(updated) => {
              const otherPhotos = photos.filter((p) => p.context !== "intervention");
              setPhotos([...otherPhotos, ...updated]);
            }}
          />
        </div>

        {/* Auto-save */}
        <div className="mb-16 text-center">
          {autoSaveStatus === "saving" && (
            <p className="text-xs text-muted">Sauvegarde automatique...</p>
          )}
          {autoSaveStatus === "saved" && lastSaved && (
            <p className="text-xs text-muted">
              Sauvegardé à {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {actionsBar}
      </div>
    );
  }

  // ── Mode ancien format (rétrocompat) ────────────────────────────────────────
  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold mb-2">Rapport d&apos;intervention</h1>
      <p className="text-sm text-muted mb-6">
        {rapport.numero_cm} · {rapport.client?.nom} · {rapport.site?.nom}
      </p>

      {/* Sélecteur de porte */}
      {installations.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <label className="block text-sm font-bold mb-3">Porte concernée</label>
          <div className="space-y-2">
            {installations.map((inst) => {
              const isSelected = selectedInstallation === inst.id;
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => handleSelectInstallation(inst)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? "border-primary" : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">🚪 {inst.repere}</span>
                    <span className="text-xs text-muted ml-2">
                      {inst.type_porte}{inst.modele ? ` · ${inst.modele}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Demande client / Description du problème */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-2">Demande client / Description du problème</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Porte concernée, demande du client, problème constaté..."
          rows={5}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Diagnostic */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-2">Diagnostic</label>
        <textarea
          value={diagnostic}
          onChange={(e) => setDiagnostic(e.target.value)}
          placeholder="Diagnostic technique..."
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Travaux effectués */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-2">Travaux effectués</label>
        <textarea
          value={travaux}
          onChange={(e) => setTravaux(e.target.value)}
          placeholder="Décrivez les travaux réalisés..."
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Photos */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <PhotoUpload
          rapportId={rapport.id}
          context="intervention"
          photos={photos.filter((p) => p.context === "intervention")}
          onPhotosChange={(updated) => {
            const otherPhotos = photos.filter((p) => p.context !== "intervention");
            setPhotos([...otherPhotos, ...updated]);
          }}
        />
      </div>

      {/* Pièces utilisées */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-3">Pièces et matériel utilisé</label>
        <PiecesInput
          pieces={pieces.filter((p) => p.nom.trim() !== "")}
          catalogue={catalogue}
          onChange={(updated) => setPieces(updated.length > 0 ? updated : [{ nom: "", quantite: 1 }])}
        />
      </div>

      {/* Indicateur auto-save */}
      <div className="mb-16 text-center">
        {autoSaveStatus === "saving" && (
          <p className="text-xs text-muted">Sauvegarde automatique...</p>
        )}
        {autoSaveStatus === "saved" && lastSaved && (
          <p className="text-xs text-muted">
            Sauvegardé automatiquement à {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {actionsBar}
    </div>
  );
}