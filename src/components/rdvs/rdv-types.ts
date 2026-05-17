// Types UI partagés entre les composants RDV (aucun "use client" / "use server")

export type RdvType = "diagnostic" | "intervention" | "maintenance" | "visite";
export type RdvStatut = "planifie" | "confirme" | "realise" | "annule";

/** Un dossier tel qu'il apparaît dans les selects du modal RDV */
export type DossierOption = {
  id: string;
  reference: string;
  clientNom: string;
  siteNom: string | null;
};

/** RDV avec jointure dossier (pour l'agenda et le dashboard) */
export type RdvWithDossier = {
  id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: string;
  statut: string;
  notes: string | null;
  dossier_id: string | null;
  dossier: {
    id: string;
    reference: string;
    client: { id: string; nom: string } | null;
    site: { nom: string } | null;
  } | null;
};

/** RDV simplifié (sans jointure, dans le contexte d'une fiche dossier) */
export type RdvSimple = {
  id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: string;
  statut: string;
  notes: string | null;
};

// ── Config visuelle ────────────────────────────────────────────────────────

export const RDV_TYPE_CONFIG: Record<
  RdvType,
  { label: string; badge: string; bloc: string }
> = {
  diagnostic:   { label: "Diagnostic",   badge: "bg-violet-100 text-violet-800", bloc: "bg-violet-400" },
  intervention: { label: "Intervention", badge: "bg-red-100 text-red-800",    bloc: "bg-red-400" },
  maintenance:  { label: "Maintenance",  badge: "bg-blue-100 text-blue-800",   bloc: "bg-blue-400" },
  visite:       { label: "Visite",       badge: "bg-green-100 text-green-800", bloc: "bg-green-400" },
};

export const RDV_STATUT_CONFIG: Record<
  RdvStatut,
  { label: string; badge: string }
> = {
  planifie:  { label: "Planifié",  badge: "bg-yellow-100 text-yellow-800" },
  confirme:  { label: "Confirmé",  badge: "bg-blue-100 text-blue-700" },
  realise:   { label: "Réalisé",   badge: "bg-green-100 text-green-700" },
  annule:    { label: "Annulé",    badge: "bg-gray-100 text-gray-500" },
};

// ── Helpers de formatage (heure Nouméa UTC+11) ────────────────────────────

const TZ_NC = "Pacific/Noumea";

export function formatRdvDate(dateStr: string): string {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("fr-FR", {
    timeZone: TZ_NC,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("fr-FR", {
      timeZone: TZ_NC,
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", "h");
  return `${datePart} — ${timePart}`;
}

export function formatRdvDateCourt(dateStr: string): string {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("fr-FR", {
    timeZone: TZ_NC,
    day: "numeric",
    month: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("fr-FR", {
      timeZone: TZ_NC,
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", "h");
  return `${datePart} ${timePart}`;
}

export function formatDuree(minutes: number | null): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
