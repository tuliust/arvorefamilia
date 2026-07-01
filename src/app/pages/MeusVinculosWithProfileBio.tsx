import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Sparkles, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import {
  getCurrentUserLinkedPeople,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
} from '../services/memberProfileService';
import {
  buildProfileQuestionnaireGenerationPayload,
  buildProfileQuestionnaireHash,
  getProfileQuestionnaireAnswers,
  normalizeProfileQuestionnairePayload,
  upsertProfileQuestionnaireAnswers,
} from '../services/profileQuestionnaireService';
import { obterRelacionamentosDaPessoa } from '../services/dataService';
import { listarArquivosHistoricosPorPessoa } from '../services/arquivosHistoricosService';
import { AI_BADGE_GROUPS, type AiGeneratedQuestion, type AiTone } from '../constants/profileQuestionnaireConfig';
import type { Pessoa } from '../types';
import type { PersonProfileQuestionnaireAnswers } from '../types/profileQuestionnaire';
import { MeusDados } from './MeusDados';

const PROFILE_RESULT_HOST_ID = 'meus-dados-profile-bio-result-host';
const PROFILE_ACTIONS_HOST_ID = 'meus-dados-profile-bio-actions-host';
const PROFILE_ORIGINAL_CONTENT_ATTRIBUTE = 'data-meus-dados-questionnaire-original';
const MAX_PROFILE_TEXT_LENGTH = 500;

type ProfileTextState = {
  minibio: string;
  curiosidades: string;
};

type GeneratedProfileTextResponse = Partial<ProfileTextState> & {
  error?: string;
};

type StepInfo = {
  current: number;
  total: number;
};

type MeusDadosDraft = {
  aiTone?: AiTone;
  aiSelectedBadges?: string[];
  aiCustomTraits?: string;
  aiGeneratedQuestions?: AiGeneratedQuestion[];
  form?: {
    falecido?: boolean;
  };
};

function limitProfileText(value: unknown) {
  return String(value ?? '').trim().slice(0, MAX_PROFILE_TEXT_LENGTH);
}

function getDraftKey(userId: string, pessoaId: string) {
  return `meus-dados-draft:${userId}:${pessoaId}`;
}

function readQuestionnaireDraft(userId: string, pessoaId: string): MeusDadosDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(getDraftKey(userId, pessoaId));
    if (!raw) return null;
    return JSON.parse(raw) as MeusDadosDraft;
  } catch {
    return null;
  }
}

function getAllAiBadges() {
  return AI_BADGE_GROUPS.flatMap((group) => group.badges);
}

function buildDraftQuestionnaire(draft: MeusDadosDraft | null) {
  if (!draft) return null;

  const selectedBadgeIds = Array.isArray(draft.aiSelectedBadges) ? draft.aiSelectedBadges : [];
  const selectedBadges = getAllAiBadges().filter((badge) => selectedBadgeIds.includes(badge.id));
  const generatedQuestions = Array.isArray(draft.aiGeneratedQuestions) ? draft.aiGeneratedQuestions : [];
  const answers = generatedQuestions.reduce<Record<string, string>>((nextAnswers, question) => {
    const answer = question.answer.trim();
    if (answer) nextAnswers[question.id] = answer;
    return nextAnswers;
  }, {});

  return normalizeProfileQuestionnairePayload({
    tone: draft.aiTone,
    selectedBadges,
    customTraits: draft.aiCustomTraits,
    generatedQuestions,
    answers,
    memorialMode: draft.form?.falecido === true,
  });
}

function hasQuestionnaireSource(questionnaire: Pick<PersonProfileQuestionnaireAnswers, 'selectedBadges' | 'customTraits' | 'generatedQuestions'> | null) {
  if (!questionnaire) return false;
  return (
    questionnaire.selectedBadges.length > 0 ||
    questionnaire.customTraits.trim().length > 0 ||
    questionnaire.generatedQuestions.some((question) => question.answer.trim().length > 0)
  );
}

