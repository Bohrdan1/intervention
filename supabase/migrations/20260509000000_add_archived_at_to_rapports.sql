-- Ajout de la colonne archived_at sur la table rapports
-- Utilisée pour l'archivage logique des rapports (suppression douce)
-- La colonne était utilisée dans le code mais absente des migrations.

ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Index partiel : seuls les rapports archivés sont indexés,
-- optimise les requêtes de filtrage (liste "tous" exclut les archivés)
CREATE INDEX IF NOT EXISTS idx_rapports_archived_at
  ON rapports(archived_at)
  WHERE archived_at IS NOT NULL;
