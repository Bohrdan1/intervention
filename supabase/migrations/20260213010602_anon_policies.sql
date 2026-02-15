-- Policies temporaires pour accès anon (développement)
-- À remplacer par des policies authenticated en production

CREATE POLICY "Anon can read clients" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert clients" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update clients" ON clients FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete clients" ON clients FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can read sites" ON sites FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert sites" ON sites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update sites" ON sites FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete sites" ON sites FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can read installations" ON installations FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert installations" ON installations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update installations" ON installations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete installations" ON installations FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can read rapports" ON rapports FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert rapports" ON rapports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update rapports" ON rapports FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete rapports" ON rapports FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can read controles" ON controles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert controles" ON controles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update controles" ON controles FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete controles" ON controles FOR DELETE TO anon USING (true);
