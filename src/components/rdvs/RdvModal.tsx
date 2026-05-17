"use client";

import { useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRdv, updateRdv } from "@/app/actions/rdvs";
import type { DossierOption, RdvWithDossier, RdvSimple } from "./rdv-types";

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  /** Liste des dossiers ouverts pour le select (vide si dossier verrouillé) */
  dossiers: DossierOption[];
  /** Si défini : sélection verrouillée sur ce dossier */
  lockedDossier?: DossierOption;
  /** Si défini : mode édition */
  editRdv?: RdvWithDossier | RdvSimple | null;
};

// ── Constantes ──────────────────────────────────────────────────────────────

const TYPES = [
  { value: "intervention", label: "Intervention" },
  { value: "maintenance",  label: "Maintenance" },
  { value: "visite",       label: "Visite" },
  { value: "diagnostic",   label: "Diagnostic" },
] as const;

const STATUTS = [
  { value: "planifie", label: "Planifié" },
  { value: "confirme", label: "Confirmé" },
] as const;

const DUREES = [
  { value: "30",  label: "30 min" },
  { value: "60",  label: "1 h" },
  { value: "90",  label: "1 h 30" },
  { value: "120", label: "2 h" },
  { value: "180", label: "3 h" },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convertit une ISO string en valeur pour input[datetime-local] */
function toDatetimeLocal(iso: string): string {
  // "2026-05-19T09:00:00+11:00" → "2026-05-19T09:00"
  return iso.substring(0, 16);
}

// ── Component ──────────────────────────────────────────────────────────────

export function RdvModal({
  open,
  onClose,
  dossiers,
  lockedDossier,
  editRdv,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isEdit = !!editRdv;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit && editRdv) {
        await updateRdv(editRdv.id, fd);
      } else {
        await createRdv(fd);
      }
      router.refresh();
      onClose();
    });
  }

  // Valeur initiale de dossier_id
  const initDossierId =
    lockedDossier?.id ??
    (editRdv && "dossier_id" in editRdv ? (editRdv.dossier_id ?? "") : "");

  const initDateRdv = editRdv ? toDatetimeLocal(editRdv.date_rdv) : "";
  const initDuree = editRdv?.duree_minutes?.toString() ?? "60";
  const initType = editRdv?.type_rdv ?? "intervention";
  const initStatut = editRdv?.statut ?? "planifie";
  const initNotes = editRdv?.notes ?? "";

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-base">
            {isEdit ? "Modifier le RDV" : "Nouveau RDV"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-muted hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Dossier */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Dossier <span className="text-red-500">*</span>
            </label>
            {lockedDossier ? (
              <>
                <input type="hidden" name="dossier_id" value={lockedDossier.id} />
                <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium">{lockedDossier.reference}</span>
                  {" · "}
                  <span className="text-muted">{lockedDossier.clientNom}</span>
                  {lockedDossier.siteNom && (
                    <span className="text-muted"> · {lockedDossier.siteNom}</span>
                  )}
                </div>
              </>
            ) : (
              <select
                name="dossier_id"
                required
                defaultValue={initDossierId}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sélectionner un dossier…</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.reference} · {d.clientNom}
                    {d.siteNom ? ` · ${d.siteNom}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & heure */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Date & heure <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="date_rdv"
              required
              defaultValue={initDateRdv}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Durée + Type (2 colonnes) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Durée</label>
              <select
                name="duree_minutes"
                defaultValue={initDuree}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {DUREES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select
                name="type_rdv"
                defaultValue={initType}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Statut</label>
            <select
              name="statut"
              defaultValue={initStatut}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Notes{" "}
              <span className="text-xs font-normal text-muted">(optionnel)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initNotes}
              placeholder="Contexte, accès, équipements…"
              className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 min-h-[44px] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light min-h-[44px] disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
