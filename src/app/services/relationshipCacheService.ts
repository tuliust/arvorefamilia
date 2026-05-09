import { supabase } from '../lib/supabaseClient';

export async function limparCacheParentesco() {
  const { error } = await supabase
    .from('parentescos_calculados')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.warn('[Supabase] Erro ao limpar cache de parentesco:', error);
  }
}
