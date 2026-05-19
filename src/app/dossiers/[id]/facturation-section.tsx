"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFacturation } from "@/app/actions/dossiers";
import type { FacturationStatut, ReglementMode } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type FacturationInit = {
  facture_statut: FacturationStatut;
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  reglement_date: string | null;
  reglement_mode: ReglementMode | null;
  offert: boolean;
};

type Props = {
  dossierId: string;
  facturation: FacturationInit;
};

// ── Config ─────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<FacturationStatut, { label: string; badge: string }> = {
  non_facture: { label: "Non facturé", badge: "bg-gray-100 text-gray-600" },
  facture:     { label: "Facturé",     badge: "bg-blue-100 text-blue-700" },
  paye:        { label: "Payé",        badge: "bg-green-100 text-green-700" },
  en_retard:   { label: "En retard",   badge: "bg-red-100 text-red-700" },
};

const REGLEMENT_LABELS: Record<ReglementMode, string> = {
  virement: "Virement",
  cheque:   "Chèque",
  especes:  "Espèces",
  carte:    "Carte",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function FacturationSection({ dossierId, facturation }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [localStatut, setLocalStatut] = useState<FacturationStatut>(
    facturation.facture_statut
  );

  const cfg = STATUT_CONFIG[localStatut];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const data = {
      facture_statut: (fd.get("facture_statut") as string) || "non_facture",
      facture_numero:     (fd.get("facture_numero") as string) || null,
      facture_date:       (fd.get("facture_date") as string) || null,
      facture_montant_ttc: (() => {
        const v = (fd.get("facture_montant_ttc") as string) || "";
        const n = parseFloat(v.replace(/\s/g, ""));
        return isNaN(n) ? null : n;
      })(),
      reglement_date: (fd.get("reglement_date") as string) || null,
      reglement_mode: (fd.get("reglement_mode") as string) || null,
      offert: fd.get("offert") === "on",
    };

    startTransition(async () => {
      await updateFacturation(dossierId, data);
      setEditing(false);
      router.refresh();
    });
  }

  // ── Formulaire édition ─────────────────────────────────────────────────

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/30 bg-white p-4">
        <h2 className="mb-4 text-xs font-semibold uppercase text-muted">
          Facturation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Statut */}
          <div>
            <label className="block text-xs text-muted mb-1">Statut</label>
            <select
              name="facture_statut"
              defaultValue={facturation.facture_statut}
              onChange={(e) => setLocalStatut(e.target.value as FacturationStatut)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              style={{ fontSize: "16px" }}
            >
              <option value="non_facture">Non facturé</option>
              <option value="facture">Facturé</option>
              <option value="paye">Payé</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>

          {/* N° facture + Montant TTC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">
                N° facture Facture+
              </label>
              <input
                type="text"
                name="facture_numero"
                defaultValue={facturation.facture_numero ?? ""}
                placeholder="FAC-2026-001"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Montant TTC (F CFP)
              </label>
              <input
                type="number"
                name="facture_montant_ttc"
                defaultValue={facturation.facture_montant_ttc ?? ""}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Date facture */}
          <div>
            <label className="block text-xs text-muted mb-1">
              Date facture
            </label>
            <input
              type="date"
              name="facture_date"
              defaultValue={facturation.facture_date ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Règlement — visible si statut = payé */}
          {localStatut === "paye" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">
                  Date règlement
                </label>
                <input
                  type="date"
                  name="reglement_date"
                  defaultValue={facturation.reglement_date ?? ""}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Mode règlement
                </label>
                <select
                  name="reglement_mode"
                  defaultValue={facturation.reglement_mode ?? ""}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">—</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                  <option value="carte">Carte</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="offert"
              name="offert"
              defaultChecked={facturation.offert}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="offert" className="text-sm font-medium cursor-pointer select-none">
              Prestation offerte <span className="text-xs text-muted">(sans facturation)</span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isPending}
              className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Lecture ────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase text-muted">
          Facturation
        </h2>
        <button
          onClick={() => setEditing(true)}
          className="min-h-[44px] rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
        >
          Modifier
        </button>
      </div>

      <div className="space-y-2">
        {/* Statut */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Statut</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* N° facture */}
        {facturation.facture_numero && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">N° facture</span>
            <span className="text-sm font-medium">{facturation.facture_numero}</span>
          </div>
        )}

        {/* Montant TTC */}
        {facturation.facture_montant_ttc != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Montant TTC</span>
            <span className="text-sm font-semibold">
              {facturation.facture_montant_ttc.toLocaleString("fr-FR")} F CFP
            </span>
          </div>
        )}

        {/* Date facture */}
        {facturation.facture_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Date facture</span>
            <span className="text-sm">{formatDate(facturation.facture_date)}</span>
          </div>
        )}

        {/* Règlement */}
        {facturation.reglement_date && (
          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-sm text-muted">Règlement</span>
            <span className="text-sm">
              {formatDate(facturation.reglement_date)}
              {facturation.reglement_mode && (
                <span className="ml-1.5 text-xs text-muted">
                  ({REGLEMENT_LABELS[facturation.reglement_mode]})
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
