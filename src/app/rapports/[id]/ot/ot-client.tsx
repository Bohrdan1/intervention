"use client";

import { useState } from "react";
import Link from "next/link";

interface ClientData {
  id: string;
  nom: string;
  sous_titre: string | null;
  telephone: string | null;
  mail: string | null;
}

interface SiteData {
  id: string;
  nom: string;
  adresse: string | null;
  contact_nom: string | null;
  contact_telephone: string | null;
}

interface EquipementData {
  id: string;
  repere: string;
  type_porte: string;
  modele: string | null;
}

interface Props {
  rapport: {
    id: string;
    numero_cm: string;
    type_rapport: string;
    date_intervention: string;
    demande_client: string | null;
    description_probleme: string | null;
    pieces_utilisees: { nom: string; quantite: number; unite?: string }[] | null;
  };
  client: ClientData | null;
  site: SiteData | null;
  installation: EquipementData | null;
  installations: EquipementData[];
  rapportId: string;
}

function typeLabel(type: string) {
  if (type === "maintenance") return "Maintenance préventive";
  if (type === "intervention") return "Intervention corrective";
  if (type === "visite") return "Visite technique";
  return type;
}

export function OrdreTravauxClient({
  rapport,
  client,
  site,
  installation,
  installations,
  rapportId,
}: Props) {
  const [piecesExtra, setPiecesExtra] = useState<string[]>([""]);

  const dateFormatee = new Date(rapport.date_intervention + "T12:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const demande = rapport.description_probleme || rapport.demande_client || "";

  const piecesExistantes = (rapport.pieces_utilisees ?? []).filter(
    (p) => p.nom.trim() !== ""
  );

  function addLigne() {
    setPiecesExtra([...piecesExtra, ""]);
  }

  function updateLigne(i: number, val: string) {
    const next = [...piecesExtra];
    next[i] = val;
    setPiecesExtra(next);
  }

  return (
    <>
      {/* Barre de navigation (screen only) */}
      <div className="print:hidden mb-4 flex items-center justify-between">
        <Link
          href={`/rapports/${rapportId}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Retour au rapport
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>

      {/* Document imprimable */}
      <div
        id="ot-document"
        className="
          bg-white
          rounded-xl border border-border shadow-sm
          p-6
          print:shadow-none print:border-none print:p-0 print:rounded-none
          print:max-w-full
        "
      >
        {/* En-tête société */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">AAC</h1>
            <p className="text-xs text-gray-500 leading-tight">
              Automatisme et Agencement Calédonien
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              ☎ Bohrdan CEZARUK · contact@bohrdan.com
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-black px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-wide">Ordre de travail</p>
              <p className="text-lg font-black">{rapport.numero_cm}</p>
            </div>
          </div>
        </div>

        {/* Infos mission */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-300 rounded p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Client</p>
            <p className="font-bold">{client?.nom ?? "—"}</p>
            {client?.sous_titre && (
              <p className="text-sm text-gray-600">{client.sous_titre}</p>
            )}
            {client?.telephone && (
              <p className="text-sm">📞 {client.telephone}</p>
            )}
          </div>
          <div className="border border-gray-300 rounded p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Site</p>
            <p className="font-bold">{site?.nom ?? "—"}</p>
            {site?.adresse && (
              <p className="text-sm text-gray-600">{site.adresse}</p>
            )}
            {site?.contact_nom && (
              <p className="text-sm">
                Contact : {site.contact_nom}
                {site.contact_telephone ? ` · ${site.contact_telephone}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Date + Type */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-300 rounded p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Date intervention</p>
            <p className="font-semibold capitalize">{dateFormatee}</p>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Type</p>
            <p className="font-semibold">{typeLabel(rapport.type_rapport)}</p>
          </div>
        </div>

        {/* Installations concernées */}
        {installations.length > 0 && (
          <div className="border border-gray-300 rounded p-3 mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Équipements du site</p>
            <div className="grid grid-cols-2 gap-1">
              {installations.map((inst) => (
                <div
                  key={inst.id}
                  className={`flex items-center gap-2 text-sm py-1 ${
                    installation?.id === inst.id ? "font-bold" : ""
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 border-2 rounded-sm flex-shrink-0 ${
                      installation?.id === inst.id
                        ? "border-black bg-black"
                        : "border-gray-400"
                    }`}
                  />
                  🚪 {inst.repere}
                  <span className="text-gray-500 text-xs">
                    {inst.type_porte}
                    {inst.modele ? ` · ${inst.modele}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demande / Description */}
        <div className="border border-gray-300 rounded p-3 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Demande client / Description du problème
          </p>
          {demande ? (
            <p className="text-sm whitespace-pre-wrap">{demande}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-4 border-b border-gray-300" />
              <div className="h-4 border-b border-gray-300" />
              <div className="h-4 border-b border-gray-300" />
            </div>
          )}
        </div>

        {/* Pièces à emporter */}
        <div className="border border-gray-300 rounded p-3 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Pièces / Matériel à emporter
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 text-xs font-bold text-gray-500">
                  Désignation
                </th>
                <th className="text-center py-1 text-xs font-bold text-gray-500 w-16">
                  Qté
                </th>
                <th className="text-center py-1 text-xs font-bold text-gray-500 w-16 print:table-cell hidden">
                  ✓
                </th>
              </tr>
            </thead>
            <tbody>
              {piecesExistantes.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5">{p.nom}</td>
                  <td className="text-center py-1.5">
                    {p.quantite} {p.unite && p.unite !== "unité" ? p.unite : ""}
                  </td>
                  <td className="text-center py-1.5">
                    <span className="inline-block w-5 h-5 border border-gray-400 rounded-sm" />
                  </td>
                </tr>
              ))}
              {/* Lignes vides éditables (screen) ou lignes vides (print) */}
              {piecesExtra.map((val, i) => (
                <tr key={`extra-${i}`} className="border-b border-gray-100">
                  <td className="py-1.5">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateLigne(i, e.target.value)}
                      placeholder="Pièce supplémentaire..."
                      className="w-full text-sm focus:outline-none print:border-none print:placeholder-transparent"
                    />
                    {/* Version print : ligne vide */}
                    <span className="hidden print:block border-b border-gray-300 w-full">&nbsp;</span>
                  </td>
                  <td className="text-center py-1.5">
                    <span className="print:hidden">1</span>
                    <span className="hidden print:block border-b border-gray-300 w-8 mx-auto">&nbsp;</span>
                  </td>
                  <td className="text-center py-1.5">
                    <span className="inline-block w-5 h-5 border border-gray-400 rounded-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addLigne}
            className="print:hidden mt-2 text-xs text-muted hover:text-foreground"
          >
            + Ligne
          </button>
        </div>

        {/* Zone travaux effectués / observations */}
        <div className="border border-gray-300 rounded p-3 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Travaux effectués / Observations sur place
          </p>
          <div className="space-y-2">
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
            <div className="h-6 border-b border-gray-300" />
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Signature technicien
            </p>
            <div className="border border-gray-400 rounded h-20" />
            <p className="text-xs text-gray-500 mt-1">
              Bohrdan CEZARUK · AAC
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Bon pour accord client
            </p>
            <div className="border border-gray-400 rounded h-20" />
            <p className="text-xs text-gray-500 mt-1">Nom &amp; signature</p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-6 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-400">
          <span>AAC · Automatisme et Agencement Calédonien · Nouméa, Nouvelle-Calédonie</span>
          <span>{rapport.numero_cm}</span>
        </div>
      </div>

      {/* CSS print (style tag injecté) */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ot-document, #ot-document * { visibility: visible; }
          #ot-document { position: fixed; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 15mm; }
          input { border: none !important; outline: none !important; }
          input::placeholder { color: transparent !important; }
        }
      `}</style>
    </>
  );
}
