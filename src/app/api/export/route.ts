import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /export?from=YYYY-MM-DD&to=YYYY-MM-DD&type=maintenance|intervention|visite
 *
 * Génère un CSV des rapports finalisés pour import Odoo / Facture.net.
 * Colonnes : Numéro, Type, Date, Client, Site, Technicien, Statut,
 *            Montant_devis_HT, Description
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");

  // ── Requête ──
  let query = supabase
    .from("rapports")
    .select(`
      id,
      numero_cm,
      type_rapport,
      date_intervention,
      statut,
      technicien,
      description_probleme,
      demande_client,
      travaux_effectues,
      montant_ht,
      client:clients(nom, telephone, mail),
      site:sites(nom, adresse)
    `)
    .eq("statut", "finalise")
    .is("archived_at", null)
    .order("date_intervention", { ascending: false });

  if (from) query = query.gte("date_intervention", from);
  if (to) query = query.lte("date_intervention", to);
  if (type && ["maintenance", "intervention", "visite"].includes(type)) {
    query = query.eq("type_rapport", type);
  }

  const { data: rapports, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Génération CSV ──
  const SEPARATOR = ";"; // Point-virgule pour Excel FR
  const NL = "\r\n";

  const TYPE_LABELS: Record<string, string> = {
    maintenance: "Maintenance préventive",
    intervention: "Intervention corrective",
    visite: "Visite technique",
  };

  // En-têtes
  const headers = [
    "Numéro",
    "Type",
    "Date",
    "Client",
    "Site",
    "Adresse",
    "Téléphone",
    "Email",
    "Technicien",
    "Désignation",
    "Montant HT (CFP)",
  ];

  function esc(val: string | null | undefined): string {
    if (!val) return "";
    // Encapsuler dans des guillemets si contient séparateur, guillemet ou retour ligne
    const s = String(val).replace(/"/g, '""');
    if (s.includes(SEPARATOR) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s}"`;
    }
    return s;
  }

  const rows: string[] = [headers.join(SEPARATOR)];

  for (const r of rapports ?? []) {
    const client = Array.isArray(r.client) ? r.client[0] : r.client;
    const site = Array.isArray(r.site) ? r.site[0] : r.site;

    // Description : demande / travaux selon le type
    const description =
      r.type_rapport === "maintenance"
        ? "Maintenance préventive portes automatiques"
        : r.demande_client || r.description_probleme || r.travaux_effectues || "";

    const row = [
      esc(r.numero_cm),
      esc(TYPE_LABELS[r.type_rapport] ?? r.type_rapport),
      esc(r.date_intervention),
      esc(client?.nom),
      esc(site?.nom),
      esc(site?.adresse),
      esc(client?.telephone),
      esc(client?.mail),
      esc(r.technicien),
      esc(description),
      esc(r.montant_ht != null ? String(r.montant_ht) : ""),
    ].join(SEPARATOR);

    rows.push(row);
  }

  const csv = "﻿" + rows.join(NL); // BOM UTF-8 pour Excel

  // ── Nom du fichier ──
  const today = new Date().toISOString().split("T")[0];
  const periodeSuffix = from && to ? `_${from}_${to}` : `_${today}`;
  const filename = `AAC_export${periodeSuffix}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
