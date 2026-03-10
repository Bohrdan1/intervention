-- Lier un rapport d'intervention à une installation spécifique (optionnel)
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS installation_id UUID REFERENCES installations(id) ON DELETE SET NULL;
