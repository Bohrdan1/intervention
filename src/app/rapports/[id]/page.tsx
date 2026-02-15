import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "./delete-button";
import type { PhotoItem } from "@/lib/types";

export default async function RapportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from("rapports")
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      controles(
        *,
        installation:installations(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!rapport) {
    redirect("/");
  }

  const isIntervention = rapport.type_rapport === "intervention";
  const photos: PhotoItem[] = rapport.photos || [];

  const controles = (rapport.controles || []).sort(
    (a: any, b: any) => a.page_number - b.page_number
  );

  const date = new Date(rapport.date_intervention).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-mono font-semibold text-primary">
            {rapport.numero_cm}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isIntervention
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isIntervention ? "Intervention" : "Maintenance"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              rapport.statut === "finalise"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {rapport.statut === "finalise" ? "Finalisé" : "Brouillon"}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{rapport.client?.nom}</h1>
        <p className="text-sm text-muted">
          {rapport.site?.nom} · {date}
        </p>
      </div>

      {/* Contenu selon le type */}
      {isIntervention ? (
        <div className="mb-6 space-y-4">
          {rapport.description_probleme && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
                Description du problème
              </h2>
              <p className="text-sm whitespace-pre-wrap">{rapport.description_probleme}</p>
            </div>
          )}

          {rapport.travaux_effectues && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
                Travaux effectués
              </h2>
              <p className="text-sm whitespace-pre-wrap">{rapport.travaux_effectues}</p>
            </div>
          )}

          {/* Photos intervention */}
          {photos.filter((p) => p.context === "intervention").length > 0 && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
                Photos
              </h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos
                  .filter((p) => p.context === "intervention")
                  .map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.label || "Photo"}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                  ))}
              </div>
            </div>
          )}

          {rapport.pieces_utilisees && (rapport.pieces_utilisees as any[]).length > 0 && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
                Pièces et matériel
              </h2>
              <div className="space-y-2">
                {(rapport.pieces_utilisees as any[]).map((piece: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{piece.nom}</span>
                    <span className="text-muted">x{piece.quantite}</span>
                    {piece.reference && (
                      <span className="text-xs text-muted">({piece.reference})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!rapport.description_probleme && !rapport.travaux_effectues && (
            <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
              <p className="text-muted text-sm">
                Aucune information saisie pour cette intervention.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
            Portes contrôlées ({controles.length})
          </h2>
          {controles.map((controle: any) => {
            const nbOk = controle.points_controle.filter((p: any) => p.etat === "ok").length;
            const total = controle.points_controle.length;
            const controlePhotos = photos.filter(
              (p) => p.context === `controle:${controle.installation?.id}`
            );

            return (
              <div
                key={controle.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">🚪 {controle.installation?.repere}</p>
                    <p className="text-xs text-muted">
                      {controle.installation?.type_porte}
                      {controle.installation?.modele ? ` · ${controle.installation.modele}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {nbOk}/{total} OK
                    </p>
                  </div>
                </div>
                {/* Observations non-OK */}
                {controle.points_controle
                  .filter((p: any) => p.etat !== "ok" && p.etat !== "na")
                  .map((p: any, i: number) => (
                    <div key={i} className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                      <span className={`text-xs font-medium ${
                        p.etat === "correction" ? "text-red-700" : "text-orange-700"
                      }`}>
                        {p.etat === "correction" ? "Correction" : "Prévention"}
                      </span>
                      <span className="text-xs text-muted"> · {p.nom}</span>
                      {p.observation && (
                        <p className="text-xs mt-0.5">{p.observation}</p>
                      )}
                    </div>
                  ))}
                {/* Photos de cette porte */}
                {controlePhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {controlePhotos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.label || "Photo"}
                        className="h-16 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isIntervention ? (
          <Link
            href={`/rapports/${rapport.id}/intervention`}
            className="flex-1 rounded-xl border border-border bg-white py-3 text-center text-sm font-medium hover:bg-slate-50"
          >
            Modifier l&apos;intervention
          </Link>
        ) : (
          <Link
            href={`/rapports/${rapport.id}/controle`}
            className="flex-1 rounded-xl border border-border bg-white py-3 text-center text-sm font-medium hover:bg-slate-50"
          >
            Modifier les contrôles
          </Link>
        )}
        <Link
          href={`/rapports/${rapport.id}/finaliser`}
          className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
        >
          Exporter PDF
        </Link>
      </div>

      {/* Supprimer (brouillons uniquement) */}
      {rapport.statut === "brouillon" && (
        <div className="mt-4">
          <DeleteButton rapportId={rapport.id} />
        </div>
      )}
    </div>
  );
}
