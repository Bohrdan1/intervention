"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateRdvStatut, deleteRdv } from "@/app/actions/rdvs";
import { RdvModal } from "./RdvModal";
import type { RdvWithDossier, DossierOption } from "./rdv-types";
import {
  RDV_TYPE_CONFIG,
  RDV_STATUT_CONFIG,
  formatRdvDate,
  formatDuree,
} from "./rdv-types";

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  rdv: RdvWithDossier;
  /** Dossiers disponibles pour l'édition (select dans RdvModal) */
  dossiers: DossierOption[];
};

// ── Component ──────────────────────────────────────────────────────────────

export function RdvCard({ rdv, dossiers }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const typeCfg =
    RDV_TYPE_CONFIG[rdv.type_rdv as keyof typeof RDV_TYPE_CONFIG] ??
    ({ label: rdv.type_rdv, badge: "bg-gray-100 text-gray-600", bloc: "bg-gray-400" } as const);

  const statutCfg =
    RDV_STATUT_CONFIG[rdv.statut as keyof typeof RDV_STATUT_CONFIG] ??
    ({ label: rdv.statut, badge: "bg-gray-100 text-gray-500" } as const);

  const isTermine = rdv.statut === "realise" || rdv.statut === "annule";

  function handleStatut(newStatut: string) {
    startTransition(async () => {
      await updateRdvStatut(rdv.id, newStatut);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Supprimer ce RDV ?")) return;
    startTransition(async () => {
      await deleteRdv(rdv.id);
      router.refresh();
    });
  }

  // Dossier info pour modal d'édition (locked si connu)
  const lockedDossier: DossierOption | undefined = rdv.dossier
    ? {
        id: rdv.dossier.id,
        reference: rdv.dossier.reference,
        clientNom: rdv.dossier.client?.nom ?? "—",
        siteNom: rdv.dossier.site?.nom ?? null,
      }
    : undefined;

  return (
    <>
      <div
        className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
          isTermine ? "opacity-60 border-border" : "border-border hover:shadow-md"
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-semibold text-sm text-foreground">
              {formatRdvDate(rdv.date_rdv)}
            </p>
            <p className="text-xs text-muted">{formatDuree(rdv.duree_minutes)}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeCfg.badge}`}>
              {typeCfg.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statutCfg.badge}`}>
              {statutCfg.label}
            </span>
          </div>
        </div>

        {/* ── Client / Dossier ────────────────────────────────────────── */}
        {rdv.dossier && (
          <div className="mb-2">
            <p className="text-sm text-foreground/80">
              {rdv.dossier.client?.nom ?? "—"}
              {rdv.dossier.site?.nom && (
                <span className="text-muted"> · {rdv.dossier.site.nom}</span>
              )}
            </p>
            <Link
              href={`/dossiers/${rdv.dossier.id}`}
              className="text-xs text-primary hover:underline"
            >
              {rdv.dossier.reference}
            </Link>
          </div>
        )}

        {/* ── Notes ───────────────────────────────────────────────────── */}
        {rdv.notes && (
          <p className="text-xs text-muted mb-3 line-clamp-2 italic">
            {rdv.notes}
          </p>
        )}

        {/* ── Actions ─────────────────────────────────────────────────── */}
        {!isTermine && (
          <div className="flex gap-2 flex-wrap mt-1">
            <button
              onClick={() => setEditOpen(true)}
              disabled={isPending}
              className="min-h-[44px] flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Modifier
            </button>
            <button
              onClick={() => handleStatut("realise")}
              disabled={isPending}
              className="min-h-[44px] flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              {isPending ? "…" : "✓ Réalisé"}
            </button>
            <button
              onClick={() => handleStatut("annule")}
              disabled={isPending}
              className="min-h-[44px] rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}

        {isTermine && (
          <div className="flex justify-end mt-1">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="min-h-[44px] rounded-lg px-3 py-2 text-xs text-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Modal édition */}
      <RdvModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        dossiers={dossiers}
        lockedDossier={lockedDossier}
        editRdv={rdv}
      />
    </>
  );
}
