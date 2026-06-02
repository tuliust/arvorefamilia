import React, { useEffect, useMemo, useState } from 'react';
import { X, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { ArquivosHistoricos } from '../../ArquivosHistoricos';
import { ArquivoHistorico, Pessoa, Relacionamento } from '../../../types';
import {
  listarArquivosHistoricosDoRelacionamento,
  salvarArquivosHistoricosDoRelacionamento,
} from '../../../services/arquivosHistoricosService';
import {
  GenealogyMarriageStatus,
  getGenealogyMarriageStatus,
} from '../layouts/genealogyColumnsLayout';
import { MarriageNodeDetails } from '../types';

interface ViewMarriageModalProps {
  open: boolean;
  marriage: MarriageNodeDetails | null;
  isAdmin?: boolean;
  onClose: () => void;
}

type ParsedDate = {
  date: Date;
  formatted: string;
};

function getRelationshipField(
  relationship: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined {
  if (!relationship) return undefined;

  for (const key of keys) {
    const value = relationship[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}

function hasInfoValue(value?: string) {
  return Boolean(String(value ?? '').trim());
}

function parseDateValue(value?: string | number | null): ParsedDate | undefined {
  if (value === null || value === undefined) return undefined;

  const text = String(value).trim();
  if (!text) return undefined;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const day = brDate ? Number(brDate[1]) : isoDate ? Number(isoDate[3]) : undefined;
  const month = brDate ? Number(brDate[2]) : isoDate ? Number(isoDate[2]) : undefined;
  const year = brDate ? Number(brDate[3]) : isoDate ? Number(isoDate[1]) : undefined;

  if (!day || !month || !year) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return {
    date,
    formatted: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
  };
}

function formatDateBR(value?: string | number | null) {
  return parseDateValue(value)?.formatted;
}

function calculateCompleteYears(start?: Date, end?: Date) {
  if (!start || !end || end < start) return undefined;

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const endMonth = end.getUTCMonth();
  const startMonth = start.getUTCMonth();

  if (endMonth < startMonth || (endMonth === startMonth && end.getUTCDate() < start.getUTCDate())) {
    years -= 1;
  }

  return years >= 0 ? years : undefined;
}

function getSafePersonName(person: Pessoa | undefined, fallback: string) {
  return person?.nome_completo?.trim() || fallback;
}

function getInitials(name: string) {
  const ignoredParts = new Set(['de', 'da', 'das', 'do', 'dos', 'e']);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.find((part, index) => (
    index > 0 && !ignoredParts.has(part.toLocaleLowerCase('pt-BR'))
  ))?.[0] ?? parts[1]?.[0] ?? '';

  return `${first}${second}`.toLocaleUpperCase('pt-BR') || '??';
}

function isPersonDeceasedLocally(person?: Pessoa) {
  return Boolean(
    person?.falecido ||
    String(person?.data_falecimento ?? '').trim() ||
    String(person?.local_falecimento ?? '').trim()
  );
}

function getDeceasedPerson(person1?: Pessoa, person2?: Pessoa) {
  if (isPersonDeceasedLocally(person1)) return person1;
  if (isPersonDeceasedLocally(person2)) return person2;
  return undefined;
}

function appendDateAndPlace(prefix: string, date?: string, place?: string) {
  if (date && place) return `${prefix} em ${date} em "${place}".`;
  if (date) return `${prefix} em ${date}.`;
  if (place) return `${prefix} em "${place}".`;
  return undefined;
}

function buildMarriageNarrative({
  status,
  relationship,
  person1,
  person2,
  person1Fallback,
  person2Fallback,
}: {
  status: GenealogyMarriageStatus;
  relationship?: Relacionamento;
  person1?: Pessoa;
  person2?: Pessoa;
  person1Fallback: string;
  person2Fallback: string;
}) {
  const relationshipRecord = (relationship || {}) as Record<string, unknown>;
  const name1 = getSafePersonName(person1, person1Fallback);
  const name2 = getSafePersonName(person2, person2Fallback);
  const marriageDateValue = getRelationshipField(relationshipRecord, [
    'data_casamento',
    'data_relacionamento',
    'data_inicio',
  ]);
  const marriageDate = parseDateValue(marriageDateValue);
  const marriageDateText = formatDateBR(marriageDateValue);
  const marriagePlace = getRelationshipField(relationshipRecord, [
    'local_casamento',
    'local_relacionamento',
    'local_inicio',
  ]);
  const separationDate = parseDateValue(getRelationshipField(relationshipRecord, [
    'data_separacao',
    'data_fim',
  ]));
  const deceasedPerson = getDeceasedPerson(person1, person2);
  const deathDate = parseDateValue(deceasedPerson?.data_falecimento);
  const durationYears = calculateCompleteYears(
    marriageDate?.date,
    status === 'divorced' ? separationDate?.date : deathDate?.date
  );
  const lines: string[] = [];

  if (status === 'active') {
    lines.push(`"${name1}" é casada(o) com "${name2}".`);

    const weddingLine = appendDateAndPlace('Eles se casaram', marriageDateText, marriagePlace);
    if (weddingLine) lines.push(weddingLine);

    return lines;
  }

  if (status === 'divorced') {
    lines.push(`"${name1}" foi casada(o) com "${name2}".`);

    const unionLine = appendDateAndPlace('A união aconteceu', marriageDateText, marriagePlace);
    if (unionLine) lines.push(unionLine);
    if (separationDate) lines.push(`Eles se separaram em ${separationDate.formatted}.`);

    return lines;
  }

  if (status === 'widowed') {
    const durationText = durationYears !== undefined ? ` por ${durationYears} anos` : '';
    lines.push(`"${name1}" foi casada(o)${durationText} com "${name2}".`);

    const unionLine = appendDateAndPlace('A união aconteceu', marriageDateText, marriagePlace);
    if (unionLine) lines.push(unionLine);

    if (durationYears !== undefined && deceasedPerson && deathDate) {
      lines.push(`A união durou por ${durationYears} anos até o falecimento de "${getSafePersonName(deceasedPerson, 'Pessoa falecida')}", em ${deathDate.formatted}.`);
    } else if (deceasedPerson && deathDate) {
      lines.push(`A união durou até o falecimento de "${getSafePersonName(deceasedPerson, 'Pessoa falecida')}", em ${deathDate.formatted}.`);
    }

    return lines;
  }

  lines.push(`"${name1}" e "${name2}" tiveram um relacionamento conjugal.`);

  const unionLine = appendDateAndPlace('A união aconteceu', marriageDateText, marriagePlace);
  if (unionLine) lines.push(unionLine);

  return lines;
}

export function ViewMarriageModal({
  open,
  marriage,
  isAdmin = false,
  onClose,
}: ViewMarriageModalProps) {
  const [arquivos, setArquivos] = useState<ArquivoHistorico[]>([]);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [savingArquivos, setSavingArquivos] = useState(false);
  const [archivesDirty, setArchivesDirty] = useState(false);
  const relacionamentoId = marriage?.relationship?.id ?? marriage?.id ?? null;

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    let mounted = true;

    async function loadArquivos() {
      setArchivesDirty(false);

      if (!open || !relacionamentoId) {
        setArquivos([]);
        return;
      }

      setLoadingArquivos(true);
      try {
        const nextArquivos = await listarArquivosHistoricosDoRelacionamento(relacionamentoId);
        if (mounted) setArquivos(nextArquivos);
      } catch (error) {
        if (mounted) {
          toast.error(error instanceof Error ? error.message : 'Não foi possível carregar arquivos históricos.');
        }
      } finally {
        if (mounted) setLoadingArquivos(false);
      }
    }

    loadArquivos();

    return () => {
      mounted = false;
    };
  }, [open, relacionamentoId]);

  const status = useMemo(
    () => getGenealogyMarriageStatus(marriage?.relationship, marriage?.person1, marriage?.person2),
    [marriage]
  );

  if (!open || !marriage) return null;

  const relationship = (marriage.relationship || {}) as Record<string, unknown>;
  const observacoes = getRelationshipField(relationship, [
    'observacoes',
    'observacao',
    'descricao',
    'notas',
  ]);
  const person1Name = getSafePersonName(marriage.person1, marriage.person1Id || 'Pessoa 1');
  const person2Name = getSafePersonName(marriage.person2, marriage.person2Id || 'Pessoa 2');
  const narrativeLines = buildMarriageNarrative({
    status,
    relationship: marriage.relationship,
    person1: marriage.person1,
    person2: marriage.person2,
    person1Fallback: marriage.person1Id || 'Pessoa 1',
    person2Fallback: marriage.person2Id || 'Pessoa 2',
  });

  const handleArquivosChange = (nextArquivos: ArquivoHistorico[]) => {
    setArquivos(nextArquivos);
    setArchivesDirty(true);
  };

  const handleSaveArquivos = async () => {
    if (!relacionamentoId) {
      toast.error('Relacionamento conjugal não localizado para salvar arquivos.');
      return;
    }

    setSavingArquivos(true);
    try {
      const savedArquivos = await salvarArquivosHistoricosDoRelacionamento(relacionamentoId, arquivos);
      setArquivos(savedArquivos);
      setArchivesDirty(false);
      toast.success('Arquivos históricos do relacionamento salvos.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar arquivos históricos.');
    } finally {
      setSavingArquivos(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-marriage-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Heart className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 id="view-marriage-modal-title" className="text-base font-semibold text-gray-900">
                Relacionamento conjugal
              </h2>
              <p className="mt-1 text-sm text-gray-500 break-words">
                {person1Name}
                {' e '}
                {person2Name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-5">
            <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
              <MarriagePersonAvatar person={marriage.person1} name={person1Name} />

              <div className="flex shrink-0 flex-col items-center justify-center sm:flex-1 sm:flex-row">
                <div className="h-8 w-px rounded-full bg-emerald-200 sm:h-px sm:w-full sm:max-w-28" />
                <div className="my-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm sm:mx-2 sm:my-0">
                  <Heart className="h-4 w-4" />
                </div>
                <div className="h-8 w-px rounded-full bg-emerald-200 sm:h-px sm:w-full sm:max-w-28" />
              </div>

              <MarriagePersonAvatar person={marriage.person2} name={person2Name} />
            </div>

            <div className="mt-5 min-w-0 rounded-xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm">
              <p className="text-center text-base font-semibold text-slate-900 sm:text-lg">
                <span className="break-words">{person1Name}</span>
                <span className="px-2 text-emerald-600">+</span>
                <span className="break-words">{person2Name}</span>
              </p>

              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {narrativeLines.map((line) => (
                  <p key={line} className="break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {isAdmin && hasInfoValue(observacoes) && (
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">
                Observações
              </p>
              <div className="min-h-[84px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 break-words">
                {observacoes}
              </div>
            </div>
          )}

          <section className="space-y-3">
            {loadingArquivos ? (
              <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                Carregando arquivos históricos...
              </p>
            ) : (
              <ArquivosHistoricos
                arquivos={arquivos}
                onChange={handleArquivosChange}
                relacionamentoId={relacionamentoId}
                readOnly={!isAdmin || !relacionamentoId}
              />
            )}

            {isAdmin && relacionamentoId && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveArquivos}
                  disabled={!archivesDirty || savingArquivos}
                >
                  {savingArquivos ? 'Salvando...' : 'Salvar arquivos'}
                </Button>
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarriagePersonAvatar({
  person,
  name,
}: {
  person?: Pessoa;
  name: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-xl font-bold text-slate-700 shadow-md">
        {person?.foto_principal_url ? (
          <img
            src={person.foto_principal_url}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      <p className="mt-3 min-w-0 max-w-full text-sm font-semibold text-slate-900 break-words">
        {name}
      </p>
    </div>
  );
}
