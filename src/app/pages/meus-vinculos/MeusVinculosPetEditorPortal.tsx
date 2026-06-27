import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, PawPrint, Pencil, Plus, RefreshCcw } from 'lucide-react';
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

type PetFormState = {
  id?: string;
  nome: string;
  raca: string;
  dataNascimento: string;
  localNascimento: string;
  falecido: boolean;
  dataFalecimento: string;
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
  fotoPrincipalUrl: '',
  outroTutorId: '',
};

function normalizeText(value?: string | number | null) {
  return String(value ?? '').trim();
}

function normalizeDateInput(value: string) {
  const trimmed = normalizeText(value);
  if (!trimmed) return '';

  const yearOnly = trimmed.match(/^(18|19|20|21)\d{2}$/);
  if (yearOnly) return trimmed;

  const brDate = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/((18|19|20|21)\d{2})$/);
  if (brDate) {
    return `${brDate[1].padStart(2, '0')}/${brDate[2].padStart(2, '0')}/${brDate[3]}`;
  }

  return trimmed;
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
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
    fotoPrincipalUrl: normalizeText(pet.foto_principal_url),
    outroTutorId: '',
  };
}

function buildPetPayload(form: PetFormState, previousPet?: Pessoa | null): Omit<Pessoa, 'id'> {
  return {
    nome_completo: form.nome.trim(),
    data_nascimento: normalizeDateInput(form.dataNascimento) || undefined,
    local_nascimento: normalizeText(form.localNascimento) || undefined,
    data_falecimento: form.falecido ? normalizeDateInput(form.dataFalecimento) || null : null,
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

function MeusVinculosPetEditorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [ownPerson, setOwnPerson] = useState<Pessoa | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [pets, setPets] = useState<Pessoa[]>([]);
  const [spouses, setSpouses] = useState<Pessoa[]>([]);
  const [form, setForm] = useState<PetFormState>(emptyPetForm);
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

  function resetForm() {
    setForm(emptyPetForm);
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      updateForm('fotoPrincipalUrl', dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a foto.');
    }
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
      const payload = buildPetPayload(form, selectedPet);

      if (form.id) {
        const updatedPet = await atualizarPessoa(form.id, payload);
        if (!updatedPet) throw new Error('Não foi possível atualizar o pet.');

        setPets((current) => current.map((pet) => pet.id === updatedPet.id ? updatedPet : pet));
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <PawPrint className="h-5 w-5" />
            </span>
            Adicionar pet
          </DialogTitle>
          <DialogDescription>
            Cadastre pets com nome, nascimento, raça, local, falecimento e foto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={() => void loadData()} disabled={loading || saving}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

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
                <Label htmlFor="meus-vinculos-pet-foto">Foto do pet</Label>
                <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    {form.fotoPrincipalUrl ? (
                      <img src={form.fotoPrincipalUrl} alt={form.nome || 'Foto do pet'} className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                  </span>
                  <Input
                    id="meus-vinculos-pet-foto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={!canEdit || saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meus-vinculos-pet-nascimento">Data de nascimento</Label>
                <Input
                  id="meus-vinculos-pet-nascimento"
                  value={form.dataNascimento}
                  onChange={(event) => updateForm('dataNascimento', event.target.value)}
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
                  placeholder="Cidade/UF ou cidade/país"
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
                <div className="space-y-2">
                  <Label htmlFor="meus-vinculos-pet-falecimento">Data de falecimento</Label>
                  <Input
                    id="meus-vinculos-pet-falecimento"
                    value={form.dataFalecimento}
                    onChange={(event) => updateForm('dataFalecimento', event.target.value)}
                    placeholder="DD/MM/AAAA ou AAAA"
                    disabled={!canEdit || saving}
                  />
                </div>
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
                      onClick={() => setForm(petToForm(pet))}
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