function getYearFromValue(value?: string | number | null) {
  const match = String(value ?? '').match(/\b(18|19|20|21)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function getApproximateAgeLabel(pessoa: Pessoa) {
  const birthYear = getYearFromValue(pessoa.data_nascimento);
  if (!birthYear) return null;

  const endYear = pessoa.falecido === true
    ? getYearFromValue(pessoa.data_falecimento) ?? undefined
    : new Date().getFullYear();

  if (!endYear || endYear < birthYear) return null;
  return `${endYear - birthYear} anos${pessoa.falecido === true ? ' aproximadamente ao falecer' : ''}`;
}

function getRelationshipNames(people?: Pessoa[]) {
  return Array.isArray(people)
    ? people.map((person) => person.nome_completo).filter(Boolean).slice(0, 12)
    : [];
}

async function buildSafeProfileContext(pessoa: Pessoa | null) {
  if (!pessoa) return {};

  const falecido = pessoa.falecido === true;
  let relacionamentos = {
    pais: [] as string[],
    maes: [] as string[],
    conjuges: [] as string[],
    filhos: [] as string[],
    pets: [] as string[],
    irmaos: [] as string[],
  };
  let fatosHistoricos: Array<{ titulo: string; descricao?: string; ano?: string; categoria?: string | null }> = [];

  try {
    const groups = await obterRelacionamentosDaPessoa(pessoa.id) as {
      pais?: Pessoa[];
      maes?: Pessoa[];
      conjuges?: Pessoa[];
      filhos?: Pessoa[];
      pets?: Pessoa[];
      irmaos?: Pessoa[];
    };

    relacionamentos = {
      pais: getRelationshipNames(groups.pais),
      maes: getRelationshipNames(groups.maes),
      conjuges: getRelationshipNames(groups.conjuges),
      filhos: getRelationshipNames(groups.filhos),
      pets: getRelationshipNames(groups.pets),
      irmaos: getRelationshipNames(groups.irmaos),
    };
  } catch {
    relacionamentos = {
      pais: [],
      maes: [],
      conjuges: [],
      filhos: [],
      pets: [],
      irmaos: [],
    };
  }

  try {
    const arquivos = await listarArquivosHistoricosPorPessoa(pessoa.id);
    fatosHistoricos = arquivos
      .map((arquivo) => ({
        titulo: arquivo.titulo,
        descricao: arquivo.descricao,
        ano: arquivo.ano,
        categoria: arquivo.categoria_evento ?? null,
      }))
      .filter((arquivo) => arquivo.titulo || arquivo.descricao)
      .slice(0, 8);
  } catch {
    fatosHistoricos = [];
  }

  return {
    nome_completo: pessoa.nome_completo ?? null,
    data_nascimento: pessoa.data_nascimento ?? null,
    idade_aproximada: getApproximateAgeLabel(pessoa),
    local_nascimento: pessoa.local_nascimento ?? null,
    data_falecimento: pessoa.data_falecimento ?? null,
    local_falecimento: pessoa.local_falecimento ?? null,
    local_atual: falecido ? null : pessoa.local_atual ?? null,
    profissao: pessoa.profissao ?? null,
    falecido,
    relacionamentos,
    fatos_historicos: fatosHistoricos,
  };
}

function findSobreMimSection() {
  if (typeof document === 'undefined') return null;

  return Array.from(document.querySelectorAll<HTMLElement>('section')).find((section) => {
    const text = section.textContent ?? '';
    return text.includes('Sobre Mim') && text.includes('Etapa') && text.includes('Voltar');
  }) ?? null;
}

function parseStepInfo(section: HTMLElement | null): StepInfo | null {
  const match = (section?.textContent ?? '').match(/Etapa\s+(\d+)\s+de\s+(\d+)/i);
  if (!match) return null;

  return {
    current: Number(match[1]),
    total: Number(match[2]),
  };
}

function ensureInlineHosts() {
  const section = findSobreMimSection();
  if (!section) return { resultHost: null, actionsHost: null, stepInfo: null, questionnaireCard: null };

  const stepInfo = parseStepInfo(section);
  const questionnaireCard = section.querySelector<HTMLElement>('.space-y-5.rounded-xl.border') ?? section;
  const actionBar = Array.from(questionnaireCard.querySelectorAll<HTMLElement>('div'))
    .reverse()
    .find((node) => node.textContent?.includes('Voltar')) ?? null;

  let resultHost = document.getElementById(PROFILE_RESULT_HOST_ID);
  if (!resultHost) {
    resultHost = document.createElement('div');
    resultHost.id = PROFILE_RESULT_HOST_ID;
    resultHost.className = 'hidden';
  }

  if (resultHost.parentElement !== questionnaireCard) {
    questionnaireCard.insertBefore(resultHost, questionnaireCard.firstChild);
  }

  let actionsHost = document.getElementById(PROFILE_ACTIONS_HOST_ID);
  if (!actionsHost) {
    actionsHost = document.createElement('div');
    actionsHost.id = PROFILE_ACTIONS_HOST_ID;
  }

  if (actionBar && actionsHost.parentElement !== actionBar) {
    const nextButton = Array.from(actionBar.querySelectorAll('button')).find((button) => button.textContent?.includes('Avançar'));
    actionBar.insertBefore(actionsHost, nextButton ?? null);
  }

  Array.from(questionnaireCard.children).forEach((child) => {
    if (child.id === PROFILE_RESULT_HOST_ID) return;
    if (child instanceof HTMLElement && !child.hasAttribute(PROFILE_ORIGINAL_CONTENT_ATTRIBUTE)) {
      child.setAttribute(PROFILE_ORIGINAL_CONTENT_ATTRIBUTE, 'true');
    }
  });

  return { resultHost, actionsHost, stepInfo, questionnaireCard };
}

function getSelectedPessoaIdFromPage() {
  const selector = document.getElementById('linked-profile-selector') as HTMLSelectElement | null;
  return selector?.value || '';
}

function useMeusDadosInlineHosts() {
  const [resultHost, setResultHost] = useState<HTMLElement | null>(null);
  const [actionsHost, setActionsHost] = useState<HTMLElement | null>(null);
  const [questionnaireCard, setQuestionnaireCard] = useState<HTMLElement | null>(null);
  const [stepInfo, setStepInfo] = useState<StepInfo | null>(null);

  useEffect(() => {
    const syncHosts = () => {
      const next = ensureInlineHosts();
      setResultHost(next.resultHost as HTMLElement | null);
      setActionsHost(next.actionsHost as HTMLElement | null);
      setQuestionnaireCard(next.questionnaireCard as HTMLElement | null);
      setStepInfo(next.stepInfo);
    };

    syncHosts();
    const observer = new MutationObserver(syncHosts);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', syncHosts);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncHosts);
      document.querySelectorAll<HTMLElement>(`[${PROFILE_ORIGINAL_CONTENT_ATTRIBUTE}]`).forEach((node) => {
        node.style.display = '';
        node.removeAttribute(PROFILE_ORIGINAL_CONTENT_ATTRIBUTE);
      });
      document.getElementById(PROFILE_RESULT_HOST_ID)?.remove();
      document.getElementById(PROFILE_ACTIONS_HOST_ID)?.remove();
    };
  }, []);

  return { resultHost, actionsHost, questionnaireCard, stepInfo };
}

function useHideConfirmUntilProfileResults(showResults: boolean) {
  useEffect(() => {
    const updateVisibility = () => {
      const submitButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[type="submit"]'));
      const confirmButton = submitButtons.find((button) => button.textContent?.includes('Confirmar meus dados'));
      const wrapper = confirmButton?.parentElement;
      if (!wrapper) return;

      wrapper.dataset.meusDadosConfirmVisibility = showResults ? 'visible' : 'hidden';
      wrapper.style.display = showResults ? '' : 'none';
    };

    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      const wrapper = document.querySelector<HTMLElement>('[data-meus-dados-confirm-visibility]');
      if (wrapper) {
        wrapper.style.display = '';
        delete wrapper.dataset.meusDadosConfirmVisibility;
      }
    };
  }, [showResults]);
}

