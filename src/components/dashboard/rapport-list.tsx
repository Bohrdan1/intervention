"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { TYPE_RAPPORT_CONFIG, type TypeRapport } from "@/lib/types";

const ITEMS_PER_PAGE = 20;

interface RapportItem {
  id: string;
  numero_cm: string;
  date_intervention: string;
  type_rapport: string;
  statut: string;
  archived_at: string | null;
  client_id: string | null;
  client: { id: string; nom: string } | null;
  site: { nom: string } | null;
  controles: { id: string }[] | null;
}

interface RapportListProps {
  rapports: RapportItem[];
  /** Filtre type actif transmis par le serveur (depuis l'URL) */
  activeType?: TypeRapport;
  /** Filtre statut actif transmis par le serveur (depuis l'URL) */
  activeStatut?: string;
  /** Mode archives */
  showArchived?: boolean;
}

export function RapportList({
  rapports,
  activeType,
  activeStatut,
  showArchived = false,
}: RapportListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Recherche texte sur la liste déjà filtrée côté serveur
  const filtered = useMemo(() => {
    if (!search.trim()) return rapports;
    const q = search.toLowerCase();
    return rapports.filter(
      (r) =>
        r.numero_cm.toLowerCase().includes(q) ||
        r.client?.nom.toLowerCase().includes(q) ||
        r.site?.nom.toLowerCase().includes(q)
    );
  }, [rapports, search]);

  // Pagination locale sur les résultats filtrés
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRapports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  // Boutons de filtre rapide dans la liste (changement de statut, archives)
  const quickFilters: { label: string; href: string; active: boolean }[] = [
    { label: "Tous", href: activeType ? `/?type=${activeType}` : "/", active: !activeStatut && !showArchived },
    { label: "Brouillons", href: buildUrl({ type: activeType, statut: "brouillon" }), active: activeStatut === "brouillon" },
    { label: "Finalisés", href: buildUrl({ type: activeType, statut: "finalise" }), active: activeStatut === "finalise" },
    { label: "📦 Archivés", href: buildUrl({ type: activeType, archive: "1" }), active: showArchived },
  ];

  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher par numéro, client ou site…"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filtres rapides statut */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {quickFilters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              f.active
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
        {/* Lien retour si un type est sélectionné */}
        {activeType && (
          <Link
            href={buildUrl({ statut: activeStatut, archive: showArchived ? "1" : undefined })}
            className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-all"
          >
            ✕ {TYPE_RAPPORT_CONFIG[activeType].label}
          </Link>
        )}
      </div>

      {/* Compteur résultats */}
      <p className="mb-3 text-xs text-muted">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        {totalPages > 1 && ` · Page ${currentPage}/${totalPages}`}
      </p>

      {/* Liste */}
      {paginatedRapports.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
          <p className="text-sm text-muted">Aucun rapport trouvé.</p>
          {(activeType || activeStatut || showArchived) && (
            <Link href="/" className="mt-3 inline-block text-xs text-primary hover:underline">
              Effacer les filtres
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedRapports.map((rapport) => {
              const typeConfig = TYPE_RAPPORT_CONFIG[rapport.type_rapport as TypeRapport];
              const nbPortes = rapport.controles?.length || 0;
              const date = new Date(rapport.date_intervention + "T12:00:00").toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={rapport.id}
                  className={`relative rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-primary-light transition-all ${
                    rapport.archived_at ? "opacity-60" : "border-border"
                  }`}
                >
                  {/* Lien principal couvrant toute la carte */}
                  <Link
                    href={`/rapports/${rapport.id}`}
                    className="absolute inset-0 rounded-xl"
                    aria-label={rapport.client?.nom || "Rapport"}
                  />
                  {/* Contenu */}
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${typeConfig?.couleurTexte ?? "text-blue-700"}`}>
                          {typeConfig?.label ?? rapport.type_rapport} · {date}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            rapport.statut === "finalise"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {rapport.statut === "finalise" ? "Finalisé" : "Brouillon"}
                        </span>
                        {rapport.archived_at && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            Archivé
                          </span>
                        )}
                      </div>
                      {rapport.client ? (
                        <Link
                          href={`/clients/${rapport.client.id}`}
                          className="relative z-10 font-semibold truncate hover:underline hover:text-primary"
                        >
                          {rapport.client.nom}
                        </Link>
                      ) : (
                        <p className="font-semibold truncate text-muted">Client inconnu</p>
                      )}
                      <p className="text-sm text-muted">
                        {rapport.site?.nom || "Site inconnu"}
                        {rapport.type_rapport !== "intervention"
                          ? ` · ${nbPortes} porte${nbPortes > 1 ? "s" : ""}`
                          : ""}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2 relative z-10">
                      {rapport.type_rapport === "visite" && rapport.statut === "brouillon" && (
                        <Link
                          href={`/rapports/${rapport.id}/devis`}
                          className={`rounded-lg ${
                            typeConfig?.couleurBouton ?? "bg-teal-600 hover:bg-teal-700"
                          } px-3 py-1.5 text-xs font-semibold text-white transition-colors`}
                        >
                          Valider la visite
                        </Link>
                      )}
                      <span className="text-muted">›</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}
