import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { DevisPDF } from '@/lib/pdf/devis-pdf';
import type { LigneDevis, VisiteData } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from('rapports')
    .select('*, client:clients(*), site:sites(*)')
    .eq('id', id)
    .single();

  if (!rapport || rapport.type_rapport !== 'visite') {
    return new Response('Non trouvé', { status: 404 });
  }

  const lignes = (rapport.lignes_devis as LigneDevis[]) || [];
  const visiteData = rapport.visite_data as VisiteData | null;
  const client = rapport.client as { nom: string } | null;
  const site = rapport.site as { nom: string; adresse: string | null } | null;

  const buffer = await renderToBuffer(
    <DevisPDF
      numeroCm={rapport.numero_cm}
      dateIntervention={rapport.date_intervention}
      clientNom={client?.nom ?? ''}
      siteNom={site?.nom ?? ''}
      siteAdresse={site?.adresse ?? null}
      travaux_envisages={visiteData?.travaux_envisages ?? ''}
      lignes={lignes}
      notes={rapport.notes_devis ?? ''}
      validite={rapport.validite_devis ?? 30}
    />
  );

  const filename = `DEVIS-${rapport.numero_cm.replace(/\s/g, '_')}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
