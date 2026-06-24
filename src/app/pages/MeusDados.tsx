import React, { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useNavigate } from 'react-router';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Info,
  MapPin,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  MemberPageHeader,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import { AddressAutocompleteInput } from '../components/person/AddressAutocompleteInput';
import {
  SocialProfileForm,
  SocialProfilesEditor,
} from '../components/person/SocialProfilesEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import {
  EditableOwnPersonPayload,
  ensureMemberProfile,
  getCurrentUserLinkedPeople,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { uploadPersonAvatarFile } from '../services/storageService';
import { salvarPreferenciasNotificacao } from '../services/userEngagementService';
import {
  buildSocialProfilesFromRows,
  listarPessoaSocialProfiles,
  substituirPessoaSocialProfiles,
} from '../services/pessoaSocialProfilesService';
import {
  AI_BADGE_GROUPS,
  AI_STEPS,
  AI_TONES,
  getAiBadgeDisplayLabel,
  getAiBadgeGroupDisplayText,
  type AiBadge,
  type AiBadgeGroup,
  type AiGeneratedQuestion,
  type AiTone,
} from '../constants/profileQuestionnaireConfig';
import {
  buildProfileQuestionnaireHash,
  getProfileQuestionnaireAnswers,
  normalizeProfileQuestionnairePayload,
  upsertProfileQuestionnaireAnswers,
} from '../services/profileQuestionnaireService';
import { Pessoa } from '../types';
import {
  buildEditablePersonFormState,
  cleanPersonPayload,
  formatPersonName,
  formatPhone,
  getInitials,
  maskBirthDate,
  normalizeBirthDate,
  normalizeLocationByMode,
  normalizeProfession,
  PersonFieldErrors,
  buildSocialProfilesFromPerson,
  createSocialProfile,
  syncFirstSocialProfileToPersonFields,
  validateEditablePersonForm,
  validateLocationByMode,
} from '../utils/personFields';

const AVATAR_SIZE = 512;
// TODO: Migrar blocos simples para os componentes compartilhados de pessoa sem afetar avatar/crop, Places e primeiro acesso.

type MeusDadosDraft = {
  form: EditableOwnPersonPayload;
  socialProfiles: SocialProfileForm[];
  aiStep?: number;
  aiTone?: AiTone;
  aiSelectedBadges?: string[];
  aiCustomTraits?: string;
  aiGeneratedQuestions?: AiGeneratedQuestion[];
  pendingAvatarDataUrl?: string | null;
  avatarCropSourceDataUrl?: string | null;
  photoMarkedForRemoval?: boolean;
};

// Futuro banco: substituir campos rede_social/instagram_usuario por pessoa_social_profiles
// (id, pessoa_id, rede, perfil, url, exibir_no_perfil, created_at, updated_at).

function getDraftKey(userId: string, pessoaId: string) {
  return `meus-dados-draft:${userId}:${pessoaId}`;
}

function readMeusDadosDraft(key: string): MeusDadosDraft | null {
  try {
    const rawDraft = window.sessionStorage.getItem(key);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as Partial<MeusDadosDraft> & { complemento?: string };
    if (!draft.form || !Array.isArray(draft.socialProfiles)) return null;

    const form = {
      ...buildEditablePersonFormState(),
      ...draft.form,
      complemento: draft.form.complemento ?? draft.complemento ?? '',
    };

    return {
      form,
      socialProfiles: draft.socialProfiles.length > 0 ? draft.socialProfiles : [createSocialProfile()],
      aiStep: typeof draft.aiStep === 'number' ? draft.aiStep : undefined,
      aiTone: draft.aiTone,
      aiSelectedBadges: Array.isArray(draft.aiSelectedBadges) ? draft.aiSelectedBadges : undefined,
      aiCustomTraits: typeof draft.aiCustomTraits === 'string' ? draft.aiCustomTraits : undefined,
      aiGeneratedQuestions: Array.isArray(draft.aiGeneratedQuestions) ? draft.aiGeneratedQuestions : undefined,
      pendingAvatarDataUrl: draft.pendingAvatarDataUrl ?? null,
      avatarCropSourceDataUrl: draft.avatarCropSourceDataUrl ?? null,
      photoMarkedForRemoval: draft.photoMarkedForRemoval === true,
    };
  } catch {
    return null;
  }
}

function writeMeusDadosDraft(key: string, draft: MeusDadosDraft) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Rascunho é uma proteção auxiliar; falhas de storage não devem bloquear a edição.
  }
}

