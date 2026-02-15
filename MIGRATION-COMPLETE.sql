-- ========================================
-- MIGRATION COMPLÈTE DE SÉCURITÉ AAC
-- Date: 2026-02-15
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ========================================

-- ========================================
-- PARTIE 1: SÉCURISATION DES TABLES
-- ========================================

-- Supprimer les policies ANON dangereuses
DROP POLICY IF EXISTS "Anon can read clients" ON clients;
DROP POLICY IF EXISTS "Anon can insert clients" ON clients;
DROP POLICY IF EXISTS "Anon can update clients" ON clients;
DROP POLICY IF EXISTS "Anon can delete clients" ON clients;

DROP POLICY IF EXISTS "Anon can read sites" ON sites;
DROP POLICY IF EXISTS "Anon can insert sites" ON sites;
DROP POLICY IF EXISTS "Anon can update sites" ON sites;
DROP POLICY IF EXISTS "Anon can delete sites" ON sites;

DROP POLICY IF EXISTS "Anon can read installations" ON installations;
DROP POLICY IF EXISTS "Anon can insert installations" ON installations;
DROP POLICY IF EXISTS "Anon can update installations" ON installations;
DROP POLICY IF EXISTS "Anon can delete installations" ON installations;

DROP POLICY IF EXISTS "Anon can read rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can insert rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can update rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can delete rapports" ON rapports;

DROP POLICY IF EXISTS "Anon can read controles" ON controles;
DROP POLICY IF EXISTS "Anon can insert controles" ON controles;
DROP POLICY IF EXISTS "Anon can update controles" ON controles;
DROP POLICY IF EXISTS "Anon can delete controles" ON controles;

-- Créer les policies AUTHENTICATED sécurisées

-- Clients
CREATE POLICY "Authenticated users can read clients" 
  ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" 
  ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" 
  ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete clients" 
  ON clients FOR DELETE TO authenticated USING (true);

-- Sites
CREATE POLICY "Authenticated users can read sites" 
  ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sites" 
  ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sites" 
  ON sites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sites" 
  ON sites FOR DELETE TO authenticated USING (true);

-- Installations
CREATE POLICY "Authenticated users can read installations" 
  ON installations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert installations" 
  ON installations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update installations" 
  ON installations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete installations" 
  ON installations FOR DELETE TO authenticated USING (true);

-- Rapports
CREATE POLICY "Authenticated users can read rapports" 
  ON rapports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert rapports" 
  ON rapports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rapports" 
  ON rapports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete rapports" 
  ON rapports FOR DELETE TO authenticated USING (true);

-- Controles
CREATE POLICY "Authenticated users can read controles" 
  ON controles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert controles" 
  ON controles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update controles" 
  ON controles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete controles" 
  ON controles FOR DELETE TO authenticated USING (true);

-- ========================================
-- PARTIE 2: SÉCURISATION DU STORAGE PHOTOS
-- ========================================

-- Supprimer les policies publiques
DROP POLICY IF EXISTS "Lecture publique des photos" ON storage.objects;
DROP POLICY IF EXISTS "Upload des photos" ON storage.objects;
DROP POLICY IF EXISTS "Suppression des photos" ON storage.objects;

-- Créer les policies sécurisées
CREATE POLICY "Public can read photos" 
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos" 
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete photos" 
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can update photos" 
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

-- ========================================
-- TERMINÉ !
-- ========================================
-- Vous pouvez maintenant fermer cette fenêtre
-- et créer votre compte utilisateur
