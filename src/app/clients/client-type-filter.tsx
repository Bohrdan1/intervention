"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { value: "",          label: "Tous" },
  { value: "prospect",  label: "Prospects" },
  { value: "actif",     label: "Actifs" },
  { value: "inactif",   label: "Inactifs" },
] as const;

export function ClientTypeFilter({ activeType }: { activeType: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    // Préserver la recherche textuelle
    router.push(`/clients?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => handleClick(t.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeType === t.value
              ? "bg-primary text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
