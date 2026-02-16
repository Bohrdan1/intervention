"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveVisite, finalizeVisite } from "./actions";
import type { PorteVisite, VisiteData } from "@/lib/types";
import { DEFAULT_VISITE_DATA, DEFAULT_PORTE_VISITE as defaultPorte } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import PhotoUpload from "@/components/ui/photo-upload";

function generateId() {
  return crypto.randomUUID();
}

function createNewPorte(): PorteVisite {
  return { ...defaultPorte, id: generateId() };
}

// ── Checkbox group helper ──
function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
              selected.includes(opt.value)
                ? "bg-primary text-white border-primary"
                : "bg-white border-border text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section Porte ──
function PorteSection({
  porte,
  index,
  rapportId,
  onChange,
  onRemove,
  canRemove,
}: {
  porte: PorteVisite;
  index: number;
  rapportId: string;
  onChange: (updated: PorteVisite) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function update(field: keyof PorteVisite, value: any) {
    onChange({ ...porte, [field]: value });
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Installation {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-danger hover:underline"
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Type de porte */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Type de porte</label>
        <div className="flex gap-2">
          {(
            [
              { value: "coulissante", label: "Coulissante" },
              { value: "battante", label: "Battante" },
              { value: "autre", label: "Autre" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("type_porte", opt.value)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                porte.type_porte === opt.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sous-options coulissante */}
      {porte.type_porte === "coulissante" && (
        <div className="mb-4 space-y-3 rounded-lg bg-slate-50 p-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Type coulissante</label>
            <div className="flex gap-2">
              {(["simple", "telescopique"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type_coulissante", t)}
                  className={`flex-1 rounded-lg border py-1.5 text-sm transition-all ${
                    porte.type_coulissante === t
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border hover:bg-slate-50"
                  }`}
                >
                  {t === "simple" ? "Simple" : "Télescopique"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Vantaux</label>
              <div className="flex gap-1">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update("vantaux", n)}
                    className={`flex-1 rounded-lg border py-1.5 text-sm transition-all ${
                      porte.vantaux === n
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Parties fixes</label>
              <input
                type="number"
                min={0}
                value={porte.parties_fixes}
                onChange={(e) => update("parties_fixes", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sous-options battante */}
      {porte.type_porte === "battante" && (
        <div className="mb-4 space-y-3 rounded-lg bg-slate-50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Vantaux</label>
              <div className="flex gap-1">
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update("vantaux", n)}
                    className={`flex-1 rounded-lg border py-1.5 text-sm transition-all ${
                      porte.vantaux === n
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sens d&apos;ouverture</label>
              <div className="flex gap-1">
                {(["poussant", "tirant"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update("sens_ouverture", s)}
                    className={`flex-1 rounded-lg border py-1.5 text-sm transition-all ${
                      porte.sens_ouverture === s
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border hover:bg-slate-50"
                    }`}
                  >
                    {s === "poussant" ? "Poussant" : "Tirant"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saisie libre autre */}
      {porte.type_porte === "autre" && (
        <div className="mb-4">
          <input
            type="text"
            value={porte.type_autre}
            onChange={(e) => update("type_autre", e.target.value)}
            placeholder="Précisez le type de porte..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {/* Support */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Nature du support</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "beton", label: "Béton" },
              { value: "metal", label: "Métal" },
              { value: "placo", label: "Placo renforcé" },
              { value: "autre", label: "Autre" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("support", opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                porte.support === opt.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {porte.support === "autre" && (
          <input
            type="text"
            value={porte.support_autre}
            onChange={(e) => update("support_autre", e.target.value)}
            placeholder="Précisez..."
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        )}
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Hauteur (mm)</label>
          <input
            type="number"
            value={porte.hauteur}
            onChange={(e) => update("hauteur", e.target.value)}
            placeholder="mm"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Largeur baie (mm)</label>
          <input
            type="number"
            value={porte.largeur}
            onChange={(e) => update("largeur", e.target.value)}
            placeholder="mm"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Passage utile (mm)</label>
          <input
            type="number"
            value={porte.passage_utile}
            onChange={(e) => update("passage_utile", e.target.value)}
            placeholder="mm"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Linteau (mm)</label>
          <input
            type="number"
            value={porte.linteau}
            onChange={(e) => update("linteau", e.target.value)}
            placeholder="mm"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Profondeur (mm)</label>
          <input
            type="number"
            value={porte.profondeur}
            onChange={(e) => update("profondeur", e.target.value)}
            placeholder="mm"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Débattement */}
      <div>
        <label className="block text-sm font-semibold mb-2">Débattement</label>
        <div className="flex gap-2 mb-2">
          {(["degage", "obstacle"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update("debattement", d)}
              className={`flex-1 rounded-lg border py-1.5 text-sm transition-all ${
                porte.debattement === d
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border hover:bg-slate-50"
              }`}
            >
              {d === "degage" ? "Dégagé" : "Obstacle"}
            </button>
          ))}
        </div>
        {porte.debattement === "obstacle" && (
          <input
            type="text"
            value={porte.debattement_detail}
            onChange={(e) => update("debattement_detail", e.target.value)}
            placeholder="Détail obstacle (tubes, poutres, luminaires...)"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        )}
      </div>

      {/* Photos de l'installation */}
      <div className="mt-4 pt-4 border-t border-border">
        <label className="block text-sm font-semibold mb-2">📷 Photos installation {index + 1}</label>
        <PhotoUpload
          rapportId={rapportId}
          context={`installation-${porte.id}`}
          photos={porte.photos || []}
          onPhotosChange={(updated) => update("photos", updated)}
        />
      </div>
    </div>
  );
}

// ── Composant principal ──
export function VisiteClient({ rapport }: { rapport: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialiser visite_data depuis le rapport ou avec les défauts
  const existingData: VisiteData = rapport.visite_data && Object.keys(rapport.visite_data).length > 0
    ? rapport.visite_data
    : {
        ...DEFAULT_VISITE_DATA,
        adresse: rapport.site?.nom || "",
        contact_sur_place: "",
        telephone_contact: "",
      };

  const [data, setData] = useState<VisiteData>(existingData);

  // Photos collectées depuis toutes les installations
  const allPhotos = data.portes.flatMap((p) => p.photos || []);

  function updateField<K extends keyof VisiteData>(field: K, value: VisiteData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function updateEnvironnement<K extends keyof VisiteData["environnement"]>(
    field: K,
    value: VisiteData["environnement"][K]
  ) {
    setData((prev) => ({
      ...prev,
      environnement: { ...prev.environnement, [field]: value },
    }));
  }

  // Portes
  function addPorte() {
    setData((prev) => ({
      ...prev,
      portes: [...prev.portes, createNewPorte()],
    }));
  }

  function updatePorte(index: number, updated: PorteVisite) {
    setData((prev) => {
      const portes = [...prev.portes];
      portes[index] = updated;
      return { ...prev, portes };
    });
  }

  function removePorte(index: number) {
    setData((prev) => ({
      ...prev,
      portes: prev.portes.filter((_, i) => i !== index),
    }));
  }

  // Sauvegarde brouillon
  async function handleSaveDraft() {
    setSaving(true);
    try {
      const result = await saveVisite(
        rapport.id,
        data.observations_particulieres,
        data.preconisation,
        allPhotos,
        data
      );
      if (!result.success) {
        toast(result.error || "Erreur de sauvegarde", "error");
        return;
      }
      toast("Brouillon sauvegardé", "success");
      router.push("/");
    } finally {
      setSaving(false);
    }
  }

  // Détection iOS/iPad
  function isIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  // Terminé → finaliser + PDF
  async function handleFinalize() {
    setGenerating(true);
    try {
      const result = await finalizeVisite(
        rapport.id,
        data.observations_particulieres,
        data.preconisation,
        allPhotos,
        data
      );
      if (!result.success) {
        toast(result.error || "Erreur de finalisation", "error");
        return;
      }

      // Génération PDF
      const rapportComplet = {
        ...rapport,
        visite_data: data,
        observations_visite: data.observations_particulieres,
        recommandations: data.preconisation,
        photos: allPhotos,
        statut: "finalise",
      };

      const { pdf } = await import("@react-pdf/renderer");
      const { RapportPDF } = await import("@/lib/pdf/rapport-pdf");
      const blob = await pdf(<RapportPDF rapport={rapportComplet} />).toBlob();
      const url = URL.createObjectURL(blob);

      if (isIOS()) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${rapport.numero_cm.replace(/\s/g, "_")}_visite.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setPreviewUrl(url);
      }

      toast("Visite finalisée", "success");
    } catch (error) {
      console.error("Erreur:", error);
      toast("Erreur lors de la finalisation", "error");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${rapport.numero_cm.replace(/\s/g, "_")}_visite.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  return (
    <div className="pb-24">
      {/* Overlay aperçu PDF */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/80">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border">
            <h2 className="text-sm font-bold">Aperçu visite technique</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
              >
                Télécharger
              </button>
              <button
                onClick={closePreview}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
          <iframe src={previewUrl} className="flex-1 w-full" title="Aperçu PDF" />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Visite technique</h1>
      <p className="text-sm text-muted mb-6">
        {rapport.numero_cm} · {rapport.client?.nom} · {rapport.site?.nom}
      </p>

      {/* ── 1. Infos Client / Site ── */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3">1. Informations générales</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Client / Site</label>
            {rapport.client?.nom ? (
              <p className="text-sm font-medium">
                {rapport.client.nom} — {rapport.site?.nom}
              </p>
            ) : null}
            <input
              type="text"
              value={data.client_site_libre}
              onChange={(e) => updateField("client_site_libre", e.target.value)}
              placeholder={rapport.client?.nom ? "Ou saisir un autre client / site..." : "Nom du client / site..."}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Adresse</label>
            <input
              type="text"
              value={data.adresse}
              onChange={(e) => updateField("adresse", e.target.value)}
              placeholder="Adresse précise du site..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Contact sur place</label>
              <input
                type="text"
                value={data.contact_sur_place}
                onChange={(e) => updateField("contact_sur_place", e.target.value)}
                placeholder="Nom du contact..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Téléphone</label>
              <input
                type="tel"
                value={data.telephone_contact}
                onChange={(e) => updateField("telephone_contact", e.target.value)}
                placeholder="Tél..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Email supplémentaire</label>
            <input
              type="email"
              value={data.email_supplementaire}
              onChange={(e) => updateField("email_supplementaire", e.target.value)}
              placeholder="email@exemple.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Travaux envisagés ── */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3">2. Travaux envisagés</h2>
        <textarea
          value={data.travaux_envisages}
          onChange={(e) => updateField("travaux_envisages", e.target.value)}
          placeholder="Intention du client (ex: Remplacement porte de garage, motorisation portail existant...)"
          rows={3}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* ── 3. Caractéristiques portes ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">3. Installations</h2>
          <button
            type="button"
            onClick={addPorte}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-light"
          >
            + Ajouter
          </button>
        </div>
        {data.portes.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
            <p className="text-sm text-muted mb-3">Aucune installation ajoutée</p>
            <button
              type="button"
              onClick={addPorte}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
            >
              + Ajouter une installation
            </button>
          </div>
        )}
        <div className="space-y-3">
          {data.portes.map((porte, i) => (
            <PorteSection
              key={porte.id}
              porte={porte}
              index={i}
              rapportId={rapport.id}
              onChange={(updated) => updatePorte(i, updated)}
              onRemove={() => removePorte(i)}
              canRemove={data.portes.length > 1}
            />
          ))}
        </div>
      </div>

      {/* ── 4. Environnement & Sécurité ── */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3">4. Environnement & Sécurité</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Accès</label>
            <input
              type="text"
              value={data.environnement.acces}
              onChange={(e) => updateEnvironnement("acces", e.target.value)}
              placeholder="Accès camionnette, poids lourd, escalier..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <CheckboxGroup
            label="Alimentation électrique"
            options={[
              { value: "230v", label: "230V dispo" },
              { value: "disjoncteur", label: "Disjoncteur dédié" },
              { value: "a_prevoir", label: "À prévoir" },
            ]}
            selected={data.environnement.electricite}
            onChange={(v) => updateEnvironnement("electricite", v)}
          />

          <CheckboxGroup
            label="Sécurité (Normes)"
            options={[
              { value: "rideau_laser", label: "Rideau laser" },
              { value: "cellules", label: "Cellules" },
              { value: "barre_palpeuse", label: "Barre palpeuse" },
              { value: "das", label: "DAS (Incendie)" },
            ]}
            selected={data.environnement.securite}
            onChange={(v) => updateEnvironnement("securite", v)}
          />

          <CheckboxGroup
            label="Mode d'activation"
            options={[
              { value: "radar", label: "Radar" },
              { value: "bouton", label: "Bouton" },
              { value: "digicode", label: "Digicode" },
              { value: "badge", label: "Badge" },
              { value: "telecommande", label: "Télécommande" },
            ]}
            selected={data.environnement.activation}
            onChange={(v) => updateEnvironnement("activation", v)}
          />
        </div>
      </div>

      {/* ── 5. Observations / Recommandations ── */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3">5. Observations & Recommandations</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Observations particulières</label>
            <textarea
              value={data.observations_particulieres}
              onChange={(e) => updateField("observations_particulieres", e.target.value)}
              placeholder="Faux aplomb, humidité, besoin d'échafaudage..."
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Préconisation / Recommandations</label>
            <textarea
              value={data.preconisation}
              onChange={(e) => updateField("preconisation", e.target.value)}
              placeholder="Ce qui sera reporté sur le devis final..."
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Actions fixes en bas ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-5xl gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || generating}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Brouillon"}
          </button>
          <button
            onClick={handleFinalize}
            disabled={saving || generating}
            className="flex-[2] rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {generating ? "Génération PDF..." : "Terminé"}
          </button>
        </div>
      </div>
    </div>
  );
}
