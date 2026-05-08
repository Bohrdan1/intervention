"use client";

import { useState } from "react";
import type { Prospect, Statut } from "./page";

const STATUTS: { value: Statut; label: string; couleur: string }[] = [
  { value: "a_contacter", label: "À contacter",   couleur: "bg-slate-100 text-slate-600" },
  { value: "en_cours",    label: "En cours",       couleur: "bg-blue-100 text-blue-700" },
  { value: "devis_envoye",label: "Devis envoyé",   couleur: "bg-amber-100 text-amber-700" },
  { value: "gagne",       label: "Gagné ✅",        couleur: "bg-green-100 text-green-700" },
  { value: "perdu",       label: "Perdu ❌",        couleur: "bg-red-100 text-red-600" },
  { value: "en_pause",    label: "En pause",        couleur: "bg-purple-100 text-purple-600" },
];

function statutConfig(s: Statut) {
  return STATUTS.find((x) => x.value === s) ?? STATUTS[0];
}

interface Props {
  prospects: Prospect[];
  relancesUrgentes: number;
  ajouterAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}

function ProspectCard({
  prospect,
  updateAction,
  deleteAction,
}: {
  prospect: Prospect;
  updateAction: Props["updateAction"];
  deleteAction: Props["deleteAction"];
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const cfg = statutConfig(prospect.statut);

  const today = new Date().toISOString().split("T")[0];
  const estUrgent =
    prospect.prochaine_action &&
    prospect.prochaine_action <= today &&
    !["gagne", "perdu"].includes(prospect.statut);

  if (editing) {
    return (
      <div className="rounded-xl border border-primary bg-white p-4 shadow-sm">
        <form
          action={async (fd) => {
            await updateAction(fd);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={prospect.id} />

          <div className="grid grid-cols-2 gap-2">
            <input
              name="nom"
              defaultValue={prospect.nom}
              placeholder="Nom *"
              required
              className="rounded-lg border border-primary px-2 py-1.5 text-sm font-bold focus:outline-none col-span-2"
            />
            <input
              name="contact_nom"
              defaultValue={prospect.contact_nom ?? ""}
              placeholder="Contact"
              className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="telephone"
              defaultValue={prospect.telephone ?? ""}
              placeholder="Téléphone"
              className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="mail"
              defaultValue={prospect.mail ?? ""}
              placeholder="Email"
              className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="source"
              defaultValue={prospect.source ?? ""}
              placeholder="Source (comment trouvé)"
              className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <select
            name="statut"
            defaultValue={prospect.statut}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-muted mb-1">Prochaine relance</label>
              <input
                type="date"
                name="prochaine_action"
                defaultValue={prospect.prochaine_action ?? ""}
                className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Montant estimé (CFP)</label>
              <input
                type="number"
                name="montant_estime"
                defaultValue={prospect.montant_estime ?? ""}
                placeholder="0"
                className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <textarea
            name="notes"
            defaultValue={prospect.notes ?? ""}
            placeholder="Notes, historique des échanges..."
            rows={3}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none resize-none"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs text-white hover:bg-primary/90"
            >
              ✓ Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-4 py-1.5 text-xs text-muted hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        estUrgent ? "border-orange-300" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm">{prospect.nom}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.couleur}`}>
              {cfg.label}
            </span>
            {estUrgent && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                🔔 Relance !
              </span>
            )}
          </div>

          {prospect.contact_nom && (
            <p className="text-xs text-muted mt-0.5">
              👤 {prospect.contact_nom}
              {prospect.telephone ? ` · ${prospect.telephone}` : ""}
            </p>
          )}

          {prospect.prochaine_action && (
            <p className="text-xs text-muted mt-0.5">
              📅 Relance :{" "}
              {new Date(prospect.prochaine_action + "T12:00:00").toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          )}

          {prospect.montant_estime && (
            <p className="text-xs text-muted mt-0.5">
              💰 {prospect.montant_estime.toLocaleString("fr-FR")} CFP estimé
            </p>
          )}

          {prospect.notes && (
            <p className="text-xs text-muted mt-1 line-clamp-2 italic">{prospect.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {prospect.telephone && (
            <a
              href={`tel:${prospect.telephone}`}
              className="text-xs text-muted hover:text-primary"
              title="Appeler"
            >
              📞
            </a>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-muted hover:text-foreground"
          >
            ✏️
          </button>
          {confirmDel ? (
            <div className="flex items-center gap-1">
              <form action={deleteAction}>
                <input type="hidden" name="id" value={prospect.id} />
                <button type="submit" className="text-xs text-red-600 font-semibold hover:underline">
                  Supprimer
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="text-xs text-muted"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDel(true)}
              className="text-xs text-muted hover:text-danger"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProspectsClient({
  prospects,
  relancesUrgentes,
  ajouterAction,
  updateAction,
  deleteAction,
}: Props) {
  const [activeStatut, setActiveStatut] = useState<Statut | "">("");
  const [showForm, setShowForm] = useState(false);

  const filtered =
    activeStatut === ""
      ? prospects
      : prospects.filter((p) => p.statut === activeStatut);

  // Stats par statut
  const counts = STATUTS.reduce(
    (acc, s) => {
      acc[s.value] = prospects.filter((p) => p.statut === s.value).length;
      return acc;
    },
    {} as Record<Statut, number>
  );

  return (
    <div>
      {/* En-tête */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-sm text-muted">
            {prospects.length} prospect{prospects.length > 1 ? "s" : ""}
            {relancesUrgentes > 0 && (
              <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                🔔 {relancesUrgentes} relance{relancesUrgentes > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
        >
          + Prospect
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-primary bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Nouveau prospect</h2>
          <form
            action={async (fd) => {
              await ajouterAction(fd);
              setShowForm(false);
            }}
            className="space-y-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                name="nom"
                placeholder="Nom de l'entreprise ou contact *"
                required
                className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none col-span-2"
              />
              <input
                name="contact_nom"
                placeholder="Interlocuteur"
                className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="telephone"
                placeholder="Téléphone"
                className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <select
              name="statut"
              defaultValue="a_contacter"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <textarea
              name="notes"
              placeholder="Notes..."
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres statut */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveStatut("")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            activeStatut === ""
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-slate-50"
          }`}
        >
          Tous ({prospects.length})
        </button>
        {STATUTS.filter((s) => counts[s.value] > 0).map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setActiveStatut(s.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeStatut === s.value
                ? `border-current ${s.couleur}`
                : "border-border hover:bg-slate-50"
            }`}
          >
            {s.label} ({counts[s.value]})
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Aucun prospect{activeStatut ? ` avec le statut "${statutConfig(activeStatut as Statut).label}"` : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
