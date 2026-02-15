"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveVisite } from "./actions";
import type { PhotoItem } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import PhotoUpload from "@/components/ui/photo-upload";

export function VisiteClient({ rapport }: { rapport: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [observations, setObservations] = useState(rapport.observations_visite || "");
  const [recommandations, setRecommandations] = useState(rapport.recommandations || "");
  const [photos, setPhotos] = useState<PhotoItem[]>(rapport.photos || []);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await saveVisite(rapport.id, observations, recommandations, photos);
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
      const result = await saveVisite(rapport.id, observations, recommandations, photos);
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
      <h1 className="text-2xl font-bold mb-2">Visite technique</h1>
      <p className="text-sm text-muted mb-6">
        {rapport.numero_cm} · {rapport.client?.nom} · {rapport.site?.nom}
      </p>

      {/* Observations */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-2">Observations</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Décrivez vos observations lors de la visite..."
          rows={6}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Recommandations */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-bold mb-2">Recommandations</label>
        <textarea
          value={recommandations}
          onChange={(e) => setRecommandations(e.target.value)}
          placeholder="Recommandations suite à la visite..."
          rows={6}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Photos */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <PhotoUpload
          rapportId={rapport.id}
          context="visite"
          photos={photos.filter((p) => p.context === "visite")}
          onPhotosChange={(updated) => {
            const otherPhotos = photos.filter((p) => p.context !== "visite");
            setPhotos([...otherPhotos, ...updated]);
          }}
        />
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
