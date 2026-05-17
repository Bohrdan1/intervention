-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 2 : Mise à jour contraintes dossiers pour le dashboard
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Supprimer les anciennes contraintes
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE dossiers DROP CONSTRAINT IF EXISTS dossiers_type_check;
ALTER TABLE dossiers DROP CONSTRAINT IF EXISTS dossiers_statut_check;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Migrer les statuts 'clos' → 'termine'
-- ─────────────────────────────────────────────────────────────────────────
UPDATE dossiers SET statut = 'termine' WHERE statut = 'clos';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Nouvelles contraintes étendues
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE dossiers
  ADD CONSTRAINT dossiers_type_check
  CHECK (type_dossier IN (
    'urgent', 'contrat', 'visite',
    'maintenance', 'installation', 'remplacement', 'intervention', 'autre'
  ));

ALTER TABLE dossiers
  ADD CONSTRAINT dossiers_statut_check
  CHECK (statut IN ('ouvert', 'en_cours', 'en_attente', 'termine', 'annule'));

COMMIT;
