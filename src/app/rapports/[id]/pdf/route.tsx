import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { RapportPDF } from '@/lib/pdf/rapport-pdf';
import type { RapportComplet } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const forceDownload = url.searchParams.get('download') === '1';
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from('rapports')
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      installation:equipements(*),
      controles(
        *,
        installation:equipements(*)
      )
    `)
    .eq('id', id)
    .single();

  if (!rapport) {
    return new Response('Non trouvé', { status: 404 });
  }

  // Mapper equipement_id → installation_id pour compatibilité PDF (photo context)
  const rapportComplet = {
    ...rapport,
    controles: (rapport.controles || []).map((c: Record<string, unknown>) => ({
      ...c,
      installation_id: c.equipement_id ?? null,
    })),
  } as unknown as RapportComplet;

  const buffer = await renderToBuffer(
    <RapportPDF rapport={rapportComplet} />
  );

  const [year, month, day] = rapport.date_intervention.split('T')[0].split('-');
  const dateStr = `${parseInt(day)}-${parseInt(month)}-${year}`;
  const siteName = (rapport.site as { nom: string })?.nom || '';
  const cleanSite = siteName.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ -]/g, '').replace(/\s+/g, '_');
  const prefix =
    rapport.type_rapport === 'intervention' ? 'CR_Intervention' :
    rapport.type_rapport === 'visite'        ? 'CR_Visite_Technique' :
                                               'CR_Maintenance';
  const filename = `${prefix}_${dateStr}_${cleanSite}.pdf`;
  const disposition = forceDownload ? 'attachment' : 'inline';
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${filename}"`,
    },
  });
}
