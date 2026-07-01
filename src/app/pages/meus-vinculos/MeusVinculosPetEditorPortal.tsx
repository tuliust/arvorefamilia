import React, { useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ImagePlus, PawPrint, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import {
  adicionarPessoa,
  atualizarPessoa,
  deletarPessoa,
  obterRelacionamentosDaPessoa,
} from '../../services/dataService';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
} from '../../services/memberProfileService';
import { createRelationshipChangeRequest } from '../../services/relationshipChangeRequestService';
import type { Pessoa, TipoRelacionamento } from '../../types';
import { maskBirthDate, normalizeBirthDate, normalizeLocationByMode } from '../../utils/personFields';

const PET_PHOTO_SIZE = 512;

type PetFormState = {
  id?: string;
  nome: string;
  raca: string;
  dataNascimento: string;
  localNascimento: string;
  falecido: boolean;
  dataFalecimento: string;
  localFalecimento: string;
  fotoPrincipalUrl: string;
  outroTutorId: string;
};

type RelationshipGroups = {
  pets?: Pessoa[];
  conjuges?: Pessoa[];
};

const BREED_PREFIX = 'Raça:';

const emptyPetForm: PetFormState = {
  nome: '',
  raca: '',
  dataNascimento: '',
  localNascimento: '',
  falecido: false,
  dataFalecimento: '',
  localFalecimento: '',
  fotoPrincipalUrl: '',
  outroTutorId: '',
};

function normalizeText(value?: string | number | null) {
  return String(value ?? '').trim();
}

function normalizeDateInput(value: string) {
  return normalizeBirthDate(normalizeText(value));
}

function maskDateInput(value: string) {
  return maskBirthDate(value);
}

function normalizeCityStateInput(value: string) {
  return normalizeLocationByMode(value, { international: false });
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

async function createPersistablePhotoSource(file: File) {
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

async function createCroppedPhotoDataUrl(imageSrc: string, cropPixels: Area) {
  const image = await readImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Não foi possível preparar o corte da imagem.');
  }

  canvas.width = PET_PHOTO_SIZE;
  canvas.height = PET_PHOTO_SIZE;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    PET_PHOTO_SIZE,
    PET_PHOTO_SIZE,
  );

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar a imagem final.'));
        return;
      }

      blobToDataUrl(blob).then(resolve).catch(reject);
    }, 'image/jpeg', 0.9);
  });
}

function getTutorRelationshipType(tutor?: Pessoa | null): TipoRelacionamento {
  const gender = String(tutor?.genero ?? '').trim().toLowerCase();

  if (['mulher', 'feminino', 'female', 'feminina', 'woman'].includes(gender)) {
    return 'mae';
  }

  return 'pai';
}

function extractBreedFromCuriosities(value?: string | null) {
  const lines = String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const breedLine = lines.find((line) => /^ra[çc]a\s*:/i.test(line));
  return breedLine?.replace(/^ra[çc]a\s*:/i, '').trim() ?? '';
}

function mergeBreedIntoCuriosities(current: string | undefined | null, breed: string) {
  const otherLines = String(current ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^ra[çc]a\s*:/i.test(line));

  const breedLine = breed.trim() ? [`${BREED_PREFIX} ${breed.trim()}`] : [];
  return [...breedLine, ...otherLines].join('\n') || undefined;
}

function petToForm(pet: Pessoa): PetFormState {
  return {
    id: pet.id,
    nome: normalizeText(pet.nome_completo),
    raca: extractBreedFromCuriosities(pet.curiosidades),
    dataNascimento: normalizeText(pet.data_nascimento),
    localNascimento: normalizeText(pet.local_nascimento),
    falecido: pet.falecido === true || Boolean(normalizeText(pet.data_falecimento)),
    dataFalecimento: normalizeText(pet.data_falecimento),
    localFalecimento: normalizeText(pet.local_falecimento),
    fotoPrincipalUrl: normalizeText(pet.foto_principal_url),
    outroTutorId: '',
  };
}

