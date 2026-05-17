"use client";

import { useState } from "react";
import Link from "next/link";
import type { RdvWithDossier } from "./rdv-types";
import { RDV_TYPE_CONFIG, formatDuree } from "./rdv-types";

// ── Constantes ──────────────────────────────────────────────────────────────

const HEURE_DEBUT  = 7;
const HEURE_FIN    = 19;
const NB_SLOTS     = (HEURE_FIN - HEURE_DEBUT) * 2; // 24 créneaux × 30 min

const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_COURTS  = [
  "jan", "fév", "mar", "avr", "mai", "jun",
  "jul", "aoû", "sep", "oct", "nov", "déc",
];

/**
 * Décalage Nouméa par rapport à UTC, en ms.
 * Nouvelle-Calédonie = UTC+11, sans heure d'été.
 */
const NC_OFFSET_MS = 11 * 60 * 60 * 1000;

// ── Helpers timezone ─────────────────────────────────────────────────────────

/**
 * Retourne un Date dont les méthodes getUTC*() donnent l'heure locale
 * à Nouméa (UTC+11).  Tous les calculs calendaires doivent passer par là.
 */
function toNC(date: Date | string): Date {
  const ms = (typeof date === "string" ? new Date(date) : date).getTime();
  return new Date(ms + NC_OFFSET_MS);
}

/**
 * Date "minuit UTC" représentant un jour calendaire Nouméa.
 * Permet les comparaisons >= / <= entre jours.
 */
function ncMidnight(nc: Date): Date {
  return new Date(
    Date.UTC(nc.getUTCFullYear(), nc.getUTCMonth(), nc.getUTCDate())
  );
}

