const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3";

async function getAccessToken(): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google token error: " + JSON.stringify(data));
  return data.access_token;
}

// Convertit une date UTC ISO en format RFC3339 Nouméa (UTC+11)
function toGoogleDateTime(isoUtc: string, durationMinutes: number) {
  const start = new Date(isoUtc);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return {
    start: { dateTime: start.toISOString(), timeZone: "Pacific/Noumea" },
    end:   { dateTime: end.toISOString(),   timeZone: "Pacific/Noumea" },
  };
}

export interface RdvForCalendar {
  id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: string;
  notes: string | null;
  dossier: {
    reference: string;
    client: { nom: string } | null;
    site: { nom: string; adresse: string | null } | null;
  } | null;
}

function buildEvent(rdv: RdvForCalendar) {
  const client = rdv.dossier?.client?.nom ?? "Client inconnu";
  const site = rdv.dossier?.site?.nom ?? "";
  const ref = rdv.dossier?.reference ?? "";
  const type = rdv.type_rdv.charAt(0).toUpperCase() + rdv.type_rdv.slice(1);

  const title = `[${type}] ${client}${site ? " · " + site : ""}`;
  const description = [
    ref ? `Dossier : ${ref}` : "",
    rdv.notes ? `Notes : ${rdv.notes}` : "",
    `ID Odessa : ${rdv.id}`,
  ].filter(Boolean).join("\n");

  const { start, end } = toGoogleDateTime(rdv.date_rdv, rdv.duree_minutes ?? 60);

  return {
    summary: title,
    description,
    location: rdv.dossier?.site?.adresse ?? undefined,
    start,
    end,
  };
}

export async function createGoogleEvent(rdv: RdvForCalendar): Promise<string | null> {
  try {
    const token = await getAccessToken();
    const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
    const res = await fetch(`${GOOGLE_CALENDAR_URL}/calendars/${calId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEvent(rdv)),
    });
    const data = await res.json() as { id?: string };
    return data.id ?? null;
  } catch (err) {
    console.error("[Google Calendar] createEvent error:", err);
    return null;
  }
}

export async function updateGoogleEvent(googleEventId: string, rdv: RdvForCalendar): Promise<void> {
  try {
    const token = await getAccessToken();
    const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
    await fetch(`${GOOGLE_CALENDAR_URL}/calendars/${calId}/events/${googleEventId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEvent(rdv)),
    });
  } catch (err) {
    console.error("[Google Calendar] updateEvent error:", err);
  }
}

export async function deleteGoogleEvent(googleEventId: string): Promise<void> {
  try {
    const token = await getAccessToken();
    const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
    await fetch(`${GOOGLE_CALENDAR_URL}/calendars/${calId}/events/${googleEventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("[Google Calendar] deleteEvent error:", err);
  }
}
