"use server";

import { createClient } from "@/lib/supabase/server";

export interface PieceCatalogue {
  id: string;
  nom: string;
  reference: string | null;
  fournisseur: string | null;
  prix_ht: number | null;
  unite: string;
  nb_utilisations: number;
}

/** Récupère toutes les pièces du catalogue triées par fréquence d'usage */
export async function getCatalogues(): Promise<PieceCatalogue[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalogue_pieces")
    .select("id, nom, reference, fournisseur, prix_ht, unite, nb_utilisations")
    .order("nb_utilisations", { ascending: false })
    .order("nom");
  return data ?? [];
}

/** Incrémente le compteur d'usage pour chaque pièce utilisée dans un rapport */
export async function incrementerUsages(noms: string[]): Promise<void> {
  if (noms.length === 0) return;
  const supabase = await createClient();
  // Incrémenter les pièces existantes
  for (const nom of noms) {
    await supabase.rpc("increment_piece_usage", { p_nom: nom }).then(async () => {
      // Si la pièce n'existe pas encore dans le catalogue, l'ajouter automatiquement
      const { data } = await supabase
        .from("catalogue_pieces")
        .select("id")
        .eq("nom", nom)
        .maybeSingle();
      if (!data) {
        await supabase.from("catalogue_pieces").insert({ nom, nb_utilisations: 1 });
      }
    });
  }
}

/** Ajoute ou met à jour une pièce dans le catalogue */
export async function upsertPieceCatalogue(piece: {
  nom: string;
  reference?: string;
  fournisseur?: string;
  prix_ht?: number;
  unite?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("catalogue_pieces").insert({
    nom: piece.nom.trim(),
    reference: piece.reference?.trim() || null,
    fournisseur: piece.fournisseur?.trim() || null,
    prix_ht: piece.prix_ht ?? null,
    unite: piece.unite?.trim() || "unité",
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
