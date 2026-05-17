"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const TYPES_PORTE = [
  "coulissante deux vantaux",
  "coulissante un vantail",
  "Téléscopique deux vantaux",
  "Téléscopique un vantail",
  "battante",
  "tournante",
];

interface Props {
  inst: { id: string; repere: string; type_porte: string; modele: string | null; avec_batterie: boolean; commentaire?: string | null };
  clientId: string;
  siteId: string;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  createRapportAction: (formData: FormData) => Promise<void>;
}

export function InstallationEditItem({
  inst,
  clientId,
  siteId,
  updateAction,
  deleteAction,
  createRapportAction,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [commentaire, setCommentaire] = useState(inst.commentaire ?? "");
  const [typeCustom, setTypeCustom] = useState(!TYPES_PORTE.includes(inst.type_porte));
  const [avecBatterie, setAvecBatterie] = useState(inst.avec_batterie ?? false);

  if (editing) {
    return (
      <div className="ml-4 border-b border-border py-2 last:border-0">
        <form
          action={async (fd) => {
            await updateAction(fd);
            setEditing(false);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="id" value={inst.id} />
          <input
            name="repere"
            defaultValue={inst.repere}
            required
            className="flex-1 rounded border border-primary px-2 py-1.5 text-xs focus:outline-none"
          />
          {typeCustom ? (
            <div className="flex gap-1">
              <input
                name="type_porte"
                defaultValue={inst.type_porte}
                required
                className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setTypeCustom(false)}
                className="rounded border border-border px-2 py-1.5 text-xs text-muted hover:bg-slate-50"
              >✕</button>
            </div>
          ) : (
            <select
              name="type_porte"
              defaultValue={inst.type_porte}
              onChange={(e) => e.target.value === "__custom__" && setTypeCustom(true)}
              className="rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
            >
              {TYPES_PORTE.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom__">— Autre —</option>
            </select>
          )}
          <input
            name="modele"
            defaultValue={inst.modele ?? ""}
            placeholder="Modèle"
            className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
          />
          <input type="hidden" name="avec_batterie" value={avecBatterie ? "true" : "false"} />
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={avecBatterie}
              onChange={(e) => setAvecBatterie(e.target.checked)}
              className="rounded"
            />
            Batterie
          </label>
          <div className="flex gap-1">
            <button
              type="submit"
              className="rounded bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary/90"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="ml-4 border-b border-border py-1.5 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          🚪 {inst.repere}
          <span className="text-xs text-muted ml-1">
            ({inst.type_porte}{inst.modele ? ` - ${inst.modele}` : ""}{inst.avec_batterie ? " · 🔋" : ""})
          </span>
        </span>
        <div className="flex items-center gap-2">
          {/* Historique */}
          <Link
            href={`/equipements/${inst.id}`}
            className="rounded bg-slate-50 border border-border px-2 py-0.5 text-xs text-muted hover:bg-slate-100 transition-colors"
            title="Historique de l'équipement"
          >
            📋
          </Link>
          {/* Modifier */}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded bg-slate-50 border border-border px-2 py-0.5 text-xs text-muted hover:bg-slate-100 transition-colors"
            title="Modifier"
          >
            ✏️
          </button>
          {/* Intervention rapide */}
          <form action={createRapportAction}>
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="site_id" value={siteId} />
            <input type="hidden" name="type_rapport" value="intervention" />
            <input type="hidden" name="equipement_id" value={inst.id} />
            <button
              type="submit"
              className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
              title={`Intervention sur ${inst.repere}`}
            >
              ⚡
            </button>
          </form>
          {/* Supprimer */}
          <form action={deleteAction}>
            <input type="hidden" name="id" value={inst.id} />
            <button type="submit" className="text-xs text-danger hover:underline">×</button>
          </form>
        </div>
      </div>

      {/* Commentaire */}
      {editingComment ? (
        <form
          action={async (fd) => {
            fd.append("id", inst.id);
            fd.append("repere", inst.repere);
            fd.append("type_porte", inst.type_porte);
            fd.append("modele", inst.modele ?? "");
            fd.append("avec_batterie", inst.avec_batterie ? "true" : "false");
            fd.append("commentaire", commentaire);
            await updateAction(fd);
            setEditingComment(false);
          }}
          className="mt-1 ml-5"
        >
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Commentaire (ex: modèle spécifique, historique...)"
            rows={2}
            className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none resize-none"
          />
          <div className="flex gap-1 mt-1">
            <button type="submit" className="rounded bg-primary px-2 py-0.5 text-xs text-white">✓ Enregistrer</button>
            <button type="button" onClick={() => { setCommentaire(inst.commentaire ?? ""); setEditingComment(false); }} className="rounded border border-border px-2 py-0.5 text-xs text-muted">Annuler</button>
          </div>
        </form>
      ) : commentaire ? (
        <div
          onClick={() => setEditingComment(true)}
          className="mt-1 ml-5 cursor-pointer rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
          title="Cliquer pour modifier"
        >
          📝 {commentaire}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditingComment(true)}
          className="mt-0.5 ml-5 text-xs text-muted hover:text-amber-600"
        >
          + Commentaire
        </button>
      )}
    </div>
  );
}
