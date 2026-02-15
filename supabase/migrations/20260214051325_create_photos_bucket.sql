-- Création du bucket de stockage pour les photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Policies : lecture publique
CREATE POLICY "Lecture publique des photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- Policies : upload
CREATE POLICY "Upload des photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

-- Policies : suppression
CREATE POLICY "Suppression des photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos');
