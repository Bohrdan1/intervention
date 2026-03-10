-- Ajout du champ adresse sur les sites
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS adresse TEXT;
