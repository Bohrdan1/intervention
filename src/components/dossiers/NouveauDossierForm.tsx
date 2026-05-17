"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDossier } from "@/app/actions/dossiers";

// ── Types ──────────────────────────────────────────────────────────────────

type SiteOption = { id: string; nom: string };
type ClientOption = { id: string; nom: string; type?: string; sites: SiteOption[] };

type Props = {
  clients: ClientOption[];
};

// ── Constantes sentinelles ─────────────────────────────────────────────────

const NOUVEAU_CLIENT = "__nouveau_client__";
const NOUVEAU_SITE = "__nouveau_site__";

const TYPES_DOSSIER = [
  { value: "contrat",       label: "Contrat de maintenance" },
  { value: "urgent",        label: "Urgent" },
  { value: "intervention",  label: "Intervention" },
  { value: "installation",  label: "Installation" },
  { value: "remplacement",  label: "Remplacement" },
  { value: "visite",        label: "Visite technique" },
  { value: "autre",         label: "Autre" },
] as const;

// ── Classes CSS communes ───────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-border px-4 py-3 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]";

const selectCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] " +
  "disabled:bg-slate-50 disabled:text-muted disabled:cursor-not-allowed";

// ── Component ──────────────────────────────────────────────────────────────

export function NouveauDossierForm({ clients }: Props) {
  // ── État du formulaire ──────────────────────────────────────────────────
  const [typeDossier, setTypeDossier] = useState("contrat");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  // Client
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClientNom, setNewClientNom] = useState("");

  // Site
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [newSiteNom, setNewSiteNom] = useState("");

  // UI
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // ── Valeurs dérivées ────────────────────────────────────────────────────
  const isNouveauClient = selectedClientId === NOUVEAU_CLIENT;
  const isNouveauSite = selectedSiteId === NOUVEAU_SITE;

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) ?? null;

  const sitesDisponibles: SiteOption[] = selectedClient?.sites ?? [];

  /** Site disabled si : aucun client, ou nouveau client sans nom saisi */
  const isSiteDisabled =
    !selectedClientId ||
    (isNouveauClient && !newClientNom.trim());

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleClientChange(value: string) {
    setSelectedClientId(value);
    setSelectedSiteId("");   // reset site
    setNewClientNom("");
    setNewSiteNom("");
    setError(null);
  }

  function handleSiteChange(value: string) {
    setSelectedSiteId(value);
    setNewSiteNom("");
    setError(null);
  }

  function handleNewClientNomChange(value: string) {
    setNewClientNom(value);
    // Quand on efface le nom du nouveau client → reset site
    if (!value.trim()) {
      setSelectedSiteId("");
      setNewSiteNom("");
    }
    setError(null);
  }

  // ── Soumission ──────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation côté client
    if (!selectedClientId) {
      setError("Veuillez sélectionner ou créer un client.");
      return;
    }
    if (isNouveauClient && !newClientNom.trim()) {
      setError("Veuillez saisir le nom du nouveau client.");
      return;
    }
    if (isNouveauSite && !newSiteNom.trim()) {
      setError("Veuillez saisir le nom du nouveau site.");
      return;
    }

    // Construire FormData
    const fd = new FormData();
    fd.set("type_dossier", typeDossier);
    fd.set("titre", titre.trim());
    fd.set("description", description.trim());

    if (isNouveauClient) {
      fd.set("new_client_nom", newClientNom.trim());
    } else {
      fd.set("client_id", selectedClientId);
    }

    if (isNouveauSite) {
      fd.set("new_site_nom", newSiteNom.trim());
    } else if (selectedSiteId) {
      fd.set("site_id", selectedSiteId);
    }

    setError(null);
    startTransition(async () => {
      const result = await createDossier(fd);
      if (result.ok) {
        router.push(`/dossiers/${result.dossierId}`);
      } else {
        setError(result.error);
      }
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {/* ── Type ─────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="type_dossier" className="mb-2 block text-sm font-medium">
          Type de dossier <span className="text-red-500">*</span>
        </label>
        <select
          id="type_dossier"
          value={typeDossier}
          onChange={(e) => setTypeDossier(e.target.value)}
          className={selectCls}
        >
          {TYPES_DOSSIER.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Titre ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="titre" className="mb-2 block text-sm font-medium">
          Titre{" "}
          <span className="text-xs font-normal text-muted">(optionnel)</span>
        </label>
        <input
          id="titre"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="ex. Contrat annuel 2026, Panne urgente…"
          className={inputCls}
        />
      </div>

      {/* ── Client ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="client_select" className="block text-sm font-medium">
          Client <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            id="client_select"
            value={selectedClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Sélectionner un client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}{c.type === "prospect" ? " 〔Prospect〕" : ""}
              </option>
            ))}
            <option value={NOUVEAU_CLIENT}>＋ Nouveau client</option>
          </select>
        </div>

        {/* Badge prospect si le client sélectionné est un prospect */}
        {selectedClient?.type === "prospect" && (
          <p className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
            <span>⚠️</span>
            Ce client est un prospect — pensez à le passer en &ldquo;Actif&rdquo; une fois le dossier confirmé.
          </p>
        )}

        {/* Champ inline nouveau client */}
        {isNouveauClient && (
          <input
            type="text"
            autoFocus
            value={newClientNom}
            onChange={(e) => handleNewClientNomChange(e.target.value)}
            placeholder="Nom du client *"
            className={`${inputCls} border-primary/50 bg-primary/5`}
            aria-label="Nom du nouveau client"
          />
        )}
      </div>

      {/* ── Site ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="site_select" className="block text-sm font-medium">
          Site{" "}
          <span className="text-xs font-normal text-muted">(optionnel)</span>
        </label>

        <select
          id="site_select"
          value={selectedSiteId}
          onChange={(e) => handleSiteChange(e.target.value)}
          disabled={isSiteDisabled}
          className={selectCls}
        >
          {isSiteDisabled ? (
            <option value="">
              {!selectedClientId
                ? "Sélectionnez un client d'abord"
                : "Saisissez le nom du client d'abord"}
            </option>
          ) : (
            <>
              <option value="">— Aucun site spécifique —</option>

              {/* Sites du client existant */}
              {sitesDisponibles.length > 0 && (
                <optgroup label="Sites existants">
                  {sitesDisponibles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </optgroup>
              )}

              <option value={NOUVEAU_SITE}>＋ Nouveau site</option>
            </>
          )}
        </select>

        {/* Champ inline nouveau site */}
        {isNouveauSite && (
          <input
            type="text"
            autoFocus
            value={newSiteNom}
            onChange={(e) => {
              setNewSiteNom(e.target.value);
              setError(null);
            }}
            placeholder="Nom du site *"
            className={`${inputCls} border-primary/50 bg-primary/5`}
            aria-label="Nom du nouveau site"
          />
        )}
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Description{" "}
          <span className="text-xs font-normal text-muted">(optionnel)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contexte, équipements concernés, priorité…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* ── Erreur ───────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ── Récap nouveau client / site (aide visuelle) ───────────────── */}
      {(isNouveauClient || isNouveauSite) && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary/80 space-y-0.5">
          {isNouveauClient && newClientNom.trim() && (
            <p>✦ Nouveau client : <strong>{newClientNom.trim()}</strong></p>
          )}
          {isNouveauSite && newSiteNom.trim() && (
            <p>✦ Nouveau site : <strong>{newSiteNom.trim()}</strong></p>
          )}
          <p className="text-primary/60 pt-0.5">
            Seront créés au moment de la soumission.
          </p>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-md hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 min-h-[44px]"
      >
        {isPending ? "Création en cours…" : "Créer le dossier →"}
      </button>
    </form>
  );
}
