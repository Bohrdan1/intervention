"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Quelque chose s'est mal passé. Veuillez réessayer.
        </p>

        {/* Message d'erreur (développement) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-xs font-mono text-red-700 break-all">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
        >
          Réessayer
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 border border-slate-300 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );
}
