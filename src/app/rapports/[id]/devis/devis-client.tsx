'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LigneDevis, StatutDevis, TypeLigne, StatutFournisseur } from '@/lib/types';
import {
  DEFAULT_LIGNE_DEVIS,
  UNITES,
  TYPE_LIGNE_LABELS,
  STATUT_FOURNISSEUR_LABELS,
} from '@/lib/types';
import { sauvegarderDevis } from './actions';

interface PorteVisiteResume {
  id: string;
  type_porte: string;
  type_coulissante: string;
  hauteur: string;
  largeur: string;
}

interface Rapport {
  id: string;
  numero_cm: string;
  date_intervention: string;
  lignes_devis: LigneDevis[] | null;
  notes_devis: string | null;
  validite_devis: number | null;
  statut_devis: StatutDevis | null;
  client: { nom: string } | null;
  site: { nom: string; adresse: string | null } | null;
  visite_data: { travaux_envisages: string; portes: PorteVisiteResume[] } | null;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

const STATUT_FOURNISSEUR_COLORS: Record<StatutFournisseur, string> = {
  a_consulter: 'bg-slate-100 text-slate-700',
  en_attente: 'bg-amber-100 text-amber-700',
  confirme: 'bg-green-100 text-green-700',
};

const TYPE_COLORS: Record<TypeLigne, string> = {
  materiel: 'bg-blue-100 text-blue-700',
  main_oeuvre: 'bg-purple-100 text-purple-700',
  deplacement: 'bg-teal-100 text-teal-700',
  autre: 'bg-gray-100 text-gray-700',
};

export function DevisClient({ rapport }: { rapport: Rapport }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [lignes, setLignes] = useState<LigneDevis[]>(
    (rapport.lignes_devis as LigneDevis[]) || []
  );
  const [notes, setNotes] = useState(rapport.notes_devis || '');
  const [validite, setValidite] = useState(rapport.validite_devis ?? 30);
  const [statut, setStatut] = useState<StatutDevis>(rapport.statut_devis || 'brouillon');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Totaux
  const totalHT = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0);
  const nbAConsulter = lignes.filter((l) => l.statut_fournisseur === 'a_consulter').length;
  const nbEnAttente = lignes.filter((l) => l.statut_fournisseur === 'en_attente').length;

  function ajouterLigne(type: TypeLigne = 'materiel') {
    const nouvelle: LigneDevis = {
      ...DEFAULT_LIGNE_DEVIS,
      id: genId(),
      type,
      unite: type === 'main_oeuvre' ? 'h' : type === 'deplacement' ? 'forfait' : 'u',
    };
    setLignes((prev) => [...prev, nouvelle]);
    setEditingId(nouvelle.id);
  }

