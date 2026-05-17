"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

export type DossierFacturationRow = {
  id: string;
  reference: string;
  facture_statut: string;
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  clientId: string | null;
  clientNom: string;
};

// ── Config ─────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  non_facture: { label: "Non facturé", badge: "bg-gray-100 text-gray-600" },
  facture:     { label: "Facturé",     badge: "bg-blue-100 text-blue-700" },
  paye:        { label: "Payé",        badge: "bg-green-100 text-green-700" },
  en_retard:   { label: "En retard",   badge: "bg-red-100 text-red-700" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function FinancesClient({
  dossiers,
}: {
  dossiers: DossierFacturationRow[];
}) {
  const [filtre, setFiltre] = useState<string>("tous");

  const filtered =
    filtre === "tous"
      ? dossiers
      : dossiers.filter((d) => d.facture_statut === filtre);

  const filtres: { key: string; label: string }[] = [
    { key: "tous",        label: "Tous" },
    { key: "non_facture", label: "Non facturés" },
    { key: "facture",     label: "Facturés" },
    { key: "en_retard",   label: "En retard" },
    { key: "paye",        label: "Payés" },
  ];

  return (
    <div>
      {/* ── Filtres ─────────────────────────────────────────────────── */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {filtres.map(({ key, label }) => {
          const count =
            key === "tous"
              ? dossiers.length
              : dossiers.filter((d) => d.facture_statut === key).length;
          return (
            <button
              key={key}
              onClick={() => setFiltre(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filtre === key
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted hover:bg-slate-50"
              }`}
            >
              {label}{" "}
              <span className={filtre === key ? "opacity-70" : "opacity-50"}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Liste ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">Aucun dossier dans cette catégorie.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((d) => {
              const cfg =
                STATUT_CONFIG[d.facture_statut] ?? STATUT_CONFIG.non_facture;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dossiers/${d.id}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {d.reference}
                      </Link>
                      {d.facture_numero && (
                        <span className="text-xs text-muted">
                          {d.facture_numero}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">
                      {d.clientId ? (
                        <Link
                          href={`/clients/${d.clientId}`}
                          className="hover:underline"
                        >
                          {d.clientNom}
                        </Link>
                      ) : (
                        d.clientNom
                      )}
                      {d.facture_date && (
                        <span className="ml-1.5">
                          · {formatDate(d.facture_date)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.facture_montant_ttc != null && (
                      <span className="text-sm font-semibold">
                        {d.facture_montant_ttc.toLocaleString("fr-FR")} F
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
