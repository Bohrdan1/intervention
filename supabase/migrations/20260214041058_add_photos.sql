-- Colonne photos sur la table rapports
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
