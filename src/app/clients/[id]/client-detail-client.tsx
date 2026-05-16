"use client";

import { useState } from "react";
import { updateClientFromDetail } from "./actions";
import type { Client } from "@/lib/types";

export function ClientDetailClient({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    await updateClientFromDetail(formData);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mb-6 rounded-xl border border-primary bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Modifier le client</h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-muted hover:text-foreground"
          >
            ✕ Annuler
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={client.id} />

          {/* Société */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">Société</p>
            <div className="space-y-2">
              <input
                name="nom"
                defaultValue={client.nom}
                required
                placeholder="Nom *"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="denomination_legale"
                defaultValue={client.denomination_legale ?? ""}
                placeholder="Dénomination légale (ex: SARL, SAS…)"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <select
                name="type_client"
                defaultValue={client.type_client ?? "professionnel"}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white"
              >
                <option value="professionnel">Professionnel</option>
                <option value="particulier">Particulier</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="ridet"
                  defaultValue={client.ridet ?? ""}
                  placeholder="RIDET"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  name="adresse_facturation"
                  defaultValue={client.adresse_facturation ?? ""}
                  placeholder="Adresse de facturation"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">Contacts</p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="telephone"
                  defaultValue={client.telephone ?? ""}
                  placeholder="Téléphone principal"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  name="telephone_secondaire"
                  defaultValue={client.telephone_secondaire ?? ""}
                  placeholder="Téléphone secondaire"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="mail"
                  defaultValue={client.mail ?? ""}
                  placeholder="Mail principal"
                  type="email"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  name="mail_comptabilite"
                  defaultValue={client.mail_comptabilite ?? ""}
                  placeholder="Mail comptabilité"
                  type="email"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="prenom"
                  defaultValue={client.prenom ?? ""}
                  placeholder="Prénom contact"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  name="fonction"
                  defaultValue={client.fonction ?? ""}
                  placeholder="Fonction"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <input
                name="site_web"
                defaultValue={client.site_web ?? ""}
                placeholder="Site web (https://…)"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Notes internes */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">🔒 Notes internes</p>
            <textarea
              name="notes_internes"
              defaultValue={client.notes_internes ?? ""}
              placeholder="Notes internes (non visible sur les documents)"
              rows={3}
              className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {saving ? "Sauvegarde…" : "✓ Enregistrer"}
          </button>
        </form>
      </div>
    );
  }

  // Mode lecture
  return (
    <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Société */}
          <div className="mb-3">
            <h1 className="text-xl font-bold">{client.nom}</h1>
            {client.denomination_legale && (
              <p className="text-sm text-muted">{client.denomination_legale}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  client.type_client === "particulier"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {client.type_client === "particulier" ? "Particulier" : "Professionnel"}
              </span>
              {client.ridet && (
                <span className="text-xs text-muted">RIDET {client.ridet}</span>
              )}
            </div>
            {client.adresse_facturation && (
              <p className="mt-1 text-xs text-muted">📮 {client.adresse_facturation}</p>
            )}
          </div>

          {/* Contacts */}
          <div className="space-y-0.5 text-sm">
            {client.telephone && (
              <a href={`tel:${client.telephone}`} className="flex items-center gap-1.5 text-sm hover:text-primary">
                📞 {client.telephone}
              </a>
            )}
            {client.telephone_secondaire && (
              <a href={`tel:${client.telephone_secondaire}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                📞 {client.telephone_secondaire}
              </a>
            )}
            {client.mail && (
              <a href={`mailto:${client.mail}`} className="flex items-center gap-1.5 text-sm hover:text-primary">
                ✉️ {client.mail}
              </a>
            )}
            {client.mail_comptabilite && (
              <a href={`mailto:${client.mail_comptabilite}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                ✉️ {client.mail_comptabilite} <span className="text-xs text-muted">(compta)</span>
              </a>
            )}
            {(client.prenom || client.fonction) && (
              <p className="text-sm text-muted">
                👤 {[client.prenom, client.fonction].filter(Boolean).join(" — ")}
              </p>
            )}
            {client.site_web && (
              <a
                href={client.site_web}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                🌐 {client.site_web}
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
        >
          ✏️ Modifier
        </button>
      </div>

      {/* Notes internes */}
      {client.notes_internes && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">🔒 Notes internes</p>
          <p className="text-xs text-amber-800 whitespace-pre-wrap">{client.notes_internes}</p>
        </div>
      )}
    </div>
  );
}
