"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveIntervention } from "./actions";
import type { PieceUtilisee, PhotoItem, RapportComplet, Installation } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import PhotoUpload from "@/components/ui/photo-upload";

export function InterventionClient({
  rapport,
  installations,
}: {
  rapport: RapportComplet;
  installations: Installation[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(
    rapport.installation_id || null
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

  function handleSelectInstallation(inst: Installation) {
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

  async function handleSave() {
    setSaving(true);
    try {
      const piecesClean = pieces.filter((p) => p.nom.trim() !== "");
      const result = await saveIntervention(
        rapport.id,
        selectedInstallation,
        description,
        diagnostic,
        travaux,
        piecesClean,
        photos
      );
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
      const piecesClean = pieces.filter((p) => p.nom.trim() !== "");
      const result = await saveIntervention(
        rapport.id,
        selectedInstallation,
        description,
        diagnostic,
        travaux,
        piecesClean,
        photos
      );
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
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold">Pièces et matériel utilisé</label>
          <button
            type="button"
            onClick={addPiece}
            className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-3">
          {pieces.map((piece, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={piece.nom}
                  onChange={(e) => updatePiece(i, "nom", e.target.value)}
                  placeholder="Nom de la pièce"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={piece.quantite}
                    onChange={(e) => updatePiece(i, "quantite", parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-20 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="Qté"
                  />
                  <input
                    type="text"
                    value={piece.reference || ""}
                    onChange={(e) => updatePiece(i, "reference", e.target.value)}
                    placeholder="Référence (optionnel)"
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePiece(i)}
                className="mt-2 text-red-500 hover:text-red-700 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions fixes en bas */}
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
    </div>
  );
}
