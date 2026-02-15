"use client";

import { useState } from "react";

const TYPES_PORTE = [
  { value: "coulissante deux vantaux", label: "Coulissante 2 vantaux" },
  { value: "coulissante un vantail", label: "Coulissante 1 vantail" },
  { value: "Téléscopique deux vantaux", label: "Téléscopique 2 vantaux" },
  { value: "Téléscopique un vantail", label: "Téléscopique 1 vantail" },
  { value: "battante", label: "Battante" },
  { value: "tournante", label: "Tournante" },
];

export function TypePorteSelect() {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  if (isCustom) {
    return (
      <div className="flex gap-1">
        <input
          name="type_porte"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Type personnalisé..."
          required
          className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            setCustomValue("");
          }}
          className="rounded border border-border px-2 py-1.5 text-xs text-muted hover:bg-slate-50"
          title="Revenir à la liste"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      name="type_porte"
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          setIsCustom(true);
        }
      }}
      className="rounded border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
    >
      {TYPES_PORTE.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
      <option value="__custom__">— Autre (saisie libre) —</option>
    </select>
  );
}
