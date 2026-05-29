-- Garantit l'unicité des références de dossier (D-YYYY-NNN)
-- Date: 2026-05-29
-- nextReference() calcule la référence côté application (SELECT max + 1) : sans
-- contrainte DB, deux créations concurrentes pouvaient produire la même référence.
-- createDossier réessaie désormais en cas de collision (code 23505).

ALTER TABLE dossiers
  ADD CONSTRAINT dossiers_reference_unique UNIQUE (reference);
