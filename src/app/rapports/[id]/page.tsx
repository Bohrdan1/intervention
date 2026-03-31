import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { DeleteButton } from "./delete-button";
import Image from "next/image";
import type { PhotoItem, VisiteData, PorteVisite, RapportComplet, PieceUtilisee } from "@/lib/types";

function getTypePorteLabel(porte: PorteVisite): string {
  if (porte.type_porte === "coulissante") {
    const type = porte.type_coulissante === "telescopique" ? "Télesco." : "Simple";
    return `Coulissante ${type} ${porte.vantaux}V${porte.parties_fixes > 0 ? ` + ${porte.parties_fixes}F` : ""}`;
  }
  if (porte.type_porte === "battante") {
    const sens = porte.sens_ouverture === "tirant" ? "Tirant" : "Poussant";
    return `Battante ${porte.vantaux}V ${sens}`;
  }
  return porte.type_autre || "Autre";
}

function getSupportLabel(s: string, autre?: string): string {
  const labels: Record<string, string> = { beton: "Béton", metal: "Métal", placo: "Placo renforcé", autre: "Autre" };
  if (s === "autre" && autre) return autre;
  return labels[s] || s;
}

function VisiteDetail({ rapport, photos }: { rapport: RapportComplet; photos: PhotoItem[] }) {
  const data: VisiteData | null = rapport.visite_data;
  const hasData = data && Object.keys(data).length > 0;

  if (!hasData) {
    return (
      <div className="mb-6">
        <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
          <p className="text-muted text-sm">Aucune information saisie pour cette visite.</p>
        </div>
      </div>
    );
  }

  const env = data.environnement || { acces: "", electricite: [], securite: [], activation: [] };
  const elecLabels: Record<string, string> = { "230v": "230V dispo", disjoncteur: "Disjoncteur dédié", a_prevoir: "À prévoir" };
  const secuLabels: Record<string, string> = { rideau_laser: "Rideau laser", cellules: "Cellules", barre_palpeuse: "Barre palpeuse", das: "DAS" };
  const actLabels: Record<string, string> = { radar: "Radar", bouton: "Bouton", digicode: "Digicode", badge: "Badge", telecommande: "Télécommande" };
  const visitePhotos = photos.filter((p) => p.context === "visite");

  return (
    <div className="mb-6 space-y-4">
      {/* Infos */}
      {(data.adresse || data.contact_sur_place) && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">Informations</h2>
          {data.adresse && <p className="text-sm"><span className="font-semibold">Adresse :</span> {data.adresse}</p>}
          {data.contact_sur_place && (
            <p className="text-sm">
              <span className="font-semibold">Contact :</span> {data.contact_sur_place}
              {data.telephone_contact ? ` (${data.telephone_contact})` : ""}
            </p>
          )}
        </div>
      )}

      {/* Travaux */}
      {data.travaux_envisages && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">Travaux envisagés</h2>
          <p className="text-sm whitespace-pre-wrap">{data.travaux_envisages}</p>
        </div>
      )}

      {/* Portes */}
      {data.portes && data.portes.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
            Portes ({data.portes.length})
          </h2>
          <div className="space-y-3">
            {data.portes.map((porte, i) => (
              <div key={porte.id || i} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-semibold mb-1">Porte {i + 1} — {getTypePorteLabel(porte)}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                  {porte.hauteur && <span>H: {porte.hauteur} mm</span>}
                  {porte.largeur && <span>L: {porte.largeur} mm</span>}
                  {porte.passage_utile && <span>PU: {porte.passage_utile} mm</span>}
                  {porte.linteau && <span>Linteau: {porte.linteau} mm</span>}
                  {porte.profondeur && <span>Prof: {porte.profondeur} mm</span>}
                  <span>Support: {getSupportLabel(porte.support, porte.support_autre)}</span>
                </div>
                {porte.debattement === "obstacle" && (
                  <p className="text-xs text-orange-600 mt-1">
                    Obstacle : {porte.debattement_detail || "Non précisé"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environnement */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">Environnement</h2>
        <div className="space-y-1 text-sm">
          {env.acces && <p><span className="font-semibold">Accès :</span> {env.acces}</p>}
          {env.electricite.length > 0 && (
            <p><span className="font-semibold">Électricité :</span> {env.electricite.map((v) => elecLabels[v] || v).join(", ")}</p>
          )}
          {env.securite.length > 0 && (
            <p><span className="font-semibold">Sécurité :</span> {env.securite.map((v) => secuLabels[v] || v).join(", ")}</p>
          )}
          {env.activation.length > 0 && (
            <p><span className="font-semibold">Activation :</span> {env.activation.map((v) => actLabels[v] || v).join(", ")}</p>
          )}
        </div>
      </div>

      {/* Observations */}
      {(data.observations_particulieres || data.preconisation) && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">Observations & Recommandations</h2>
          {data.observations_particulieres && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-muted">Observations</p>
              <p className="text-sm whitespace-pre-wrap">{data.observations_particulieres}</p>
            </div>
          )}
          {data.preconisation && (
            <div>
              <p className="text-xs font-semibold text-muted">Préconisation</p>
              <p className="text-sm whitespace-pre-wrap">{data.preconisation}</p>
            </div>
          )}
        </div>
      )}

      {/* Photos */}
      {visitePhotos.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Photos</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {visitePhotos.map((photo) => (
              <Image key={photo.id} src={photo.url} alt={photo.label || "Photo"} width={200} height={96} className="h-24 w-full rounded-lg object-cover" unoptimized />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const isVisite = rapport.type_rapport === "visite";
  const photos: PhotoItem[] = rapport.photos || [];

  const controles = (rapport.controles || []).sort(
    (a: { page_number: number }, b: { page_number: number }) => a.page_number - b.page_number
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
              isVisite
                ? "bg-teal-100 text-teal-700"
                : isIntervention
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {isVisite ? "Visite technique" : isIntervention ? "Intervention" : "Maintenance"}
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
      {isVisite ? (
        <VisiteDetail rapport={rapport} photos={photos} />
      ) : isIntervention ? (
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
                    <Image
                      key={photo.id}
                      src={photo.url}
                      alt={photo.label || "Photo"}
                      width={200}
                      height={96}
                      className="h-24 w-full rounded-lg object-cover"
                      unoptimized
                    />
                  ))}
              </div>
            </div>
          )}

          {rapport.pieces_utilisees && rapport.pieces_utilisees.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
                Pièces et matériel
              </h2>
              <div className="space-y-2">
                {rapport.pieces_utilisees.map((piece: PieceUtilisee, i: number) => (
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
          {controles.map((controle: RapportComplet["controles"][number]) => {
            const nbOk = controle.points_controle.filter((p) => p.etat === "ok").length;
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
                  .filter((p) => p.etat !== "ok" && p.etat !== "na")
                  .map((p, i) => (
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
                      <Image
                        key={photo.id}
                        src={photo.url}
                        alt={photo.label || "Photo"}
                        width={160}
                        height={64}
                        className="h-16 w-full rounded-lg object-cover"
                        unoptimized
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
        {isVisite ? (
          <>
            <Link
              href={`/rapports/${rapport.id}/visite`}
              className="flex-1 rounded-xl border border-border bg-white py-3 text-center text-sm font-medium hover:bg-slate-50"
            >
              Modifier
            </Link>
            <Link
              href={`/rapports/${rapport.id}/devis`}
              className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
            >
              Devis
            </Link>
          </>
        ) : isIntervention ? (
          <>
            <Link
              href={`/rapports/${rapport.id}/intervention`}
              className="flex-1 rounded-xl border border-border bg-white py-3 text-center text-sm font-medium hover:bg-slate-50"
            >
              Modifier l&apos;intervention
            </Link>
            {rapport.statut === 'finalise' ? (
              <Link
                href={`/rapports/${rapport.id}/pdf`}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
              >
                PDF
              </Link>
            ) : (
              <form
                action={async () => {
                  'use server';
                  const supabase = await createClient();
                  await supabase
                    .from('rapports')
                    .update({ statut: 'finalise', updated_at: new Date().toISOString() })
                    .eq('id', rapport.id);
                  revalidatePath(`/rapports/${rapport.id}`);
                  redirect(`/rapports/${rapport.id}/pdf`);
                }}
                className="flex-1"
              >
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light"
                >
                  Valider
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <Link
              href={`/rapports/${rapport.id}/controle`}
              className="flex-1 rounded-xl border border-border bg-white py-3 text-center text-sm font-medium hover:bg-slate-50"
            >
              Modifier les contrôles
            </Link>
            {rapport.statut === 'finalise' ? (
              <Link
                href={`/rapports/${rapport.id}/pdf`}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
              >
                PDF
              </Link>
            ) : (
              <form
                action={async () => {
                  'use server';
                  const supabase = await createClient();
                  await supabase
                    .from('rapports')
                    .update({ statut: 'finalise', updated_at: new Date().toISOString() })
                    .eq('id', rapport.id);
                  revalidatePath(`/rapports/${rapport.id}`);
                  redirect(`/rapports/${rapport.id}/pdf`);
                }}
                className="flex-1"
              >
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light"
                >
                  Valider
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Supprimer */}
      <div className="mt-4">
        <DeleteButton rapportId={rapport.id} isFinalise={rapport.statut === "finalise"} />
      </div>
    </div>
  );
}
