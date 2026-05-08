-- Montant HT en CFP pour les rapports (utilisé dans l'export comptable et le tableau de bord financier)
ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS montant_ht NUMERIC(12, 0);

-- Index pour les requêtes financières
CREATE INDEX IF NOT EXISTS idx_rapports_montant_ht ON rapports(montant_ht)
  WHERE montant_ht IS NOT NULL;
