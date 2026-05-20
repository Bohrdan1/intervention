"use client";

import { useState } from "react";
import Link from "next/link";
import { updateClientFromDetail, updateSiteFromDetail } from "./actions";
import type { Client } from "@/lib/types";
import { RdvModal } from "@/components/rdvs/RdvModal";
import type { DossierOption } from "@/components/rdvs/rdv-types";

// ── Types ──────────────────────────────────────────────────────────────────

interface EquipementItem {
  id: string;
  repere: string;
  type_porte: string;
  modele: string | null;
}

interface SiteItem {
  id: string;
  nom: string;
  adresse: string | null;
  periodicite_maintenance: number | null;
  contact_nom: string | null;
  contact_telephone: string | null;
  contact_mail: string | null;
  memo_prive: string | null;
  contact_fonction: string | null;
  horaires: string | null;
  code_acces: string | null;
  notes_site: string | null;
  equipements: EquipementItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PERIODICITES = [
  { value: "", label: "Aucune maintenance" },
  { value: "3", label: "Trimestrielle (3 mois)" },
  { value: "6", label: "Semestrielle (6 mois)" },
  { value: "12", label: "Annuelle (12 mois)" },
  { value: "24", label: "Biennale (24 mois)" },
];

const PERIODICITE_LABEL: Record<number, string> = {
  3: "Trim.", 6: "Semes.", 12: "Annuel", 24: "Bienn.",
};

function periodiciteLabel(mois: number | null): string {
  if (!mois) return "";
  return PERIODICITE_LABEL[mois] ?? `${mois} mois`;
}

function joursAvant(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function MaintenanceBadge({ jours }: { jours: number | null }) {
  if (jours === null)
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Jamais</span>;
  if (jours < 0)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Retard {Math.abs(jours)} j</span>;
  if (jours <= 30)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Dans {jours} j</span>;
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Dans {jours} j</span>;
}

// ── Composant principal ────────────────────────────────────────────────────

export function ClientDetailClient({
  client,
  clientId,
  sites,
  derniereCMParSite,
  derniereVisiteParInstallation,
  dossierOptions,
}: {
  client: Client;
  clientId: string;
  sites: SiteItem[];
  derniereCMParSite: Record<string, string>;
  derniereVisiteParInstallation: Record<string, { date: string; type: string }>;
  dossierOptions: DossierOption[];
}) {
  // ── Client edit state ──
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── RDV modal state ──
  const [rdvModalOpen, setRdvModalOpen] = useState(false);

  // ── Site accordion state ──
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [savingSite, setSavingSite] = useState(false);
  const [codeVisible, setCodeVisible] = useState<Record<string, boolean>>({});

  // ── Client submit ──
  async function handleClientSubmit(formData: FormData) {
    setSaving(true);
    await updateClientFromDetail(formData);
    setSaving(false);
    setEditing(false);
  }

  // ── Site submit ──
  async function handleSiteSubmit(formData: FormData) {
    setSavingSite(true);
    await updateSiteFromDetail(formData);
    setSavingSite(false);
    setEditingSiteId(null);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODE ÉDITION CLIENT
  // ══════════════════════════════════════════════════════════════════════════
  if (editing) {
    return (
      <div className="mb-6 rounded-xl border border-primary bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Modifier le client</h2>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted hover:text-foreground">
            ✕ Annuler
          </button>
        </div>

        <form action={handleClientSubmit} className="space-y-4">
          <input type="hidden" name="id" value={client.id} />

          {/* Société */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">Société</p>
            <div className="space-y-2">
              <input name="nom" defaultValue={client.nom} required placeholder="Nom *"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <input name="denomination_legale" defaultValue={client.denomination_legale ?? ""} placeholder="Dénomination légale"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <select name="type_client" defaultValue={client.type_client ?? "professionnel"}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white">
                  <option value="professionnel">Professionnel</option>
                  <option value="particulier">Particulier</option>
                </select>
                <select name="type" defaultValue={client.type ?? "actif"}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white">
                  <option value="actif">Actif</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="ridet" defaultValue={client.ridet ?? ""} placeholder="RIDET"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input name="adresse_facturation" defaultValue={client.adresse_facturation ?? ""} placeholder="Adresse facturation"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">Contacts</p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input name="telephone" defaultValue={client.telephone ?? ""} placeholder="Téléphone principal"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input name="telephone_secondaire" defaultValue={client.telephone_secondaire ?? ""} placeholder="Téléphone secondaire"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="mail" defaultValue={client.mail ?? ""} placeholder="Mail principal" type="email"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input name="mail_comptabilite" defaultValue={client.mail_comptabilite ?? ""} placeholder="Mail comptabilité" type="email"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="prenom" defaultValue={client.prenom ?? ""} placeholder="Prénom contact"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input name="fonction" defaultValue={client.fonction ?? ""} placeholder="Fonction"
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <input name="site_web" defaultValue={client.site_web ?? ""} placeholder="Site web (https://…)"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>

          {/* Notes internes */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-2">🔒 Notes internes</p>
            <textarea name="notes_internes" defaultValue={client.notes_internes ?? ""}
              placeholder="Notes internes (non visible sur les documents)" rows={3}
              className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none resize-none" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50">
            {saving ? "Sauvegarde…" : "✓ Enregistrer"}
          </button>
        </form>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODE LECTURE CLIENT
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* En-tête client */}
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
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  client.type_client === "particulier" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {client.type_client === "particulier" ? "Particulier" : "Professionnel"}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  client.type === "prospect" ? "bg-orange-100 text-orange-700"
                  : client.type === "inactif" ? "bg-gray-100 text-gray-500"
                  : "bg-green-100 text-green-700"
                }`}>
                  {client.type === "prospect" ? "Prospect" : client.type === "inactif" ? "Inactif" : "Actif"}
                </span>
                {client.ridet && <span className="text-xs text-muted">RIDET {client.ridet}</span>}
              </div>
              {client.adresse_facturation && (
                <p className="mt-1 text-xs text-muted">📮 {client.adresse_facturation}</p>
              )}
            </div>

            {/* Contacts */}
            <div className="space-y-0.5">
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
                  ✉️ {client.mail_comptabilite} <span className="text-xs">(compta)</span>
                </a>
              )}
              {(client.prenom || client.fonction) && (
                <p className="text-sm text-muted">
                  👤 {[client.prenom, client.fonction].filter(Boolean).join(" — ")}
                </p>
              )}
              {client.site_web && (
                <a href={client.site_web} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  🌐 {client.site_web}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button type="button" onClick={() => setEditing(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 min-h-[44px]">
              ✏️ Modifier
            </button>
            <button
              type="button"
              onClick={() => setRdvModalOpen(true)}
              className="rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 min-h-[44px]"
            >
              📅 + RDV
            </button>
          </div>
        </div>

        {client.notes_internes && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">🔒 Notes internes</p>
            <p className="text-xs text-amber-800 whitespace-pre-wrap">{client.notes_internes}</p>
          </div>
        )}
      </div>

      <RdvModal
        open={rdvModalOpen}
        onClose={() => setRdvModalOpen(false)}
        dossiers={dossierOptions}
      />

      {/* ── Sites & équipements ── */}
      <h2 className="mb-3 text-sm font-bold text-muted uppercase tracking-wide">
        Sites &amp; équipements
      </h2>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted">
          Aucun site enregistré pour ce client.
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => {
            const derniereCM = derniereCMParSite[site.id] ?? null;
            let prochaineCM: string | null = null;
            let joursAvantCM: number | null = null;

            if (site.periodicite_maintenance) {
              if (derniereCM) {
                const d = new Date(derniereCM + "T12:00:00");
                d.setMonth(d.getMonth() + site.periodicite_maintenance);
                prochaineCM = d.toISOString().split("T")[0];
                joursAvantCM = joursAvant(prochaineCM);
              } else {
                joursAvantCM = null;
              }
            }

            const isOpen = editingSiteId === site.id;

            return (
              <div key={site.id} className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">

                {/* ── En-tête site cliquable ── */}
                <div
                  onClick={() => setEditingSiteId(isOpen ? null : site.id)}
                  className={`px-4 py-3 border-b border-border cursor-pointer transition-colors ${isOpen ? "bg-slate-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{site.nom}</p>
                      {site.adresse && <p className="text-xs text-muted mt-0.5">{site.adresse}</p>}

                      {/* Contact complet */}
                      {(site.contact_nom || site.contact_telephone || site.contact_mail || site.contact_fonction) && (
                        <p className="mt-1 text-xs text-muted">
                          👤{" "}
                          {[site.contact_nom, site.contact_fonction].filter(Boolean).join(" · ")}
                          {site.contact_telephone && (
                            <> · <a href={`tel:${site.contact_telephone}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>{site.contact_telephone}</a></>
                          )}
                          {site.contact_mail && (
                            <> · <a href={`mailto:${site.contact_mail}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>{site.contact_mail}</a></>
                          )}
                        </p>
                      )}

                      {/* Horaires */}
                      {site.horaires && <p className="mt-0.5 text-xs text-muted">🕐 {site.horaires}</p>}

                      {/* Code d'accès — avec bouton Afficher (stoppe propagation) */}
                      {site.code_acces && (
                        <div
                          className="flex items-center gap-1.5 mt-0.5 text-xs text-muted"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>🔑 {codeVisible[site.id] ? site.code_acces : "••••••"}</span>
                          <button
                            type="button"
                            onClick={() => setCodeVisible((v) => ({ ...v, [site.id]: !v[site.id] }))}
                            className="text-primary hover:underline"
                          >
                            {codeVisible[site.id] ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                      )}

                      {/* Notes site */}
                      {site.notes_site && !isOpen && (
                        <div className="mt-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                          📝 {site.notes_site}
                        </div>
                      )}
                    </div>

                    {/* Badges + accordéon indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {site.periodicite_maintenance && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          🔄 {periodiciteLabel(site.periodicite_maintenance)}
                        </span>
                      )}
                      <span className="text-xs text-muted whitespace-nowrap">
                        {isOpen ? "▼" : "▶"} Modifier
                      </span>
                    </div>
                  </div>

                  {/* Maintenance timeline */}
                  {site.periodicite_maintenance && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted flex-wrap">
                      {derniereCM ? (
                        <>
                          <span>
                            Dernière CM :{" "}
                            {new Date(derniereCM + "T12:00:00").toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          {prochaineCM && (
                            <>
                              <span>·</span>
                              <span>
                                Prochaine :{" "}
                                {new Date(prochaineCM + "T12:00:00").toLocaleDateString("fr-FR", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span>Aucune CM enregistrée</span>
                      )}
                      <MaintenanceBadge jours={joursAvantCM} />
                    </div>
                  )}
                </div>

                {/* ── Formulaire d'édition accordéon ── */}
                {isOpen && (
                  <div className="px-4 py-4 bg-slate-50 border-b border-border">
                    <form action={handleSiteSubmit} className="space-y-2">
                      <input type="hidden" name="id" value={site.id} />
                      <input type="hidden" name="client_id" value={clientId} />

                      <div className="grid grid-cols-2 gap-2">
                        <input name="nom" defaultValue={site.nom} required placeholder="Nom du site *"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <input name="adresse" defaultValue={site.adresse ?? ""} placeholder="Adresse"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>

                      <select name="periodicite_maintenance"
                        defaultValue={site.periodicite_maintenance?.toString() ?? ""}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white">
                        {PERIODICITES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>

                      <p className="text-xs font-semibold text-muted uppercase pt-1">Contact sur place</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input name="contact_nom" defaultValue={site.contact_nom ?? ""} placeholder="Nom contact"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <input name="contact_fonction" defaultValue={site.contact_fonction ?? ""} placeholder="Fonction"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input name="contact_telephone" defaultValue={site.contact_telephone ?? ""} placeholder="Téléphone"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <input name="contact_mail" defaultValue={site.contact_mail ?? ""} placeholder="Mail"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input name="horaires" defaultValue={site.horaires ?? ""} placeholder="Horaires d'accès"
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <input name="code_acces" defaultValue={site.code_acces ?? ""} placeholder="Digicode, badge..."
                          className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>

                      <textarea name="notes_site" defaultValue={site.notes_site ?? ""} placeholder="Notes site"
                        rows={2}
                        className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none resize-none" />

                      <textarea name="memo_prive" defaultValue={site.memo_prive ?? ""} placeholder="Mémo privé (ex: envoyer copie rapport à…)"
                        rows={2}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />

                      <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={savingSite}
                          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50">
                          {savingSite ? "Sauvegarde…" : "✓ Enregistrer"}
                        </button>
                        <button type="button" onClick={() => setEditingSiteId(null)}
                          className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-white">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Équipements ── */}
                {site.equipements.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted italic">Aucun équipement enregistré</div>
                ) : (
                  <div className="divide-y divide-border">
                    {site.equipements.map((inst) => {
                      const derniere = derniereVisiteParInstallation[inst.id];
                      return (
                        <div key={inst.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">🚪 {inst.repere}</p>
                            <p className="text-xs text-muted">
                              {inst.type_porte}
                              {inst.modele ? ` · ${inst.modele}` : ""}
                              {derniere ? (
                                <> · {derniere.type === "maintenance" ? "CM" : "Intervention"}{" "}
                                  {new Date(derniere.date + "T12:00:00").toLocaleDateString("fr-FR", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </>
                              ) : " · Aucune visite"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <Link href={`/equipements/${inst.id}`}
                              className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:bg-slate-50">
                              📋 Historique
                            </Link>
                            <Link href={`/rapports/nouveau?client_id=${clientId}&site_id=${site.id}&equipement_id=${inst.id}&type=intervention`}
                              className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100">
                              ⚡
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
