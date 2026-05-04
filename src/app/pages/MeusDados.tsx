import React, { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useNavigate } from 'react-router';
import { ArrowRight, Camera, ImagePlus, Save, Trash2, UploadCloud, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
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
import { supabase } from '../lib/supabaseClient';
import {
  GoogleAddressComponent,
  GooglePlaceResult,
  GooglePlacesAutocomplete,
  loadGoogleMapsPlaces,
} from '../lib/googleMapsLoader';
import {
  confirmOwnLinkedPersonData,
  EditableOwnPersonPayload,
  ensureMemberProfile,
  getPrimaryLinkedPersonWithPessoa,
  listLinkablePeople,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { Pessoa } from '../types';

const EDITABLE_FIELDS: Array<keyof EditableOwnPersonPayload> = [
  'nome_completo',
  'data_nascimento',
  'local_nascimento',
  'local_atual',
  'minibio',
  'curiosidades',
  'telefone',
  'endereco',
  'rede_social',
  'instagram_usuario',
  'permitir_exibir_instagram',
  'permitir_mensagens_whatsapp',
];

const SOCIAL_NETWORKS = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok'] as const;
const LOWERCASE_NAME_PARTS = new Set(['de', 'da', 'das', 'do', 'dos', 'e']);
const AVATAR_BUCKET = 'person-avatars';
const AVATAR_SIZE = 512;

// Futuro banco: substituir campos rede_social/instagram_usuario por pessoa_social_profiles
// (id, pessoa_id, rede, perfil, url, exibir_no_perfil, created_at, updated_at).
type FieldErrors = Partial<Record<keyof EditableOwnPersonPayload | 'complemento', string>>;

function buildFormState(pessoa?: Pessoa | null): EditableOwnPersonPayload {
  return {
    nome_completo: pessoa?.nome_completo ?? '',
    data_nascimento: pessoa?.data_nascimento ?? '',
    local_nascimento: pessoa?.local_nascimento ?? '',
    local_atual: pessoa?.local_atual ?? '',
    foto_principal_url: pessoa?.foto_principal_url ?? '',
    minibio: pessoa?.minibio ?? '',
    curiosidades: pessoa?.curiosidades ?? '',
    telefone: pessoa?.telefone ?? '',
    endereco: pessoa?.endereco ?? '',
    rede_social: pessoa?.rede_social ?? '',
    instagram_usuario: pessoa?.instagram_usuario ?? '',
    instagram_url: pessoa?.instagram_url ?? '',
    permitir_exibir_instagram: Boolean(pessoa?.permitir_exibir_instagram),
    permitir_mensagens_whatsapp: Boolean(pessoa?.permitir_mensagens_whatsapp),
  };
}

function cleanPayload(form: EditableOwnPersonPayload): EditableOwnPersonPayload {
  const normalizedForm: EditableOwnPersonPayload = {
    ...form,
    nome_completo: formatPersonName(String(form.nome_completo ?? '')),
    data_nascimento: normalizeBirthDate(String(form.data_nascimento ?? '')),
    local_nascimento: normalizeLocation(String(form.local_nascimento ?? '')),
    local_atual: normalizeLocation(String(form.local_atual ?? '')),
    telefone: formatPhone(String(form.telefone ?? '')),
  };

  return EDITABLE_FIELDS.reduce<EditableOwnPersonPayload>((payload, field) => {
    const value = normalizedForm[field];

    if (field === 'rede_social' && !value) {
      (payload as Record<string, unknown>)[field] = '';
      return payload;
    }

    if (typeof value === 'string') {
      (payload as Record<string, unknown>)[field] = normalizedForm[field]?.toString().trim() ?? '';
      return payload;
    }

    (payload as Record<string, unknown>)[field] = normalizedForm[field];
    return payload;
  }, {});
}

function normalizeWord(word: string) {
  const lower = word.toLocaleLowerCase('pt-BR');
  if (LOWERCASE_NAME_PARTS.has(lower)) return lower;

  return lower
    .split('-')
    .map((part) => part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1))
    .join('-');
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(normalizeWord)
    .join(' ');
}

function formatPersonName(value: string) {
  return titleCase(value);
}

function hasFirstAndLastName(value: string) {
  const words = value.trim().split(/\s+/).filter((part) => part.length >= 2);
  return words.length >= 2;
}

function maskBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function normalizeBirthDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  return maskBirthDate(trimmed);
}

function validateBirthDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^\d{4}$/.test(trimmed)) return undefined;

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 'Use DD/MM/AAAA ou apenas AAAA.';

  const day = Number(match[1]);
  const month = Number(match[2]);
  if (day < 1 || day > 31) return 'Dia deve estar entre 01 e 31.';
  if (month < 1 || month > 12) return 'Mês deve estar entre 01 e 12.';

  return undefined;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizeLocation(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const [rawCity, ...rest] = trimmed.split('/');
  if (!rest.length) return titleCase(rawCity);

  const city = titleCase(rawCity);
  const region = rest.join('/').trim();
  const normalizedRegion = /^[a-zA-Z]{2}$/.test(region) ? region.toLocaleUpperCase('pt-BR') : titleCase(region);
  return `${city}/${normalizedRegion}`;
}

function validateLocation(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const slashParts = trimmed.split('/');
  if (slashParts.length !== 2 || !slashParts[0].trim() || !slashParts[1].trim()) {
    return 'Use Cidade/UF ou Cidade/País.';
  }

  const region = slashParts[1].trim();
  if (/^[a-zA-Z]{1,2}$/.test(region) && !/^[A-Z]{2}$/.test(region)) {
    return 'Para cidades brasileiras, use UF com duas letras maiúsculas. Ex.: São José dos Campos/SP.';
  }

  return undefined;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.find((part, index) => index > 0 && !LOWERCASE_NAME_PARTS.has(part.toLocaleLowerCase('pt-BR')))?.[0] ?? parts[1]?.[0] ?? '';
  return `${first}${second}`.toLocaleUpperCase('pt-BR') || 'EU';
}

function getSocialPlaceholder(network?: string) {
  if (network === 'Instagram' || network === 'TikTok') return '@usuario';
  if (network === 'Facebook' || network === 'LinkedIn') return 'nome-do-perfil ou URL';
  return 'Selecione uma rede primeiro';
}

function getAddressComponent(
  components: GoogleAddressComponent[] | undefined,
  type: string,
  name: 'long_name' | 'short_name' = 'long_name',
) {
  return components?.find((component) => component.types.includes(type))?.[name] ?? '';
}

function joinAddressParts(parts: string[]) {
  return parts.map((part) => part.trim()).filter(Boolean).join(', ');
}

function formatGooglePlaceAddress(place: GooglePlaceResult) {
  const components = place.address_components;
  if (!components?.length) return place.formatted_address ?? '';

  const street = getAddressComponent(components, 'route');
  const number = getAddressComponent(components, 'street_number');
  const neighborhood =
    getAddressComponent(components, 'sublocality_level_1') ||
    getAddressComponent(components, 'sublocality') ||
    getAddressComponent(components, 'neighborhood');
  const city =
    getAddressComponent(components, 'locality') ||
    getAddressComponent(components, 'administrative_area_level_2') ||
    getAddressComponent(components, 'postal_town');
  const state = getAddressComponent(components, 'administrative_area_level_1', 'short_name');
  const postalCode = getAddressComponent(components, 'postal_code');
  const postalCodeSuffix = getAddressComponent(components, 'postal_code_suffix');
  const fullPostalCode = [postalCode, postalCodeSuffix].filter(Boolean).join('-');
  const cityState = [city, state].filter(Boolean).join('/');
  const streetLine = joinAddressParts([street, number]);
  const address = joinAddressParts([streetLine, neighborhood, cityState, fullPostalCode ? `CEP ${fullPostalCode}` : '']);

  return address || (place.formatted_address ?? '');
}

function readImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = src;
  });
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

function isMissingStorageBucketError(message: string) {
  const normalized = message.toLocaleLowerCase('pt-BR');
  return normalized.includes('bucket not found') || (normalized.includes('bucket') && normalized.includes('not found'));
}

