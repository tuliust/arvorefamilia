import { supabase } from '../lib/supabaseClient';

export async function limparCacheParentesco() {
  const { error } = await supabase.rpc('clear_parentescos_calculados');

  if (error) {
    console.warn('[Supabase] Erro ao limpar cache de parentesco:', error);
  }
}
