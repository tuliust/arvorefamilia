import React, { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useNavigate } from 'react-router';
import { Camera, ImagePlus, Info, Save, Sparkles, Trash2, UploadCloud, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
} from '../components/layout/MemberPageHeader';
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
import {
  buildSocialProfilesFromRows,
  listarPessoaSocialProfiles,
  substituirPessoaSocialProfiles,
} from '../services/pessoaSocialProfilesService';
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
const LOCATION_FORMAT_HELPER = 'Use o formato Nome da Cidade/UF. Exemplo: São José dos Pinhais/PR.';
const INTERNATIONAL_LOCATION_FORMAT_HELPER = 'Use o formato Nome da Cidade (País). Exemplo: Dublin (Irlanda).';
// TODO: Migrar blocos simples para os componentes compartilhados de pessoa sem afetar avatar/crop, Places e primeiro acesso.

type MeusDadosDraft = {
  form: EditableOwnPersonPayload;
  socialProfiles: SocialProfileForm[];
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
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiDestination, setAiDestination] = useState<'minibio' | 'curiosidades'>('minibio');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
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
      }

      if (!shouldPreserveDraft) {
        setForm(draft?.form ?? buildEditablePersonFormState(data?.pessoa));
        setSocialProfiles(draft?.socialProfiles ?? loadedSocialProfiles);
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
      pendingAvatarDataUrl,
      avatarCropSourceDataUrl,
      photoMarkedForRemoval,
    });
  }, [
    avatarCropSourceDataUrl,
    form,
    link?.pessoa?.id,
    pendingAvatarDataUrl,
    photoMarkedForRemoval,
    socialProfiles,
    user?.id,
  ]);

  const pessoa = link?.pessoa;
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
  const shouldSuggestFullBirthDate = /^\d{4}$/.test(String(form.data_nascimento ?? '').trim());

  const markFormDirty = () => {
    isDirtyRef.current = true;
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

  const syncFirstSocialProfileToLegacyFields = (profiles: SocialProfileForm[]) => {
    markFormDirty();
    setForm((current) => syncFirstSocialProfileToPersonFields(current, profiles));
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
    const nextErrors = validateEditablePersonForm(form);
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

  const handleGenerateAiText = async () => {
    const keywords = aiKeywords.trim();
    if (!keywords || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiSuggestion('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: 'profile_text',
          destination: aiDestination,
          keywords,
          context: {
            nome: String(form.nome_completo ?? ''),
            profissao: String(form.profissao ?? ''),
            local_nascimento: String(form.local_nascimento ?? ''),
            local_atual: String(form.local_atual ?? ''),
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Não foi possível gerar a sugestão agora.');
      }

      const suggestion = payload?.answer;
      if (!suggestion || typeof suggestion !== 'string') {
        throw new Error('A IA não retornou uma sugestão válida.');
      }
      setAiSuggestion(suggestion.trim());
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Não foi possível gerar a sugestão agora.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiText = () => {
    if (!aiSuggestion) return;
    updateTextField(aiDestination, aiSuggestion);
    setAiDialogOpen(false);
    setAiSuggestion('');
    setAiError(null);
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

    setSaving(true);

    const primarySocialProfile = socialProfiles[0];
    const payload = cleanPersonPayload({
      ...form,
      rede_social: primarySocialProfile?.rede || '',
      instagram_usuario: primarySocialProfile?.perfil || '',
    });
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

    try {
      const savedProfiles = await substituirPessoaSocialProfiles(pessoa.id, socialProfiles, {
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
    toast.success('Dados pessoais salvos.');
    navigate('/meus-vinculos', { replace: true });
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
        title="Revisar meus dados"
        subtitle="Confira suas informações antes de acessar a árvore principal."
        icon={UserCircle2}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Network },
        ]}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,320px)]">
        <form onSubmit={handleConfirm} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
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
            <h2 className="mb-4 text-base font-semibold text-gray-900">Dados pessoais</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nome completo" error={errors.nome_completo}>
                <Input
                  value={String(form.nome_completo ?? '')}
                  onBlur={() => normalizeFieldOnBlur('nome_completo')}
                  onChange={(e) => updateTextField('nome_completo', e.target.value)}
                  aria-invalid={Boolean(errors.nome_completo)}
                  required
                />
              </Field>
              <Field label="Data de nascimento" error={errors.data_nascimento}>
                <Input
                  value={String(form.data_nascimento ?? '')}
                  onBlur={() => normalizeFieldOnBlur('data_nascimento')}
                  onChange={(e) => updateTextField('data_nascimento', e.target.value)}
                  placeholder="DD/MM/AAAA ou AAAA"
                  aria-invalid={Boolean(errors.data_nascimento)}
                />
              </Field>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_112px] gap-3">
                <Field label="Local de nascimento" error={errors.local_nascimento}>
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
                />
              </div>
              {shouldSuggestFullBirthDate && (
                <div className="min-w-0 self-start">
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="break-words">Se souber, adicione também o dia e o mês de nascimento.</p>
                  </div>
                </div>
              )}
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_112px] gap-3">
                <Field label="Cidade de residência" error={errors.local_atual}>
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
                />
              </div>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_112px] gap-3">
                <Field label="Profissão">
                  <Input
                    value={String(form.profissao ?? '')}
                    onBlur={() => normalizeFieldOnBlur('profissao')}
                    onChange={(e) => updateTextField('profissao', e.target.value)}
                    placeholder="Ex: jornalista, professora, médico..."
                  />
                </Field>
                <CompactToggleField
                  label="Falecida"
                  checked={form.falecido === true}
                  onCheckedChange={(checked) => updateField('falecido', checked)}
                />
              </div>
            {form.falecido === true && (
              <>
                <Field label="Data de falecimento" error={errors.data_falecimento}>
                  <Input
                    value={String(form.data_falecimento ?? '')}
                    onBlur={() => normalizeFieldOnBlur('data_falecimento')}
                    onChange={(event) => updateTextField('data_falecimento', event.target.value)}
                    placeholder="DD/MM/AAAA ou AAAA"
                    aria-invalid={Boolean(errors.data_falecimento)}
                  />
                </Field>
                <Field label="Local de falecimento" error={errors.local_falecimento}>
                  <Input
                    value={String(form.local_falecimento ?? '')}
                    onBlur={() => normalizeFieldOnBlur('local_falecimento')}
                    onChange={(event) => updateTextField('local_falecimento', event.target.value)}
                    placeholder={form.local_falecimento_exterior === true ? 'Cidade (País)' : 'Cidade/UF'}
                    aria-invalid={Boolean(errors.local_falecimento)}
                  />
                  <p className="break-words text-xs text-gray-500">
                    {form.local_falecimento_exterior === true ? INTERNATIONAL_LOCATION_FORMAT_HELPER : LOCATION_FORMAT_HELPER}
                  </p>
                  <ToggleField
                    label="Falecimento fora do Brasil"
                    checked={form.local_falecimento_exterior === true}
                    onCheckedChange={(checked) => updateField('local_falecimento_exterior', checked)}
                  />
                </Field>
              </>
            )}
            </div>
          </section>

          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Contato, endereço e redes sociais</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="WhatsApp">
              <Input
                value={String(form.telefone ?? '')}
                onChange={(e) => updateTextField('telefone', e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
              />
            </Field>
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
              <p className="break-words text-xs text-gray-500">
                Use para apartamento, bloco, torre, casa ou referência interna. O endereço principal continua vindo do Google Maps.
              </p>
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

          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">Mini Bio e Curiosidades</h2>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  setAiError(null);
                  setAiSuggestion('');
                  setAiDialogOpen(true);
                }}
                aria-label="Gerar texto com IA"
                title="Gerar texto com IA"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Mini Bio">
              <Textarea
                value={String(form.minibio ?? '')}
                onChange={(e) => updateTextField('minibio', e.target.value)}
                placeholder="Opcional: escreva uma breve apresentação sobre você. Conte quem você é, de onde vem, o que faz ou fez, sua trajetória, valores, conquistas e sua relação com a família."
                className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
              />
            </Field>
              <Field label="Curiosidades">
              <Textarea
                value={String(form.curiosidades ?? '')}
                onChange={(e) => updateTextField('curiosidades', e.target.value)}
                placeholder="Opcional: compartilhe fatos, histórias ou lembranças curiosas sobre sua vida. Pode incluir hobbies, costumes, viagens, talentos, apelidos, momentos marcantes ou detalhes que ajudem a família a conhecer melhor você."
                className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
              />
              </Field>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={saving || !canEditSelectedProfile} className="w-full sm:w-auto sm:min-w-[220px]">
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Confirmar meus dados
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="h-fit min-w-0 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
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

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Gerar texto com IA</DialogTitle>
            <DialogDescription>
              Informe fatos e tópicos reais. A sugestão só será aplicada quando você confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-profile-destination">Destino</Label>
              <select
                id="ai-profile-destination"
                value={aiDestination}
                onChange={(event) => setAiDestination(event.target.value as 'minibio' | 'curiosidades')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="minibio">Mini Bio</option>
                <option value="curiosidades">Curiosidades</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-profile-keywords">Palavras-chave e tópicos</Label>
              <Textarea
                id="ai-profile-keywords"
                value={aiKeywords}
                onChange={(event) => setAiKeywords(event.target.value)}
                placeholder="Ex: professora, nasceu na Bahia, gosta de música, viagens em família"
                className="min-h-24"
              />
            </div>
            {aiError && <p className="text-sm text-red-600">{aiError}</p>}
            {aiSuggestion && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Sugestão</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{aiSuggestion}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAiDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGenerateAiText} disabled={aiLoading || !aiKeywords.trim()}>
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Gerando...' : 'Gerar sugestão'}
            </Button>
            {aiSuggestion && (
              <Button type="button" onClick={handleApplyAiText}>
                Aplicar texto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="break-words text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="min-w-0 space-y-1">
        <Label>{label}</Label>
        {description && <p className="break-words text-xs leading-snug text-gray-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="shrink-0" />
    </div>
  );
}

function CompactToggleField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-6 flex h-10 min-w-0 items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}
