-- ============================================
-- Fix : Activer RLS sur equipements et interventions
-- ============================================

-- TABLE : equipements
ALTER TABLE equipements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read equipements"
  ON equipements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert equipements"
  ON equipements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update equipements"
  ON equipements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete equipements"
  ON equipements FOR DELETE TO authenticated USING (true);

-- TABLE : interventions
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interventions"
  ON interventions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert interventions"
  ON interventions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interventions"
  ON interventions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete interventions"
  ON interventions FOR DELETE TO authenticated USING (true);
