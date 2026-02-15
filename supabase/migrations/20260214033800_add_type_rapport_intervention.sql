-- Ajouter le type de rapport (maintenance par défaut pour les existants)
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS type_rapport TEXT DEFAULT 'maintenance'
    CHECK (type_rapport IN ('maintenance', 'intervention'));

-- Colonnes spécifiques à l'intervention
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS description_probleme TEXT,
  ADD COLUMN IF NOT EXISTS travaux_effectues TEXT,
  ADD COLUMN IF NOT EXISTS pieces_utilisees JSONB DEFAULT '[]';
