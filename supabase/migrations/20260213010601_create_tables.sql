-- ============================================
-- SCHEMA : Automatisme et Agencement
-- Rapports de maintenance préventive/corrective
-- ============================================

-- =====================
-- TABLE : clients
-- =====================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  sous_titre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clients"
  ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE TO authenticated USING (true);

-- =====================
-- TABLE : sites
-- =====================
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_client_id ON sites(client_id);
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sites"
  ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sites"
  ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sites"
  ON sites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sites"
  ON sites FOR DELETE TO authenticated USING (true);

-- =====================
-- TABLE : installations (portes)
-- =====================
CREATE TABLE IF NOT EXISTS installations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  repere TEXT NOT NULL,
  type_porte TEXT NOT NULL DEFAULT 'coulissante deux vantaux',
  modele TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_installations_site_id ON installations(site_id);
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read installations"
  ON installations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert installations"
  ON installations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update installations"
  ON installations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete installations"
  ON installations FOR DELETE TO authenticated USING (true);

-- =====================
-- TABLE : rapports
-- =====================
CREATE TABLE IF NOT EXISTS rapports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_cm TEXT NOT NULL,
  date_intervention DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  technicien TEXT NOT NULL DEFAULT 'Bohrdan CEZARUK',
  constat_general JSONB DEFAULT '[
    {"label": "Structure", "texte": "En bon état, aucune déformation majeure, pas de corrosion. Habillages et fixations correctes.", "conforme": true},
    {"label": "Rails", "texte": "Nettoyés, pas d''usure excessive ni rayure profonde.", "conforme": true},
    {"label": "Motorisation", "texte": "Fonctionnement fluide, pas de vibrations ou bruit anormal. Courroies et câbles en bon état.", "conforme": true},
    {"label": "Détection / Sécurité", "texte": "Capteurs réactifs, systèmes d''inversion et ralentissement conformes.", "conforme": true},
    {"label": "Verrouillage", "texte": "Fonctionnement normal des serrures et loquets, aucune difficulté.", "conforme": true},
    {"label": "Carte de commande", "texte": "Aucun message d''erreur, réglages conformes.", "conforme": true},
    {"label": "Connexion électrique", "texte": "Borniers serrés, câblage OK, mise à la terre conforme.", "conforme": true},
    {"label": "Mouvements", "texte": "Fermeture progressive, sans à-coups, butée respectée.", "conforme": true},
    {"label": "Essais finaux", "texte": "Fonctionnement fluide, voyants au vert.", "conforme": true}
  ]'::jsonb,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'finalise')),
  signature_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rapports_client_id ON rapports(client_id);
CREATE INDEX idx_rapports_site_id ON rapports(site_id);
CREATE INDEX idx_rapports_date ON rapports(date_intervention DESC);
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rapports"
  ON rapports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert rapports"
  ON rapports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rapports"
  ON rapports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete rapports"
  ON rapports FOR DELETE TO authenticated USING (true);

-- =====================
-- TABLE : controles (1 par porte dans un rapport)
-- =====================
CREATE TABLE IF NOT EXISTS controles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rapport_id UUID NOT NULL REFERENCES rapports(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE RESTRICT,
  page_number INT NOT NULL DEFAULT 1,
  points_controle JSONB NOT NULL DEFAULT '[
    {"nom": "câblages basse tension", "etat": "ok", "observation": ""},
    {"nom": "groupe moteur", "etat": "ok", "observation": ""},
    {"nom": "platine électronique", "etat": "ok", "observation": ""},
    {"nom": "détecteurs", "etat": "ok", "observation": ""},
    {"nom": "verrouillage", "etat": "ok", "observation": ""},
    {"nom": "boitier de commande", "etat": "ok", "observation": ""},
    {"nom": "bande de roulement", "etat": "ok", "observation": ""},
    {"nom": "courroie", "etat": "ok", "observation": ""},
    {"nom": "poulies de renvoi", "etat": "ok", "observation": ""},
    {"nom": "chariots porteurs", "etat": "ok", "observation": ""},
    {"nom": "butées", "etat": "ok", "observation": ""},
    {"nom": "fixations du mécanisme", "etat": "ok", "observation": ""},
    {"nom": "éléments de guidage au sol", "etat": "ok", "observation": ""},
    {"nom": "menuiserie", "etat": "ok", "observation": ""},
    {"nom": "vitrage", "etat": "ok", "observation": ""},
    {"nom": "calfeutrements", "etat": "ok", "observation": ""}
  ]'::jsonb,
  points_erp JSONB NOT NULL DEFAULT '[
    {"nom": "réouverture sur obstacle", "conforme": true},
    {"nom": "ouverture par rappel mécanique", "conforme": true},
    {"nom": "boitier d''ouverture d''urgence", "conforme": true},
    {"nom": "ouverture sur panne réseau", "conforme": true},
    {"nom": "bande de visualisation", "conforme": true},
    {"nom": "zone de sécurisation", "conforme": true},
    {"nom": "alimentation sur disjoncteur séparé", "conforme": true}
  ]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_controles_rapport_id ON controles(rapport_id);
CREATE INDEX idx_controles_installation_id ON controles(installation_id);
CREATE UNIQUE INDEX idx_controles_rapport_installation ON controles(rapport_id, installation_id);
ALTER TABLE controles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read controles"
  ON controles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert controles"
  ON controles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update controles"
  ON controles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete controles"
  ON controles FOR DELETE TO authenticated USING (true);

-- =====================
-- Triggers updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_sites
  BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_installations
  BEFORE UPDATE ON installations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_rapports
  BEFORE UPDATE ON rapports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_controles
  BEFORE UPDATE ON controles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- Function : auto-génération numéro CM
-- =====================
CREATE OR REPLACE FUNCTION generate_numero_cm()
RETURNS TEXT AS $$
DECLARE
  current_year INT;
  next_num INT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(REPLACE(numero_cm, 'CM ', ''), '/', 2) AS INT)
  ), 0) + 1
  INTO next_num
  FROM rapports
  WHERE numero_cm LIKE 'CM ' || current_year || '/%';
  RETURN 'CM ' || current_year || '/' || next_num;
END;
$$ LANGUAGE plpgsql;
