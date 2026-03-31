'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { LigneDevis, StatutDevis } from '@/lib/types';

export async function sauvegarderDevis(
  rapportId: string,
  lignes: LigneDevis[],
  notes: string,
  validite: number,
  statut: StatutDevis,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('rapports')
    .update({
      lignes_devis: lignes,
      notes_devis: notes,
      validite_devis: validite,
      statut_devis: statut,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rapportId);

  if (error) throw new Error(error.message);
  revalidatePath(`/rapports/${rapportId}`);
  revalidatePath(`/rapports/${rapportId}/devis`);
}
