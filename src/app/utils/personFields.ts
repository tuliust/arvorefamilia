import type { EditableOwnPersonPayload } from '../services/memberProfileService';
import { Pessoa } from '../types';
import { getZodiacSignFromBirthDate } from './zodiac';

export { getZodiacSignFromBirthDate };

export const SOCIAL_NETWORKS = ['LinkedIn', 'Facebook', 'Instagram', 'TikTok'] as const;

export type SocialProfileForm = {
  id: string;
  rede: string;
  perfil: string;
};

export const LOWERCASE_NAME_PARTS = new Set(['de', 'da', 'das', 'do', 'dos', 'e']);

export const PERSON_FIELD_LABELS = {
  nome_completo: 'Nome completo',
  data_nascimento: 'Dia ou Ano de Nascimento',
  signo: 'Signo',
  local_nascimento: 'Local de nascimento',
  local_nascimento_exterior: 'Local de nascimento fora do Brasil',
  local_atual: 'Cidade de residência',
  local_atual_exterior: 'Residência atual fora do Brasil',
  profissao: 'Profissão',
  foto_principal_url: 'Foto',
  minibio: 'Mini bio',
  curiosidades: 'Curiosidades',
  telefone: 'WhatsApp',
  endereco: 'Endereço',
  complemento: 'Complemento',
  rede_social: 'Rede social',
  instagram_usuario: 'Perfil da rede social',
  instagram_url: 'URL da rede social',
  permitir_exibir_instagram: 'Exibir rede social no perfil',
  permitir_mensagens_whatsapp: 'Permitir mensagens por WhatsApp',
  permitir_exibir_data_nascimento: 'Exibir data de nascimento',
  permitir_exibir_endereco: 'Exibir endereço',
  permitir_exibir_rede_social: 'Exibir rede social',
  permitir_exibir_telefone: 'Exibir telefone/WhatsApp',
  data_falecimento: 'Dia ou Ano de Falecimento',
  local_falecimento: 'Local de falecimento',
  local_falecimento_exterior: 'Falecimento no exterior',
  falecido: 'A pessoa é falecida?',
  humano_ou_pet: 'Tipo',
  geracao_sociologica: 'Geração sociológica',
  lado: 'Lado',
} as const;

export type PersonFieldErrors = Partial<Record<keyof EditableOwnPersonPayload, string>>;

export const EDITABLE_OWN_PERSON_FIELDS: Array<keyof EditableOwnPersonPayload> = [
  'nome_completo',
  'data_nascimento',
  'local_nascimento',
  'local_nascimento_exterior',
  'data_falecimento',
  'local_falecimento',
  'local_falecimento_exterior',
  'falecido',
  'local_atual',
  'local_atual_exterior',
  'profissao',
  'foto_principal_url',
  'minibio',
  'curiosidades',
  'telefone',
  'endereco',
  'complemento',
  'rede_social',
  'instagram_usuario',
  'instagram_url',
  'permitir_exibir_instagram',
  'permitir_mensagens_whatsapp',
  'permitir_exibir_data_nascimento',
  'permitir_exibir_endereco',
  'permitir_exibir_rede_social',
  'permitir_exibir_telefone',
];

function extractYear(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const year = value > 9999 ? new Date(value).getFullYear() : value;
    return Number.isFinite(year) ? year : undefined;
  }

  const text = String(value).trim();
  if (!text) return undefined;

  const directYear = text.match(/\b(\d{4})\b/)?.[1];
  if (directYear) return Number(directYear);

  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) return new Date(parsed).getFullYear();

  return undefined;
}

export function getPersonBirthYear(person?: Pessoa | null) {
  if (!person) return undefined;
  return extractYear(person.data_nascimento);
}

export function getPersonDeathYear(person?: Pessoa | null) {
  if (!person) return undefined;
  return extractYear(person.data_falecimento);
}