  function supprimerLigne(id: string) {
    setLignes((prev) => prev.filter((l) => l.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function updateLigne(id: string, field: keyof LigneDevis, value: string | number) {
    setLignes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  function importerDepuisVisite() {
    const portes = rapport.visite_data?.portes ?? [];
    const lignesMateriel: LigneDevis[] = portes.map((porte) => {
      const dims =
        porte.hauteur && porte.largeur
          ? ` ${porte.largeur}x${porte.hauteur}mm`
          : '';
      const typLabel = porte.type_coulissante
        ? `${porte.type_porte} ${porte.type_coulissante}`
        : porte.type_porte;
      return {
        ...DEFAULT_LIGNE_DEVIS,
        id: genId(),
        type: 'materiel' as TypeLigne,
        description: `Porte ${typLabel}${dims}`,
        quantite: 1,
        unite: 'u',
        statut_fournisseur: 'a_consulter' as StatutFournisseur,
      };
    });
    const ligneMainOeuvre: LigneDevis = {
      ...DEFAULT_LIGNE_DEVIS,
      id: genId(),
      type: 'main_oeuvre',
      description: 'Pose et mise en service',
      quantite: 1,
      unite: 'forfait',
      statut_fournisseur: 'a_consulter',
    };
    setLignes([...lignesMateriel, ligneMainOeuvre]);
  }

  function sauvegarder(newStatut?: StatutDevis) {
    const s = newStatut || statut;
    setStatut(s);
    setSaved(false);
    startTransition(async () => {
      await sauvegarderDevis(rapport.id, lignes, notes, validite, s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const ligne = editingId ? lignes.find((l) => l.id === editingId) : null;

  return (
    <div className="pb-24">
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/rapports/${rapport.id}`} className="text-sm text-muted hover:text-foreground">
              ← {rapport.numero_cm}
            </Link>
          </div>
          <h1 className="text-xl font-bold">Devis</h1>
          <p className="text-sm text-muted">{rapport.client?.nom} · {rapport.site?.nom}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          statut === 'accepte' ? 'bg-green-100 text-green-700' :
          statut === 'envoye' ? 'bg-blue-100 text-blue-700' :
          statut === 'refuse' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {statut === 'brouillon' ? 'Brouillon' :
           statut === 'envoye' ? 'Envoyé' :
           statut === 'accepte' ? 'Accepté' : 'Refusé'}
        </span>
      </div>

      {/* Alertes fournisseurs */}
      {(nbAConsulter > 0 || nbEnAttente > 0) && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800 mb-1">Fournisseurs à traiter</p>
          {nbAConsulter > 0 && (
            <p className="text-xs text-amber-700">{nbAConsulter} ligne{nbAConsulter > 1 ? 's' : ''} à consulter</p>
          )}
          {nbEnAttente > 0 && (
            <p className="text-xs text-amber-700">{nbEnAttente} ligne{nbEnAttente > 1 ? 's' : ''} en attente de réponse</p>
          )}
        </div>
      )}

      {/* Lignes devis */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Lignes ({lignes.length})
          </h2>
          <span className="text-sm font-bold text-foreground">
            Total HT : {totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} F
          </span>
        </div>

        {lignes.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center mb-3">
            <p className="text-muted text-sm">Aucune ligne. Ajoutez du matériel ou de la main d&apos;œuvre.</p>
            {(rapport.visite_data?.portes?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={importerDepuisVisite}
                className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Importer depuis la visite
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {lignes.map((l) => (
            <div
              key={l.id}
              className={`rounded-xl border bg-white shadow-sm overflow-hidden ${editingId === l.id ? 'border-primary' : 'border-border'}`}
            >
              {/* Ligne résumé */}
              <div
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => setEditingId(editingId === l.id ? null : l.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[l.type]}`}>
                      {TYPE_LIGNE_LABELS[l.type]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_FOURNISSEUR_COLORS[l.statut_fournisseur]}`}>
                      {STATUT_FOURNISSEUR_LABELS[l.statut_fournisseur]}
                    </span>
                    {l.fournisseur && (
                      <span className="text-xs text-muted">{l.fournisseur}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{l.description || <span className="text-muted italic">Sans description</span>}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {l.quantite} {l.unite} × {l.prix_unitaire.toLocaleString('fr-FR')} F
                    {' = '}
                    <span className="font-semibold text-foreground">
                      {(l.quantite * l.prix_unitaire).toLocaleString('fr-FR')} F
                    </span>
                  </p>
                </div>
                <span className="text-muted text-lg">{editingId === l.id ? '▲' : '▼'}</span>
              </div>

              {/* Formulaire édition */}
              {editingId === l.id && (
                <div className="border-t border-border bg-slate-50 p-3 space-y-3">
                  {/* Type */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TYPE_LIGNE_LABELS) as TypeLigne[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateLigne(l.id, 'type', t)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            l.type === t ? 'border-primary bg-primary text-white' : 'border-border bg-white text-foreground hover:bg-slate-50'
                          }`}
                        >
                          {TYPE_LIGNE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Description</label>
                    <input
                      type="text"
                      value={l.description}
                      onChange={(e) => updateLigne(l.id, 'description', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      placeholder="Description de la prestation ou du matériel"
                    />
                  </div>

                  {/* Référence */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Référence</label>
                    <input
                      type="text"
                      value={l.reference}
                      onChange={(e) => updateLigne(l.id, 'reference', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      placeholder="Réf. fabricant (optionnel)"
                    />
                  </div>

                  {/* Qté / Unité / Prix */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Quantité</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={l.quantite}
                        onChange={(e) => updateLigne(l.id, 'quantite', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Unité</label>
                      <select
                        value={l.unite}
                        onChange={(e) => updateLigne(l.id, 'unite', e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        {UNITES.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Prix HT (F)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={l.prix_unitaire}
                        onChange={(e) => updateLigne(l.id, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Fournisseur */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Fournisseur</label>
                      <input
                        type="text"
                        value={l.fournisseur}
                        onChange={(e) => updateLigne(l.id, 'fournisseur', e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        placeholder="Nom du fournisseur"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Statut fournisseur</label>
                      <select
                        value={l.statut_fournisseur}
                        onChange={(e) => updateLigne(l.id, 'statut_fournisseur', e.target.value as StatutFournisseur)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        {(Object.keys(STATUT_FOURNISSEUR_LABELS) as StatutFournisseur[]).map((s) => (
                          <option key={s} value={s}>{STATUT_FOURNISSEUR_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sous-total + supprimer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold">
                      Sous-total : {(l.quantite * l.prix_unitaire).toLocaleString('fr-FR')} F HT
                    </span>
                    <button
                      type="button"
                      onClick={() => supprimerLigne(l.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Boutons ajout rapide */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.keys(TYPE_LIGNE_LABELS) as TypeLigne[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => ajouterLigne(t)}
              className="rounded-lg border border-dashed border-border bg-white px-3 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
            >
              + {TYPE_LIGNE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes & validité */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm mb-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Notes / Conditions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none"
            placeholder="Conditions particulières, délais, remarques..."
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Validité du devis (jours)</label>
          <input
            type="number"
            min="1"
            max="365"
            value={validite}
            onChange={(e) => setValidite(parseInt(e.target.value) || 30)}
            className="w-32 rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Récapitulatif</h2>
        <div className="space-y-1 text-sm">
          {(['materiel', 'main_oeuvre', 'deplacement', 'autre'] as TypeLigne[]).map((type) => {
            const total = lignes
              .filter((l) => l.type === type)
              .reduce((s, l) => s + l.quantite * l.prix_unitaire, 0);
            if (total === 0) return null;
            return (
              <div key={type} className="flex justify-between">
                <span className="text-muted">{TYPE_LIGNE_LABELS[type]}</span>
                <span>{total.toLocaleString('fr-FR')} F</span>
              </div>
            );
          })}
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Total HT</span>
            <span>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} F</span>
          </div>
        </div>
      </div>

      {/* Actions bas de page */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex gap-3 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => sauvegarder()}
          disabled={isPending}
          className="flex-1 rounded-xl border border-border bg-white py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
        >
          {saved ? '✓ Sauvegardé' : isPending ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        <Link
          href={`/rapports/${rapport.id}/devis/pdf`}
          className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
        >
          Exporter PDF
        </Link>
      </div>

      {/* Changer statut */}
      <div className="flex flex-wrap gap-2 pb-20">
        {(['brouillon', 'envoye', 'accepte', 'refuse'] as StatutDevis[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sauvegarder(s)}
            disabled={statut === s || isPending}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
              statut === s
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-muted hover:bg-slate-50'
            }`}
          >
            {s === 'brouillon' ? 'Brouillon' :
             s === 'envoye' ? 'Marquer envoyé' :
             s === 'accepte' ? 'Marquer accepté' : 'Marquer refusé'}
          </button>
        ))}
      </div>
    </div>
  );
}
