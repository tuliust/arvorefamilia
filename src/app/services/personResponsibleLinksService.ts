import { supabase } from '../lib/supabaseClient';
import { Pessoa } from '../types';

export interface PersonResponsibleLinkRecord {
  id: string;
  managed_pessoa_id: string;
  responsible_pessoa_id: string;
  responsibility_role?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  responsible_pessoa?: Pessoa | null;
  managed_pessoa?: Pessoa | null;
}

function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message ?? '';

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    message.includes('person_responsible_links') ||
    message.includes('schema cache')
  );
}

const RESPONSIBLE_LINK_SELECT = `
  *,
  responsible_pessoa:pessoas!person_responsible_links_responsible_pessoa_id_fkey(*)
`;

const MANAGED_LINK_SELECT = `
  *,
  managed_pessoa:pessoas!person_responsible_links_managed_pessoa_id_fkey(*)
`;

export async function adminListPersonResponsibleLinks() {
  const { data, error } = await supabase
    .from('person_responsible_links')
    .select(RESPONSIBLE_LINK_SELECT)
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('[Supabase] Tabela person_responsible_links ausente. Aplique a migration de vínculos pessoa-a-pessoa.');
      return { error: undefined, data: [] as PersonResponsibleLinkRecord[] };
    }

    return { error: error.message, data: [] as PersonResponsibleLinkRecord[] };
  }

  return {
    error: undefined,
    data: ((data || []) as PersonResponsibleLinkRecord[]).map((link) => ({
      ...link,
      responsible_pessoa: (link as any).responsible_pessoa ?? null,
    })),
  };
}

export async function listManagedPeopleForResponsiblePerson(responsiblePessoaId: string) {
  const { data, error } = await supabase
    .from('person_responsible_links')
    .select(MANAGED_LINK_SELECT)
    .eq('responsible_pessoa_id', responsiblePessoaId)
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      return { error: undefined, data: [] as PersonResponsibleLinkRecord[] };
    }

    return { error: error.message, data: [] as PersonResponsibleLinkRecord[] };
  }

  const links = ((data || []) as PersonResponsibleLinkRecord[])
    .map((link) => ({
      ...link,
      managed_pessoa: (link as any).managed_pessoa ?? null,
    }))
    .filter((link) => Boolean(link.managed_pessoa));

  return {
    error: undefined,
    data: links.sort((left, right) => {
      const leftName = left.managed_pessoa?.nome_completo ?? '';
      const rightName = right.managed_pessoa?.nome_completo ?? '';
      return leftName.localeCompare(rightName, 'pt-BR');
    }),
  };
}

export async function adminCreatePersonResponsibleLink(params: {
  managedPessoaId: string;
  responsiblePessoaId: string;
  responsibilityRole?: string | null;
}) {
  const { data, error } = await supabase
    .from('person_responsible_links')
    .upsert({
      managed_pessoa_id: params.managedPessoaId,
      responsible_pessoa_id: params.responsiblePessoaId,
      responsibility_role: params.responsibilityRole ?? 'Responsável',
    }, { onConflict: 'managed_pessoa_id,responsible_pessoa_id' })
    .select(RESPONSIBLE_LINK_SELECT)
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return {
        error: 'Tabela person_responsible_links ausente. Aplique a migration antes de vincular responsáveis sem usuário autenticado.',
        data: null as PersonResponsibleLinkRecord | null,
      };
    }

    return { error: error.message, data: null as PersonResponsibleLinkRecord | null };
  }

  return {
    error: undefined,
    data: {
      ...(data as PersonResponsibleLinkRecord),
      responsible_pessoa: (data as any).responsible_pessoa ?? null,
    },
  };
}
