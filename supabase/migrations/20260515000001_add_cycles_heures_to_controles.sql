ALTER TABLE controles
  ADD COLUMN IF NOT EXISTS nombre_cycles INTEGER,
  ADD COLUMN IF NOT EXISTS heures_fonctionnement INTEGER;
