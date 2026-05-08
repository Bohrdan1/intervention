import Link from "next/link";

export interface AlerteMaintenance {
  siteId: string;
  siteNom: string;
  clientNom: string;
  clientId: string;
  periodicite: number;
  derniereCM: string | null;  // date ISO de la dernière CM finalisée, ou null
  prochaineCM: string | null; // date ISO calculée, ou null si jamais fait
  joursRestants: number | null; // négatif = en retard, null = jamais fait
}

interface Props {
  alertes: AlerteMaintenance[];
}

function StatutBadge({ jours }: { jours: number | null }) {
  if (jours === null) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        Jamais effectuée
      </span>
    );
  }
  if (jours < 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        En retard de {Math.abs(jours)} j
      </span>
    );
  }
  if (jours <= 30) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Dans {jours} j
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Dans {jours} j
    </span>
  );
}

export function MaintenanceAlerts({ alertes }: Props) {
  if (alertes.length === 0) return null;

  const retard = alertes.filter((a) => a.joursRestants !== null && a.joursRestants < 0);
  const urgent = alertes.filter((a) => a.joursRestants !== null && a.joursRestants >= 0 && a.joursRestants <= 30);
  const jamais = alertes.filter((a) => a.joursRestants === null);

  const totalAlerte = retard.length + urgent.length + jamais.length;

  return (
    <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-orange-900 flex items-center gap-2">
          🔔 Maintenances à planifier
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
            {totalAlerte}
          </span>
        </h2>
        <Link
          href="/clients"
          className="text-xs text-orange-700 hover:underline"
        >
          Gérer les contrats →
        </Link>
      </div>

      <div className="space-y-2">
        {[...retard, ...jamais, ...urgent].map((alerte) => (
          <div
            key={alerte.siteId}
            className="flex items-center justify-between rounded-lg bg-white border border-orange-100 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{alerte.clientNom}</p>
              <p className="text-xs text-muted truncate">
                📍 {alerte.siteNom}
                {alerte.derniereCM && (
                  <> · Dernière CM : {new Date(alerte.derniereCM + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</>
                )}
              </p>
            </div>
            <div className="ml-3 flex items-center gap-2 shrink-0">
              <StatutBadge jours={alerte.joursRestants} />
              <Link
                href={`/rapports/nouveau?client_id=${alerte.clientId}&site_id=${alerte.siteId}&type=maintenance`}
                className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                + CM
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
