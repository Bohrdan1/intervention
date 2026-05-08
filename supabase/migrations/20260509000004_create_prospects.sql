-- Module prospects : suivi commercial simplifié
-- Permet de tracker les prospects AAC (Korail, Apogoti, Pharmacie de l'Océan, etc.)

CREATE TABLE IF NOT EXISTS prospects (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom          TEXT NOT NULL,             -- Nom de l'entreprise ou du contact
  contact_nom  TEXT,                      -- Interlocuteur
  telephone    TEXT,
  mail         TEXT,
  adresse      TEXT,
  statut       TEXT NOT NULL DEFAULT 'a_contacter'
               CHECK (statut IN ('a_contacter', 'en_cours', 'devis_envoye', 'gagne', 'perdu', 'en_pause')),
  source       TEXT,                      -- Comment ce prospect a été trouvé
  notes        TEXT,                      -- Notes libres / historique
  prochaine_action  DATE,                 -- Date de prochaine relance
  montant_estime    NUMERIC(12, 0),       -- Montant potentiel en CFP
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_prochaine_action ON prospects(prochaine_action)
  WHERE prochaine_action IS NOT NULL;

-- RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read prospects"
  ON prospects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert prospects"
  ON prospects FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update prospects"
  ON prospects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete prospects"
  ON prospects FOR DELETE TO authenticated USING (true);

-- Trigger updated_at
CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pré-remplissage avec les prospects connus d'AAC
INSERT INTO prospects (nom, statut, notes, prochaine_action) VALUES
  ('Korail',              'a_contacter', 'Prospect à démarcher', NULL),
  ('Apogoti',             'a_contacter', 'Mis en location par Sunset Immobilier', NULL),
  ('Pharmacie de l''Océan','en_cours',   'Client — travaux d''agrandissement à venir (portes)', NULL),
  ('Food court rue Laroque','a_contacter','Prospect à démarcher', NULL),
  ('St Honoré',           'en_pause',    'À recontacter (nouveaux projets)', NULL),
  ('Isis Gestion',        'a_contacter', 'Syndic à démarcher', NULL)
ON CONFLICT DO NOTHING;
