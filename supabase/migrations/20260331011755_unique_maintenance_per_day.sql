-- Index unique partiel : un seul rapport de maintenance par client + site + date
-- Les interventions et visites techniques ne sont pas concernées.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_maintenance_par_jour
  ON rapports (client_id, site_id, date_intervention)
  WHERE type_rapport = 'maintenance';
