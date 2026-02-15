-- Migration de sécurité : Storage Photos
-- Date: 2026-02-15
-- Description: Sécurise le bucket photos (upload/delete = authenticated, lecture = public)

-- ========================================
-- 1. SUPPRIMER LES POLICIES PUBLIQUES
-- ========================================

DROP POLICY IF EXISTS "Lecture publique des photos" ON storage.objects;
DROP POLICY IF EXISTS "Upload des photos" ON storage.objects;
DROP POLICY IF EXISTS "Suppression des photos" ON storage.objects;

-- ========================================
-- 2. CRÉER LES POLICIES SÉCURISÉES
-- ========================================

-- Lecture publique (nécessaire pour afficher les photos dans les PDFs partagés)
CREATE POLICY "Public can read photos" 
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');

-- Upload : UNIQUEMENT utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload photos" 
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

-- Suppression : UNIQUEMENT utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete photos" 
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');

-- Update/Metadata : UNIQUEMENT utilisateurs authentifiés
CREATE POLICY "Authenticated users can update photos" 
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'photos')
  WITH CHECK (bucket_id = 'photos');
