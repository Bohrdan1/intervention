import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DevisClient } from './devis-client';

export default async function DevisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from('rapports')
    .select('*, client:clients(*), site:sites(*)')
    .eq('id', id)
    .single();

  if (!rapport || rapport.type_rapport !== 'visite') {
    redirect('/');
  }

  return <DevisClient rapport={rapport} />;
}
