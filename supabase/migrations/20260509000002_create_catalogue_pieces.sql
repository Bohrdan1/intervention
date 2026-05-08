-- Catalogue de pièces utilisées en intervention
-- Permet l'autocomplétion et la cohérence des noms/références

CREATE TABLE IF NOT EXISTS catalogue_pieces (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         TEXT NOT NULL,
  reference   TEXT,
  fournisseur TEXT,
  prix_ht     NUMERIC(10, 2),
  unite       TEXT DEFAULT 'unité',
  nb_utilisations INTEGER DEFAULT 0, -- incrémenté à chaque usage, pour trier par fréquence
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index de recherche rapide par nom
CREATE INDEX IF NOT EXISTS idx_catalogue_pieces_nom ON catalogue_pieces(nom);
-- Tri par fréquence d'usage
CREATE INDEX IF NOT EXISTS idx_catalogue_pieces_usage ON catalogue_pieces(nb_utilisations DESC);

ALTER TABLE catalogue_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read catalogue"
  ON catalogue_pieces FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert catalogue"
  ON catalogue_pieces FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update catalogue"
  ON catalogue_pieces FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete catalogue"
  ON catalogue_pieces FOR DELETE TO authenticated USING (true);

-- Trigger updated_at
CREATE TRIGGER update_catalogue_pieces_updated_at
  BEFORE UPDATE ON catalogue_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pièces fréquentes pour les portes automatiques (à adapter)
INSERT INTO catalogue_pieces (nom, reference, fournisseur, unite, prix_ht) VALUES
  ('Courroie crantée',       '',   'Provalu', 'unité', 0),
  ('Cellule de détection',   '',   'Provalu', 'unité', 0),
  ('Radar de sécurité',      '',   'Provalu', 'unité', 0),
  ('Carte électronique',     '',   'Provalu', 'unité', 0),
  ('Moteur groupe',          '',   'Provalu', 'unité', 0),
  ('Batterie de secours',    '',   'Provalu', 'unité', 0),
  ('Boîtier vert BBG CO48',  '',   'Provalu', 'unité', 0),
  ('Télécommande',           '',   'Provalu', 'unité', 0),
  ('Galet de guidage',       '',   '',        'unité', 0),
  ('Câble acier',            '',   '',        'mètre', 0),
  ('Vis autoforeuse',        '',   '',        'boîte', 0),
  ('Colson (serre-câble)',   '',   '',        'sachet',0),
  ('Rivet',                  '',   '',        'boîte', 0),
  ('Graisse',                '',   '',        'tube',  0)
ON CONFLICT DO NOTHING;
