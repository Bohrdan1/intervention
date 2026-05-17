"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRdvStatut } from "@/app/actions/rdvs";
import { RdvModal } from "./RdvModal";
import type { RdvSimple, DossierOption } from "./rdv-types";
import {
  RDV_TYPE_CONFIG,
  RDV_STATUT_CONFIG,
  formatRdvDate,
  formatDuree,
} from "./rdv-types";

// ── Types ──────────────────────────────────────────────────────────────────

type Props = {
  dossierId: string;
  lockedDossier: DossierOption;
  rdvs: RdvSimple[];
};

// ── Ligne RDV ──────────────────────────────────────────────────────────────

function RdvRow({
  rdv,
  lockedDossier,
  onEdit,
}: {
  rdv: RdvSimple;
  lockedDossier: DossierOption;
  onEdit: (rdv: RdvSimple) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const typeCfg =
    RDV_TYPE_CONFIG[rdv.type_rdv as keyof typeof RDV_TYPE_CONFIG] ??
    ({ label: rdv.type_rdv, badge: "bg-gray-100 text-gray-600" } as const);
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

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {formatRdvDate(rdv.date_rdv)}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeCfg.badge}`}>
            {typeCfg.label}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statutCfg.badge}`}>
            {statutCfg.label}
          </span>
          <span className="text-xs text-muted">{formatDuree(rdv.duree_minutes)}</span>
        </div>
        {rdv.notes && (
          <p className="mt-1 text-xs text-muted italic line-clamp-1">{rdv.notes}</p>
        )}
      </div>

      {/* Actions */}
      {!isTermine && (
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(rdv)}
            disabled={isPending}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-2 text-xs hover:bg-slate-50 disabled:opacity-50"
          >
            ✏️
          </button>
          <button
            onClick={() => handleStatut("realise")}
            disabled={isPending}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-green-200 bg-green-50 px-2 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            {isPending ? "…" : "✓"}
          </button>
          <button
            onClick={() => handleStatut("annule")}
            disabled={isPending}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-2 text-xs text-muted hover:bg-slate-50 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── Section principale ─────────────────────────────────────────────────────

export function DossierRdvSection({ dossierId, lockedDossier, rdvs }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editRdv, setEditRdv] = useState<RdvSimple | null>(null);

  // Séparer à venir vs terminés
  const aVenir = rdvs.filter((r) => r.statut !== "realise" && r.statut !== "annule");
  const termines = rdvs.filter((r) => r.statut === "realise" || r.statut === "annule");

  return (
    <div>
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">
          RDV{" "}
          <span className="ml-1 text-sm font-normal text-muted">
            ({aVenir.length} à venir)
          </span>
        </h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="min-h-[44px] rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-light"
        >
          + RDV
        </button>
      </div>

      {/* ── Liste à venir ────────────────────────────────────────────── */}
      {aVenir.length === 0 && termines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted">Aucun RDV dans ce dossier.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 min-h-[44px] text-sm text-primary hover:underline"
          >
            Ajouter un RDV →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {aVenir.map((rdv) => (
            <RdvRow
              key={rdv.id}
              rdv={rdv}
              lockedDossier={lockedDossier}
              onEdit={(r) => setEditRdv(r)}
            />
          ))}

          {termines.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted hover:text-foreground list-none flex items-center gap-1">
                <span>▶</span>
                <span>{termines.length} RDV terminé{termines.length > 1 ? "s" : ""}</span>
              </summary>
              <div className="mt-2 space-y-2 opacity-60">
                {termines.map((rdv) => (
                  <RdvRow
                    key={rdv.id}
                    rdv={rdv}
                    lockedDossier={lockedDossier}
                    onEdit={(r) => setEditRdv(r)}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <RdvModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        dossiers={[]}
        lockedDossier={lockedDossier}
      />

      <RdvModal
        open={!!editRdv}
        onClose={() => setEditRdv(null)}
        dossiers={[]}
        lockedDossier={lockedDossier}
        editRdv={editRdv}
      />
    </div>
  );
}
