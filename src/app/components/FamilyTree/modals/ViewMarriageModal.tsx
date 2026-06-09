import React, { useEffect, useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { ArquivosHistoricos } from '../../ArquivosHistoricos';
import { ArquivoHistorico, HistoricalFileEventCategory, Pessoa, Relacionamento } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import {
  listarArquivosHistoricosDoRelacionamento,
  salvarArquivosHistoricosDoRelacionamento,
} from '../../../services/arquivosHistoricosService';
import { getLinkedPersonWithPessoa } from '../../../services/memberProfileService';
import { createPersonProfileSuggestion } from '../../../services/personProfileSuggestionService';
import { canEditLinkedPersonRecord, isAdminUser } from '../../../services/permissionService';
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

const MARRIAGE_HISTORICAL_FILE_CATEGORY_OPTIONS: Array<{ value: HistoricalFileEventCategory; label: string }> = [
  { value: 'certidao_casamento', label: 'Certidão de Casamento' },
  { value: 'divorcio', label: 'Divórcio' },
  { value: 'outro', label: 'Outro' },
];

const EMPTY_SUGGESTION_FORM = {
  informacoes: '',
  data: '',
  local: '',
  outros: '',
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

function getSafePersonName(person: Pessoa | undefined, fallback: string) {
  return person?.nome_completo?.trim() || fallback;
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function isPersonDeceased(person?: Pessoa) {
  return Boolean(person?.falecido || person?.data_falecimento || person?.local_falecimento);
}

function isRelationshipInactive(relationship?: Relacionamento) {
  const relationshipRecord = (relationship || {}) as Record<string, unknown>;
  const separationDate = getRelationshipField(relationshipRecord, [
    'data_separacao',
    'data_fim',
  ]);
  const activeValue = relationshipRecord.ativo;
  const subtype = String(relationshipRecord.subtipo_relacionamento ?? '').trim().toLowerCase();

  return Boolean(
    separationDate ||
    activeValue === false ||
    subtype === 'separado'
  );
}

function buildRelationshipHeadline(
  person1Name?: string,
  person2Name?: string,
  relationship?: Relacionamento,
  person1?: Pessoa,
  person2?: Pessoa
) {
  const name1 = person1Name?.trim() ? getFirstName(person1Name) : undefined;
  const name2 = person2Name?.trim() ? getFirstName(person2Name) : undefined;
  const shouldUsePresent = Boolean(
    !isRelationshipInactive(relationship) &&
    !isPersonDeceased(person1) &&
    !isPersonDeceased(person2)
  );

  if (name1 && name2) return `${name1} e ${name2} ${shouldUsePresent ? 'são' : 'foram'} casados.`;
  if (name1) return `${name1} ${shouldUsePresent ? 'tem' : 'teve'} um casamento registrado.`;
  if (name2) return `${name2} ${shouldUsePresent ? 'tem' : 'teve'} um casamento registrado.`;

  return 'Casamento registrado na árvore familiar.';
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

function normalizeLocationPart(value?: string) {
  const text = String(value ?? '').trim();
  const normalized = text.toLowerCase();

  if (!text || normalized === 'null' || normalized === 'undefined') return undefined;

  return text;
}

function formatMarriagePlace(place?: string) {
  const text = normalizeLocationPart(place);
  if (!text) return undefined;

  if (!text.includes('/')) return text;

  const [city, uf] = text.split('/').map(normalizeLocationPart);
  if (city && uf) return `${city}/${uf}`;

  return city || uf;
}

function buildMarriageNarrative(relationship?: Relacionamento) {
  const relationshipRecord = (relationship || {}) as Record<string, unknown>;
  const marriageDate = parseDateValue(getRelationshipField(relationshipRecord, [
    'data_casamento',
    'data_relacionamento',
    'data_inicio',
  ]));
  const separationDate = parseDateValue(getRelationshipField(relationshipRecord, [
    'data_separacao',
    'data_fim',
  ]));
  const marriagePlace = formatMarriagePlace(getRelationshipField(relationshipRecord, [
    'local_casamento',
    'local_relacionamento',
    'local_inicio',
  ]));
  const lines: string[] = [];

  if (marriageDate && separationDate) {
    lines.push(`O matrimônio aconteceu entre ${marriageDate.formatted} e ${separationDate.formatted}.`);
  } else if (marriageDate) {
    lines.push(`O matrimônio aconteceu em ${marriageDate.formatted}.`);
  } else if (separationDate) {
    lines.push(`O matrimônio terminou em ${separationDate.formatted}.`);
  }

  if (marriagePlace) {
    lines.push(`A cerimônia foi realizada em ${marriagePlace}.`);
  }

  return lines;
}

export function ViewMarriageModal({
  open,
  marriage,
  isAdmin = false,
  onClose,
}: ViewMarriageModalProps) {
  const { user } = useAuth();
  const [arquivos, setArquivos] = useState<ArquivoHistorico[]>([]);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [savingArquivos, setSavingArquivos] = useState(false);
  const [archivesDirty, setArchivesDirty] = useState(false);
  const [resolvedIsAdmin, setResolvedIsAdmin] = useState(isAdmin);
  const [canEditLinkedPeople, setCanEditLinkedPeople] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState(EMPTY_SUGGESTION_FORM);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const relacionamentoId = marriage?.relationship?.id ?? marriage?.id ?? null;
  const canInsertRelationshipInfo = resolvedIsAdmin || canEditLinkedPeople;
  const canManageHistoricalFiles = true;

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (suggestionOpen) {
          setSuggestionOpen(false);
          return;
        }

        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, suggestionOpen]);

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

  useEffect(() => {
    let mounted = true;

    async function loadPermissionContext() {
      setResolvedIsAdmin(isAdmin);
      setCanEditLinkedPeople(false);

      if (!open || !user) return;

      const personIds = Array.from(new Set([
        marriage?.person1?.id ?? marriage?.person1Id,
        marriage?.person2?.id ?? marriage?.person2Id,
      ].filter(Boolean) as string[]));

      try {
        const [adminResult, ...linkResults] = await Promise.all([
          isAdminUser(user),
          ...personIds.map((personId) => getLinkedPersonWithPessoa(user.id, personId)),
        ]);

        if (!mounted) return;

        setResolvedIsAdmin(Boolean(isAdmin || adminResult.isAdmin));
        setCanEditLinkedPeople(linkResults.some((result) => canEditLinkedPersonRecord(result.data)));
      } catch {
        if (mounted) {
          setResolvedIsAdmin(isAdmin);
          setCanEditLinkedPeople(false);
        }
      }
    }

    loadPermissionContext();

    return () => {
      mounted = false;
    };
  }, [isAdmin, marriage, open, user]);

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
  const relationshipHeadline = buildRelationshipHeadline(
    marriage.person1?.nome_completo,
    marriage.person2?.nome_completo,
    marriage.relationship,
    marriage.person1,
    marriage.person2
  );
  const narrativeLines = buildMarriageNarrative(marriage.relationship);
  const targetPessoaId = marriage.person1?.id ?? marriage.person1Id ?? marriage.person2?.id ?? marriage.person2Id;
  const hasSuggestionContent = Object.values(suggestionForm).some((value) => value.trim());

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

  const handleInsertInformation = () => {
    if (!user) {
      toast.error('Entre na sua conta para sugerir informações sobre este relacionamento.');
      return;
    }

    setSuggestionForm(EMPTY_SUGGESTION_FORM);
    setSuggestionOpen(true);
  };

  const handleSubmitSuggestion = async () => {
    if (!targetPessoaId || suggestionLoading || !hasSuggestionContent) return;

    setSuggestionLoading(true);
    try {
      const context = [
        `Relacionamento conjugal: ${person1Name} e ${person2Name}.`,
        relacionamentoId ? `ID do relacionamento: ${relacionamentoId}.` : undefined,
        canInsertRelationshipInfo
          ? 'Solicitação enviada por pessoa autorizada para este contexto, sem fluxo direto disponível no modal.'
          : 'Sugestão enviada por usuário sem permissão direta.',
      ].filter(Boolean).join(' ');
      const suggestionLines = [
        `Informações: ${suggestionForm.informacoes.trim() || 'Não informado'}`,
        `Data: ${suggestionForm.data.trim() || 'Não informado'}`,
        `Local: ${suggestionForm.local.trim() || 'Não informado'}`,
        `Outros: ${suggestionForm.outros.trim() || 'Não informado'}`,
      ].join('\n');

      await createPersonProfileSuggestion({
        targetPessoaId,
        suggestionText: `${context}\n\n${suggestionLines}`,
      });
      setSuggestionForm(EMPTY_SUGGESTION_FORM);
      setSuggestionOpen(false);
      toast.success('Sugestão enviada para revisão administrativa.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar a sugestão.');
    } finally {
      setSuggestionLoading(false);
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
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Heart className="h-5 w-5" />
          </div>

          <h2 id="view-marriage-modal-title" className="min-w-0 flex-1 text-left text-lg font-semibold text-gray-900">
            Relacionamento conjugal
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            aria-label="Fechar modal"
            title="Fechar modal"
          >
            <X className="h-5 w-5" />
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
                <span className="break-words">{relationshipHeadline}</span>
              </p>

              {narrativeLines.length > 0 && (
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  {narrativeLines.map((line) => (
                    <p key={line} className="break-words">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold text-gray-900">
                  Informações do relacionamento
                </h3>
                <p className="mt-1 break-words text-sm text-gray-500">
                  Sugira datas, locais, histórias ou correções sobre este matrimônio.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleInsertInformation}
                className="w-full sm:w-auto"
                aria-label="Inserir Informações"
              >
                <Plus className="h-4 w-4" />
                Inserir Informações
              </Button>
            </div>
          </section>

          {resolvedIsAdmin && hasInfoValue(observacoes) && (
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">
                Observações
              </p>
              <div className="min-h-[84px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 break-words">
                {observacoes}
              </div>
            </div>
          )}

          <section className="space-y-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:tracking-normal">
            {loadingArquivos ? (
              <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                Carregando arquivos históricos...
              </p>
            ) : (
              <ArquivosHistoricos
                arquivos={arquivos}
                onChange={handleArquivosChange}
                relacionamentoId={relacionamentoId}
                readOnly={false}
                addButtonVariant="icon"
                eventCategoryOptions={MARRIAGE_HISTORICAL_FILE_CATEGORY_OPTIONS}
              />
            )}

            {canManageHistoricalFiles && (
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

      <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Inserir Informações</DialogTitle>
            <DialogDescription>
              Envie uma sugestão para revisão no painel administrativo. Ela não altera o relacionamento automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="relationship-info">
                Informações
              </label>
              <Textarea
                id="relationship-info"
                value={suggestionForm.informacoes}
                onChange={(event) => setSuggestionForm((current) => ({ ...current, informacoes: event.target.value }))}
                rows={4}
                placeholder="Descreva a informação, correção ou história sobre este relacionamento."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="relationship-date">
                  Data
                </label>
                <Input
                  id="relationship-date"
                  value={suggestionForm.data}
                  onChange={(event) => setSuggestionForm((current) => ({ ...current, data: event.target.value }))}
                  placeholder="Ex: 24/09/2009"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="relationship-place">
                  Local
                </label>
                <Input
                  id="relationship-place"
                  value={suggestionForm.local}
                  onChange={(event) => setSuggestionForm((current) => ({ ...current, local: event.target.value }))}
                  placeholder="Ex: Natal/RN"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="relationship-other">
                Outros
              </label>
              <Textarea
                id="relationship-other"
                value={suggestionForm.outros}
                onChange={(event) => setSuggestionForm((current) => ({ ...current, outros: event.target.value }))}
                rows={3}
                placeholder="Observações adicionais."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuggestionOpen(false)}
              disabled={suggestionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmitSuggestion}
              disabled={suggestionLoading || !hasSuggestionContent || !targetPessoaId}
            >
              {suggestionLoading ? 'Enviando...' : 'Enviar sugestão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