function MeusDadosProfileBioResults() {
  const { user } = useAuth();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<PersonProfileQuestionnaireAnswers | null>(null);
  const [profileText, setProfileText] = useState<ProfileTextState>({ minibio: '', curiosidades: '' });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const autoGeneratedKeyRef = useRef<string | null>(null);

  const saveProfileTextValues = useCallback(async (
    values: ProfileTextState = profileText,
    { quiet = false }: { quiet?: boolean } = {},
  ) => {
    if (!pessoa?.id || !canEdit) return false;

    const nextValues = {
      minibio: limitProfileText(values.minibio),
      curiosidades: limitProfileText(values.curiosidades),
    };

    setSaving(true);
    setError(null);

    const { error: updateError, data } = await updateOwnLinkedPerson(pessoa.id, nextValues);
    setSaving(false);

    if (updateError) {
      if (!quiet) {
        setError(updateError);
        toast.error(updateError);
      }
      return false;
    }

    if (data && !quiet) {
      setPessoa(data);
      setProfileText({
        minibio: limitProfileText(data.minibio),
        curiosidades: limitProfileText(data.curiosidades),
      });
    }

    if (!quiet) toast.success('Mini Bio e Curiosidades salvas.');
    return true;
  }, [canEdit, pessoa?.id, profileText]);

  const generateProfileText = useCallback(async (sourceQuestionnaire: PersonProfileQuestionnaireAnswers, { manual = false } = {}) => {
    if (!pessoa?.id) return;
    if (!hasQuestionnaireSource(sourceQuestionnaire)) {
      const message = 'Responda ao menos uma opção do questionário para gerar os textos.';
      setGenerationError(message);
      if (manual) toast.error(message);
      return;
    }

    setGenerating(true);
    setGenerationError(null);

    try {
      const generationPayload = buildProfileQuestionnaireGenerationPayload(sourceQuestionnaire);
      const safeContext = await buildSafeProfileContext(pessoa);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'profile_text',
          ...generationPayload,
          context: safeContext,
        }),
      });
      const payload = await response.json().catch(() => ({})) as GeneratedProfileTextResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Não foi possível gerar os textos agora.');
      }

      const generatedValues = {
        minibio: limitProfileText(payload.minibio),
        curiosidades: limitProfileText(payload.curiosidades),
      };

      setProfileText(generatedValues);
      const textSaved = await saveProfileTextValues(generatedValues, { quiet: !manual });
      if (!textSaved) {
        throw new Error('Os textos foram gerados, mas não foi possível salvá-los no perfil.');
      }

      const currentHash = buildProfileQuestionnaireHash(sourceQuestionnaire);
      const questionnaireUpdate = await upsertProfileQuestionnaireAnswers(pessoa.id, {
        tone: sourceQuestionnaire.tone,
        selectedBadges: sourceQuestionnaire.selectedBadges,
        customTraits: sourceQuestionnaire.customTraits,
        generatedQuestions: sourceQuestionnaire.generatedQuestions,
        answers: sourceQuestionnaire.answers,
        memorialMode: sourceQuestionnaire.memorialMode,
        lastGeneratedHash: currentHash,
      });

      if (!questionnaireUpdate.error && questionnaireUpdate.data) {
        setQuestionnaire(questionnaireUpdate.data);
      }

      if (manual) toast.success('Sugestão atualizada com IA.');
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : 'Não foi possível gerar os textos agora.';
      setGenerationError(message);
      if (manual) toast.error(message);
    } finally {
      setGenerating(false);
    }
  }, [pessoa, saveProfileTextValues]);

  useEffect(() => {
    let mounted = true;

    async function loadProfileText() {
      if (!user) return;

      setLoading(true);
      setError(null);
      setGenerationError(null);
      loadedRef.current = false;
      autoGeneratedKeyRef.current = null;

      await resolveFirstAccessLinkForUser(user);
      const { data: linksData, error: linksError } = await getCurrentUserLinkedPeople();
      if (!mounted) return;

      if (linksError) {
        setError(linksError);
        setLoading(false);
        return;
      }

      const selectedPessoaId = getSelectedPessoaIdFromPage();
      const selectedLink = (
        selectedPessoaId ? linksData.find((item) => item.pessoa_id === selectedPessoaId) : null
      ) || linksData.find((item) => item.principal) || linksData[0] || null;

      if (!selectedLink?.pessoa) {
        setError('Não foi possível carregar o perfil vinculado.');
        setPessoa(null);
        setQuestionnaire(null);
        setLoading(false);
        return;
      }

      const linkedPessoa = selectedLink.pessoa;
      setPessoa(linkedPessoa);
      setCanEdit(selectedLink.can_edit !== false);
      setProfileText({
        minibio: limitProfileText(linkedPessoa.minibio),
        curiosidades: limitProfileText(linkedPessoa.curiosidades),
      });

      const draftQuestionnaire = buildDraftQuestionnaire(readQuestionnaireDraft(user.id, linkedPessoa.id));
      let loadedQuestionnaire: PersonProfileQuestionnaireAnswers | null = null;

      if (draftQuestionnaire && hasQuestionnaireSource(draftQuestionnaire)) {
        const savedDraft = await upsertProfileQuestionnaireAnswers(linkedPessoa.id, {
          ...draftQuestionnaire,
          lastGeneratedHash: null,
        });

        if (!mounted) return;

        if (savedDraft.error) {
          setGenerationError(`Não foi possível salvar o questionário antes de gerar os textos: ${savedDraft.error}`);
        } else {
          loadedQuestionnaire = savedDraft.data;
        }
      }

      if (!loadedQuestionnaire) {
        const questionnaireResult = await getProfileQuestionnaireAnswers(linkedPessoa.id);
        if (!mounted) return;

        if (questionnaireResult.error) {
          setGenerationError(`Não foi possível carregar o questionário de perfil: ${questionnaireResult.error}`);
        } else {
          loadedQuestionnaire = questionnaireResult.data;
        }
      }

      setQuestionnaire(loadedQuestionnaire);
      loadedRef.current = true;
      setLoading(false);
    }

    void loadProfileText();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!loadedRef.current || !pessoa?.id || !questionnaire || !hasQuestionnaireSource(questionnaire)) return;

    const currentHash = buildProfileQuestionnaireHash(questionnaire);
    const generationKey = `${pessoa.id}:${currentHash}`;
    if (autoGeneratedKeyRef.current === generationKey) return;

    const shouldGenerate =
      !profileText.minibio.trim() ||
      !profileText.curiosidades.trim() ||
      questionnaire.lastGeneratedHash !== currentHash;

    if (!shouldGenerate) return;

    autoGeneratedKeyRef.current = generationKey;
    void generateProfileText(questionnaire);
  }, [generateProfileText, pessoa?.id, profileText.curiosidades, profileText.minibio, questionnaire]);

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
  }, []);

  const updateProfileText = (field: keyof ProfileTextState, value: string) => {
    const nextValues = {
      ...profileText,
      [field]: value.slice(0, MAX_PROFILE_TEXT_LENGTH),
    };

    setProfileText(nextValues);
    setError(null);

    if (!loadedRef.current || !canEdit) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void saveProfileTextValues(nextValues, { quiet: true });
    }, 800);
  };

  const hasOutdatedSuggestion = useMemo(() => {
    if (!questionnaire) return false;
    const currentHash = buildProfileQuestionnaireHash(questionnaire);
    return Boolean(
      currentHash &&
      questionnaire.lastGeneratedHash !== currentHash &&
      (profileText.minibio.trim() || profileText.curiosidades.trim())
    );
  }, [profileText.curiosidades, profileText.minibio, questionnaire]);

  const canGenerate = Boolean(questionnaire && hasQuestionnaireSource(questionnaire) && canEdit);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
          <span>Etapa 9 de 9</span>
          <span className="break-words text-right">Seu Perfil</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-100">
            <UserCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold text-gray-950">Seu Perfil</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
              Revise os textos gerados pela IA. Você pode editar livremente antes de confirmar seus dados.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-blue-900">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando questionário e preparando a geração...
          </div>
        )}

        {generating && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900">
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando Mini Bio e Curiosidades com IA...
          </div>
        )}

        {!loading && !questionnaire && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Não encontramos respostas salvas do questionário. Os campos podem ser preenchidos manualmente.
          </p>
        )}

        {(error || generationError) && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error || generationError}
          </p>
        )}

        {hasOutdatedSuggestion && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            O questionário foi alterado desde a última geração. Use “Atualizar com IA” apenas se quiser substituir a sugestão atual.
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="meus-dados-minibio">Mini Bio</Label>
              <span className="text-xs text-gray-500">{profileText.minibio.length}/{MAX_PROFILE_TEXT_LENGTH}</span>
            </div>
            <Textarea
              id="meus-dados-minibio"
              value={profileText.minibio}
              onChange={(event) => updateProfileText('minibio', event.target.value)}
              placeholder="Escreva uma apresentação curta sobre você."
              disabled={!canEdit || loading}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="meus-dados-curiosidades">Curiosidades</Label>
              <span className="text-xs text-gray-500">{profileText.curiosidades.length}/{MAX_PROFILE_TEXT_LENGTH}</span>
            </div>
            <Textarea
              id="meus-dados-curiosidades"
              value={profileText.curiosidades}
              onChange={(event) => updateProfileText('curiosidades', event.target.value)}
              placeholder="Liste gostos, hábitos, memórias ou detalhes leves sobre você."
              disabled={!canEdit || loading}
              rows={5}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {saving ? 'Salvando textos...' : 'Os textos são salvos automaticamente ao editar.'}
          </p>
          {canGenerate && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => questionnaire && generateProfileText(questionnaire, { manual: true })}
              disabled={generating || loading || saving}
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Gerando...' : hasOutdatedSuggestion ? 'Atualizar com IA' : 'Regenerar com IA'}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function MeusDadosInlineProfileBioController() {
  const { resultHost, actionsHost, questionnaireCard, stepInfo } = useMeusDadosInlineHosts();
  const [showResults, setShowResults] = useState(false);
  useHideConfirmUntilProfileResults(showResults);

  useEffect(() => {
    if (!resultHost) return;
    resultHost.classList.toggle('hidden', !showResults);
  }, [resultHost, showResults]);

  useEffect(() => {
    if (!questionnaireCard) return;

    questionnaireCard.querySelectorAll<HTMLElement>(`[${PROFILE_ORIGINAL_CONTENT_ATTRIBUTE}]`).forEach((node) => {
      node.style.display = showResults ? 'none' : '';
    });
  }, [questionnaireCard, showResults, stepInfo]);

  const revealResults = useCallback(() => {
    setShowResults(true);
    window.setTimeout(() => {
      document.getElementById(PROFILE_RESULT_HOST_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  useEffect(() => {
    const handleQuestionnaireFinished = () => revealResults();
    window.addEventListener('meus-dados:questionnaire-finished', handleQuestionnaireFinished);

    return () => {
      window.removeEventListener('meus-dados:questionnaire-finished', handleQuestionnaireFinished);
    };
  }, [revealResults]);

  return (
    <>
      {actionsHost && !showResults ? createPortal(
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={revealResults}
            className="w-full sm:w-auto"
          >
            Pular Tudo
          </Button>
        </div>,
        actionsHost,
      ) : null}

      {resultHost && showResults ? createPortal(
        <MeusDadosProfileBioResults />,
        resultHost,
      ) : null}
    </>
  );
}

export function MeusDadosWithInlineProfileBio() {
  return (
    <>
      <MeusDados />
      <MeusDadosInlineProfileBioController />
    </>
  );
}
