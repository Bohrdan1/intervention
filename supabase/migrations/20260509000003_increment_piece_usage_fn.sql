-- Fonction pour incrémenter le compteur d'usage d'une pièce du catalogue
CREATE OR REPLACE FUNCTION increment_piece_usage(p_nom TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE catalogue_pieces
  SET nb_utilisations = nb_utilisations + 1,
      updated_at = NOW()
  WHERE nom = p_nom;
$$;