/** Lundi de la semaine contenant `nc` (résultat = ncMidnight). */
function getMonday(nc: Date): Date {
  const d = ncMidnight(nc);
  const dow = d.getUTCDay(); // 0 = dim, 1 = lun …
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/** Ajoute `days` jours à une date ncMidnight (sans mutation). */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isToday(d: Date): boolean {
  // d et today sont tous les deux des ncMidnight
  const today = ncMidnight(toNC(new Date()));
  return d.getTime() === today.getTime();
}

// ── Positionnement CSS grid ───────────────────────────────────────────────────

type GridPos = {
  rowStart: number;
  rowSpan: number;
  col: number; // 2 = lun … 8 = dim
};

/**
 * Calcule la position grid d'un RDV en heure Nouméa.
 * Retourne null si le RDV est hors de la plage 07:00-19:00 ou hors semaine.
 */
function getGridPos(rdv: RdvWithDossier, lundi: Date): GridPos | null {
  const nc  = toNC(rdv.date_rdv);
  const h   = nc.getUTCHours();
  const m   = nc.getUTCMinutes();

  if (h < HEURE_DEBUT || h >= HEURE_FIN) return null;

  const dateOnly = ncMidnight(nc);
  const diff = Math.round(
    (dateOnly.getTime() - lundi.getTime()) / 86_400_000
  );
  if (diff < 0 || diff > 6) return null;

  const slotStart = (h - HEURE_DEBUT) * 2 + Math.floor(m / 30);
  const rowStart  = slotStart + 2; // +1 header row, row-start base 1
  const dureeMins = rdv.duree_minutes ?? 60;
  const rowSpan   = Math.max(1, Math.ceil(dureeMins / 30));
  const col       = diff + 2; // 2 = lundi … 8 = dimanche

  return { rowStart, rowSpan, col };
}

// ── Labels horaires ───────────────────────────────────────────────────────────

function timeLabel(slot: number): string {
  const h = HEURE_DEBUT + Math.floor(slot / 2);
  const m = slot % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
}

// ── Component ──────────────────────────────────────────────────────────────

type Props = {
  rdvs: RdvWithDossier[];
};

export function RdvCalendrierSemaine({ rdvs }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Lundi/dimanche de la semaine affichée, en heure Nouméa
  const lundi    = addDays(getMonday(toNC(new Date())), weekOffset * 7);
  const dimanche = addDays(lundi, 6);

  // Titre de la semaine
  const titreDebut   = `${lundi.getUTCDate()} ${MOIS_COURTS[lundi.getUTCMonth()]}`;
  const titreFin     = `${dimanche.getUTCDate()} ${MOIS_COURTS[dimanche.getUTCMonth()]} ${dimanche.getUTCFullYear()}`;
  const titreSemaine = `${titreDebut} – ${titreFin}`;

  // Filtrage des RDVs de la semaine en heure Nouméa
  const rdvsSemaine = rdvs.filter((r) => {
    const d = ncMidnight(toNC(r.date_rdv));
    return d >= lundi && d <= dimanche;
  });

  // Labels des jours (en-tête colonne)
  const joursDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(lundi, i);
    return { label: JOURS_COURTS[i], num: d.getUTCDate(), isToday: isToday(d) };
  });

  const SLOT_H = "2rem";

  return (
    <div>
      {/* ── Navigation semaine ──────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          onClick={() => setWeekOffset((n) => n - 1)}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 active:scale-95"
        >
          ← Préc.
        </button>
        <p className="text-sm font-semibold text-center">{titreSemaine}</p>
        <div className="flex gap-2">
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="min-h-[44px] rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50"
            >
              Auj.
            </button>
          )}
          <button
            onClick={() => setWeekOffset((n) => n + 1)}
            className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 active:scale-95"
          >
            Suiv. →
          </button>
        </div>
      </div>

      {/* ── Grille ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: `3rem repeat(7, minmax(4rem, 1fr))`,
            gridTemplateRows: `2.5rem repeat(${NB_SLOTS}, ${SLOT_H})`,
            minWidth: "36rem",
          }}
        >
          {/* ── En-têtes jours ────────────────────────────────────── */}
          <div
            className="sticky top-0 bg-white border-b border-r border-border z-10"
            style={{ gridRow: 1, gridColumn: 1 }}
          />
          {joursDates.map((j, i) => (
            <div
              key={i}
              className={`sticky top-0 z-10 flex flex-col items-center justify-center border-b border-r border-border text-xs font-medium py-1 ${
                j.isToday ? "bg-primary/5 text-primary" : "bg-white text-muted"
              }`}
              style={{ gridRow: 1, gridColumn: i + 2 }}
            >
              <span>{j.label}</span>
              <span
                className={`text-sm font-bold ${
                  j.isToday
                    ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                    : ""
                }`}
              >
                {j.num}
              </span>
            </div>
          ))}

          {/* ── Labels horaires (colonne gauche) ──────────────────── */}
          {Array.from({ length: NB_SLOTS }, (_, slot) => (
            <div
              key={`t-${slot}`}
              className="border-b border-r border-border/40 pr-1 flex items-start justify-end"
              style={{ gridRow: slot + 2, gridColumn: 1, height: SLOT_H }}
            >
              {slot % 2 === 0 && (
                <span className="text-[0.6rem] text-muted leading-none pt-0.5">
                  {timeLabel(slot)}
                </span>
              )}
            </div>
          ))}

          {/* ── Cellules de fond ──────────────────────────────────── */}
          {Array.from({ length: NB_SLOTS }, (_, slot) =>
            Array.from({ length: 7 }, (_, day) => (
              <div
                key={`bg-${slot}-${day}`}
                className={`border-b border-r border-border/30 ${
                  slot % 2 === 0 ? "border-b-border/50" : "border-b-border/20"
                }`}
                style={{
                  gridRow: slot + 2,
                  gridColumn: day + 2,
                  height: SLOT_H,
                }}
              />
            ))
          )}

          {/* ── Blocs RDV ─────────────────────────────────────────── */}
          {rdvsSemaine.map((rdv) => {
            const pos = getGridPos(rdv, lundi);
            if (!pos) return null;

            const cfg =
              RDV_TYPE_CONFIG[rdv.type_rdv as keyof typeof RDV_TYPE_CONFIG] ??
              ({
                label: rdv.type_rdv,
                badge: "bg-gray-100 text-gray-600",
                bloc: "bg-gray-400",
              } as const);

            const href  = rdv.dossier ? `/dossiers/${rdv.dossier.id}` : "#";
            const label = rdv.dossier?.client?.nom ?? rdv.dossier?.reference ?? cfg.label;

            return (
              <Link
                key={rdv.id}
                href={href}
                title={`${cfg.label} — ${label}\n${formatDuree(rdv.duree_minutes)}${rdv.notes ? "\n" + rdv.notes : ""}`}
                className={`rounded px-1 py-0.5 text-white text-[0.6rem] leading-tight overflow-hidden cursor-pointer hover:brightness-90 transition-all z-20 mx-0.5 ${cfg.bloc}`}
                style={{
                  gridRow: `${pos.rowStart} / span ${pos.rowSpan}`,
                  gridColumn: pos.col,
                  minHeight: "44px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  position: "relative",
                }}
              >
                <span className="font-semibold truncate">{cfg.label}</span>
                <span className="truncate opacity-90">{label}</span>
                <span className="opacity-75">{formatDuree(rdv.duree_minutes)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {rdvsSemaine.length === 0 && (
        <p className="mt-3 text-center text-sm text-muted">
          Aucun RDV cette semaine.
        </p>
      )}
    </div>
  );
}
