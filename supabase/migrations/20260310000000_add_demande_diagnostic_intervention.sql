-- Ajout des champs demande_client et diagnostic sur les rapports d'intervention
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS demande_client TEXT,
  ADD COLUMN IF NOT EXISTS diagnostic TEXT;
