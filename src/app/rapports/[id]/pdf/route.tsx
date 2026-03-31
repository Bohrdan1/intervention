import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { RapportPDF } from '@/lib/pdf/rapport-pdf';
import type { RapportComplet } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from('rapports')
    .select(`
      *,
      client:clients(*),
      site:sites(*),
      installation:installations(*),
      controles(
        *,
        installation:installations(*)
      )
    `)
    .eq('id', id)
    .single();

  if (!rapport) {
    return new Response('Non trouvé', { status: 404 });
  }

  const rapportComplet = rapport as unknown as RapportComplet;

  const buffer = await renderToBuffer(
    <RapportPDF rapport={rapportComplet} />
  );

  const filename = `${rapport.numero_cm.replace(/\s/g, '_')}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
