"use client";

import { useState, useRef } from "react";

const PERIODICITES = [
  { value: "", label: "Pas de contrat" },
  { value: "3",  label: "Trimestrielle (3 mois)" },
  { value: "6",  label: "Semestrielle (6 mois)" },
  { value: "12", label: "Annuelle (12 mois)" },
  { value: "24", label: "Biennale (2 ans)" },
];

interface Site {
  id: string;
  nom: string;
  adresse?: string | null;
  contact_nom?: string | null;
  contact_telephone?: string | null;
  contact_mail?: string | null;
  memo_prive?: string | null;
  periodicite_maintenance?: number | null;
  contact_fonction?: string | null;
  horaires?: string | null;
  code_acces?: string | null;
  notes_site?: string | null;
}

interface Props {
  site: Site;
  clientId: string;
  updateAction: (formData: FormData) => Promise<void>;
  deleteSiteAction: (formData: FormData) => Promise<void>;
  createRapportAction: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  addInstallationForm: React.ReactNode;
  addInstallationAction: (formData: FormData) => Promise<void>;
}

export function SiteEditItem({
  site,
  clientId,
  updateAction,
  deleteSiteAction,
  createRapportAction,
  children,
  addInstallationForm,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingMemo, setEditingMemo] = useState(false);
  const [memo, setMemo] = useState(site.memo_prive ?? "");
  const memoFormRef = useRef<HTMLFormElement>(null);

  const hasContact = site.contact_nom || site.contact_telephone || site.contact_mail;

  return (
    <div className="rounded-lg border border-border p-3 bg-slate-50">
      {/* En-tête site */}
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <form
            action={async (fd) => {
              await updateAction(fd);
              setEditing(false);
            }}
            className="flex-1 mr-2 space-y-2"
          >
            <input type="hidden" name="id" value={site.id} />
            <div className="flex gap-2">
              <input
                name="nom"
                defaultValue={site.nom}
                required
                placeholder="Nom du site"
                className="flex-1 rounded border border-primary px-2 py-1 text-sm font-semibold focus:outline-none"
              />
              <input
                name="adresse"
                defaultValue={site.adresse ?? ""}
                placeholder="Adresse"
                className="flex-[2] rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                name="contact_nom"
                defaultValue={site.contact_nom ?? ""}
                placeholder="Contact sur place"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="contact_telephone"
                defaultValue={site.contact_telephone ?? ""}
                placeholder="Téléphone"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="contact_mail"
                defaultValue={site.contact_mail ?? ""}
                placeholder="Mail"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                name="contact_fonction"
                defaultValue={site.contact_fonction ?? ""}
                placeholder="Fonction contact"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="horaires"
                defaultValue={site.horaires ?? ""}
                placeholder="Horaires"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="code_acces"
                defaultValue={site.code_acces ?? ""}
                placeholder="Code d'accès"
                className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              name="notes_site"
              defaultValue={site.notes_site ?? ""}
              placeholder="Notes site"
              className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
            />
            <div className="flex gap-2 items-center">
              <label className="text-xs text-muted whitespace-nowrap">Maintenance :</label>
              <select
                name="periodicite_maintenance"
                defaultValue={site.periodicite_maintenance?.toString() ?? ""}
                className="rounded border border-border px-2 py-1 text-xs focus:border-primary focus:outline-none bg-white"
              >
                {PERIODICITES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary/90"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded border border-border px-3 py-1 text-xs text-muted hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">📍 {site.nom}</h4>
              {site.periodicite_maintenance && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  🔄 {site.periodicite_maintenance === 12 ? "Annuelle" :
                      site.periodicite_maintenance === 6  ? "Semestrielle" :
                      site.periodicite_maintenance === 3  ? "Trimestrielle" :
                      site.periodicite_maintenance === 24 ? "Biennale" :
                      `${site.periodicite_maintenance} mois`}
                </span>
              )}
            </div>
            {site.adresse && (
              <p className="text-xs text-muted mt-0.5">{site.adresse}</p>
            )}
            {hasContact && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                {site.contact_nom && <span>👤 {site.contact_nom}</span>}
                {site.contact_telephone && <span>📞 {site.contact_telephone}</span>}
                {site.contact_mail && <span>✉️ {site.contact_mail}</span>}
              </div>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded bg-slate-100 border border-border px-2 py-0.5 text-xs text-muted hover:bg-slate-200 transition-colors"
              title="Modifier le site"
            >
              ✏️
            </button>
            <form action={createRapportAction}>
              <input type="hidden" name="client_id" value={clientId} />
              <input type="hidden" name="site_id" value={site.id} />
              <input type="hidden" name="type_rapport" value="maintenance" />
              <button
                type="submit"
                className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                title="Nouvelle maintenance"
              >🔧</button>
            </form>
            <form action={createRapportAction}>
              <input type="hidden" name="client_id" value={clientId} />
              <input type="hidden" name="site_id" value={site.id} />
              <input type="hidden" name="type_rapport" value="intervention" />
              <button
                type="submit"
                className="rounded-lg bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                title="Nouvelle intervention"
              >⚡</button>
            </form>
            <form action={createRapportAction}>
              <input type="hidden" name="client_id" value={clientId} />
              <input type="hidden" name="site_id" value={site.id} />
              <input type="hidden" name="type_rapport" value="visite" />
              <button
                type="submit"
                className="rounded-lg bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                title="Nouvelle visite technique"
              >👁</button>
            </form>
            {confirmDelete ? (
              <div className="flex items-center gap-1 rounded border border-red-300 bg-red-50 px-1.5 py-0.5">
                <span className="text-xs text-red-700">Sûr ?</span>
                <form action={deleteSiteAction}>
                  <input type="hidden" name="id" value={site.id} />
                  <button type="submit" className="rounded bg-red-600 px-1.5 py-0.5 text-xs text-white font-semibold">Oui</button>
                </form>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-muted">Non</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-muted hover:text-danger">×</button>
            )}
          </div>
        )}
      </div>

      {/* Mémo privé */}
      <div className="mb-2">
        {editingMemo ? (
          <form
            ref={memoFormRef}
            action={async (fd) => {
              fd.append("id", site.id);
              fd.append("nom", site.nom);
              fd.append("adresse", site.adresse ?? "");
              await updateAction(fd);
              setEditingMemo(false);
            }}
            className="mt-1"
          >
            <input type="hidden" name="memo_prive" value={memo} />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Note privée (ex: envoyer copie du rapport à...)"
              rows={2}
              className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none resize-none"
            />
            <div className="flex gap-1 mt-1">
              <button type="submit" className="rounded bg-primary px-2 py-0.5 text-xs text-white">✓ Enregistrer</button>
              <button type="button" onClick={() => { setMemo(site.memo_prive ?? ""); setEditingMemo(false); }} className="rounded border border-border px-2 py-0.5 text-xs text-muted">Annuler</button>
            </div>
          </form>
        ) : memo ? (
          <div
            onClick={() => setEditingMemo(true)}
            className="mt-1 cursor-pointer rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
            title="Cliquer pour modifier"
          >
            📝 {memo}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingMemo(true)}
            className="mt-1 text-xs text-muted hover:text-amber-600"
          >
            + Note privée
          </button>
        )}
      </div>

      {/* Installations */}
      {children}

      {/* Ajout installation */}
      {addInstallationForm}
    </div>
  );
}
