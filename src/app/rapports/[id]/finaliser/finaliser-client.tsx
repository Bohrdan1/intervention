"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveConstatAndFinalize, saveConstatDraft } from "./actions";
import type { ConstatItem, RapportComplet } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

export function FinaliserClient({ rapport }: { rapport: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [constat, setConstat] = useState<ConstatItem[]>(rapport.constat_general || []);
  const [signatureData, setSignatureData] = useState<string | null>(rapport.signature_data);
  const [signatureClient, setSignatureClient] = useState<string | null>(rapport.signature_client);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasClientRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const activeCanvas = useRef<"tech" | "client">("tech");

  // ── Constat handlers ──
  function updateConstat(index: number, field: keyof ConstatItem, value: any) {
    setConstat((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  // ── Signature canvas (générique) ──
  function getCanvasCoords(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function initCanvasBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    // Remplir le fond en blanc pour éviter le fond noir en export
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startDrawingTech(e: React.TouchEvent | React.MouseEvent) {
    activeCanvas.current = "tech";
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fond blanc si canvas vierge (pas encore de signature)
    if (!signatureData) initCanvasBackground(canvas, ctx);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function startDrawingClient(e: React.TouchEvent | React.MouseEvent) {
    activeCanvas.current = "client";
    const canvas = canvasClientRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fond blanc si canvas vierge (pas encore de signature)
    if (!signatureClient) initCanvasBackground(canvas, ctx);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!isDrawing.current) return;
    const canvas = activeCanvas.current === "tech" ? canvasRef.current : canvasClientRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (activeCanvas.current === "tech") {
      const canvas = canvasRef.current;
      if (canvas) setSignatureData(canvas.toDataURL("image/png"));
    } else {
      const canvas = canvasClientRef.current;
      if (canvas) setSignatureClient(canvas.toDataURL("image/png"));
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  }

  function clearSignatureClient() {
    const canvas = canvasClientRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureClient(null);
  }


  // ── Génération PDF ──
  async function generatePdfBlob(): Promise<Blob> {
    const rapportComplet: RapportComplet = {
      ...rapport,
      constat_general: constat,
      signature_data: signatureData,
      signature_client: signatureClient,
    };

    const { pdf } = await import("@react-pdf/renderer");
    const { RapportPDF } = await import("@/lib/pdf/rapport-pdf");
    return pdf(<RapportPDF rapport={rapportComplet} />).toBlob();
  }

  // Détection iOS/iPad
  function isIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  async function handlePreview() {
    setGenerating(true);
    try {
      await saveConstatAndFinalize(rapport.id, constat, signatureData, signatureClient);
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);

      if (isIOS()) {
        // Sur iPad/iPhone : télécharger le PDF (fonctionne aussi en mode PWA)
        const a = document.createElement("a");
        a.href = url;
        a.download = `${rapport.numero_cm.replace(/\s/g, "_")}_${rapport.site?.nom || "rapport"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Erreur PDF:", error);
      toast("Erreur lors de la génération du PDF", "error");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${rapport.numero_cm.replace(/\s/g, "_")}_${rapport.site?.nom || "rapport"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  async function handleSaveDraft() {
    setSaving(true);
    await saveConstatDraft(rapport.id, constat, signatureData, signatureClient);
    setSaving(false);
    toast("Brouillon sauvegardé", "success");
    router.push("/");
  }

  const isIntervention = rapport.type_rapport === "intervention";
  const controles = rapport.controles || [];

  // Résumé des contrôles (maintenance uniquement)
  const totalPoints = controles.reduce(
    (acc: number, c: any) => acc + c.points_controle.length,
    0
  );
  const pointsOk = controles.reduce(
    (acc: number, c: any) =>
      acc + c.points_controle.filter((p: any) => p.etat === "ok").length,
    0
  );
  const corrections = controles.reduce(
    (acc: number, c: any) =>
      acc + c.points_controle.filter((p: any) => p.etat === "correction").length,
    0
  );
  const preventions = controles.reduce(
    (acc: number, c: any) =>
      acc + c.points_controle.filter((p: any) => p.etat === "prevention").length,
    0
  );

  return (
    <div className="pb-24">
      {/* Overlay aperçu PDF */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/80">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border">
            <h2 className="text-sm font-bold">Aperçu du rapport</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
              >
                📥 Télécharger
              </button>
              <button
                onClick={closePreview}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                ✕ Fermer
              </button>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="flex-1 w-full"
            title="Aperçu PDF"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2">Finaliser le rapport</h1>
      <p className="text-sm text-muted mb-6">
        {rapport.numero_cm} · {rapport.site?.nom}
        {isIntervention ? "" : ` · ${rapport.controles?.length || 0} porte${(rapport.controles?.length || 0) > 1 ? "s" : ""}`}
      </p>

      {/* Résumé (maintenance uniquement) */}
      {!isIntervention && (
        <div className="mb-6 grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-white border border-border p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-green-600">{pointsOk}</p>
            <p className="text-xs text-muted">OK</p>
          </div>
          <div className="rounded-xl bg-white border border-border p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-red-600">{corrections}</p>
            <p className="text-xs text-muted">Corrections</p>
          </div>
          <div className="rounded-xl bg-white border border-border p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-orange-600">{preventions}</p>
            <p className="text-xs text-muted">Préventions</p>
          </div>
          <div className="rounded-xl bg-white border border-border p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-primary">{totalPoints}</p>
            <p className="text-xs text-muted">Total</p>
          </div>
        </div>
      )}

      {/* Résumé intervention */}
      {isIntervention && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold mb-3">⚡ Résumé de l&apos;intervention</h2>
          {rapport.description_probleme && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted uppercase">Problème</p>
              <p className="text-sm mt-1">{rapport.description_probleme}</p>
            </div>
          )}
          {rapport.travaux_effectues && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted uppercase">Travaux</p>
              <p className="text-sm mt-1">{rapport.travaux_effectues}</p>
            </div>
          )}
          {rapport.pieces_utilisees?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase">Pièces</p>
              <ul className="text-sm mt-1 list-disc list-inside">
                {rapport.pieces_utilisees.map((p: any, i: number) => (
                  <li key={i}>{p.nom} x{p.quantite}{p.reference ? ` (${p.reference})` : ""}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Constat général (maintenance uniquement) */}
      {!isIntervention && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold mb-4">🛠 Constat général de conformité</h2>
          <div className="space-y-3">
            {constat.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => updateConstat(i, "conforme", !item.conforme)}
                  className={`mt-0.5 flex-shrink-0 rounded-lg border px-2 py-1 text-sm transition-all ${
                    item.conforme
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-red-100 border-red-400 text-red-700"
                  }`}
                >
                  {item.conforme ? "✔" : "✘"}
                </button>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{item.label} : </span>
                    <input
                      type="text"
                      value={item.texte}
                      onChange={(e) => updateConstat(i, "texte", e.target.value)}
                      className="w-full mt-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Signature Technicien */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">✍️ Technicien</h2>
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-danger hover:underline"
            >
              Effacer
            </button>
          </div>
          <p className="text-sm text-muted mb-2">{rapport.technicien}</p>
          <canvas
            ref={canvasRef}
            width={300}
            height={120}
            className="w-full rounded-lg border-2 border-dashed border-border bg-slate-50 touch-none"
            onMouseDown={startDrawingTech}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawingTech}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Signature Client */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">✍️ Client</h2>
            <button
              type="button"
              onClick={clearSignatureClient}
              className="text-xs text-danger hover:underline"
            >
              Effacer
            </button>
          </div>
          <p className="text-sm text-muted mb-2">{rapport.client?.nom || "Client"}</p>
          <canvas
            ref={canvasClientRef}
            width={300}
            height={120}
            className="w-full rounded-lg border-2 border-dashed border-border bg-slate-50 touch-none"
            onMouseDown={startDrawingClient}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawingClient}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
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
            {saving ? "Sauvegarde..." : "💾 Brouillon"}
          </button>
          <button
            onClick={handlePreview}
            disabled={generating}
            className="flex-[2] rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {generating ? "Génération..." : "👁 Aperçu PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
