-- Migration de sécurité : passage de anon à authenticated
-- Date: 2026-02-15
-- Description: Sécurise toutes les tables en requérant l'authentification
--              Architecture mono-utilisateur évolutive

-- ========================================
-- 1. SUPPRIMER LES POLICIES ANON DANGEREUSES
-- ========================================

-- Clients
DROP POLICY IF EXISTS "Anon can read clients" ON clients;
DROP POLICY IF EXISTS "Anon can insert clients" ON clients;
DROP POLICY IF EXISTS "Anon can update clients" ON clients;
DROP POLICY IF EXISTS "Anon can delete clients" ON clients;

-- Sites
DROP POLICY IF EXISTS "Anon can read sites" ON sites;
DROP POLICY IF EXISTS "Anon can insert sites" ON sites;
DROP POLICY IF EXISTS "Anon can update sites" ON sites;
DROP POLICY IF EXISTS "Anon can delete sites" ON sites;

-- Installations
DROP POLICY IF EXISTS "Anon can read installations" ON installations;
DROP POLICY IF EXISTS "Anon can insert installations" ON installations;
DROP POLICY IF EXISTS "Anon can update installations" ON installations;
DROP POLICY IF EXISTS "Anon can delete installations" ON installations;

-- Rapports
DROP POLICY IF EXISTS "Anon can read rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can insert rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can update rapports" ON rapports;
DROP POLICY IF EXISTS "Anon can delete rapports" ON rapports;

-- Controles
DROP POLICY IF EXISTS "Anon can read controles" ON controles;
DROP POLICY IF EXISTS "Anon can insert controles" ON controles;
DROP POLICY IF EXISTS "Anon can update controles" ON controles;
DROP POLICY IF EXISTS "Anon can delete controles" ON controles;

-- ========================================
-- 2. CRÉER LES POLICIES AUTHENTICATED
-- ========================================
-- Note: Ces policies donnent accès à TOUS les utilisateurs authentifiés
-- Pour l'instant = un seul utilisateur (Bohrdan)
-- Plus tard = facile d'ajouter des filtres par user_id si besoin

-- Clients
CREATE POLICY "Authenticated users can read clients" 
  ON clients FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert clients" 
  ON clients FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
  ON clients FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients" 
  ON clients FOR DELETE 
  TO authenticated 
  USING (true);

-- Sites
CREATE POLICY "Authenticated users can read sites" 
  ON sites FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert sites" 
  ON sites FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites" 
  ON sites FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sites" 
  ON sites FOR DELETE 
  TO authenticated 
  USING (true);

-- Installations
CREATE POLICY "Authenticated users can read installations" 
  ON installations FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert installations" 
  ON installations FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update installations" 
  ON installations FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete installations" 
  ON installations FOR DELETE 
  TO authenticated 
  USING (true);

-- Rapports
CREATE POLICY "Authenticated users can read rapports" 
  ON rapports FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert rapports" 
  ON rapports FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rapports" 
  ON rapports FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rapports" 
  ON rapports FOR DELETE 
  TO authenticated 
  USING (true);

-- Controles
CREATE POLICY "Authenticated users can read controles" 
  ON controles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert controles" 
  ON controles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update controles" 
  ON controles FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete controles" 
  ON controles FOR DELETE 
  TO authenticated 
  USING (true);
