-- Ajout du module devis aux rapports de type visite
-- lignes_devis : tableau JSON de lignes de chiffrage
-- statut_devis : brouillon | envoye | accepte | refuse

ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS lignes_devis JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS statut_devis TEXT DEFAULT 'brouillon'
    CHECK (statut_devis IN ('brouillon', 'envoye', 'accepte', 'refuse')),
  ADD COLUMN IF NOT EXISTS notes_devis TEXT,
  ADD COLUMN IF NOT EXISTS validite_devis INTEGER DEFAULT 30;

COMMENT ON COLUMN rapports.lignes_devis IS
  'Lignes de devis : [{id, description, quantite, unite, prix_unitaire, fournisseur, statut_fournisseur, type}]';
COMMENT ON COLUMN rapports.statut_devis IS
  'Statut du devis : brouillon | envoye | accepte | refuse';
