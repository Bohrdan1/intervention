-- ============================================
-- Visite technique v2 : données structurées
-- ============================================

-- Colonne JSONB pour stocker toutes les données structurées de la visite
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS visite_data JSONB DEFAULT '{}';
