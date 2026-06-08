import React from 'react';
import { ArquivoHistorico } from '../../types';
import { FavoriteButton } from './FavoriteButton';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

type HistoricalFileFavoriteButtonProps = {
  arquivo: ArquivoHistorico;
  pessoaId?: string | null;
  relacionamentoId?: string | null;
  className?: string;
};

const HISTORICAL_FILE_CATEGORY_LABELS: Record<string, string> = {
  certidao_nascimento: 'Certidão de Nascimento',
  certidao_casamento: 'Certidão de Casamento',
  alistamento_militar: 'Alistamento Militar',
  imigracao: 'Imigração',
  divorcio: 'Divórcio',
  carreira_profissional: 'Carreira Profissional',
  mudanca_cidade: 'Mudança de Cidade',
  certidao_obito: 'Certidão de Óbito',
  outro: 'Outro',
};

function getHistoricalFileOwner(
  arquivo: ArquivoHistorico,
  pessoaId?: string | null,
  relacionamentoId?: string | null
) {
  const ownerPessoaId = arquivo.pessoa_id ?? pessoaId ?? null;
  const ownerRelacionamentoId = arquivo.relacionamento_id ?? relacionamentoId ?? null;

  return {
    pessoaId: ownerPessoaId,
    relacionamentoId: ownerRelacionamentoId,
    linkedTo: ownerRelacionamentoId ? 'relationship' : 'person',
  } as const;
}

function getHistoricalFileDescription(arquivo: ArquivoHistorico) {
  const categoryLabel = arquivo.categoria_evento
    ? HISTORICAL_FILE_CATEGORY_LABELS[arquivo.categoria_evento]
    : undefined;

  return (
    arquivo.descricao ||
    arquivo.ano ||
    categoryLabel ||
    (arquivo.tipo === 'pdf' ? 'PDF histórico' : 'Imagem histórica')
  );
}

export function HistoricalFileFavoriteButton({
  arquivo,
  pessoaId,
  relacionamentoId,
  className = '',
}: HistoricalFileFavoriteButtonProps) {
  if (!UUID_RE.test(arquivo.id)) return null;

  const owner = getHistoricalFileOwner(arquivo, pessoaId, relacionamentoId);

  return (
    <FavoriteButton
      entityType="historical_file"
      entityId={arquivo.id}
      label={arquivo.titulo || 'Arquivo histórico'}
      description={getHistoricalFileDescription(arquivo)}
      href={owner.pessoaId ? `/pessoa/${owner.pessoaId}` : undefined}
      metadata={{
        file_type: arquivo.tipo,
        ano: arquivo.ano ?? null,
        categoria_evento: arquivo.categoria_evento ?? null,
        linked_to: owner.linkedTo,
        pessoa_id: owner.pessoaId,
        relacionamento_id: owner.relacionamentoId,
      }}
      variant="icon"
      size="sm"
      className={className}
    />
  );
}
