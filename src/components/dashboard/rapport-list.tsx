"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

type FilterType = "tous" | "maintenance" | "intervention" | "visite" | "brouillon" | "finalise";

const ITEMS_PER_PAGE = 20;

interface RapportItem {
  id: string;
  numero_cm: string;
  date_intervention: string;
  type_rapport: string;
  statut: string;
  client: { nom: string } | null;
  site: { nom: string } | null;
  controles: { id: string }[] | null;
}

export function RapportList({ rapports }: { rapports: RapportItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("tous");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rapports;

    // Filtre par type/statut
    if (filter === "maintenance") result = result.filter((r) => r.type_rapport === "maintenance");
    else if (filter === "intervention") result = result.filter((r) => r.type_rapport === "intervention");
    else if (filter === "visite") result = result.filter((r) => r.type_rapport === "visite");
    else if (filter === "brouillon") result = result.filter((r) => r.statut === "brouillon");
    else if (filter === "finalise") result = result.filter((r) => r.statut === "finalise");

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.numero_cm.toLowerCase().includes(q) ||
          r.client?.nom.toLowerCase().includes(q) ||
          r.site?.nom.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rapports, search, filter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRapports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset page quand filtres changent
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: "tous", label: "Tous" },
    { value: "maintenance", label: "Maintenance" },
    { value: "intervention", label: "Intervention" },
    { value: "visite", label: "Visites" },
    { value: "brouillon", label: "Brouillons" },
    { value: "finalise", label: "Finalisés" },
  ];

  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher par numéro, client ou site..."
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Compteur résultats */}
      <p className="mb-3 text-xs text-muted">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
      </p>

      {/* Liste */}
      {paginatedRapports.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
          <p className="text-sm text-muted">Aucun rapport trouvé.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedRapports.map((rapport) => {
            const isIntervention = rapport.type_rapport === "intervention";
            const isVisite = rapport.type_rapport === "visite";
            const nbPortes = rapport.controles?.length || 0;
            const date = new Date(rapport.date_intervention).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Link
                key={rapport.id}
                href={`/rapports/${rapport.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-light transition-all active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-primary">
                      {rapport.numero_cm}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isVisite
                          ? "bg-teal-100 text-teal-700"
                          : isIntervention
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isVisite ? "Visite" : isIntervention ? "Intervention" : "Maintenance"}
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
                  </div>
                  <p className="font-semibold truncate">
                    {rapport.client?.nom || "Client inconnu"}
                  </p>
                  <p className="text-sm text-muted">
                    {rapport.site?.nom || "Site inconnu"}
                    {!isIntervention ? ` · ${nbPortes} porte${nbPortes > 1 ? "s" : ""}` : ""}
                    {" · "}{date}
                  </p>
                </div>
                <span className="ml-3 text-muted">›</span>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </>
      )}
    </div>
  );
}
