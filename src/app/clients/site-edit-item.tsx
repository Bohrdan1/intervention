"use client";

import { useState, useRef } from "react";

interface Site {
  id: string;
  nom: string;
  adresse?: string | null;
  memo_prive?: string | null;
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
  const [editingMemo, setEditingMemo] = useState(false);
  const [memo, setMemo] = useState(site.memo_prive ?? "");
  const memoFormRef = useRef<HTMLFormElement>(null);

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
            className="flex flex-1 gap-2 mr-2"
          >
            <input type="hidden" name="id" value={site.id} />
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
              placeholder="Adresse (ex: 12 rue de la Paix, Nouméa)"
              className="flex-[2] rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
            />
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
          </form>
        ) : (
          <div>
            <h4 className="text-sm font-semibold">📍 {site.nom}</h4>
            {site.adresse && (
              <p className="text-xs text-muted mt-0.5">{site.adresse}</p>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-1.5">
            {/* Modifier site */}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded bg-slate-100 border border-border px-2 py-0.5 text-xs text-muted hover:bg-slate-200 transition-colors"
              title="Modifier le site"
            >
              ✏️
            </button>
            {/* Maintenance */}
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
            {/* Intervention */}
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
            {/* Visite */}
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
            {/* Supprimer */}
            <form action={deleteSiteAction}>
              <input type="hidden" name="id" value={site.id} />
              <button type="submit" className="text-xs text-danger hover:underline">×</button>
            </form>
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
