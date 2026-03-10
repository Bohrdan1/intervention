"use client";

import { useState } from "react";

interface Props {
  client: { id: string; nom: string; sous_titre: string | null };
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function ClientEditHeader({ client, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="flex items-center justify-between border-b border-border p-4">
        <form
          action={async (fd) => {
            await updateAction(fd);
            setEditing(false);
          }}
          className="flex flex-1 gap-2 mr-2"
        >
          <input type="hidden" name="id" value={client.id} />
          <input
            name="nom"
            defaultValue={client.nom}
            required
            placeholder="Nom du client"
            className="flex-1 rounded border border-primary px-2 py-1 text-sm font-bold focus:outline-none"
          />
          <input
            name="sous_titre"
            defaultValue={client.sous_titre ?? ""}
            placeholder="Sous-titre (ex: Casino Les Halles + Vinothèque)"
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
            className="rounded border border-border px-3 py-1 text-xs text-muted hover:bg-slate-50"
          >
            Annuler
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-border p-4">
      <div>
        <h3 className="font-bold">{client.nom}</h3>
        {client.sous_titre && (
          <p className="text-xs text-muted">{client.sous_titre}</p>
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
        <form action={deleteAction}>
          <input type="hidden" name="id" value={client.id} />
          <button type="submit" className="text-xs text-danger hover:underline">
            Supprimer
          </button>
        </form>
      </div>
    </div>
  );
}
