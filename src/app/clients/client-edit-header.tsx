"use client";

import { useState } from "react";
import Link from "next/link";

interface ClientData {
  id: string;
  nom: string;
  sous_titre: string | null;
  prenom: string | null;
  fonction: string | null;
  telephone: string | null;
  mail: string | null;
  comptabilite: string | null;
}

interface Props {
  client: ClientData;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function ClientEditHeader({ client, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasContact = client.prenom || client.fonction || client.telephone || client.mail || client.comptabilite;

  if (editing) {
    return (
      <div className="border-b border-border p-4">
        <form
          action={async (fd) => {
            await updateAction(fd);
            setEditing(false);
          }}
          className="space-y-2"
        >
          <input type="hidden" name="id" value={client.id} />

          {/* Ligne 1 : Nom + Sous-titre */}
          <div className="flex gap-2">
            <input
              name="nom"
              defaultValue={client.nom}
              required
              placeholder="Nom / Société"
              className="flex-1 rounded border border-primary px-2 py-1.5 text-sm font-bold focus:outline-none"
            />
            <input
              name="sous_titre"
              defaultValue={client.sous_titre ?? ""}
              placeholder="Sous-titre"
              className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Ligne 2 : Prénom + Fonction */}
          <div className="flex gap-2">
            <input
              name="prenom"
              defaultValue={client.prenom ?? ""}
              placeholder="Prénom"
              className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="fonction"
              defaultValue={client.fonction ?? ""}
              placeholder="Fonction"
              className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Ligne 3 : Téléphone + Mail */}
          <div className="flex gap-2">
            <input
              name="telephone"
              defaultValue={client.telephone ?? ""}
              placeholder="Téléphone"
              className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="mail"
              defaultValue={client.mail ?? ""}
              placeholder="Mail"
              className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Ligne 4 : Comptabilité */}
          <input
            name="comptabilite"
            defaultValue={client.comptabilite ?? ""}
            placeholder="Comptabilité (contact facturation)"
            className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded bg-primary px-4 py-1.5 text-xs text-white hover:bg-primary/90"
            >
              ✓ Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="border-b border-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">
            <Link
              href={`/clients/${client.id}`}
              className="hover:underline hover:text-primary"
            >
              {client.nom}
            </Link>
            {client.prenom && <span className="font-normal text-sm ml-1.5">— {client.prenom}</span>}
          </h3>
          {client.sous_titre && (
            <p className="text-xs text-muted">{client.sous_titre}</p>
          )}
          {hasContact && (
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
              {client.fonction && <span>👤 {client.fonction}</span>}
              {client.telephone && <span>📞 {client.telephone}</span>}
              {client.mail && <span>✉️ {client.mail}</span>}
              {client.comptabilite && <span>🧾 {client.comptabilite}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-muted hover:text-foreground"
            title="Modifier"
          >
            ✏️
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 rounded border border-red-300 bg-red-50 px-2 py-1">
              <span className="text-xs text-red-700">Supprimer {client.nom} ?</span>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={client.id} />
                <button type="submit" className="rounded bg-red-600 px-2 py-0.5 text-xs text-white font-semibold">
                  Confirmer
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-muted hover:text-danger"
              title="Supprimer"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
