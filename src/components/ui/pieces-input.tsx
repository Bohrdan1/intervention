"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface PieceUtilisee {
  nom: string;
  quantite: number;
  unite?: string;
  prix_ht?: number | null;
}

interface PieceCatalogue {
  id: string;
  nom: string;
  reference: string | null;
  prix_ht: number | null;
  unite: string;
  nb_utilisations: number;
}

interface Props {
  pieces: PieceUtilisee[];
  catalogue: PieceCatalogue[];
  onChange: (pieces: PieceUtilisee[]) => void;
}

export function PiecesInput({ pieces, catalogue, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Suggestions dérivées de la saisie (pas d'état à synchroniser)
  const suggestions = useMemo(() => {
    if (!query.trim()) {
      // Sans query : afficher les plus fréquentes
      return catalogue.slice(0, 6);
    }
    const q = query.toLowerCase();
    return catalogue
      .filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          (p.reference ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, catalogue]);

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function ajouterPiece(piece: PieceCatalogue | { nom: string; prix_ht: null; unite: string }) {
    const nom = piece.nom.trim();
    if (!nom) return;
    // Si déjà présente, incrémenter la quantité
    const idx = pieces.findIndex((p) => p.nom.toLowerCase() === nom.toLowerCase());
    if (idx >= 0) {
      const updated = [...pieces];
      updated[idx] = { ...updated[idx], quantite: updated[idx].quantite + 1 };
      onChange(updated);
    } else {
      onChange([...pieces, {
        nom,
        quantite: 1,
        unite: piece.unite ?? "unité",
        prix_ht: piece.prix_ht ?? null,
      }]);
    }
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function ajouterLibre() {
    if (!query.trim()) return;
    ajouterPiece({ nom: query.trim(), prix_ht: null, unite: "unité" });
  }

  function modifierQuantite(index: number, delta: number) {
    const updated = [...pieces];
    const nouvelleQte = updated[index].quantite + delta;
    if (nouvelleQte <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], quantite: nouvelleQte };
    }
    onChange(updated);
  }

  function supprimerPiece(index: number) {
    const updated = [...pieces];
    updated.splice(index, 1);
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {/* Pièces sélectionnées */}
      {pieces.length > 0 && (
        <div className="space-y-1.5">
          {pieces.map((piece, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{piece.nom}</p>
                {piece.prix_ht && (
                  <p className="text-xs text-muted">
                    {piece.prix_ht.toLocaleString("fr-FR")} CFP/{piece.unite ?? "u."}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => modifierQuantite(i, -1)}
                  className="h-6 w-6 rounded border border-border text-xs font-bold text-muted hover:bg-slate-200 transition-colors"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center">{piece.quantite}</span>
                <button
                  type="button"
                  onClick={() => modifierQuantite(i, +1)}
                  className="h-6 w-6 rounded border border-border text-xs font-bold text-muted hover:bg-slate-200 transition-colors"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => supprimerPiece(i)}
                  className="ml-1 text-xs text-danger hover:underline"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Champ de saisie + suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (suggestions.length > 0 && query.trim()) {
                  const exact = suggestions.find(
                    (s) => s.nom.toLowerCase() === query.toLowerCase()
                  );
                  if (exact) ajouterPiece(exact);
                  else ajouterLibre();
                } else {
                  ajouterLibre();
                }
              }
            }}
            placeholder="Rechercher une pièce (courroie, cellule, carte…)"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={ajouterLibre}
            disabled={!query.trim()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropRef}
            className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-border bg-white shadow-lg overflow-hidden"
          >
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // évite que l'input perde le focus avant le clic
                  ajouterPiece(p);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-primary/5 transition-colors text-left"
              >
                <span className="font-medium">{p.nom}</span>
                <span className="text-xs text-muted">
                  {p.prix_ht ? `${p.prix_ht.toLocaleString("fr-FR")} CFP` : p.unite}
                  {p.nb_utilisations > 0 && (
                    <span className="ml-2 text-primary">× {p.nb_utilisations}</span>
                  )}
                </span>
              </button>
            ))}
            {query.trim() && !suggestions.some((s) => s.nom.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); ajouterLibre(); }}
                className="flex w-full items-center px-3 py-2 text-sm text-muted hover:bg-slate-50 border-t border-border"
              >
                + Ajouter &quot;{query.trim()}&quot; comme nouvelle pièce
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
