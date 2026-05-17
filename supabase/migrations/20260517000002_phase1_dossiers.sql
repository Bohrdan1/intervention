-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 1 : Restructuration du schéma Odessa
--   • installations  →  equipements  (enrichi, mêmes UUIDs)
--   • nouvelles tables : dossiers, rdvs, factures, reglements
--   • rapports.dossier_id, rapports.equipement_id
--   • controles.equipement_id  (renommé depuis installation_id)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Supprimer les tables vides obsolètes
-- ─────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS interventions  CASCADE;
DROP TABLE IF EXISTS equipements    CASCADE;  -- ancienne table vide

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Nouvelle table equipements (remplace installations, champs enrichis)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE equipements (
  id                   UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id              UUID        NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  repere               TEXT        NOT NULL,
  type_porte           TEXT        NOT NULL DEFAULT 'coulissante deux vantaux',
  modele               TEXT,
  marque               TEXT,
  numero_serie         TEXT,
  annee_installation   INTEGER,
  date_mise_en_service DATE,
  avec_batterie        BOOLEAN     NOT NULL DEFAULT FALSE,
  commentaire          TEXT,
  notes_techniques     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Migrer installations → equipements (préserver les UUIDs)
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO equipements (
  id, site_id, repere, type_porte, modele,
  avec_batterie, commentaire, created_at, updated_at
)
SELECT
  id,
  site_id,
  repere,
  type_porte,
  modele,
  COALESCE(avec_batterie, FALSE),
  commentaire,
  created_at,
  updated_at
FROM installations;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Table dossiers (regroupement de travaux / affaires)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE dossiers (
  id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference        TEXT         NOT NULL,
  client_id        UUID         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id          UUID         REFERENCES sites(id) ON DELETE SET NULL,
  type_dossier     TEXT         NOT NULL DEFAULT 'maintenance',
  statut           TEXT         NOT NULL DEFAULT 'ouvert',
  titre            TEXT,
  description      TEXT,
  date_ouverture   DATE         NOT NULL DEFAULT CURRENT_DATE,
  date_cloture     DATE,
  montant_total_ht NUMERIC(12,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT dossiers_type_check   CHECK (type_dossier IN ('maintenance','installation','remplacement','intervention','autre')),
  CONSTRAINT dossiers_statut_check CHECK (statut IN ('ouvert','en_cours','clos'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Table rdvs (rendez-vous / planification)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE rdvs (
  id             UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id     UUID         REFERENCES dossiers(id) ON DELETE CASCADE,
  client_id      UUID         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id        UUID         REFERENCES sites(id) ON DELETE SET NULL,
  type_rdv       TEXT         NOT NULL DEFAULT 'intervention',
  date_rdv       TIMESTAMPTZ  NOT NULL,
  duree_minutes  INTEGER      DEFAULT 60,
  statut         TEXT         NOT NULL DEFAULT 'planifie',
  notes          TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT rdvs_statut_check CHECK (statut IN ('planifie','confirme','realise','annule'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Table factures
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE factures (
  id             UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero         TEXT          NOT NULL UNIQUE,
  dossier_id     UUID          REFERENCES dossiers(id) ON DELETE SET NULL,
  client_id      UUID          NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date_facture   DATE          NOT NULL DEFAULT CURRENT_DATE,
  date_echeance  DATE,
  statut         TEXT          NOT NULL DEFAULT 'brouillon',
  montant_ht     NUMERIC(12,2) NOT NULL DEFAULT 0,
  taux_tva       NUMERIC(5,2)  NOT NULL DEFAULT 11.00,
  lignes         JSONB         NOT NULL DEFAULT '[]',
  notes          TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT factures_statut_check CHECK (statut IN ('brouillon','envoyee','partiellement_payee','payee','annulee'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Table reglements (paiements liés aux factures)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE reglements (
  id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_id      UUID          NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  date_reglement  DATE          NOT NULL DEFAULT CURRENT_DATE,
  montant         NUMERIC(12,2) NOT NULL,
  mode_paiement   TEXT          NOT NULL DEFAULT 'virement',
  reference       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT reglements_mode_check CHECK (mode_paiement IN ('virement','cheque','especes','autre'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Ajouter dossier_id aux rapports
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS dossier_id UUID REFERENCES dossiers(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Migrer les rapports existants : 1 dossier par rapport
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r             RECORD;
  new_dos_id    UUID;
  type_dos      TEXT;
BEGIN
  FOR r IN
    SELECT id, client_id, site_id, type_rapport, numero_cm, date_intervention
    FROM   rapports
    WHERE  dossier_id IS NULL
  LOOP
    type_dos := CASE r.type_rapport
      WHEN 'maintenance'  THEN 'maintenance'
      WHEN 'intervention' THEN 'intervention'
      ELSE 'autre'
    END;

    INSERT INTO dossiers (reference, client_id, site_id, type_dossier, statut, date_ouverture)
    VALUES (
      'DOS-' || r.numero_cm,
      r.client_id,
      r.site_id,
      type_dos,
      'clos',
      r.date_intervention::DATE
    )
    RETURNING id INTO new_dos_id;

    UPDATE rapports SET dossier_id = new_dos_id WHERE id = r.id;
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 10. controles : ajouter equipement_id, copier depuis installation_id
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE controles ADD COLUMN IF NOT EXISTS equipement_id UUID;
UPDATE controles SET equipement_id = installation_id WHERE installation_id IS NOT NULL;
ALTER TABLE controles
  ADD CONSTRAINT controles_equipement_id_fkey
  FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 11. rapports : ajouter equipement_id, copier depuis installation_id
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS equipement_id UUID;
UPDATE rapports SET equipement_id = installation_id WHERE installation_id IS NOT NULL;
ALTER TABLE rapports
  ADD CONSTRAINT rapports_equipement_id_fkey
  FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 12. Supprimer les anciennes colonnes installation_id
--     (supprime automatiquement les FK vers installations)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE controles DROP COLUMN IF EXISTS installation_id;
ALTER TABLE rapports  DROP COLUMN IF EXISTS installation_id;

-- ─────────────────────────────────────────────────────────────────────────
-- 13. Supprimer la table installations (plus aucune FK ne la référence)
-- ─────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS installations CASCADE;

-- ─────────────────────────────────────────────────────────────────────────
-- 14. RLS — activer sur toutes les nouvelles tables
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE equipements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdvs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reglements  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipements_auth" ON equipements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dossiers_auth"    ON dossiers    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rdvs_auth"        ON rdvs        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "factures_auth"    ON factures    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reglements_auth"  ON reglements  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 15. Index de performance
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_equipements_site_id       ON equipements(site_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_client_id        ON dossiers(client_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_site_id          ON dossiers(site_id);
CREATE INDEX IF NOT EXISTS idx_rapports_dossier_id       ON rapports(dossier_id);
CREATE INDEX IF NOT EXISTS idx_rapports_equipement_id    ON rapports(equipement_id);
CREATE INDEX IF NOT EXISTS idx_controles_equipement_id   ON controles(equipement_id);
CREATE INDEX IF NOT EXISTS idx_rdvs_client_id            ON rdvs(client_id);
CREATE INDEX IF NOT EXISTS idx_rdvs_dossier_id           ON rdvs(dossier_id);
CREATE INDEX IF NOT EXISTS idx_factures_client_id        ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_dossier_id       ON factures(dossier_id);
CREATE INDEX IF NOT EXISTS idx_reglements_facture_id     ON reglements(facture_id);

COMMIT;
