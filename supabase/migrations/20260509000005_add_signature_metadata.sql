-- Métadonnées de signature : nom du signataire côté client + horodatage
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS nom_signataire_client TEXT,
  ADD COLUMN IF NOT EXISTS date_signature TIMESTAMPTZ;
