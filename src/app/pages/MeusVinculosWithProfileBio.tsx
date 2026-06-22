import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
} from '../services/memberProfileService';
import {
  buildProfileQuestionnaireGenerationPayload,
  buildProfileQuestionnaireHash,
  getProfileQuestionnaireAnswers,
  upsertProfileQuestionnaireAnswers,
} from '../services/profileQuestionnaireService';
import type { Pessoa } from '../types';
import type { PersonProfileQuestionnaireAnswers } from '../types/profileQuestionnaire';
import { MeusVinculos } from './MeusVinculos';

type ProfileTextState = {
  minibio: string;
  curiosidades: string;
};

type GeneratedProfileTextResponse = Partial<ProfileTextState> & {
  error?: string;
};

const PROFILE_BIO_PORTAL_ID = 'meus-vinculos-profile-bio-host';
const MAX_PROFILE_TEXT_LENGTH = 300;

function limitProfileText(value: unknown) {
  return String(value ?? '').trim().slice(0, MAX_PROFILE_TEXT_LENGTH);
}

function hasQuestionnaireSource(questionnaire: PersonProfileQuestionnaireAnswers | null) {
  if (!questionnaire) return false;
  return (
    questionnaire.selectedBadges.length > 0 ||
    questionnaire.customTraits.trim().length > 0 ||
    questionnaire.generatedQuestions.some((question) => question.answer.trim().length > 0)
  );
}

function buildSafeProfileContext(pessoa: Pessoa | null) {
  if (!pessoa) return {};

  return {
    nome_completo: pessoa.nome_completo ?? null,
    data_nascimento: pessoa.data_nascimento ?? null,
    local_nascimento: pessoa.local_nascimento ?? null,
    local_atual: pessoa.local_atual ?? null,
    profissao: pessoa.profissao ?? null,
    falecido: pessoa.falecido === true,
  };
}

function ensurePortalHost() {
  if (typeof document === 'undefined') return null;

  const existingHost = document.getElementById(PROFILE_BIO_PORTAL_ID);
  if (existingHost) return existingHost;

  const targetSection = document.querySelector('main > section');
  if (!targetSection) return null;

  const host = document.createElement('div');
  host.id = PROFILE_BIO_PORTAL_ID;
  host.className = 'mb-6';
  targetSection.insertBefore(host, targetSection.firstChild);
  return host;
}

