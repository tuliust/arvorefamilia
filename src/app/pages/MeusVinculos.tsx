import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, FileArchive, Heart, Plus, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { adicionarRelacionamento, obterRelacionamentosDaPessoa } from '../services/dataService';
import {
  confirmOwnLinkedPersonData,
  getPrimaryLinkedPersonWithPessoa,
  listLinkablePeople,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { ArquivoHistorico, Pessoa, SubtipoRelacionamento, TipoRelacionamento } from '../types';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

type RelationshipTypeOption = 'pai' | 'mae' | 'filho' | 'conjuge' | 'irmao';

const EMPTY_GROUPS: RelationshipGroups = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  irmaos: [],
};

const RELATIONSHIP_LABELS: Record<RelationshipTypeOption, string> = {
  pai: 'Pai',
  mae: 'Mãe',
  filho: 'Filho(a)',
  conjuge: 'Cônjuge',
  irmao: 'Irmão(ã)',
};

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function groupContains(groups: RelationshipGroups, type: RelationshipTypeOption, personId: string) {
  if (type === 'pai') return groups.pais.some((person) => person.id === personId);
  if (type === 'mae') return groups.maes.some((person) => person.id === personId);
  if (type === 'filho') return groups.filhos.some((person) => person.id === personId);
  if (type === 'conjuge') return groups.conjuges.some((person) => person.id === personId);
  return groups.irmaos.some((person) => person.id === personId);
}

