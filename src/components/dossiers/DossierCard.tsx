"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

export type DossierRow = {
  id: string;
  reference: string;
  titre: string | null;
  type_dossier: string;
  statut: string;
  date_ouverture: string;
  date_cloture: string | null;
  montant_total_ht: number | null;
  facture_statut?: string;
  offert: boolean;
  is_urgent: boolean;
  prochainRdv: {
    date_rdv: string;
    type_rdv: string;
    statut: string;
  } | null;
  client: { id: string; nom: string } | null;
  site: { nom: string } | null;
  rapports: { id: string }[];
};

// ── Config ─────────────────────────────────────────────────────────────────

type KnownType =
  | "urgent"
  | "contrat"
  | "visite"
  | "maintenance"
  | "installation"
  | "remplacement"
  | "intervention"
  | "autre";

type KnownStatut =
  | "ouvert"
  | "en_cours"
  | "en_attente"
  | "facture"
  | "termine"
  | "annule";

const TYPE_CONFIG: Record<KnownType, { label: string; badge: string }> = {
  urgent:        { label: "Urgent",        badge: "bg-red-100 text-red-800" },
  contrat:       { label: "Contrat",       badge: "bg-blue-100 text-blue-800" },
  visite:        { label: "Visite",        badge: "bg-teal-100 text-teal-800" },
  maintenance:   { label: "Maintenance",   badge: "bg-sky-100 text-sky-700" },
  installation:  { label: "Installation",  badge: "bg-purple-100 text-purple-800" },
  remplacement:  { label: "Remplacement",  badge: "bg-orange-100 text-orange-800" },
  intervention:  { label: "Intervention",  badge: "bg-violet-100 text-violet-700" },
  autre:         { label: "Autre",         badge: "bg-gray-100 text-gray-600" },
};

const STATUT_CONFIG: Record<KnownStatut, { label: string; badge: string }> = {
  ouvert:     { label: "Ouvert",     badge: "bg-yellow-100 text-yellow-800" },
  en_cours:   { label: "En cours",   badge: "bg-orange-100 text-orange-800" },
  en_attente: { label: "En attente", badge: "bg-gray-100 text-gray-600" },
  facture:    { label: "Facturé",    badge: "bg-blue-100 text-blue-700" },
  termine:    { label: "Terminé",    badge: "bg-green-100 text-green-700" },
  annule:     { label: "Annulé",     badge: "bg-red-50 text-red-500" },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatRdvShort(dateIso: string): string {
  const NC_OFFSET_MS = 11 * 60 * 60 * 1000;
  const d = new Date(new Date(dateIso).getTime() + NC_OFFSET_MS);
  const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const mois = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${jours[d.getUTCDay()]} ${d.getUTCDate()} ${mois[d.getUTCMonth()]} · ${pad(d.getUTCHours())}h${pad(d.getUTCMinutes())}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function DossierCard({ dossier }: { dossier: DossierRow }) {
  const router = useRouter();
  const typeCfg =
    TYPE_CONFIG[dossier.type_dossier as KnownType] ??
    ({ label: dossier.type_dossier, badge: "bg-gray-100 text-gray-600" } as const);

  const statutCfg =
    STATUT_CONFIG[dossier.statut as KnownStatut] ??
    ({ label: dossier.statut, badge: "bg-gray-100 text-gray-600" } as const);

  const nbRapports = dossier.rapports.length;

  return (
    <div
      className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99] cursor-pointer"
      onClick={() => router.push(`/dossiers/${dossier.id}`)}
    >

      {/* Badges + référence */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {dossier.is_urgent && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
              ⚡ Urgent
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeCfg.badge}`}>
            {typeCfg.label}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statutCfg.badge}`}>
            {statutCfg.label}
          </span>
        </div>
        <span className="text-xs text-muted shrink-0">{dossier.reference}</span>
      </div>

      {/* Titre */}
      {dossier.titre && (
        <p className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
          {dossier.titre}
        </p>
      )}

      {/* Client · Site */}
      <p className="text-sm text-foreground/80">
        {dossier.client ? (
          <Link
            href={`/clients/${dossier.client.id}`}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {dossier.client.nom}
          </Link>
        ) : "—"}
        {dossier.site?.nom && (
          <span className="text-muted"> · {dossier.site.nom}</span>
        )}
      </p>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Ouvert le {formatDate(dossier.date_ouverture)}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Badges facturation */}
          {dossier.offert && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
              🎁 Offert
            </span>
          )}
          {!dossier.offert && dossier.statut === "termine" && dossier.facture_statut === "non_facture" && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">
              Non facturé
            </span>
          )}
          {dossier.facture_statut === "en_retard" && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
              En retard
            </span>
          )}
          {dossier.facture_statut === "paye" && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
              Payé ✓
            </span>
          )}
          {nbRapports > 0 && (
            <span className="text-xs text-muted">
              📋 {nbRapports} rapport{nbRapports > 1 ? "s" : ""}
            </span>
          )}
          {dossier.montant_total_ht != null && (
            <span className="text-xs font-medium text-foreground">
              {dossier.montant_total_ht.toLocaleString("fr-FR")} CFP
            </span>
          )}
          </div>
        </div>
        {dossier.prochainRdv ? (
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            <span>📅</span>
            <span>{formatRdvShort(dossier.prochainRdv.date_rdv)}</span>
            {dossier.prochainRdv.statut === "confirme" && (
              <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium">Confirmé</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-muted/50 mt-1 flex items-center gap-1">
            <span>📅</span>
            <span>Aucun RDV</span>
          </p>
        )}
      </div>
    </div>
  );
}