function useProfileBioPortalHost() {
  const [host, setHost] = useState<HTMLElement | null>(() => ensurePortalHost());

  useEffect(() => {
    if (host) return undefined;

    let animationFrame = window.requestAnimationFrame(() => {
      const nextHost = ensurePortalHost();
      if (nextHost) setHost(nextHost);
    });

    const observer = new MutationObserver(() => {
      const nextHost = ensurePortalHost();
      if (nextHost) {
        setHost(nextHost);
        observer.disconnect();
        window.cancelAnimationFrame(animationFrame);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [host]);

  useEffect(() => () => {
    const currentHost = document.getElementById(PROFILE_BIO_PORTAL_ID);
    currentHost?.remove();
  }, []);

  return host;
}

function MeusVinculosProfileBioSection() {
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
  const dirtyRef = useRef(false);
  const generationAttemptedKeyRef = useRef<string | null>(null);

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

    dirtyRef.current = false;
    if (data) {
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
      const message = 'Preencha o questionário em Meus Dados antes de gerar os textos.';
      setGenerationError(message);
      if (manual) toast.error(message);
      return;
    }

    setGenerating(true);
    setGenerationError(null);

    try {
      const generationPayload = buildProfileQuestionnaireGenerationPayload(sourceQuestionnaire);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'profile_text',
          ...generationPayload,
          context: buildSafeProfileContext(pessoa),
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
      dirtyRef.current = true;
      await saveProfileTextValues(generatedValues, { quiet: !manual });

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
      dirtyRef.current = false;
      generationAttemptedKeyRef.current = null;

      await resolveFirstAccessLinkForUser(user);
      const { data, error: linkError } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (!mounted) return;

      if (linkError || !data?.pessoa) {
        setError(linkError || 'Não foi possível carregar o perfil vinculado.');
        setPessoa(null);
        setQuestionnaire(null);
        setLoading(false);
        return;
      }

      const linkedPessoa = data.pessoa;
      setPessoa(linkedPessoa);
      setCanEdit(data.can_edit !== false);
      setProfileText({
        minibio: limitProfileText(linkedPessoa.minibio),
        curiosidades: limitProfileText(linkedPessoa.curiosidades),
      });

      const questionnaireResult = await getProfileQuestionnaireAnswers(linkedPessoa.id);
      if (!mounted) return;

      if (questionnaireResult.error) {
        setGenerationError(`Não foi possível carregar o questionário de perfil: ${questionnaireResult.error}`);
        setQuestionnaire(null);
      } else {
        setQuestionnaire(questionnaireResult.data);
      }

      loadedRef.current = true;
      setLoading(false);
    }

    loadProfileText();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!loadedRef.current || !pessoa?.id || !questionnaire || !hasQuestionnaireSource(questionnaire)) return;
    if (profileText.minibio.trim() || profileText.curiosidades.trim()) return;

    const currentHash = buildProfileQuestionnaireHash(questionnaire);
    const generationKey = `${pessoa.id}:${currentHash}`;
    if (generationAttemptedKeyRef.current === generationKey) return;

    generationAttemptedKeyRef.current = generationKey;
    void generateProfileText(questionnaire);
  }, [generateProfileText, pessoa?.id, profileText.curiosidades, profileText.minibio, questionnaire]);

  useEffect(() => {
    if (!loadedRef.current || !dirtyRef.current || !pessoa?.id || generating || saving) return undefined;

    const timeoutId = window.setTimeout(() => {
      void saveProfileTextValues(profileText, { quiet: true });
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [generating, pessoa?.id, profileText, saveProfileTextValues, saving]);

  const currentQuestionnaireHash = questionnaire ? buildProfileQuestionnaireHash(questionnaire) : null;
  const hasOutdatedSuggestion = Boolean(
    questionnaire &&
    currentQuestionnaireHash &&
    questionnaire.lastGeneratedHash &&
    questionnaire.lastGeneratedHash !== currentQuestionnaireHash &&
    (profileText.minibio.trim() || profileText.curiosidades.trim())
  );
  const canGenerate = Boolean(questionnaire && hasQuestionnaireSource(questionnaire) && canEdit);

  const updateProfileText = (field: keyof ProfileTextState, value: string) => {
    dirtyRef.current = true;
    setError(null);
    setProfileText((current) => ({
      ...current,
      [field]: value.slice(0, MAX_PROFILE_TEXT_LENGTH),
    }));
  };

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
            <Sparkles className="h-3.5 w-3.5" />
            Sugestão com IA
          </div>
          <h2 className="mt-3 text-lg font-semibold text-gray-950">Sobre mim</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            A IA usa as respostas de Meus Dados para sugerir sua Mini Bio e suas Curiosidades. Edite livremente antes de seguir.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {canGenerate && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => questionnaire && generateProfileText(questionnaire, { manual: true })}
              disabled={generating || loading || saving}
            >
              {generating ? 'Gerando...' : hasOutdatedSuggestion ? 'Atualizar com IA' : 'Regenerar com IA'}
            </Button>
          )}
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => saveProfileTextValues(profileText)}
            disabled={!canEdit || loading || saving || generating}
          >
            {saving ? 'Salvando...' : 'Salvar textos'}
          </Button>
        </div>
      </div>

      {loading && (
        <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Carregando Mini Bio e Curiosidades...
        </p>
      )}

      {!loading && !questionnaire && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Não encontramos respostas salvas do questionário. Volte para Meus Dados se quiser gerar sugestões automaticamente.
        </p>
      )}

      {generating && (
        <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Gerando sugestão com IA...
        </p>
      )}

      {(error || generationError) && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error || generationError}
        </p>
      )}

      {hasOutdatedSuggestion && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          O questionário foi alterado desde a última geração. Use “Atualizar com IA” apenas se quiser substituir a sugestão atual.
        </p>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="meus-vinculos-minibio">Mini Bio</Label>
            <span className="text-xs text-gray-500">{profileText.minibio.length}/{MAX_PROFILE_TEXT_LENGTH}</span>
          </div>
          <Textarea
            id="meus-vinculos-minibio"
            value={profileText.minibio}
            onChange={(event) => updateProfileText('minibio', event.target.value)}
            onBlur={() => saveProfileTextValues(profileText, { quiet: true })}
            placeholder="Escreva uma apresentação curta sobre você."
            disabled={!canEdit || loading}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="meus-vinculos-curiosidades">Curiosidades</Label>
            <span className="text-xs text-gray-500">{profileText.curiosidades.length}/{MAX_PROFILE_TEXT_LENGTH}</span>
          </div>
          <Textarea
            id="meus-vinculos-curiosidades"
            value={profileText.curiosidades}
            onChange={(event) => updateProfileText('curiosidades', event.target.value)}
            onBlur={() => saveProfileTextValues(profileText, { quiet: true })}
            placeholder="Liste gostos, hábitos, memórias ou detalhes leves sobre você."
            disabled={!canEdit || loading}
            rows={5}
          />
        </div>
      </div>
    </section>
  );
}

function MeusVinculosProfileBioPortal() {
  const host = useProfileBioPortalHost();
  if (!host) return null;
  return createPortal(<MeusVinculosProfileBioSection />, host);
}

export function MeusVinculosWithProfileBio() {
  return (
    <div>
      <MeusVinculosProfileBioPortal />
      <MeusVinculos />
    </div>
  );
}
