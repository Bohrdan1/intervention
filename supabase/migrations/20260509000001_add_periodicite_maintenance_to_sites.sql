-- Ajout de la périodicité de maintenance sur les sites
-- periodicite_maintenance : durée en mois entre deux maintenances préventives
-- NULL = pas de contrat de maintenance sur ce site
-- Valeurs courantes : 6 (semestrielle), 12 (annuelle), 3 (trimestrielle)

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS periodicite_maintenance INTEGER
    CHECK (periodicite_maintenance > 0 AND periodicite_maintenance <= 60);

COMMENT ON COLUMN sites.periodicite_maintenance IS
  'Périodicité de maintenance en mois. NULL = pas de contrat.';
