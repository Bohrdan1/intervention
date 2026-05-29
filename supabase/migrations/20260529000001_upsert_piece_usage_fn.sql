-- Rend increment_piece_usage atomique : incrémente si la pièce existe, sinon la crée.
-- Date: 2026-05-29
-- Évite le pattern app-side (RPC + SELECT + INSERT) de catalogue.ts qui faisait
-- 2N requêtes et comportait une fenêtre de course.

CREATE OR REPLACE FUNCTION increment_piece_usage(p_nom TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE catalogue_pieces
    SET nb_utilisations = nb_utilisations + 1,
        updated_at = NOW()
    WHERE nom = p_nom;
  IF NOT FOUND THEN
    INSERT INTO catalogue_pieces (nom, nb_utilisations) VALUES (p_nom, 1);
  END IF;
END;
$$;
