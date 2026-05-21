"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDossier } from "@/app/actions/dossiers";

// ── Config ─────────────────────────────────────────────────────────────────

const TYPES_DOSSIER = [
  { value: "contrat",      label: "Contrat de maintenance" },
  { value: "intervention", label: "Intervention" },
  { value: "installation", label: "Installation" },
  { value: "remplacement", label: "Remplacement" },
  { value: "visite",       label: "Visite technique" },
  { value: "autre",        label: "Autre" },
];

// ── Types ──────────────────────────────────────────────────────────────────

type Props = {
  dossierId: string;
  titre: string | null;
  typeDossier: string;
  description: string | null;
};

// ── Component ──────────────────────────────────────────────────────────────

export function DossierEditInline({ dossierId, titre, typeDossier, description }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-muted hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-slate-50"
      >
        ✏️ Modifier
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateDossier(dossierId, fd);
      router.refresh();
      setEditing(false);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select name="type_dossier" defaultValue={typeDossier}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none">
          {TYPES_DOSSIER.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Titre</label>
        <input name="titre" defaultValue={titre ?? ""}
          placeholder="Titre optionnel"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <textarea name="description" defaultValue={description ?? ""}
          rows={2} placeholder="Description optionnelle"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none resize-none" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white disabled:opacity-50">
          {isPending ? "Enregistrement…" : "✓ Enregistrer"}
        </button>
        <button type="button" onClick={() => setEditing(false)}
          className="flex-1 rounded-lg border border-border py-2 text-sm hover:bg-white">
          Annuler
        </button>
      </div>
    </form>
  );
}
