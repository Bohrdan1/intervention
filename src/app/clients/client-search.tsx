"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function ClientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        router.push(`/clients?q=${encodeURIComponent(query.trim())}`);
      } else if (initialQuery) {
        router.push("/clients");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un client..."
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