export function MeusDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [form, setForm] = useState<EditableOwnPersonPayload>(buildFormState());
  const [complemento, setComplemento] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (!mounted) return;

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setLink(data);
      setForm(buildFormState(data?.pessoa));
      setComplemento('');
      setPhotoMarkedForRemoval(false);
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function loadLocationSuggestions() {
      const { data } = await listLinkablePeople();
      if (!mounted) return;

      const suggestions = new Set<string>();
      data.forEach((person) => {
        const birthLocation = normalizeLocation(String(person.local_nascimento ?? ''));
        const currentLocation = normalizeLocation(String(person.local_atual ?? ''));

        if (birthLocation) suggestions.add(birthLocation);
        if (currentLocation) suggestions.add(currentLocation);
      });

      setLocationSuggestions(Array.from(suggestions).sort((a, b) => a.localeCompare(b, 'pt-BR')));
    }

    loadLocationSuggestions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const input = addressInputRef.current;

    if (!apiKey || !input) return;

    let active = true;
    let autocomplete: GooglePlacesAutocomplete | undefined;
    let listener: { remove: () => void } | undefined;

    loadGoogleMapsPlaces(apiKey)
      .then((googleMaps) => {
        if (!active || !googleMaps || !addressInputRef.current) return;

        const brazilBounds = new googleMaps.maps.LatLngBounds(
          { lat: -33.75, lng: -73.99 },
          { lat: 5.27, lng: -34.79 },
        );

        autocomplete = new googleMaps.maps.places.Autocomplete(addressInputRef.current, {
          bounds: brazilBounds,
          fields: ['address_components', 'formatted_address', 'geometry'],
          strictBounds: false,
          types: ['address'],
        });

        listener = autocomplete.addListener('place_changed', () => {
          const selectedAddress = formatGooglePlaceAddress(autocomplete.getPlace());
          if (!selectedAddress) return;

          setForm((current) => ({
            ...current,
            endereco: selectedAddress,
          }));
          setErrors((current) => ({
            ...current,
            endereco: undefined,
          }));
        });
      })
      .catch(() => {
        if (active) toast.error('Não foi possível carregar sugestões de endereço.');
      });

    return () => {
      active = false;
      listener?.remove();
      if (autocomplete && window.google?.maps.event?.clearInstanceListeners) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

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

  const pessoa = link?.pessoa;
  const alreadyConfirmed = Boolean(link?.dados_confirmados);

  const previewName = useMemo(() => {
    const name = formatPersonName(String(form.nome_completo ?? '').trim());
    return name || pessoa?.nome_completo || 'Minha pessoa na árvore';
  }, [form.nome_completo, pessoa?.nome_completo]);

  const previewLocation = useMemo(() => {
    return normalizeLocation(String(form.local_atual || form.local_nascimento || '')) || 'Sem local informado';
  }, [form.local_atual, form.local_nascimento]);

  const currentPhotoUrl = photoMarkedForRemoval ? '' : photoPreviewUrl || String(form.foto_principal_url ?? '');

  const updateField = (field: keyof EditableOwnPersonPayload, value: string | boolean) => {
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
    if (field === 'data_nascimento') {
      updateField(field, maskBirthDate(value));
      return;
    }

    if (field === 'telefone') {
      updateField(field, formatPhone(value));
      return;
    }

    updateField(field, value);
  };

  const normalizeFieldOnBlur = (field: keyof EditableOwnPersonPayload) => {
    const value = String(form[field] ?? '');

    if (field === 'nome_completo') updateField(field, formatPersonName(value));
    if (field === 'data_nascimento') updateField(field, normalizeBirthDate(value));
    if (field === 'local_nascimento' || field === 'local_atual') updateField(field, normalizeLocation(value));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const normalizedName = formatPersonName(String(form.nome_completo ?? ''));
    const normalizedBirthDate = normalizeBirthDate(String(form.data_nascimento ?? ''));
    const normalizedBirthLocation = normalizeLocation(String(form.local_nascimento ?? ''));
    const normalizedCurrentLocation = normalizeLocation(String(form.local_atual ?? ''));

    if (!hasFirstAndLastName(normalizedName)) {
      nextErrors.nome_completo = 'Informe pelo menos nome e sobrenome, com duas letras ou mais.';
    }

    const birthDateError = validateBirthDate(normalizedBirthDate);
    if (birthDateError) nextErrors.data_nascimento = birthDateError;

    const birthLocationError = validateLocation(normalizedBirthLocation);
    if (birthLocationError) nextErrors.local_nascimento = birthLocationError;

    const currentLocationError = validateLocation(normalizedCurrentLocation);
    if (currentLocationError) nextErrors.local_atual = currentLocationError;

    if (
      Boolean(form.permitir_exibir_instagram) &&
      String(form.rede_social ?? '').trim() &&
      !String(form.instagram_usuario ?? '').trim()
    ) {
      nextErrors.instagram_usuario = 'Informe o perfil para exibir a rede social.';
    }

    if (Boolean(form.permitir_exibir_instagram) && !String(form.rede_social ?? '').trim()) {
      nextErrors.rede_social = 'Selecione uma rede social para exibir no perfil.';
    }

    setErrors(nextErrors);
    setForm((current) => ({
      ...current,
      nome_completo: normalizedName,
      data_nascimento: normalizedBirthDate,
      local_nascimento: normalizedBirthLocation,
      local_atual: normalizedCurrentLocation,
      telefone: formatPhone(String(current.telefone ?? '')),
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setSelectedPhoto(file);
    setCropImageUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPhotoMarkedForRemoval(false);
  };

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setPhotoPreviewUrl(null);
    setCropImageUrl(null);
    setCroppedPhotoBlob(null);
    setSelectedPhoto(null);
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
      const previewUrl = URL.createObjectURL(blob);

      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(previewUrl);
      setCroppedPhotoBlob(blob);
      setPhotoMarkedForRemoval(false);
      setPhotoDialogOpen(false);
      toast.success('Corte aplicado ao avatar.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível aplicar o corte.');
    }
  };

  const uploadAvatarBlob = async (blob: Blob) => {
    if (!user || !pessoa?.id) return { error: 'Não foi possível localizar o usuário para salvar a foto.', url: null };

    const extension = 'jpg';
    const storagePath = `${user.id}/${pessoa.id}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      if (isMissingStorageBucketError(error.message)) {
        return { error: undefined, url: null };
      }

      return { error: error.message, url: null };
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
    return { error: undefined, url: data.publicUrl };
  };

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !link?.id || !pessoa?.id) {
      toast.error('Não foi possível localizar seu vínculo com a árvore.');
      return;
    }

    if (!validateForm()) {
      toast.error('Revise os campos destacados antes de salvar.');
      return;
    }

    setSaving(true);

    const payload = cleanPayload(form);
    if (photoMarkedForRemoval) {
      payload.foto_principal_url = '';
    } else if (croppedPhotoBlob) {
      const upload = await uploadAvatarBlob(croppedPhotoBlob);

      if (upload.error) {
        setSaving(false);
        toast.error(`Não foi possível enviar a foto: ${upload.error}`);
        return;
      }

      if (upload.url) {
        payload.foto_principal_url = upload.url;
      } else {
        toast.info('Storage de avatars não configurado. O corte ficará apenas como preview local.');
      }
    }

    const { error: updateError, data: updatedPessoa } = await updateOwnLinkedPerson(pessoa.id, payload);

    if (updateError) {
      setSaving(false);
      toast.error(updateError);
      return;
    }

    const { error: profileError } = await ensureMemberProfile(user.id, {
      nome_exibicao: updatedPessoa?.nome_completo ?? String(payload.nome_completo ?? ''),
      avatar_url: photoMarkedForRemoval ? null : String(updatedPessoa?.foto_principal_url ?? form.foto_principal_url ?? '') || null,
    });

    if (profileError) {
      setSaving(false);
      toast.error(profileError);
      return;
    }

    const { error: confirmError } = await confirmOwnLinkedPersonData(link.id);
    setSaving(false);

    if (confirmError) {
      toast.error(confirmError);
      return;
    }

    toast.success('Dados confirmados.');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!link || !pessoa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
          <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-600" />
          <h1 className="text-xl font-bold text-gray-900">Perfil não vinculado</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sua conta ainda não está vinculada a uma pessoa da árvore. Use o primeiro acesso ou solicite ajuda.
          </p>
          <Button className="mt-5" onClick={() => navigate('/entrar')}>
            Ir para autenticação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">
              {alreadyConfirmed ? 'Gerenciamento dos meus dados' : 'Confirmação necessária'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Revisar meus dados</h1>
            <p className="mt-1 text-sm text-gray-500">
              Confira suas informações antes de acessar a árvore principal.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.4fr)_320px]">
        <form onSubmit={handleConfirm} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
            <Field label="Local de nascimento" error={errors.local_nascimento}>
              <Input
                value={String(form.local_nascimento ?? '')}
                onBlur={() => normalizeFieldOnBlur('local_nascimento')}
                onChange={(e) => updateTextField('local_nascimento', e.target.value)}
                placeholder="Cidade/UF"
                list="location-suggestions"
                aria-invalid={Boolean(errors.local_nascimento)}
              />
            </Field>
            <Field label="Residência atual" error={errors.local_atual}>
              <Input
                value={String(form.local_atual ?? '')}
                onBlur={() => normalizeFieldOnBlur('local_atual')}
                onChange={(e) => updateTextField('local_atual', e.target.value)}
                placeholder="Cidade/UF"
                list="location-suggestions"
                aria-invalid={Boolean(errors.local_atual)}
              />
            </Field>
            <datalist id="location-suggestions">
              {locationSuggestions.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
            <Field label="Telefone">
              <Input
                value={String(form.telefone ?? '')}
                onChange={(e) => updateTextField('telefone', e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
              />
            </Field>
            <Field label="Endereço">
              <Input
                ref={addressInputRef}
                value={String(form.endereco ?? '')}
                onChange={(e) => updateTextField('endereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade, CEP"
              />
            </Field>
            <Field label="Complemento">
              <Input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apartamento, bloco, casa, referência"
              />
              {/* Campo visual até public.pessoas.complemento existir no schema e na tipagem. */}
            </Field>
            <Field label="Rede social" error={errors.rede_social}>
              <select
                value={String(form.rede_social ?? '')}
                onChange={(event) => updateField('rede_social', event.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                aria-invalid={Boolean(errors.rede_social)}
              >
                <option value="">Selecione uma rede</option>
                {SOCIAL_NETWORKS.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Perfil da Rede Social" error={errors.instagram_usuario}>
              <Input
                value={String(form.instagram_usuario ?? '')}
                onChange={(e) => updateTextField('instagram_usuario', e.target.value)}
                placeholder={getSocialPlaceholder(String(form.rede_social ?? ''))}
                aria-invalid={Boolean(errors.instagram_usuario)}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Mini bio">
              <Textarea
                value={String(form.minibio ?? '')}
                onChange={(e) => updateTextField('minibio', e.target.value)}
                className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
              />
            </Field>
            <Field label="Curiosidades">
              <Textarea
                value={String(form.curiosidades ?? '')}
                onChange={(e) => updateTextField('curiosidades', e.target.value)}
                className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
              />
            </Field>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ToggleField
              label="Exibir rede social no perfil"
              checked={Boolean(form.permitir_exibir_instagram)}
              onCheckedChange={(checked) => updateField('permitir_exibir_instagram', checked)}
            />
            <ToggleField
              label="Permitir mensagens por WhatsApp"
              checked={Boolean(form.permitir_mensagens_whatsapp)}
              onCheckedChange={(checked) => updateField('permitir_mensagens_whatsapp', checked)}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={saving} className="sm:min-w-[220px]">
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Confirmar meus dados
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-3xl font-bold text-blue-700">
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt={previewName} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(previewName)}</span>
            )}
          </div>

          <h2 className="mt-4 whitespace-normal text-xl font-bold leading-snug text-gray-900">
            {previewName}
          </h2>
          <p className="mt-2 text-sm text-gray-500">{previewLocation}</p>

          <div className="mt-5 grid grid-cols-1 gap-2">
            <Button type="button" variant="outline" onClick={() => setPhotoDialogOpen(true)}>
              <Camera className="mr-2 h-4 w-4" />
              {currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}
            </Button>
            {currentPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Remover foto
              </Button>
            )}
          </div>

          {selectedPhoto && (
            <p className="mt-3 text-xs text-amber-700">
              Corte aplicado localmente. Ao confirmar, o app tentará enviar a foto ao Storage.
            </p>
          )}

          {alreadyConfirmed && (
            <Button variant="outline" className="mt-5 w-full" onClick={() => navigate('/')}>
              Acessar árvore
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </aside>
      </main>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}</DialogTitle>
            <DialogDescription>
              Selecione uma imagem, ajuste o corte quadrado e aplique antes de salvar.
            </DialogDescription>
          </DialogHeader>

          {cropImageUrl ? (
            <div className="space-y-4">
              <div className="relative h-72 overflow-hidden rounded-xl bg-gray-950">
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
                <UploadCloud className="mr-2 h-4 w-4" />
                Escolher outra imagem
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
                <UploadCloud className="mr-2 h-4 w-4" />
                Arraste uma imagem ou clique para selecionar
              </span>
              <span className="mt-1 text-xs text-gray-500">O corte final será quadrado.</span>
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
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="text-red-700 hover:bg-red-50">
                Remover foto
              </Button>
            )}
            {cropImageUrl ? (
              <Button type="button" onClick={handleApplyCrop}>
                Aplicar corte
              </Button>
            ) : (
              <Button type="button" onClick={() => setPhotoDialogOpen(false)}>
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
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
