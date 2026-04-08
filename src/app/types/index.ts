// Tipos principais do sistema de árvore genealógica

export type TipoEntidade = 'Humano' | 'Pet';

export type TipoRelacionamento = 'conjuge' | 'pai' | 'mae' | 'filho' | 'irmao';

export type SubtipoRelacionamento = 'sangue' | 'adotivo' | 'uniao' | 'casamento' | 'separado';

export type LadoPessoa = 'esquerda' | 'direita';

export type TipoVisualizacaoArvore = 'lados' | 'geracoes';

export interface ArquivoHistorico {
  id: string;
  tipo: 'imagem' | 'pdf';
  url: string;
  titulo: string;
  descricao?: string;
}

export interface Pessoa {
  id: string;
  nome_completo: string;
  data_nascimento?: number | string;
  local_nascimento?: string;
  data_falecimento?: number | string;
  local_falecimento?: string;
  local_atual?: string;
  foto_principal_url?: string;
  humano_ou_pet: TipoEntidade;
  lado?: LadoPessoa;
  cor_bg_card?: string;
  minibio?: string;
  curiosidades?: string;
  telefone?: string;
  endereco?: string;
  rede_social?: string;
  arquivos_historicos?: ArquivoHistorico[];
  created_at?: string;
  updated_at?: string;
}

export interface ImagemPessoa {
  id: string;
  pessoa_id: string;
  image_url: string;
  legenda?: string;
  ordem: number;
}

export interface Relacionamento {
  id: string;
  pessoa_origem_id: string;
  pessoa_destino_id: string;
  tipo_relacionamento: TipoRelacionamento;
  subtipo_relacionamento?: SubtipoRelacionamento;
  data_casamento?: string;
  data_separacao?: string;
  local_casamento?: string;
  local_separacao?: string;
  ativo: boolean;
  observacoes?: string;
}

export interface DadosImportacao {
  'Nome completo': string;
  'Data de nascimento'?: number | string;
  'Local de Nascimento'?: string;
  'Data de falecimento'?: number | string;
  'Local de falecimento'?: string;
  'Cônjuge'?: string;
  'Pai'?: string;
  'Mãe'?: string;
  'Filho (a) de (de sangue; adotivo'?: string;
  'Humano ou pet': string;
}

export interface PessoaComRelacionamentos extends Pessoa {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
}

export interface FamilyTreeNode {
  id: string;
  pessoa: Pessoa;
  generation: number;
}

export interface FamilyTreeEdge {
  id: string;
  source: string;
  target: string;
  tipo: 'casamento' | 'filiacao';
  subtipo?: SubtipoRelacionamento;
}
