-- Champs société supplémentaires sur clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS denomination_legale text,
  ADD COLUMN IF NOT EXISTS ridet text,
  ADD COLUMN IF NOT EXISTS adresse_facturation text,
  ADD COLUMN IF NOT EXISTS telephone_secondaire text,
  ADD COLUMN IF NOT EXISTS mail_comptabilite text,
  ADD COLUMN IF NOT EXISTS site_web text,
  ADD COLUMN IF NOT EXISTS notes_internes text,
  ADD COLUMN IF NOT EXISTS type_client text DEFAULT 'professionnel';

-- Champs supplémentaires sur sites
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS contact_fonction text,
  ADD COLUMN IF NOT EXISTS horaires text,
  ADD COLUMN IF NOT EXISTS code_acces text,
  ADD COLUMN IF NOT EXISTS notes_site text;
