"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "Rapports" },
    { href: "/clients", label: "Clients" },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">A&A</span>
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            Automatisme & Agencement
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/rapports/nouveau"
            className="ml-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            + Rapport
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            title="Déconnexion"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}