function RelationSection({
  title,
  emptyLabel,
  people,
  typeLabel,
}: {
  title: string;
  emptyLabel: string;
  people: Pessoa[];
  typeLabel: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          já cadastrado
        </span>
      </div>

      {people.length === 0 ? (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {people.map((person) => (
            <div key={person.id} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{person.nome_completo}</p>
              <p className="text-xs text-gray-500">{typeLabel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MeusVinculos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [relationships, setRelationships] = useState<RelationshipGroups>(EMPTY_GROUPS);
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [relationshipType, setRelationshipType] = useState<RelationshipTypeOption>('pai');
  const [subtype, setSubtype] = useState<SubtipoRelacionamento>('sangue');
  const [parentGender, setParentGender] = useState<'pai' | 'mae'>('pai');
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRelationship, setSavingRelationship] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const pessoa = link?.pessoa;

  const selectablePeople = useMemo(
    () => people.filter((person) => person.id !== pessoa?.id),
    [people, pessoa?.id],
  );

  const selectedPerson = useMemo(
    () => selectablePeople.find((person) => person.id === selectedPersonId) ?? null,
    [selectablePeople, selectedPersonId],
  );

  const filteredPeople = useMemo(() => {
    const term = personSearch.trim().toLocaleLowerCase('pt-BR');
    if (!term) return selectablePeople.slice(0, 8);

    return selectablePeople
      .filter((person) => person.nome_completo.toLocaleLowerCase('pt-BR').includes(term))
      .slice(0, 8);
  }, [personSearch, selectablePeople]);

  async function reloadRelationships(pessoaId: string) {
    const nextRelationships = await obterRelacionamentosDaPessoa(pessoaId);
    setRelationships(nextRelationships);
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const [{ data, error }, linkablePeople] = await Promise.all([
        getPrimaryLinkedPersonWithPessoa(user.id),
        listLinkablePeople(),
      ]);

      if (!mounted) return;

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setLink(data);
      setArchives(data?.pessoa?.arquivos_historicos ?? []);
      setPeople(linkablePeople.data ?? []);

      if (data?.pessoa?.id) {
        await reloadRelationships(data.pessoa.id);
      }

      if (mounted) setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSelectPerson = (person: Pessoa) => {
    setSelectedPersonId(person.id);
    setPersonSearch(person.nome_completo);
  };

  const handleAddRelationship = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pessoa?.id || !selectedPerson) {
      toast.error('Selecione uma pessoa cadastrada.');
      return;
    }

    if (selectedPerson.id === pessoa.id) {
      toast.error('Não é possível vincular a pessoa com ela mesma.');
      return;
    }

    if (groupContains(relationships, relationshipType, selectedPerson.id)) {
      toast.warning('Este relacionamento já está cadastrado.');
      return;
    }

    setSavingRelationship(true);

    try {
      const created = await adicionarRelacionamento({
        pessoa_origem_id: pessoa.id,
        pessoa_destino_id: selectedPerson.id,
        tipo_relacionamento: relationshipType as TipoRelacionamento,
        subtipo_relacionamento: subtype,
      });

      if (!created) {
        throw new Error('Não foi possível criar o relacionamento.');
      }

      if (relationshipType === 'conjuge' || relationshipType === 'irmao') {
        await adicionarRelacionamento({
          pessoa_origem_id: selectedPerson.id,
          pessoa_destino_id: pessoa.id,
          tipo_relacionamento: relationshipType,
          subtipo_relacionamento: subtype,
        });
      }

      if (relationshipType === 'pai' || relationshipType === 'mae') {
        await adicionarRelacionamento({
          pessoa_origem_id: selectedPerson.id,
          pessoa_destino_id: pessoa.id,
          tipo_relacionamento: 'filho',
          subtipo_relacionamento: subtype,
        });
      }

      if (relationshipType === 'filho') {
        await adicionarRelacionamento({
          pessoa_origem_id: selectedPerson.id,
          pessoa_destino_id: pessoa.id,
          tipo_relacionamento: parentGender,
          subtipo_relacionamento: subtype,
        });
      }

      await reloadRelationships(pessoa.id);
      setSelectedPersonId('');
      setPersonSearch('');
      toast.success('Relacionamento adicionado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar relacionamento.');
    } finally {
      setSavingRelationship(false);
    }
  };

  const handleFinish = async () => {
    if (!link?.id || !pessoa?.id) {
      toast.error('Não foi possível localizar seu vínculo com a árvore.');
      return;
    }

    setFinishing(true);

    const { error: archiveError } = await updateOwnLinkedPerson(pessoa.id, {
      arquivos_historicos: archives,
    });

    if (archiveError) {
      setFinishing(false);
      toast.error(archiveError);
      return;
    }

    const { error: confirmError } = await confirmOwnLinkedPersonData(link.id);
    setFinishing(false);

    if (confirmError) {
      toast.error(confirmError);
      return;
    }

    toast.success('Vínculos confirmados.');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando seus vínculos...</p>
        </div>
      </div>
    );
  }

  if (!link || !pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Sua conta ainda não está vinculada a uma pessoa da árvore.</p>
            <Button className="mt-4" onClick={() => navigate('/entrar')}>
              Ir para autenticação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parents = uniquePeople([...relationships.pais, ...relationships.maes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-sm font-medium text-blue-700">Etapa final</p>
          <h1 className="text-2xl font-bold text-gray-900">Confirmar vínculos familiares</h1>
          <p className="mt-1 text-sm text-gray-500">Revise seus relacionamentos e arquivos antes de acessar a árvore.</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.25fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Relacionamentos cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RelationSection title="Pais" emptyLabel="Nenhum pai/mãe cadastrado" people={parents} typeLabel="Pai/Mãe" />
              <RelationSection title="Filhos" emptyLabel="Nenhum filho cadastrado" people={uniquePeople(relationships.filhos)} typeLabel="Filho(a)" />
              <RelationSection title="Cônjuge" emptyLabel="Nenhum cônjuge cadastrado" people={uniquePeople(relationships.conjuges)} typeLabel="Cônjuge" />
              <RelationSection title="Irmãos" emptyLabel="Nenhum irmão cadastrado" people={uniquePeople(relationships.irmaos)} typeLabel="Irmão(ã)" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar ou corrigir relacionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRelationship} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo-relacionamento">Tipo de relacionamento</Label>
                  <select
                    id="tipo-relacionamento"
                    value={relationshipType}
                    onChange={(event) => setRelationshipType(event.target.value as RelationshipTypeOption)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="filho">Filho(a)</option>
                    <option value="conjuge">Cônjuge</option>
                    <option value="irmao">Irmão(ã)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtipo-relacionamento">Subtipo</Label>
                  <select
                    id="subtipo-relacionamento"
                    value={subtype}
                    onChange={(event) => setSubtype(event.target.value as SubtipoRelacionamento)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {relationshipType === 'conjuge' ? (
                      <>
                        <option value="casamento">Casamento</option>
                        <option value="uniao">União estável</option>
                        <option value="separado">Separado</option>
                      </>
                    ) : (
                      <>
                        <option value="sangue">Sangue</option>
                        <option value="adotivo">Adotivo</option>
                      </>
                    )}
                  </select>
                </div>

                {relationshipType === 'filho' && (
                  <div className="space-y-2">
                    <Label htmlFor="parent-genero">{pessoa.nome_completo} é</Label>
                    <select
                      id="parent-genero"
                      value={parentGender}
                      onChange={(event) => setParentGender(event.target.value as 'pai' | 'mae')}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pessoa-relacionada">Pessoa relacionada</Label>
                  <Input
                    id="pessoa-relacionada"
                    value={personSearch}
                    onChange={(event) => {
                      setPersonSearch(event.target.value);
                      setSelectedPersonId('');
                    }}
                    placeholder="Digite para buscar uma pessoa cadastrada"
                  />
                  {personSearch && (
                    <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white">
                      {filteredPeople.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-gray-500">Nenhuma pessoa cadastrada encontrada.</p>
                      ) : (
                        filteredPeople.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => handleSelectPerson(person)}
                            className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                          >
                            <span>
                              <span className="block text-sm font-medium text-gray-900">{person.nome_completo}</span>
                              {person.data_nascimento && <span className="text-xs text-gray-500">{person.data_nascimento}</span>}
                            </span>
                            {selectedPersonId === person.id && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" disabled={savingRelationship || !selectedPerson}>
                    {savingRelationship ? 'Salvando...' : `Adicionar ${RELATIONSHIP_LABELS[relationshipType]}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div>
            <ArquivosHistoricos arquivos={archives} onChange={setArchives} />
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{pessoa.nome_completo}</h2>
              <p className="text-sm text-gray-500">Perfil vinculado à sua conta</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Confirmação</p>
            <p className="mt-1">Ao concluir, seus dados ficam marcados como confirmados e a árvore principal é liberada.</p>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <FileArchive className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>Arquivos adicionados aqui são salvos junto dos arquivos históricos da pessoa.</p>
          </div>

          <Button className="mt-5 w-full" onClick={handleFinish} disabled={finishing}>
            {finishing ? (
              'Finalizando...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Confirmar e acessar árvore
              </>
            )}
          </Button>
        </aside>
      </main>
    </div>
  );
}
