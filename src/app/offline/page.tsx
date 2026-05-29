import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-5xl mb-4">📡</p>
      <h1 className="text-xl font-bold mb-2">Pas de connexion</h1>
      <p className="text-sm text-muted mb-6 max-w-sm">
        Cette page n&apos;est pas disponible hors-ligne. Les rapports déjà consultés
        restent accessibles depuis l&apos;accueil.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light transition-all"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
