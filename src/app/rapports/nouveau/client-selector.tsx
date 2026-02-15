"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface Installation {
  id: string;
  repere: string;
  type_porte: string;
  modele: string | null;
}

interface Site {
  id: string;
  nom: string;
  installations: Installation[];
}

interface Client {
  id: string;
  nom: string;
  sous_titre: string | null;
  sites: Site[];
}

export function ClientSiteSelectorClient({ clients }: { clients: Client[] }) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType = typeParam === "intervention" ? "intervention" : typeParam === "visite" ? "visite" : "maintenance";
  const initialClientId = searchParams.get("client_id") || "";

  const [typeRapport, setTypeRapport] = useState<"maintenance" | "intervention" | "visite">(initialType);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedSiteId, setSelectedSiteId] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const sites = selectedClient?.sites || [];
  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const installations = selectedSite?.installations || [];

  return (
    <>
      {/* Type de rapport */}
      <input type="hidden" name="type_rapport" value={typeRapport} />
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-muted mb-3">Type de rapport</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTypeRapport("maintenance")}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              typeRapport === "maintenance"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary-light"
            }`}
          >
            <p className="text-2xl mb-1">🔧</p>
            <p className="text-sm font-semibold">Maintenance</p>
            <p className="text-xs text-muted mt-1">Checklist de contrôle</p>
          </button>
          <button
            type="button"
            onClick={() => setTypeRapport("intervention")}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              typeRapport === "intervention"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary-light"
            }`}
          >
            <p className="text-2xl mb-1">⚡</p>
            <p className="text-sm font-semibold">Intervention</p>
            <p className="text-xs text-muted mt-1">Dépannage / réparation</p>
          </button>
          <button
            type="button"
            onClick={() => setTypeRapport("visite")}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              typeRapport === "visite"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary-light"
            }`}
          >
            <p className="text-2xl mb-1">👁</p>
            <p className="text-sm font-semibold">Visite technique</p>
            <p className="text-xs text-muted mt-1">Observations / RDV</p>
          </button>
        </div>
      </div>

      {/* Date */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-muted mb-2">
          Date d&apos;intervention
        </label>
        <input
          type="date"
          name="date_intervention"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Client */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-muted mb-2">Client</label>
        <select
          name="client_id"
          required
          value={selectedClientId}
          onChange={(e) => {
            setSelectedClientId(e.target.value);
            setSelectedSiteId("");
          }}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Sélectionner un client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
              {c.sous_titre ? ` (${c.sous_titre})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Site */}
      {selectedClientId && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-muted mb-2">Site</label>
          {sites.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun site pour ce client.{" "}
              <a href="/clients" className="text-primary underline">
                Ajouter un site
              </a>
            </p>
          ) : (
            <select
              name="site_id"
              required
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Sélectionner un site...</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom} ({s.installations.length} porte{s.installations.length > 1 ? "s" : ""})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Portes à contrôler (maintenance uniquement) */}
      {selectedSiteId && typeRapport === "maintenance" && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-muted mb-3">
            Portes à contrôler
          </label>
          {installations.length === 0 ? (
            <p className="text-sm text-muted">
              Aucune porte enregistrée.{" "}
              <a href="/clients" className="text-primary underline">
                Ajouter des portes
              </a>
            </p>
          ) : (
            <div className="space-y-2">
              {installations.map((inst) => (
                <label
                  key={inst.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    name="installations"
                    value={inst.id}
                    defaultChecked
                    className="h-5 w-5 rounded border-border text-primary accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">🚪 {inst.repere}</p>
                    <p className="text-xs text-muted">
                      {inst.type_porte}
                      {inst.modele ? ` · ${inst.modele}` : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
