"use client";

import { useState } from "react";

export function CodeAccesToggle({ code }: { code: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span>🔑 {visible ? code : "••••••"}</span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-primary hover:underline text-xs"
      >
        {visible ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}
