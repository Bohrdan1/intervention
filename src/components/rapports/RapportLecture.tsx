"use client";

import Link from "next/link";
import Image from "next/image";
import { ArchiveButton } from "@/app/rapports/[id]/archive-button";
import { DeleteButton } from "@/app/rapports/[id]/delete-button";
import { RattacherDossierButton } from "./RattacherDossierButton";
import type {
  RapportComplet,
  ConstatItem,
  PieceUtilisee,
  PointControle,
  PointERP,
  EtatControle,
  PhotoItem,
  VisiteData,
  PorteVisite,
} from "@/lib/types";
import type { DossierChoix } from "./RattacherDossierModal";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function EtatBadge({ etat }: { etat: EtatControle }) {
  const cfg: Record<EtatControle, { label: string; cls: string }> = {
    ok:         { label: "OK",          cls: "bg-green-100 text-green-700" },
    correction: { label: "Correction",  cls: "bg-red-100 text-red-700" },
    prevention: { label: "Prévention",  cls: "bg-orange-100 text-orange-700" },
    na:         { label: "N/A",         cls: "bg-gray-100 text-gray-500" },
  };
  const c = cfg[etat] ?? { label: etat, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}

function ConformeBadge({ conforme }: { conforme: boolean }) {
  return conforme
    ? <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Conforme</span>
    : <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Non conforme</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

function PiecesTable({ pieces }: { pieces: PieceUtilisee[] }) {
  return (
    <Section title="Pièces et matériel">
      <div className="divide-y divide-border">
        {pieces.map((piece, i) => (
          <div key={i} className="flex items-center gap-3 py-2 text-sm">
            <span className="flex-1 font-medium">{piece.nom}</span>
            <span className="text-muted">x{piece.quantite}</span>
            {piece.reference && (
              <span className="text-xs text-muted">({piece.reference})</span>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ConstatList({ items }: { items: ConstatItem[] }) {
  return (
    <Section title="Constat général">
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <ConformeBadge conforme={item.conforme} />
            <div>
              <p className="text-xs font-semibold">{item.label}</p>
              {item.texte && <p className="text-xs text-muted">{item.texte}</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

type ControleRow = RapportComplet["controles"][number];

function ControleCard({ controle, photos }: { controle: ControleRow; photos: PhotoItem[] }) {
  const controlePhotos = photos.filter(
    (p) => p.context === `controle:${controle.equipement?.id}`
  );
  const nbOk = controle.points_controle.filter((p: PointControle) => p.etat === "ok").length;
  const total = controle.points_controle.length;

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">🚪 {controle.equipement?.repere}</p>
          <p className="text-xs text-muted">
            {controle.equipement?.type_porte}
            {controle.equipement?.modele ? ` · ${controle.equipement.modele}` : ""}
          </p>
        </div>
        <p className="text-sm font-bold text-green-600">{nbOk}/{total} OK</p>
      </div>

      {/* Points de contrôle */}
      {controle.points_controle.length > 0 && (
        <div className="mb-3 space-y-1">
          {controle.points_controle.map((p: PointControle, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <EtatBadge etat={p.etat} />
              <span className="text-xs">{p.nom}</span>
              {p.observation && (
                <span className="text-xs text-muted">— {p.observation}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Points ERP */}
      {controle.points_erp && controle.points_erp.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">ERP</p>
          <div className="space-y-1">
            {controle.points_erp.map((p: PointERP, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <ConformeBadge conforme={p.conforme} />
                <span className="text-xs">{p.nom}</span>
                {p.commentaire && (
                  <span className="text-xs text-muted">— {p.commentaire}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infos supplémentaires */}
      {(controle.nombre_cycles != null || controle.heures_fonctionnement != null || controle.note_supplementaire) && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs space-y-1">
          {controle.nombre_cycles != null && (
            <p><span className="font-medium">Cycles :</span> {controle.nombre_cycles}</p>
          )}
          {controle.heures_fonctionnement != null && (
            <p><span className="font-medium">Heures :</span> {controle.heures_fonctionnement}</p>
          )}
          {controle.note_supplementaire && (
            <p className="whitespace-pre-wrap">{controle.note_supplementaire}</p>
          )}
        </div>
      )}

      {/* Photos */}
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
}

function VisiteDataLecture({ data }: { data: VisiteData }) {
  const env = data.environnement || { acces: "", electricite: [], securite: [], activation: [] };
  const elecLabels: Record<string, string> = { "230v": "230V dispo", disjoncteur: "Disjoncteur dédié", a_prevoir: "À prévoir" };
  const secuLabels: Record<string, string> = { rideau_laser: "Rideau laser", cellules: "Cellules", barre_palpeuse: "Barre palpeuse", das: "DAS" };
  const actLabels: Record<string, string> = { radar: "Radar", bouton: "Bouton", digicode: "Digicode", badge: "Badge", telecommande: "Télécommande" };

  return (
    <div className="space-y-4">
      {/* Infos contact */}
      {(data.adresse || data.contact_sur_place) && (
        <Section title="Informations">
          {data.adresse && <p className="text-sm"><span className="font-semibold">Adresse :</span> {data.adresse}</p>}
          {data.contact_sur_place && (
            <p className="text-sm">
              <span className="font-semibold">Contact :</span> {data.contact_sur_place}
              {data.telephone_contact ? ` (${data.telephone_contact})` : ""}
            </p>
          )}
        </Section>
      )}

      {/* Travaux envisagés */}
      {data.travaux_envisages && (
        <Section title="Travaux envisagés">
          <p className="text-sm whitespace-pre-wrap">{data.travaux_envisages}</p>
        </Section>
      )}

      {/* Portes */}
      {data.portes && data.portes.length > 0 && (
        <Section title={`Portes (${data.portes.length})`}>
          <div className="space-y-3">
            {data.portes.map((porte, i) => (
              <div key={porte.id || i} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-semibold mb-1">
                  Porte {i + 1} — {getTypePorteLabel(porte)}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                  {porte.hauteur && <span>H: {porte.hauteur} mm</span>}
                  {porte.largeur && <span>L: {porte.largeur} mm</span>}
                  {porte.passage_utile && <span>PU: {porte.passage_utile} mm</span>}
                  {porte.linteau && <span>Linteau: {porte.linteau} mm</span>}
                  {porte.profondeur && <span>Prof: {porte.profondeur} mm</span>}
                </div>
                {porte.debattement === "obstacle" && (
                  <p className="text-xs text-orange-600 mt-1">
                    Obstacle : {porte.debattement_detail || "Non précisé"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Environnement */}
      <Section title="Environnement">
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
      </Section>

      {/* Observations */}
      {(data.observations_particulieres || data.preconisation) && (
        <Section title="Observations & Recommandations">
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
        </Section>
      )}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

type Props = {
  rapport: RapportComplet;
  currentDossier: { id: string; reference: string } | null;
  dossierChoix: DossierChoix[];
  onModifier: () => void;
};

// ── Component ────────────────────────────────────────────────────────────────

export function RapportLecture({ rapport, currentDossier, dossierChoix, onModifier }: Props) {
  const isIntervention = rapport.type_rapport === "intervention";
  const isVisite = rapport.type_rapport === "visite";
  const photos: PhotoItem[] = rapport.photos || [];

  const controles = [...(rapport.controles ?? [])].sort(
    (a, b) => a.page_number - b.page_number
  );

  const date = new Date(rapport.date_intervention + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/rapports">Rapports</Link>
        <span>/</span>
        <span>{rapport.numero_cm}</span>
      </div>

      {/* En-tête */}
      <div className="mb-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-sm font-semibold text-primary">{rapport.numero_cm}</span>
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

        {/* Client */}
        <Link
          href={`/clients/${rapport.client.id}`}
          className="text-2xl font-bold hover:underline hover:text-primary"
        >
          {rapport.client.nom}
        </Link>

        {/* Site + date */}
        <p className="text-sm text-muted">{rapport.site.nom} · {date}</p>

        {/* Technicien */}
        {rapport.technicien && (
          <p className="text-sm text-muted">Technicien : {rapport.technicien}</p>
        )}

        {/* Dossier */}
        <div className="mt-2 flex items-center gap-2">
          {currentDossier ? (
            <Link
              href={`/dossiers/${currentDossier.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              📁 {currentDossier.reference}
            </Link>
          ) : (
            <span className="text-xs text-muted">Non rattaché à un dossier</span>
          )}
        </div>
      </div>

      {/* Corps selon type */}
      <div className="mb-6 space-y-4">
        {isVisite ? (
          <>
            {rapport.observations_visite && (
              <Section title="Observations">
                <p className="text-sm whitespace-pre-wrap">{rapport.observations_visite}</p>
              </Section>
            )}
            {rapport.recommandations && (
              <Section title="Recommandations">
                <p className="text-sm whitespace-pre-wrap">{rapport.recommandations}</p>
              </Section>
            )}
            {rapport.visite_data && Object.keys(rapport.visite_data).length > 0 && (
              <VisiteDataLecture data={rapport.visite_data} />
            )}
          </>
        ) : (
          <>
            {rapport.demande_client && (
              <Section title="Demande client">
                <p className="text-sm whitespace-pre-wrap">{rapport.demande_client}</p>
              </Section>
            )}
            {rapport.description_probleme && (
              <Section title="Description du problème">
                <p className="text-sm whitespace-pre-wrap">{rapport.description_probleme}</p>
              </Section>
            )}
            {rapport.diagnostic && (
              <Section title="Diagnostic">
                <p className="text-sm whitespace-pre-wrap">{rapport.diagnostic}</p>
              </Section>
            )}
            {rapport.travaux_effectues && (
              <Section title="Travaux effectués">
                <p className="text-sm whitespace-pre-wrap">{rapport.travaux_effectues}</p>
              </Section>
            )}
            {rapport.pieces_utilisees && rapport.pieces_utilisees.length > 0 && (
              <PiecesTable pieces={rapport.pieces_utilisees} />
            )}
            {rapport.constat_general && rapport.constat_general.length > 0 && (
              <ConstatList items={rapport.constat_general} />
            )}
            {rapport.recommandations && (
              <Section title="Recommandations">
                <p className="text-sm whitespace-pre-wrap">{rapport.recommandations}</p>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Controles (maintenance uniquement) */}
      {!isVisite && !isIntervention && controles.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
            Portes contrôlées ({controles.length})
          </h2>
          {controles.map((controle) => (
            <ControleCard key={controle.id} controle={controle} photos={photos} />
          ))}
        </div>
      )}

      {/* Signature */}
      {rapport.signature_client && (
        <div className="mb-4 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Signature</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rapport.signature_client}
            alt="Signature client"
            className="max-h-24 rounded border border-border"
          />
          {rapport.nom_signataire_client && (
            <p className="mt-1 text-sm text-muted">Signé par : {rapport.nom_signataire_client}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={onModifier}
          className="w-full min-h-[44px] rounded-xl border border-border bg-white py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          ✏️ Modifier
        </button>
        {rapport.statut === "finalise" && (
          <a
            href={`/rapports/${rapport.id}/pdf?download=1`}
            className="block w-full min-h-[44px] rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-light"
          >
            📥 Télécharger PDF
          </a>
        )}
        <div className="mb-2">
          <RattacherDossierButton
            rapportId={rapport.id}
            currentDossierId={rapport.dossier_id ?? null}
            dossiers={dossierChoix}
          />
        </div>
        <ArchiveButton rapportId={rapport.id} isArchived={!!rapport.archived_at} />
        <DeleteButton rapportId={rapport.id} isFinalise={rapport.statut === "finalise"} />
      </div>
    </div>
  );
}
