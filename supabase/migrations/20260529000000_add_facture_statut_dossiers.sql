-- Ajout du statut 'facture' aux dossiers
-- Date: 2026-05-29
-- Contexte : autoStatut() (src/app/actions/dossiers.ts) calcule un statut 'facture'
--            lorsqu'un n° de facture est renseigné sans règlement. L'UI (colonne
--            « Facturés » du Kanban, DossierCard, finances) attend ce statut, mais
--            la contrainte CHECK ne l'autorisait pas → UPDATE rejeté silencieusement.

ALTER TABLE dossiers DROP CONSTRAINT IF EXISTS dossiers_statut_check;

ALTER TABLE dossiers
  ADD CONSTRAINT dossiers_statut_check
  CHECK (statut IN ('ouvert', 'en_cours', 'en_attente', 'facture', 'termine', 'annule'));