function removeMeusDadosDraft(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

function readImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = src;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Não foi possível preparar a imagem.')));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string) {
  try {
    const [metadata, encodedData] = dataUrl.split(',');
    if (!metadata || !encodedData) return null;

    const mimeType = metadata.match(/^data:([^;]+)/)?.[1] ?? 'image/jpeg';
    const isBase64 = metadata.includes(';base64');
    const binary = isBase64 ? window.atob(encodedData) : decodeURIComponent(encodedData);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

async function createPersistableAvatarSource(file: File) {
  const sourceDataUrl = await blobToDataUrl(file);
  const image = await readImage(sourceDataUrl);
  const maxDimension = 1600;

  if (image.naturalWidth <= maxDimension && image.naturalHeight <= maxDimension) {
    return sourceDataUrl;
  }

  const scale = maxDimension / Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');

  if (!context) return sourceDataUrl;

  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

async function createCroppedAvatarBlob(imageSrc: string, cropPixels: Area) {
  const image = await readImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Não foi possível preparar o corte da imagem.');
  }

  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar o JPEG final.'));
        return;
      }

      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

export function MeusDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasInitializedFormRef = useRef(false);
  const initializedPessoaIdRef = useRef<string | null>(null);
  const loadedQuestionnaireHashRef = useRef<string | null>(null);
  const loadedLastGeneratedHashRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [linkedPeople, setLinkedPeople] = useState<Array<UserPersonLinkRecord & { pessoa: Pessoa | null }>>([]);
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [form, setForm] = useState<EditableOwnPersonPayload>(buildEditablePersonFormState());
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileForm[]>(() => [createSocialProfile()]);
  const [errors, setErrors] = useState<PersonFieldErrors>({});
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null>(null);
  const [avatarCropSourceDataUrl, setAvatarCropSourceDataUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaireSaving, setQuestionnaireSaving] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiTone, setAiTone] = useState<AiTone>('afetivo');
  const [aiSelectedBadges, setAiSelectedBadges] = useState<string[]>([]);
  const [aiCustomTraits, setAiCustomTraits] = useState('');
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<AiGeneratedQuestion[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      loadedQuestionnaireHashRef.current = null;
      loadedLastGeneratedHashRef.current = null;
      await resolveFirstAccessLinkForUser(user);
      const { data: linksData, error } = await getCurrentUserLinkedPeople();

      if (!mounted) return;

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setLinkedPeople(linksData);
      const selectedLink = (
        selectedPessoaId
          ? linksData.find((item) => item.pessoa_id === selectedPessoaId)
          : null
      ) || linksData.find((item) => item.principal) || linksData[0] || null;

      if (selectedLink && selectedLink.pessoa_id !== selectedPessoaId) {
        setSelectedPessoaId(selectedLink.pessoa_id);
      }

      const data = selectedLink;
      const nextPessoaId = data?.pessoa?.id ?? null;
      const samePessoa = nextPessoaId && initializedPessoaIdRef.current === nextPessoaId;
      const shouldPreserveDraft = hasInitializedFormRef.current && isDirtyRef.current && samePessoa;
      const draftKey = user.id && nextPessoaId ? getDraftKey(user.id, nextPessoaId) : null;
      const draft = draftKey && !shouldPreserveDraft ? readMeusDadosDraft(draftKey) : null;
      let loadedSocialProfiles = buildSocialProfilesFromPerson(data?.pessoa);
      let loadedQuestionnaire: Awaited<ReturnType<typeof getProfileQuestionnaireAnswers>>['data'] = null;

      setLink(data);

      if (nextPessoaId) {
        try {
          const socialProfileRows = await listarPessoaSocialProfiles(nextPessoaId);
          loadedSocialProfiles = buildSocialProfilesFromRows(socialProfileRows, data?.pessoa);
        } catch (socialProfilesError) {
          if (mounted) {
            toast.warning(
              socialProfilesError instanceof Error
                ? `Não foi possível carregar redes sociais versionadas: ${socialProfilesError.message}`
              : 'Não foi possível carregar redes sociais versionadas.',
            );
          }
        }

        try {
          const questionnaireResult = await getProfileQuestionnaireAnswers(nextPessoaId);
          if (questionnaireResult.error) {
            throw new Error(questionnaireResult.error);
          }
          loadedQuestionnaire = questionnaireResult.data;
        } catch (questionnaireError) {
          if (mounted) {
            toast.warning(
              questionnaireError instanceof Error
                ? `Não foi possível carregar o questionário de perfil: ${questionnaireError.message}`
                : 'Não foi possível carregar o questionário de perfil.',
            );
          }
        }
      }

      loadedQuestionnaireHashRef.current = loadedQuestionnaire
        ? buildProfileQuestionnaireHash(loadedQuestionnaire)
        : null;
      loadedLastGeneratedHashRef.current = loadedQuestionnaire?.lastGeneratedHash ?? null;

      if (!shouldPreserveDraft) {
        setForm(draft?.form ?? buildEditablePersonFormState(data?.pessoa));
        setSocialProfiles(draft?.socialProfiles ?? loadedSocialProfiles);
        setAiStep(Math.min(Math.max(draft?.aiStep ?? 0, 0), AI_STEPS.length - 1));
        setAiTone(draft?.aiTone ?? loadedQuestionnaire?.tone ?? 'afetivo');
        setAiSelectedBadges(
          draft?.aiSelectedBadges ??
          loadedQuestionnaire?.selectedBadges.map((badge) => badge.id) ??
          [],
        );
        setAiCustomTraits(draft?.aiCustomTraits ?? loadedQuestionnaire?.customTraits ?? '');
        setAiGeneratedQuestions(draft?.aiGeneratedQuestions ?? loadedQuestionnaire?.generatedQuestions ?? []);
        setAiError(null);
        isDirtyRef.current = Boolean(draft);
      }

      hasInitializedFormRef.current = true;
      initializedPessoaIdRef.current = nextPessoaId;
      if (!shouldPreserveDraft) {
        const restoredPendingAvatar = draft?.pendingAvatarDataUrl ?? null;
        const restoredCropSource = draft?.avatarCropSourceDataUrl ?? null;
        setPendingAvatarDataUrl(restoredPendingAvatar);
        setAvatarCropSourceDataUrl(restoredCropSource);
        setPhotoPreviewUrl(restoredPendingAvatar);
        setCropImageUrl(restoredCropSource);
        setCroppedPhotoBlob(restoredPendingAvatar ? dataUrlToBlob(restoredPendingAvatar) : null);
        setPhotoMarkedForRemoval(draft?.photoMarkedForRemoval === true);
      }
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [selectedPessoaId, user]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    };
  }, [cropImageUrl]);

  useEffect(() => {
    const pessoaId = link?.pessoa?.id;
    if (!user?.id || !pessoaId || !hasInitializedFormRef.current || !isDirtyRef.current) return;

    writeMeusDadosDraft(getDraftKey(user.id, pessoaId), {
      form,
      socialProfiles,
      aiStep,
      aiTone,
      aiSelectedBadges,
      aiCustomTraits,
      aiGeneratedQuestions,
      pendingAvatarDataUrl,
      avatarCropSourceDataUrl,
      photoMarkedForRemoval,
    });
  }, [
    aiCustomTraits,
    aiGeneratedQuestions,
    aiSelectedBadges,
    aiStep,
    aiTone,
    avatarCropSourceDataUrl,
    form,
    link?.pessoa?.id,
    pendingAvatarDataUrl,
    photoMarkedForRemoval,
    socialProfiles,
    user?.id,
  ]);

  const pessoa = link?.pessoa;
  const isOnboarding = link?.dados_confirmados === false;
  const canEditSelectedProfile = link?.can_edit !== false;
  const previewName = useMemo(() => {
    const name = formatPersonName(String(form.nome_completo ?? '').trim());
    return name || pessoa?.nome_completo || 'Minha pessoa na árvore';
  }, [form.nome_completo, pessoa?.nome_completo]);

  const previewLocation = useMemo(() => {
    if (form.local_atual) {
      return normalizeLocationByMode(String(form.local_atual), {
        international: form.local_atual_exterior === true,
      }) || 'Sem local informado';
    }
    return normalizeLocationByMode(String(form.local_nascimento || ''), {
      international: form.local_nascimento_exterior === true,
    }) || 'Sem local informado';
  }, [form.local_atual, form.local_atual_exterior, form.local_nascimento, form.local_nascimento_exterior]);

  const currentPhotoUrl = photoMarkedForRemoval ? '' : photoPreviewUrl || String(form.foto_principal_url ?? '');
  const aiAllBadges = useMemo(() => AI_BADGE_GROUPS.flatMap((group) => group.badges), []);
  const aiSelectedBadgeItems = useMemo(
    () => aiAllBadges.filter((badge) => aiSelectedBadges.includes(badge.id)),
    [aiAllBadges, aiSelectedBadges],
  );
  const aiHasMinimumQuestionnaireInput = Boolean(aiTone) && aiSelectedBadgeItems.length > 0;
  const aiProgressPercent = Math.round(((aiStep + 1) / AI_STEPS.length) * 100);
  const aiIsMemorialMode = form.falecido === true;

  const markFormDirty = () => {
    isDirtyRef.current = true;
  };

  const markQuestionnaireDirty = () => {
    isDirtyRef.current = true;
    setAiError(null);
  };

  const updateAiTone = (tone: AiTone) => {
    markQuestionnaireDirty();
    setAiTone(tone);
  };

  const updateAiStep = (nextStep: number) => {
    markQuestionnaireDirty();
    setAiStep(Math.min(Math.max(nextStep, 0), AI_STEPS.length - 1));
  };

  const updateField = (field: keyof EditableOwnPersonPayload, value: string | boolean) => {
    markFormDirty();
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const updateTextField = (field: keyof EditableOwnPersonPayload, value: string) => {
    if (field === 'data_nascimento' || field === 'data_falecimento') {
      updateField(field, maskBirthDate(value));
      return;
    }

    if (field === 'telefone') {
      updateField(field, formatPhone(value));
      return;
    }

    updateField(field, value);
  };

  const getCompleteSocialProfiles = (profiles: SocialProfileForm[] = socialProfiles) => (
    profiles.filter((profile) => profile.rede.trim() && profile.perfil.trim())
  );

  const getPrimaryCompleteSocialProfile = (profiles: SocialProfileForm[] = socialProfiles) => (
    getCompleteSocialProfiles(profiles)[0] ?? createSocialProfile()
  );

  const syncFirstSocialProfileToLegacyFields = (profiles: SocialProfileForm[]) => {
    markFormDirty();
    const primaryCompleteProfile = getPrimaryCompleteSocialProfile(profiles);
    setForm((current) => syncFirstSocialProfileToPersonFields(current, [primaryCompleteProfile]));
    setErrors((current) => ({
      ...current,
      rede_social: undefined,
      instagram_usuario: undefined,
    }));
  };

  const handleSocialProfilesChange = (nextProfiles: SocialProfileForm[]) => {
    markFormDirty();
    setSocialProfiles(nextProfiles);
    syncFirstSocialProfileToLegacyFields(nextProfiles);
  };

  const normalizeFieldOnBlur = (field: keyof EditableOwnPersonPayload) => {
    const value = String(form[field] ?? '');

    if (field === 'nome_completo') updateField(field, formatPersonName(value));
    if (field === 'data_nascimento' || field === 'data_falecimento') {
      updateField(field, normalizeBirthDate(value));
    }
    if (field === 'profissao') updateField(field, normalizeProfession(value));
    if (field === 'local_nascimento' || field === 'local_atual' || field === 'local_falecimento') {
      const international = field === 'local_nascimento'
        ? form.local_nascimento_exterior === true
        : field === 'local_falecimento'
          ? form.local_falecimento_exterior === true
          : form.local_atual_exterior === true;
      const normalizedLocation = normalizeLocationByMode(value, { international });
      updateField(field, normalizedLocation);
      setErrors((current) => ({
        ...current,
        [field]: validateLocationByMode(normalizedLocation, { international }),
      }));
    }
  };

  const validateForm = () => {
    const primarySocialProfile = getPrimaryCompleteSocialProfile();
    const formForValidation = {
      ...form,
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    };
    const nextErrors = validateEditablePersonForm(formForValidation);
    const normalizedName = formatPersonName(String(form.nome_completo ?? ''));
    const normalizedBirthDate = normalizeBirthDate(String(form.data_nascimento ?? ''));
    const normalizedBirthLocation = normalizeLocationByMode(String(form.local_nascimento ?? ''), {
      international: form.local_nascimento_exterior === true,
    });
    const normalizedDeathDate = normalizeBirthDate(String(form.data_falecimento ?? ''));
    const normalizedDeathLocation = normalizeLocationByMode(String(form.local_falecimento ?? ''), {
      international: form.local_falecimento_exterior === true,
    });
    const normalizedCurrentLocation = normalizeLocationByMode(String(form.local_atual ?? ''), {
      international: form.local_atual_exterior === true,
    });

    setErrors(nextErrors);
    setForm((current) => ({
      ...current,
      nome_completo: normalizedName,
      data_nascimento: normalizedBirthDate,
      local_nascimento: normalizedBirthLocation,
      data_falecimento: normalizedDeathDate,
      local_falecimento: normalizedDeathLocation,
      local_atual: normalizedCurrentLocation,
      profissao: normalizeProfession(String(current.profissao ?? '')),
      telefone: formatPhone(String(current.telefone ?? '')),
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    try {
      const sourceDataUrl = await createPersistableAvatarSource(file);
      markFormDirty();
      setAvatarCropSourceDataUrl(sourceDataUrl);
      setCropImageUrl(sourceDataUrl);
    } catch {
      toast.error('Não foi possível preparar a imagem selecionada.');
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPhotoMarkedForRemoval(false);
  };

  const handleRemovePhoto = () => {
    markFormDirty();
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setPhotoPreviewUrl(null);
    setCropImageUrl(null);
    setCroppedPhotoBlob(null);
    setPendingAvatarDataUrl(null);
    setAvatarCropSourceDataUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPhotoMarkedForRemoval(true);
    setPhotoDialogOpen(false);
  };

  const handleApplyCrop = async () => {
    if (!cropImageUrl || !croppedAreaPixels) {
      toast.error('Selecione e ajuste uma imagem antes de aplicar.');
      return;
    }

    try {
      const blob = await createCroppedAvatarBlob(cropImageUrl, croppedAreaPixels);
      const previewUrl = await blobToDataUrl(blob);

      markFormDirty();
      setPhotoPreviewUrl(previewUrl);
      setCroppedPhotoBlob(blob);
      setPendingAvatarDataUrl(previewUrl);
      setAvatarCropSourceDataUrl(null);
      setCropImageUrl(null);
      setPhotoMarkedForRemoval(false);
      setPhotoDialogOpen(false);
      toast.success('Corte aplicado ao avatar.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível aplicar o corte.');
    }
  };

  const uploadAvatarBlob = async (blob: Blob) => {
    if (!user || !pessoa?.id) return { error: 'Não foi possível localizar o usuário para salvar a foto.', url: null };

    try {
      const upload = await uploadPersonAvatarFile(blob, { pessoaId: pessoa.id });
      return { error: undefined, url: upload.url };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Não foi possível enviar a foto.',
        url: null,
      };
    }
  };

  const toggleAiBadge = (badgeId: string) => {
    markQuestionnaireDirty();
    setAiSelectedBadges((current) => (
      current.includes(badgeId)
        ? current.filter((item) => item !== badgeId)
        : [...current, badgeId]
    ));
  };

  const buildQuestionnairePayload = () => {
    const answers = aiGeneratedQuestions.reduce<Record<string, string>>((nextAnswers, question) => {
      const answer = question.answer.trim();
      if (answer) {
        nextAnswers[question.id] = answer;
      }
      return nextAnswers;
    }, {});

    const normalized = normalizeProfileQuestionnairePayload({
      tone: aiTone,
      selectedBadges: aiSelectedBadgeItems,
      customTraits: aiCustomTraits,
      generatedQuestions: aiGeneratedQuestions,
      answers,
      memorialMode: aiIsMemorialMode,
    });
    const currentHash = buildProfileQuestionnaireHash(normalized);

    return {
      ...normalized,
      lastGeneratedHash: currentHash === loadedQuestionnaireHashRef.current
        ? loadedLastGeneratedHashRef.current
        : null,
    };
  };

  const validateQuestionnaire = () => {
    if (!aiTone) {
      return 'Escolha um tom para os textos antes de continuar.';
    }

    if (!aiHasMinimumQuestionnaireInput) {
      return 'Selecione ao menos uma característica antes de continuar.';
    }

    return null;
  };

  const saveProfileQuestionnaire = async ({ requireMinimum = false, quiet = false } = {}) => {
    if (!pessoa?.id) {
      const message = 'Não foi possível localizar a pessoa para salvar o questionário.';
      if (!quiet) setAiError(message);
      return { ok: false, error: message };
    }

    const validationError = validateQuestionnaire();
    if (validationError && requireMinimum) {
      setAiError(validationError);
      return { ok: false, error: validationError };
    }

    if (validationError && !requireMinimum) {
      return { ok: true, skipped: true };
    }

    setQuestionnaireSaving(true);
    setAiError(null);

    try {
      const payload = buildQuestionnairePayload();
      const result = await upsertProfileQuestionnaireAnswers(pessoa.id, payload);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        loadedQuestionnaireHashRef.current = buildProfileQuestionnaireHash(result.data);
        loadedLastGeneratedHashRef.current = result.data.lastGeneratedHash;
      }

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o questionário agora.';
      if (!quiet) setAiError(message);
      return { ok: false, error: message };
    } finally {
      setQuestionnaireSaving(false);
    }
  };

  const handleQuestionnaireNext = async () => {
    if (aiStep >= AI_STEPS.length - 1) return;
    await saveProfileQuestionnaire({ quiet: true });
    updateAiStep(aiStep + 1);
  };
  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !link?.id || !pessoa?.id) {
      toast.error('Não foi possível localizar seu vínculo com a árvore.');
      return;
    }

    if (!canEditSelectedProfile) {
      toast.error('Este perfil está em modo somente leitura para sua conta.');
      return;
    }

    if (!validateForm()) {
      toast.error('Revise os campos destacados antes de salvar.');
      return;
    }

    const questionnaireValidationError = isOnboarding ? validateQuestionnaire() : null;
    if (questionnaireValidationError) {
      setAiError(questionnaireValidationError);
      toast.error(questionnaireValidationError);
      return;
    }

    setSaving(true);

    const questionnaireSave = await saveProfileQuestionnaire({ requireMinimum: isOnboarding, quiet: !isOnboarding });
    if (!questionnaireSave.ok && isOnboarding) {
      setSaving(false);
      toast.error(questionnaireSave.error || 'Não foi possível salvar o questionário.');
      return;
    }

    if (!questionnaireSave.ok && !isOnboarding) {
      toast.warning(questionnaireSave.error || 'Dados pessoais serão salvos, mas o questionário de perfil não foi atualizado.');
    }

    const completedSocialProfiles = getCompleteSocialProfiles();
    const primarySocialProfile = completedSocialProfiles[0] ?? createSocialProfile();
    const payload = cleanPersonPayload({
      ...form,
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    });
    delete payload.minibio;
    delete payload.curiosidades;

    if (payload.falecido === true) {
      payload.permitir_exibir_data_nascimento = true;
      payload.permitir_exibir_telefone = true;
      payload.permitir_exibir_endereco = true;
      payload.permitir_exibir_rede_social = true;
      payload.permitir_exibir_instagram = true;
      payload.permitir_mensagens_whatsapp = false;
    }
    if (photoMarkedForRemoval) {
      payload.foto_principal_url = '';
    } else if (croppedPhotoBlob) {
      const upload = await uploadAvatarBlob(croppedPhotoBlob);

      if (upload.error) {
        setSaving(false);
        toast.error(`Não foi possível enviar a foto: ${upload.error}`);
        return;
      }

      payload.foto_principal_url = upload.url;
    }

    const { error: updateError, data: updatedPessoa } = await updateOwnLinkedPerson(pessoa.id, payload);

    if (updateError) {
      setSaving(false);
      toast.error(updateError);
      return;
    }

    if (payload.falecido === true) {
      await salvarPreferenciasNotificacao(user.id, {
        receber_aniversarios: false,
        receber_datas_memoria: false,
        receber_eventos: false,
        receber_avisos_gerais: false,
        receber_email: false,
        receber_push: false,
        receber_whatsapp: false,
        receber_email_novo_usuario: false,
        receber_email_datas_especiais: false,
        receber_email_novas_mensagens_forum: false,
        receber_email_novos_registros_historicos: false,
        receber_email_evento_historico_familia: false,
      });
    }

    try {
      const savedProfiles = await substituirPessoaSocialProfiles(pessoa.id, completedSocialProfiles, {
        exibirNoPerfil: payload.permitir_exibir_rede_social !== false,
      });
      setSocialProfiles(buildSocialProfilesFromRows(savedProfiles, updatedPessoa ?? pessoa));
    } catch (socialProfilesError) {
      toast.warning(
        socialProfilesError instanceof Error
          ? `Dados pessoais salvos, mas não foi possível salvar redes sociais versionadas: ${socialProfilesError.message}`
          : 'Dados pessoais salvos, mas não foi possível salvar redes sociais versionadas.',
      );
    }

    if (link.relacao_com_perfil === 'Sou esta pessoa') {
      const { error: profileError } = await ensureMemberProfile(user.id, {
        nome_exibicao: updatedPessoa?.nome_completo ?? String(payload.nome_completo ?? ''),
        avatar_url: photoMarkedForRemoval ? null : String(updatedPessoa?.foto_principal_url ?? form.foto_principal_url ?? '') || null,
      });

      if (profileError) {
        setSaving(false);
        toast.error(profileError);
        return;
      }
    }

    setSaving(false);

    if (user?.id && pessoa.id) {
      removeMeusDadosDraft(getDraftKey(user.id, pessoa.id));
    }
    setPendingAvatarDataUrl(null);
    setAvatarCropSourceDataUrl(null);
    setCroppedPhotoBlob(null);
    isDirtyRef.current = false;
    toast.success(isOnboarding ? 'Dados pessoais salvos.' : 'Alterações salvas.');
    if (isOnboarding) {
      navigate('/meus-vinculos', { replace: true });
    }
  };

  const renderAiBadgeGroup = (group: AiBadgeGroup) => {
    const GroupIcon = group.icon;
    const compactCards = ['personalidade', 'familia', 'trabalho', 'lugares', 'momentos', 'hobbies', 'marcas'].includes(group.id);
    const displayText = getAiBadgeGroupDisplayText(group, aiIsMemorialMode);

    return (
      <div className="space-y-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <GroupIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-gray-900">{displayText.title}</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">{displayText.subtitle}</p>
          </div>
        </div>
        <div className={compactCards ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
          {group.badges.map((badge) => {
            const selected = aiSelectedBadges.includes(badge.id);
            const BadgeIcon = badge.icon ?? group.icon;
            const displayLabel = getAiBadgeDisplayLabel(badge, aiIsMemorialMode);

            if (compactCards) {
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => toggleAiBadge(badge.id)}
                  className={[
                    'flex min-h-[56px] min-w-0 items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium leading-snug transition-colors',
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:bg-blue-50/50',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <span className="min-w-0 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {displayLabel}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => toggleAiBadge(badge.id)}
                className={[
                  'flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
                  selected
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50',
                ].join(' ')}
                aria-pressed={selected}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/80 text-blue-700">
                  <BadgeIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 break-words font-medium leading-snug">{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAiStep = () => {
    if (aiStep === 0) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="break-words text-lg font-semibold text-gray-900">Qual é o seu estilo?</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
              Escolha o estilo da Mini Bio e das Curiosidades. Se o perfil for de uma pessoa falecida, os textos serão escritos no passado com o estilo selecionado.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AI_TONES.map((tone) => {
              const selected = aiTone === tone.id;
              const ToneIcon = tone.icon;

              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => updateAiTone(tone.id)}
                  className={[
                    'flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/80 text-blue-700">
                    <ToneIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold leading-snug">{tone.label}</span>
                    <span className="mt-1 block break-words text-xs leading-snug text-gray-500">{tone.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (aiStep >= 1 && aiStep <= 7) {
      return renderAiBadgeGroup(AI_BADGE_GROUPS[aiStep - 1]);
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!link || !pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
          <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-600" />
          <h1 className="break-words text-xl font-bold text-gray-900">Perfil não vinculado</h1>
          <p className="mt-2 break-words text-sm text-gray-600">
            Sua conta ainda não está vinculada a uma pessoa da árvore. Use o primeiro acesso ou solicite ajuda.
          </p>
          <Button className="mt-5 w-full sm:w-auto" onClick={() => navigate('/entrar')}>
            Ir para autenticação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title={isOnboarding ? 'Revisar meus dados' : 'Editar meus dados'}
        subtitle={isOnboarding ? 'Confira suas informações antes de acessar a árvore principal.' : 'Atualize seus dados pessoais, contatos, redes e foto de perfil.'}
        icon={UserCircle2}
        hideHeaderActions={isOnboarding}
        hideMobileHeaderActions={isOnboarding}
        hideMobileBottomNav={isOnboarding}
      />

      {isOnboarding && <MemberOnboardingSteps activeStep={1} hidePreferences={form.falecido === true} />}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,320px)] lg:pb-6">
        <form onSubmit={handleConfirm} className="order-2 min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:order-1">
          {linkedPeople.length > 1 && (
            <section className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Label htmlFor="linked-profile-selector">Perfil em edição</Label>
              <select
                id="linked-profile-selector"
                value={selectedPessoaId}
                onChange={(event) => {
                  isDirtyRef.current = false;
                  hasInitializedFormRef.current = false;
                  initializedPessoaIdRef.current = null;
                  setSelectedPessoaId(event.target.value);
                }}
                className="mt-2 flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {linkedPeople.map((item) => (
                  <option key={item.id} value={item.pessoa_id}>
                    {item.pessoa?.nome_completo || item.pessoa_id}
                    {item.principal ? ' · principal' : ''}
                    {item.can_edit === false ? ' · somente leitura' : ''}
                  </option>
                ))}
              </select>
            </section>
          )}

          {!canEditSelectedProfile && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Este perfil está disponível para consulta, mas sua conta não tem permissão para editar os dados.
            </div>
          )}

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <SectionTitle icon={UserCircle2}>Dados pessoais</SectionTitle>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <Field label="Nome completo" error={errors.nome_completo}>
                <Input
                  value={String(form.nome_completo ?? '')}
                  onBlur={() => normalizeFieldOnBlur('nome_completo')}
                  onChange={(e) => updateTextField('nome_completo', e.target.value)}
                  aria-invalid={Boolean(errors.nome_completo)}
                  required
                />
              </Field>

              <Field label="Profissão">
                <Input
                  value={String(form.profissao ?? '')}
                  onBlur={() => normalizeFieldOnBlur('profissao')}
                  onChange={(e) => updateTextField('profissao', e.target.value)}
                  placeholder="Ex: jornalista, professora, médico..."
                />
              </Field>

              <div className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_128px]">
                <Field
                  label="Local de nascimento"
                  labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para local de nascimento" />}
                  error={errors.local_nascimento}
                >
                  <Input
                    value={String(form.local_nascimento ?? '')}
                    onBlur={() => normalizeFieldOnBlur('local_nascimento')}
                    onChange={(e) => updateTextField('local_nascimento', e.target.value)}
                    placeholder={form.local_nascimento_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                    aria-invalid={Boolean(errors.local_nascimento)}
                  />
                </Field>
                <CompactToggleField
                  label="Estrangeiro"
                  checked={form.local_nascimento_exterior === true}
                  onCheckedChange={(checked) => updateField('local_nascimento_exterior', checked)}
                  className="sm:self-end"
                />
              </div>

              <Field
                label="Dia ou Ano de Nascimento"
                labelAddon={<DateFormatInfoButton ariaLabel="Formato aceito para nascimento" />}
                error={errors.data_nascimento}
              >
                <Input
                  id="data-nascimento"
                  value={String(form.data_nascimento ?? '')}
                  onBlur={() => normalizeFieldOnBlur('data_nascimento')}
                  onChange={(e) => updateTextField('data_nascimento', e.target.value)}
                  placeholder="AAAA ou DD/MM/AAAA"
                  aria-invalid={Boolean(errors.data_nascimento)}
                />
              </Field>

              <div className="border-t border-gray-200 pt-4 md:col-span-2">
                <DeathStatusSelector
                  checked={form.falecido === true}
                  onChange={(checked) => updateField('falecido', checked)}
                />
              </div>

              {form.falecido !== true && (
                <div className="grid min-w-0 grid-cols-1 items-start gap-3 md:col-span-2 sm:grid-cols-[minmax(0,1fr)_128px] md:max-w-[calc(50%-0.5rem)]">
                  <Field
                    label="Cidade de residência"
                    labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para cidade de residência" />}
                    error={errors.local_atual}
                  >
                    <Input
                      value={String(form.local_atual ?? '')}
                      onBlur={() => normalizeFieldOnBlur('local_atual')}
                      onChange={(e) => updateTextField('local_atual', e.target.value)}
                      placeholder={form.local_atual_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                      aria-invalid={Boolean(errors.local_atual)}
                    />
                  </Field>
                  <CompactToggleField
                    label="Exterior"
                    checked={form.local_atual_exterior === true}
                    onCheckedChange={(checked) => updateField('local_atual_exterior', checked)}
                    className="sm:self-end"
                  />
                </div>
              )}

              {form.falecido === true && (
                <div className="grid grid-cols-1 items-start gap-4 md:col-span-2 md:grid-cols-2">
                  <Field
                    label="Dia ou Ano de Falecimento"
                    labelAddon={<DateFormatInfoButton ariaLabel="Formato aceito para falecimento" />}
                    error={errors.data_falecimento}
                  >
                    <Input
                      value={String(form.data_falecimento ?? '')}
                      onBlur={() => normalizeFieldOnBlur('data_falecimento')}
                      onChange={(event) => updateTextField('data_falecimento', event.target.value)}
                      placeholder="AAAA ou DD/MM/AAAA"
                      aria-invalid={Boolean(errors.data_falecimento)}
                    />
                  </Field>
                  <div className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Field
                      label="Local de falecimento"
                      labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para local de falecimento" />}
                      error={errors.local_falecimento}
                    >
                      <Input
                        value={String(form.local_falecimento ?? '')}
                        onBlur={() => normalizeFieldOnBlur('local_falecimento')}
                        onChange={(event) => updateTextField('local_falecimento', event.target.value)}
                        placeholder={form.local_falecimento_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                        aria-invalid={Boolean(errors.local_falecimento)}
                      />
                    </Field>
                    <CompactToggleField
                      label="Falecimento no exterior"
                      checked={form.local_falecimento_exterior === true}
                      onCheckedChange={(checked) => updateField('local_falecimento_exterior', checked)}
                      className="sm:self-end"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {form.falecido !== true && (
          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <SectionTitle icon={MapPin}>Contato, endereço e redes</SectionTitle>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <Field label="WhatsApp">
                <Input
                  value={String(form.telefone ?? '')}
                  onChange={(e) => updateTextField('telefone', e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </Field>
              <div className="hidden md:block" />
              <Field label="Endereço">
                <AddressAutocompleteInput
                  value={String(form.endereco ?? '')}
                  onChange={(nextValue) => updateTextField('endereco', nextValue)}
                  placeholder="Digite a rua e número, depois selecione"
                />
              </Field>
              <Field label="Complemento">
                <Input
                  value={String(form.complemento ?? '')}
                  onChange={(e) => updateTextField('complemento', e.target.value)}
                  placeholder="Ex.: Apto 402, Bloco B, Torre Norte"
                />
              </Field>
              <div className="min-w-0 space-y-2 md:col-span-2">
                <SocialProfilesEditor
                  profiles={socialProfiles}
                  onChange={handleSocialProfilesChange}
                  errors={{
                    rede_social: errors.rede_social,
                    instagram_usuario: errors.instagram_usuario,
                  }}
                />
              </div>
            </div>
          </section>
          )}

          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4">
              <SectionTitle icon={Sparkles} className="mb-0">Sobre Mim</SectionTitle>
              <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
                Responda este questionário para preparar a geração da sua Mini Bio e das suas Curiosidades na próxima etapa.
              </p>
            </div>

            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
                  <span>Etapa {aiStep + 1} de {AI_STEPS.length}</span>
                  <span className="break-words text-right">{AI_STEPS[aiStep]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${aiProgressPercent}%` }}
                  />
                </div>
              </div>

              {renderAiStep()}

              {aiError && (
                <p className="break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {aiError}
                </p>
              )}

              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateAiStep(aiStep - 1)}
                  disabled={aiStep === 0 || questionnaireSaving}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                {aiStep < AI_STEPS.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleQuestionnaireNext}
                    disabled={questionnaireSaving}
                    className="w-full sm:w-auto"
                  >
                    {questionnaireSaving ? 'Salvando...' : 'Avançar'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </section>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={saving || questionnaireSaving || !canEditSelectedProfile} className="w-full sm:w-auto sm:min-w-[220px]">
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isOnboarding ? 'Confirmar meus dados' : 'Salvar alterações'}
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="order-1 h-fit min-w-0 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm lg:order-2">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-3xl font-bold text-blue-700">
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt={previewName} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(previewName)}</span>
            )}
          </div>

          <h2 className="mt-4 break-words text-xl font-bold leading-snug text-gray-900">
            {previewName}
          </h2>
          <p className="mt-2 break-words text-sm text-gray-500">{previewLocation}</p>

          <div className="mt-5 grid grid-cols-1 gap-2">
            <Button type="button" variant="outline" onClick={() => setPhotoDialogOpen(true)}>
              <Camera className="h-4 w-4" />
              <span className="md:hidden">{currentPhotoUrl ? 'Alterar' : 'Cadastrar'}</span>
              <span className="hidden md:inline">{currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}</span>
            </Button>
            {currentPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                <span className="md:hidden">Remover</span>
                <span className="hidden md:inline">Remover foto</span>
              </Button>
            )}
          </div>

        </aside>
      </main>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="break-words">{currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}</DialogTitle>
            <DialogDescription className="break-words">
              Selecione uma imagem, ajuste o corte quadrado e aplique antes de salvar.
            </DialogDescription>
          </DialogHeader>

          {cropImageUrl ? (
            <div className="space-y-4">
              <div className="relative h-64 overflow-hidden rounded-xl bg-gray-950 sm:h-72">
                <Cropper
                  image={cropImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-zoom">Zoom</Label>
                <input
                  id="avatar-zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <label className="inline-flex cursor-pointer items-center text-sm font-medium text-blue-700 hover:text-blue-800">
                <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words">Escolher outra imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handlePhotoFile(event.target.files?.[0])}
                />
              </label>
            </div>
          ) : (
            <label
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handlePhotoFile(event.dataTransfer.files?.[0]);
              }}
            >
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt="Preview da foto" className="h-32 w-32 rounded-2xl object-cover" />
              ) : currentPhotoUrl ? (
                <img src={currentPhotoUrl} alt={previewName} className="h-32 w-32 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
              <span className="mt-4 flex items-center text-sm font-medium text-gray-900">
                <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words">Arraste uma imagem ou clique para selecionar</span>
              </span>
              <span className="mt-1 break-words text-xs text-gray-500">O corte final será quadrado.</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handlePhotoFile(event.target.files?.[0])}
              />
            </label>
          )}

          <DialogFooter>
            {currentPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="w-full text-red-700 hover:bg-red-50 sm:w-auto">
                <span className="md:hidden">Remover</span>
                <span className="hidden md:inline">Remover foto</span>
              </Button>
            )}
            {cropImageUrl ? (
              <Button type="button" className="w-full sm:w-auto" onClick={handleApplyCrop}>
                Aplicar corte
              </Button>
            ) : (
              <Button type="button" className="w-full sm:w-auto" onClick={() => setPhotoDialogOpen(false)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={['mb-4 flex min-w-0 items-center gap-2.5 text-lg font-semibold text-gray-900', className].filter(Boolean).join(' ')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </h2>
  );
}

function InfoTooltipButton({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = React.useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && wrapperRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((current) => !current)}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !wrapperRef.current?.contains(nextTarget)) {
            setOpen(false);
          }
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={[
          'pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-gray-200 bg-gray-900 px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-lg group-hover:block group-focus-within:block',
          open ? 'block' : 'hidden',
        ].join(' ')}
      >
        {children}
      </span>
    </span>
  );
}

function DateFormatInfoButton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <InfoTooltipButton ariaLabel={ariaLabel}>
      Use o formato AAAA ou DD/MM/AAAA
    </InfoTooltipButton>
  );
}

function LocationFormatInfoButton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <InfoTooltipButton ariaLabel={ariaLabel}>
      Para locais no Brasil, use Cidade/UF. Para exterior, marque a opção correspondente e use Cidade (País).
    </InfoTooltipButton>
  );
}

function DeathStatusSelector({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="min-w-0 space-y-3">
      <p className="break-words text-sm font-medium text-gray-900">Você está escrevendo o perfil de uma pessoa falecida?</p>
      <div className="inline-flex w-full max-w-xs rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Você está escrevendo o perfil de uma pessoa falecida?">
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={checked}
          className={[
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
            checked ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={!checked}
          className={[
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
            !checked ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          Não
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  labelAddon,
  error,
  children,
  className = '',
}: {
  label: string;
  labelAddon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={['min-w-0 space-y-2', className].filter(Boolean).join(' ')}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Label className="min-w-0 break-words">{label}</Label>
        {labelAddon}
      </div>
      {children}
      {error && <p className="break-words text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function CompactToggleField({
  label,
  checked,
  onCheckedChange,
  className = '',
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <div aria-hidden="true" className="hidden h-[22px] sm:block" />
      <div className="flex h-10 min-w-0 items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 sm:mt-2">
        <Label className="min-w-0 break-words text-xs">{label}</Label>
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
      </div>
    </div>
  );
}
