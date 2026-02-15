-- Migration : Bucket pour signatures
-- Date: 2026-02-15
-- Description: Crée un bucket Supabase Storage pour les signatures

-- Créer le bucket "signatures"
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket signatures
-- Lecture publique (pour affichage dans PDFs)
DROP POLICY IF EXISTS "Public can read signatures" ON storage.objects;
CREATE POLICY "Public can read signatures" 
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'signatures');

-- Upload : UNIQUEMENT utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;
CREATE POLICY "Authenticated users can upload signatures" 
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'signatures');

-- Suppression : UNIQUEMENT utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can delete signatures" ON storage.objects;
CREATE POLICY "Authenticated users can delete signatures" 
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'signatures');

-- Update : UNIQUEMENT utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can update signatures" ON storage.objects;
CREATE POLICY "Authenticated users can update signatures" 
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'signatures')
  WITH CHECK (bucket_id = 'signatures');
