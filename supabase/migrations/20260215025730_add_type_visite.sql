-- Ajouter le type "visite" au CHECK constraint de type_rapport
ALTER TABLE rapports DROP CONSTRAINT IF EXISTS rapports_type_rapport_check;
ALTER TABLE rapports ADD CONSTRAINT rapports_type_rapport_check
  CHECK (type_rapport IN ('maintenance', 'intervention', 'visite'));

-- Colonnes spécifiques aux visites techniques
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS observations_visite TEXT;
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS recommandations TEXT;