function buildPetPayload(form: PetFormState, previousPet?: Pessoa | null): Omit<Pessoa, 'id'> {
  return {
    nome_completo: form.nome.trim(),
    data_nascimento: normalizeDateInput(form.dataNascimento) || undefined,
    local_nascimento: normalizeCityStateInput(form.localNascimento) || undefined,
    data_falecimento: form.falecido ? normalizeDateInput(form.dataFalecimento) || null : null,
    local_falecimento: form.falecido ? normalizeCityStateInput(form.localFalecimento) || undefined : undefined,
    falecido: form.falecido,
    humano_ou_pet: 'Pet',
    genero: 'pet',
    foto_principal_url: normalizeText(form.fotoPrincipalUrl) || undefined,
    curiosidades: mergeBreedIntoCuriosities(previousPet?.curiosidades, form.raca),
  };
}

function getPetMeta(pet: Pessoa) {
  return [
    extractBreedFromCuriosities(pet.curiosidades),
    pet.data_nascimento ? `Nascimento: ${pet.data_nascimento}` : '',
    pet.local_nascimento ? `Local: ${pet.local_nascimento}` : '',
    pet.data_falecimento ? `Falecimento: ${pet.data_falecimento}` : '',
    pet.local_falecimento ? `Local de falecimento: ${pet.local_falecimento}` : '',
    pet.falecido || pet.data_falecimento ? 'Falecido' : '',
  ].filter(Boolean);
}

async function createPetTutorRequest(args: {
  pet: Pessoa;
  ownPerson: Pessoa;
  tutor: Pessoa;
  otherTutorId?: string | null;
}) {
  const { pet, ownPerson, tutor, otherTutorId } = args;

  return createRelationshipChangeRequest({
    requester_pessoa_id: ownPerson.id,
    action: 'create',
    target_pessoa_id: pet.id,
    related_pessoa_id: tutor.id,
    relationship_type: getTutorRelationshipType(tutor),
    relationship_subtype: 'adotivo',
    details: {
      ativo: true,
      relationshipGroup: 'pets',
      otherParentId: otherTutorId ?? null,
    },
  });
}

function notifyPetSaved(pet: Pessoa, action: 'created' | 'updated') {
  window.dispatchEvent(new CustomEvent('meus-vinculos:pet-saved', {
    detail: {
      pet: { ...pet, humano_ou_pet: 'Pet' },
      action,
    },
  }));
}

function MeusVinculosPetEditorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [ownPerson, setOwnPerson] = useState<Pessoa | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [pets, setPets] = useState<Pessoa[]>([]);
  const [spouses, setSpouses] = useState<Pessoa[]>([]);
  const [form, setForm] = useState<PetFormState>(emptyPetForm);
  const [photoCropSource, setPhotoCropSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedPet = useMemo(
    () => form.id ? pets.find((pet) => pet.id === form.id) ?? null : null,
    [form.id, pets],
  );

  async function loadData() {
    if (!user) return;

    setLoading(true);

    try {
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (error || !data?.pessoa) {
        throw new Error(error || 'Não foi possível carregar seu perfil vinculado.');
      }

      const groups = await obterRelacionamentosDaPessoa(data.pessoa.id) as RelationshipGroups;

      setOwnPerson(data.pessoa);
      setCanEdit(data.can_edit !== false);
      setPets(Array.isArray(groups.pets) ? groups.pets : []);
      setSpouses(Array.isArray(groups.conjuges) ? groups.conjuges : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os pets.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void loadData();
  }, [open, user?.id]);

  function updateForm<Key extends keyof PetFormState>(field: Key, value: PetFormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetPhotoCrop() {
    setPhotoCropSource(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  function resetForm() {
    setForm(emptyPetForm);
    resetPhotoCrop();
  }

  function selectPetForEditing(pet: Pessoa) {
    setForm(petToForm(pet));
    resetPhotoCrop();
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    try {
      const dataUrl = await createPersistablePhotoSource(file);
      setPhotoCropSource(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a foto.');
    }
  }

  async function handleApplyCrop() {
    if (!photoCropSource || !croppedAreaPixels) {
      toast.error('Selecione e ajuste uma imagem antes de aplicar.');
      return;
    }

    try {
      const croppedDataUrl = await createCroppedPhotoDataUrl(photoCropSource, croppedAreaPixels);
      updateForm('fotoPrincipalUrl', croppedDataUrl);
      resetPhotoCrop();
      toast.success('Corte aplicado à foto do pet.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível aplicar o corte.');
    }
  }

  function handleRemovePhoto() {
    updateForm('fotoPrincipalUrl', '');
    resetPhotoCrop();
  }

  function updateDateField(field: 'dataNascimento' | 'dataFalecimento', value: string) {
    updateForm(field, maskDateInput(value));
  }

  function normalizeDateField(field: 'dataNascimento' | 'dataFalecimento') {
    updateForm(field, normalizeDateInput(form[field]));
  }

  function normalizeLocationField(field: 'localNascimento' | 'localFalecimento') {
    updateForm(field, normalizeCityStateInput(form[field]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ownPerson) {
      toast.error('Não foi possível identificar seu perfil vinculado.');
      return;
    }

    if (!canEdit) {
      toast.error('Seu vínculo atual não permite editar estes dados.');
      return;
    }

    if (!form.nome.trim()) {
      toast.error('Informe o nome do pet.');
      return;
    }

    setSaving(true);

    try {
      const normalizedForm: PetFormState = {
        ...form,
        dataNascimento: normalizeDateInput(form.dataNascimento),
        localNascimento: normalizeCityStateInput(form.localNascimento),
        dataFalecimento: form.falecido ? normalizeDateInput(form.dataFalecimento) : '',
        localFalecimento: form.falecido ? normalizeCityStateInput(form.localFalecimento) : '',
      };
      const payload = buildPetPayload(normalizedForm, selectedPet);

      if (form.id) {
        const updatedPet = await atualizarPessoa(form.id, payload);
        if (!updatedPet) throw new Error('Não foi possível atualizar o pet.');

        setPets((current) => current.map((pet) => pet.id === updatedPet.id ? updatedPet : pet));
        notifyPetSaved(updatedPet, 'updated');
        toast.success('Pet atualizado.');
        resetForm();
        onOpenChange(false);
        return;
      }

      const createdPet = await adicionarPessoa(payload);

      if (!createdPet) {
        throw new Error('Não foi possível cadastrar o pet.');
      }

      try {
        await createPetTutorRequest({
          pet: createdPet,
          ownPerson,
          tutor: ownPerson,
          otherTutorId: form.outroTutorId || null,
        });

        const otherTutor = spouses.find((spouse) => spouse.id === form.outroTutorId);
        if (otherTutor) {
          await createPetTutorRequest({
            pet: createdPet,
            ownPerson,
            tutor: otherTutor,
            otherTutorId: ownPerson.id,
          });
        }
      } catch (requestError) {
        await deletarPessoa(createdPet.id).catch(() => false);
        throw requestError;
      }

      setPets((current) => [...current, createdPet]);
      notifyPetSaved(createdPet, 'created');
      toast.success('Pet cadastrado. O vínculo com tutor ficará em análise antes de aparecer definitivamente na árvore.');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o pet.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <PawPrint className="h-5 w-5" />
            </span>
            {form.id ? 'Editar pet' : 'Adicionar pet'}
          </DialogTitle>
          <DialogDescription>
            Cadastre pets com nome, nascimento, raça, local, falecimento e foto.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Carregando pets...
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
            <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="meus-vinculos-pet-nome">Nome do pet</Label>
                <Input
                  id="meus-vinculos-pet-nome"
                  value={form.nome}
                  onChange={(event) => updateForm('nome', event.target.value)}
                  placeholder="Ex: Bob, Mel, Thor..."
                  disabled={!canEdit || saving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Foto do pet</Label>
                <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
                  {photoCropSource ? (
                    <>
                      <div className="relative h-64 overflow-hidden rounded-xl bg-gray-950 sm:h-72">
                        <Cropper
                          image={photoCropSource}
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
                        <Label htmlFor="meus-vinculos-pet-zoom">Zoom</Label>
                        <input
                          id="meus-vinculos-pet-zoom"
                          type="range"
                          min={1}
                          max={3}
                          step={0.01}
                          value={zoom}
                          onChange={(event) => setZoom(Number(event.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex cursor-pointer items-center text-sm font-medium text-blue-700 hover:text-blue-800">
                          <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                          Escolher outra imagem
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handlePhotoChange}
                            disabled={!canEdit || saving}
                          />
                        </label>
                        <Button type="button" onClick={handleApplyCrop} disabled={!canEdit || saving} className="w-full sm:w-auto">
                          Aplicar corte
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                        {form.fotoPrincipalUrl ? (
                          <img src={form.fotoPrincipalUrl} alt={form.nome || 'Foto do pet'} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus className="h-6 w-6" />
                        )}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                          <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                          Escolher foto
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handlePhotoChange}
                            disabled={!canEdit || saving}
                          />
                        </label>
                        {form.fotoPrincipalUrl && (
                          <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="w-full justify-center text-red-700 hover:bg-red-50" disabled={saving}>
                            <Trash2 className="h-4 w-4" />
                            Remover foto
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meus-vinculos-pet-nascimento">Data de nascimento</Label>
                <Input
                  id="meus-vinculos-pet-nascimento"
                  value={form.dataNascimento}
                  onChange={(event) => updateDateField('dataNascimento', event.target.value)}
                  onBlur={() => normalizeDateField('dataNascimento')}
                  placeholder="DD/MM/AAAA ou AAAA"
                  disabled={!canEdit || saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meus-vinculos-pet-raca">Raça</Label>
                <Input
                  id="meus-vinculos-pet-raca"
                  value={form.raca}
                  onChange={(event) => updateForm('raca', event.target.value)}
                  placeholder="Ex: SRD, Poodle, Siamês"
                  disabled={!canEdit || saving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="meus-vinculos-pet-local-nascimento">Local de nascimento</Label>
                <Input
                  id="meus-vinculos-pet-local-nascimento"
                  value={form.localNascimento}
                  onChange={(event) => updateForm('localNascimento', event.target.value)}
                  onBlur={() => normalizeLocationField('localNascimento')}
                  placeholder="Cidade/UF"
                  disabled={!canEdit || saving}
                />
              </div>

              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.falecido}
                  onChange={(event) => updateForm('falecido', event.target.checked)}
                  disabled={!canEdit || saving}
                />
                Pet falecido
              </label>

              {form.falecido && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="meus-vinculos-pet-falecimento">Data de falecimento</Label>
                    <Input
                      id="meus-vinculos-pet-falecimento"
                      value={form.dataFalecimento}
                      onChange={(event) => updateDateField('dataFalecimento', event.target.value)}
                      onBlur={() => normalizeDateField('dataFalecimento')}
                      placeholder="DD/MM/AAAA ou AAAA"
                      disabled={!canEdit || saving}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="meus-vinculos-pet-local-falecimento">Local de falecimento</Label>
                    <Input
                      id="meus-vinculos-pet-local-falecimento"
                      value={form.localFalecimento}
                      onChange={(event) => updateForm('localFalecimento', event.target.value)}
                      onBlur={() => normalizeLocationField('localFalecimento')}
                      placeholder="Cidade/UF"
                      disabled={!canEdit || saving}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                <Button type="submit" disabled={!canEdit || saving} className="w-full sm:w-auto">
                  {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {saving ? 'Salvando...' : form.id ? 'Salvar pet' : 'Cadastrar pet'}
                </Button>
                {form.id && (
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto" disabled={saving}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </form>

            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Pets cadastrados</p>

              {pets.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                  Nenhum pet cadastrado ainda.
                </p>
              ) : (
                pets.map((pet) => {
                  const meta = getPetMeta(pet);

                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => selectPetForEditing(pet)}
                      className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                      disabled={saving}
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                        {pet.foto_principal_url ? (
                          <img src={pet.foto_principal_url} alt={pet.nome_completo} className="h-full w-full object-cover" />
                        ) : (
                          <PawPrint className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-semibold text-gray-950">{pet.nome_completo}</span>
                        <span className="mt-1 block break-words text-xs text-gray-600">
                          {meta.length > 0 ? meta.join(' · ') : 'Clique para editar'}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MeusVinculosPetEditorPortal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenPetModal = () => setOpen(true);
    window.addEventListener('meus-vinculos:open-pet-modal', handleOpenPetModal);

    return () => {
      window.removeEventListener('meus-vinculos:open-pet-modal', handleOpenPetModal);
    };
  }, []);

  return <MeusVinculosPetEditorDialog open={open} onOpenChange={setOpen} />;
}
