"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EtatControle, PhotoItem } from "@/lib/types";
import { saveControle, savePhotos } from "./actions";
import { useToast } from "@/components/ui/toast";
import PhotoUpload from "@/components/ui/photo-upload";

interface PointControle {
  nom: string;
  etat: EtatControle;
  observation: string;
}

interface PointERP {
  nom: string;
  conforme: boolean;
}

interface ControleData {
  id: string;
  page_number: number;
  points_controle: PointControle[];
  points_erp: PointERP[];
  installation: {
    id: string;
    repere: string;
    type_porte: string;
    modele: string | null;
  };
}

export function ChecklistClient({
  rapportId,
  numeroCm,
  siteName,
  controles,
  initialPhotos,
}: {
  rapportId: string;
  numeroCm: string;
  siteName: string;
  controles: ControleData[];
  initialPhotos: PhotoItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allControles, setAllControles] = useState<ControleData[]>(controles);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);

  const current = allControles[currentIndex];
  const total = allControles.length;

  // Photos filtrées pour la porte actuelle
  const currentContext = `controle:${current.installation.id}`;
  const currentPhotos = photos.filter((p) => p.context === currentContext);

  function handlePhotosChange(updatedContextPhotos: PhotoItem[]) {
    const otherPhotos = photos.filter((p) => p.context !== currentContext);
    setPhotos([...otherPhotos, ...updatedContextPhotos]);
  }

  function updatePointControle(pointIndex: number, field: "etat" | "observation", value: any) {
    setAllControles((prev) => {
      const next = [...prev];
      const controle = { ...next[currentIndex] };
      const points = [...controle.points_controle];
      points[pointIndex] = { ...points[pointIndex], [field]: value };
      controle.points_controle = points;
      next[currentIndex] = controle;
      return next;
    });
  }

  function updatePointERP(pointIndex: number, conforme: boolean) {
    setAllControles((prev) => {
      const next = [...prev];
      const controle = { ...next[currentIndex] };
      const points = [...controle.points_erp];
      points[pointIndex] = { ...points[pointIndex], conforme };
      controle.points_erp = points;
      next[currentIndex] = controle;
      return next;
    });
  }

  async function handleSaveAndNavigate(direction: "prev" | "next" | "finish") {
    setSaving(true);
    const result = await saveControle(current.id, current.points_controle, current.points_erp);
    const photoResult = await savePhotos(rapportId, photos);

    if (!result.success || !photoResult.success) {
      toast(result.error || photoResult.error || "Erreur de sauvegarde", "error");
      setSaving(false);
      return;
    }

    toast("Sauvegardé", "success");
    setSaving(false);

    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "next" && currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "finish") {
      router.push(`/rapports/${rapportId}/finaliser`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleJumpTo(index: number) {
    if (index === currentIndex) return;
    setSaving(true);
    const result = await saveControle(current.id, current.points_controle, current.points_erp);
    const photoResult = await savePhotos(rapportId, photos);
    setSaving(false);

    if (!result.success || !photoResult.success) {
      toast(result.error || photoResult.error || "Erreur de sauvegarde", "error");
      return;
    }

    toast("Sauvegardé", "success");
    setCurrentIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const etatOptions: { value: EtatControle; label: string; color: string; activeColor: string }[] = [
    { value: "ok", label: "✔ OK", color: "border-green-300 text-green-700", activeColor: "bg-green-100 border-green-500 text-green-800 font-semibold" },
    { value: "correction", label: "Correction", color: "border-red-300 text-red-600", activeColor: "bg-red-100 border-red-500 text-red-800 font-semibold" },
    { value: "prevention", label: "Prévention", color: "border-orange-300 text-orange-600", activeColor: "bg-orange-100 border-orange-500 text-orange-800 font-semibold" },
    { value: "na", label: "— N/A", color: "border-gray-300 text-gray-500", activeColor: "bg-gray-100 border-gray-500 text-gray-700 font-semibold" },
  ];

  return (
    <div className="pb-24">
      {/* Header sticky */}
      <div className="sticky top-[57px] z-40 -mx-4 border-b border-border bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">{numeroCm} · {siteName}</p>
            <h2 className="text-base font-bold">
              Porte {currentIndex + 1}/{total}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">🚪 {current.installation.repere}</p>
            <p className="text-xs text-muted">
              {current.installation.type_porte}
              {current.installation.modele ? ` · ${current.installation.modele}` : ""}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
        {/* Saut de porte */}
        {total > 1 && (
          <div className="mt-2 flex gap-1 overflow-x-auto">
            {allControles.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleJumpTo(i)}
                disabled={saving}
                className={`min-w-[32px] rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                  i === currentIndex
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Points de contrôle */}
      <div className="mt-4 space-y-3">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
          Points de contrôle
        </h3>
        {current.points_controle.map((point, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <p className="text-sm font-medium mb-2">{point.nom}</p>
            <div className="flex gap-1.5 mb-2">
              {etatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updatePointControle(i, "etat", opt.value)}
                  className={`flex-1 rounded-lg border py-2 text-xs transition-all ${
                    point.etat === opt.value ? opt.activeColor : opt.color
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {point.etat !== "ok" && point.etat !== "na" && (
              <input
                type="text"
                placeholder="Observation..."
                value={point.observation}
                onChange={(e) => updatePointControle(i, "observation", e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            )}
            {(point.etat === "ok" || point.etat === "na") && point.observation && (
              <input
                type="text"
                placeholder="Observation..."
                value={point.observation}
                onChange={(e) => updatePointControle(i, "observation", e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Points ERP */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
          Conformité ERP — CO48, EN16005
        </h3>
        {current.points_erp.map((point, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border bg-white p-3 shadow-sm"
          >
            <p className="text-sm font-medium flex-1">{point.nom}</p>
            <div className="flex gap-2 ml-3">
              <button
                type="button"
                onClick={() => updatePointERP(i, true)}
                className={`rounded-lg border px-4 py-2 text-xs transition-all ${
                  point.conforme
                    ? "bg-green-100 border-green-500 text-green-800 font-semibold"
                    : "border-green-300 text-green-600"
                }`}
              >
                ✔ Conforme
              </button>
              <button
                type="button"
                onClick={() => updatePointERP(i, false)}
                className={`rounded-lg border px-4 py-2 text-xs transition-all ${
                  !point.conforme
                    ? "bg-red-100 border-red-500 text-red-800 font-semibold"
                    : "border-red-300 text-red-600"
                }`}
              >
                ✘ Non conforme
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Photos */}
      <div className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm">
        <PhotoUpload
          rapportId={rapportId}
          context={currentContext}
          photos={currentPhotos}
          onPhotosChange={handlePhotosChange}
        />
      </div>

      {/* Navigation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-5xl gap-3">
          {currentIndex > 0 && (
            <button
              onClick={() => handleSaveAndNavigate("prev")}
              disabled={saving}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              ← Porte précédente
            </button>
          )}
          {currentIndex < total - 1 ? (
            <button
              onClick={() => handleSaveAndNavigate("next")}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Porte suivante →"}
            </button>
          ) : (
            <button
              onClick={() => handleSaveAndNavigate("finish")}
              disabled={saving}
              className="flex-1 rounded-xl bg-success py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Finaliser le rapport ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
