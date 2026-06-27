import React, { useEffect, useMemo, useState } from 'react';
import { Heart, PawPrint, User, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pessoa, Relacionamento } from '../../types';
import { getRelationshipSubtitle } from '../../utils/personProfile';
import { isHumanFamilyMember, isPetFamilyMember } from '../../utils/personEntity';
import {
  getConjugalRelationshipStatus,
  getConjugalRelationshipStatusDescription,
  getConjugalRelationshipStatusLabel,
  getConjugalRelationshipSubtypeLabel,
  type ConjugalRelationshipStatus,
} from '../../utils/conjugalRelationshipStatus';
import { obterPessoaPorId, obterRelacionamentosDetalhadosDaPessoa } from '../../services/dataService';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

type SpouseRelationshipGroup = 'current' | 'previous' | 'historical';

type SpouseRelationshipItem = {
  person: Pessoa;
  relationship?: Relacionamento;
  status: ConjugalRelationshipStatus;
  statusLabel: string;
  statusDescription: string;
  subtypeLabel: string;
  group: SpouseRelationshipGroup;
};

function uniqueById(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function findConjugalRelationship(
  currentPersonId: string | undefined,
  spouseId: string,
  detailedRelationships: Relacionamento[]
) {
  if (!currentPersonId) return undefined;

  return detailedRelationships.find((relationship) => (
    relationship.tipo_relacionamento === 'conjuge' &&
    (
      relationship.pessoa_origem_id === currentPersonId && relationship.pessoa_destino_id === spouseId ||
      relationship.pessoa_origem_id === spouseId && relationship.pessoa_destino_id === currentPersonId
    )
  ));
}

function getSpouseRelationshipGroup(status: ConjugalRelationshipStatus): SpouseRelationshipGroup {
  if (status === 'active') return 'current';
  if (status === 'widowed' || status === 'historical') return 'historical';
  return 'previous';
}

function buildSpouseRelationshipItems({
  spouses,
  currentPerson,
  detailedRelationships,
}: {
  spouses: Pessoa[];
  currentPerson?: Pessoa;
  detailedRelationships: Relacionamento[];
}) {
  return spouses.map<SpouseRelationshipItem>((spouse) => {
    const relationship = findConjugalRelationship(currentPerson?.id, spouse.id, detailedRelationships);
    const status = getConjugalRelationshipStatus(relationship, currentPerson, spouse);

    return {
      person: spouse,
      relationship,
      status,
      statusLabel: getConjugalRelationshipStatusLabel(status),
      statusDescription: getConjugalRelationshipStatusDescription(status),
      subtypeLabel: getConjugalRelationshipSubtypeLabel(relationship),
      group: getSpouseRelationshipGroup(status),
    };
  });
}

function getSpouseRelationshipSubtitle(item: SpouseRelationshipItem) {
  if (item.status === 'active') return item.subtypeLabel;
  return item.statusLabel;
}

function PersonButton({
  person,
  label,
  description,
  treeReturnPath,
}: {
  person: Pessoa;
  label: string;
  description?: string;
  treeReturnPath?: string;
}) {
  const navigate = useNavigate();
  const isPet = person.humano_ou_pet === 'Pet';
  const profilePath = treeReturnPath
    ? `/pessoa/${person.id}?voltar=${encodeURIComponent(treeReturnPath)}`
    : `/pessoa/${person.id}`;

  return (
    <button
      type="button"
      onClick={() => navigate(profilePath, { flushSync: true })}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
      aria-label={`Abrir perfil de ${person.nome_completo}`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${isPet ? 'bg-amber-100' : 'bg-blue-50'}`}>
        {person.foto_principal_url ? (
          <img src={person.foto_principal_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className={`h-6 w-6 ${isPet ? 'text-amber-700' : 'text-blue-700'}`} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">{person.nome_completo}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{getRelationshipSubtitle(person) || label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-400">{description}</span>
        )}
      </span>
    </button>
  );
}

function SpouseRelationshipCard({
  title,
  description,
  items,
  treeReturnPath,
}: {
  title: string;
  description: string;
  items: SpouseRelationshipItem[];
  treeReturnPath?: string;
}) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <PersonButton
            key={`${item.person.id}-${item.status}`}
            person={item.person}
            label={getSpouseRelationshipSubtitle(item)}
            description={item.statusDescription}
            treeReturnPath={treeReturnPath}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function PersonRelationshipsView({
  relationships,
  loading = false,
  treeReturnPath,
}: {
  relationships: RelationshipGroups;
  loading?: boolean;
  treeReturnPath?: string;
}) {
  const { id: currentPersonId } = useParams<{ id: string }>();
  const [currentPerson, setCurrentPerson] = useState<Pessoa | undefined>();
  const [detailedRelationships, setDetailedRelationships] = useState<Relacionamento[]>([]);
  const [conjugalContextLoading, setConjugalContextLoading] = useState(false);
  const parents = uniqueById([...relationships.pais, ...relationships.maes]);
  const spouses = uniqueById(relationships.conjuges);
  const relatedChildren = uniqueById(relationships.filhos);
  const children = relatedChildren.filter(isHumanFamilyMember);
  const pets = relatedChildren.filter(isPetFamilyMember);
  const siblings = uniqueById(relationships.irmaos);

  useEffect(() => {
    let mounted = true;

    async function loadConjugalContext() {
      if (!currentPersonId || spouses.length === 0) {
        setCurrentPerson(undefined);
        setDetailedRelationships([]);
        setConjugalContextLoading(false);
        return;
      }

      setConjugalContextLoading(true);

      try {
        const [person, relationshipsData] = await Promise.all([
          obterPessoaPorId(currentPersonId),
          obterRelacionamentosDetalhadosDaPessoa(currentPersonId),
        ]);

        if (!mounted) return;

        setCurrentPerson(person);
        setDetailedRelationships(relationshipsData);
      } catch (error) {
        console.warn('Não foi possível carregar contexto conjugal do perfil.', error);

        if (mounted) {
          setCurrentPerson(undefined);
          setDetailedRelationships([]);
        }
      } finally {
        if (mounted) setConjugalContextLoading(false);
      }
    }

    loadConjugalContext();

    return () => {
      mounted = false;
    };
  }, [currentPersonId, spouses.length]);

  const spouseRelationshipItems = useMemo(
    () => buildSpouseRelationshipItems({ spouses, currentPerson, detailedRelationships }),
    [currentPerson, detailedRelationships, spouses]
  );
  const currentSpouses = spouseRelationshipItems.filter((item) => item.group === 'current');
  const previousSpouses = spouseRelationshipItems.filter((item) => item.group === 'previous');
  const historicalSpouses = spouseRelationshipItems.filter((item) => item.group === 'historical');

  if (loading || conjugalContextLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Carregando relacionamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {parents.length === 0 ? <p className="text-sm text-gray-500">Nenhum pai/mãe cadastrado</p> : parents.map((person) => <PersonButton key={person.id} person={person} label="Pai/Mãe" treeReturnPath={treeReturnPath} />)}
        </CardContent>
      </Card>

      <SpouseRelationshipCard
        title="Relacionamento atual"
        description="Vínculo conjugal vigente neste perfil."
        items={currentSpouses}
        treeReturnPath={treeReturnPath}
      />

      <SpouseRelationshipCard
        title="Relacionamentos anteriores"
        description="Vínculos encerrados, inativos, separados ou divorciados."
        items={previousSpouses}
        treeReturnPath={treeReturnPath}
      />

      <SpouseRelationshipCard
        title="Uniões históricas"
        description="Vínculos preservados por viuvez ou memória histórica da família."
        items={historicalSpouses}
        treeReturnPath={treeReturnPath}
      />

      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filhos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {children.map((person) => <PersonButton key={person.id} person={person} label="Filho(a)" treeReturnPath={treeReturnPath} />)}
          </CardContent>
        </Card>
      )}

      {pets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Pets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pets.map((person) => <PersonButton key={person.id} person={person} label="Pet da família" treeReturnPath={treeReturnPath} />)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Irmãos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {siblings.length === 0 ? <p className="text-sm text-gray-500">Nenhum irmão cadastrado</p> : siblings.map((person) => <PersonButton key={person.id} person={person} label="Irmão(ã)" treeReturnPath={treeReturnPath} />)}
        </CardContent>
      </Card>
    </div>
  );
}
