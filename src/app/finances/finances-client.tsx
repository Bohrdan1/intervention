"use client";

import { useState } from "react";
import Link from "next/link";

interface RapportRow {
  id: string;
  numero_cm: string;
  type_rapport: string;
  date_intervention: string;
  montant_ht: number | null;
  client_nom: string | null;
  site_nom: string | null;
}

interface Props {
  rapports: RapportRow[];
  sansMontantCount: number;
  updateMontantAction: (fd: FormData) => Promise<void>;
}

const TYPE_ICONS: Record<string, string> = {
  maintenance: "🔧",
  intervention: "⚡",
  visite: "📐",
};

export function FinancesClient({ rapports, sansMontantCount, updateMontantAction }: Props) {
  const [showSansMontant, setShowSansMontant] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sansMontant = rapports.filter((r) => r.montant_ht == null);
  const avecMontant = rapports.filter((r) => r.montant_ht != null);

  if (sansMontantCount === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-700">
          ✅ Tous les rapports finalisés ont un montant renseigné
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Alerte montants manquants */}
      <button
        type="button"
        onClick={() => setShowSansMontant(!showSansMontant)}
        className="w-full mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              💰 {sansMontantCount} rapport{sansMontantCount > 1 ? "s" : ""} sans montant
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Renseignez les montants pour des stats précises
            </p>
          </div>
          <span className="text-amber-600 text-sm">
            {showSansMontant ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {showSansMontant && (
        <div className="mb-4 space-y-2">
          {sansMontant.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{TYPE_ICONS[r.type_rapport] ?? "📋"}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/rapports/${r.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {r.numero_cm}
                  </Link>
                  <p className="text-xs text-muted truncate">
                    {r.client_nom} · {new Date(r.date_intervention + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                </div>
                {editingId === r.id ? (
                  <form
                    action={async (fd) => {
                      await updateMontantAction(fd);
                      setEditingId(null);
                    }}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      type="number"
                      name="montant_ht"
                      placeholder="CFP"
                      autoFocus
                      className="w-28 rounded-lg border border-primary px-2 py-1 text-sm focus:outline-none"
                    />
                    <button type="submit" className="text-xs text-primary font-bold hover:underline">
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(r.id)}
                    className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    + Montant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste récente avec montants */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold">
            Derniers rapports facturés ({avecMontant.slice(0, 10).length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {avecMontant.slice(0, 10).map((r) => (
            <div key={r.id} className="flex items-center px-4 py-2.5 gap-3">
              <span className="text-sm">{TYPE_ICONS[r.type_rapport] ?? "📋"}</span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/rapports/${r.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {r.numero_cm}
                </Link>
                <p className="text-xs text-muted truncate">
                  {r.client_nom}
                  {r.site_nom ? ` · ${r.site_nom}` : ""}
                  {" · "}
                  {new Date(r.date_intervention + "T12:00:00").toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              {editingId === r.id ? (
                <form
                  action={async (fd) => {
                    await updateMontantAction(fd);
                    setEditingId(null);
                  }}
                  className="flex items-center gap-1"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    type="number"
                    name="montant_ht"
                    defaultValue={r.montant_ht ?? ""}
                    autoFocus
                    className="w-28 rounded-lg border border-primary px-2 py-1 text-sm focus:outline-none"
                  />
                  <button type="submit" className="text-xs text-primary font-bold">OK</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-muted">✕</button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingId(r.id)}
                  className="shrink-0 text-sm font-semibold text-right hover:text-primary"
                  title="Modifier le montant"
                >
                  {r.montant_ht!.toLocaleString("fr-FR")} CFP
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
