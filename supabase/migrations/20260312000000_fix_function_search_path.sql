-- Fix security advisory: mutable search_path on functions
-- Ajoute SET search_path = '' pour éviter le risque d'injection via search_path

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

CREATE OR REPLACE FUNCTION generate_numero_cm()
RETURNS TEXT AS $$
DECLARE
  current_year INT;
  next_num INT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(REPLACE(numero_cm, 'CM ', ''), '/', 2) AS INT)
  ), 0) + 1
  INTO next_num
  FROM public.rapports
  WHERE numero_cm LIKE 'CM ' || current_year || '/%';
  RETURN 'CM ' || current_year || '/' || next_num;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';
