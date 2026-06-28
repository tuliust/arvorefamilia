import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { AppLink as Link } from '../components/AppLink';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  obterPessoaPorId,
  obterRelacionamentosDaPessoa,
  obterRelacionamentosDetalhadosDaPessoa,
  obterTodasPessoas,
  obterTodosRelacionamentos,
} from '../services/dataService';
import {
  listarArquivosHistoricosDoRelacionamento,
  listarArquivosHistoricosPorPessoa,
} from '../services/arquivosHistoricosService';
import { listarEventosDaPessoa } from '../services/personEventsService';
import { listarPessoaSocialProfiles } from '../services/pessoaSocialProfilesService';
import { getProfileQuestionnaireSelectedBadges } from '../services/profileQuestionnaireService';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import { listarTopicosForum } from '../services/forumService';
import { ArquivoHistorico, ForumTopico, Pessoa, PessoaSocialProfile, PersonEvent, Relacionamento } from '../types';
import type { ProfileQuestionnaireSelectableOption } from '../types/profileQuestionnaire';
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Pencil,
  Plus,
  Star,
  UserCircle2,
} from 'lucide-react';
import { PersonDataView } from '../components/person/PersonDataView';
import { PersonRelationshipsView } from '../components/person/PersonRelationshipsView';
import { RelationshipFinder } from '../components/person/RelationshipFinder';
import { PersonEventsList } from '../components/person/PersonEventsList';
import { useAuth } from '../contexts/AuthContext';
import { canEditLinkedPersonRecord, canEditPerson, getLinkedPessoaIdForUser, isAdminUser } from '../services/permissionService';
import { getCachedTreeData } from '../services/treeDataCache';
import { ForumEmptyState } from '../components/forum/ForumEmptyState';
import { PersonTimeline } from '../components/Timeline/PersonTimeline';
import { FavoriteButton } from '../components/favorites/FavoriteButton';
import { MemberPageHeader, type HeaderAction } from '../components/layout/MemberPageHeader';
import { buildPersonTimeline } from '../utils/buildPersonTimeline';
import { getLinkedPersonWithPessoa } from '../services/memberProfileService';

const TREE_RETURN_FALLBACK_PATH = '/mapa-familiar';
const ALLOWED_TREE_RETURN_PATHS = ['/', '/mapa-familiar', '/mapa-familiar-horizontal'];

function getSafeTreeReturnPath(rawReturnPath?: string | null) {
  const cleanReturnPath = rawReturnPath?.trim();

  if (!cleanReturnPath) {
    return TREE_RETURN_FALLBACK_PATH;
  }

  try {
    const decodedReturnPath = decodeURIComponent(cleanReturnPath);
    const isInternalPath = decodedReturnPath.startsWith('/') && !decodedReturnPath.startsWith('//');
    const isAllowedTreePath = ALLOWED_TREE_RETURN_PATHS.some(
      (path) => decodedReturnPath === path || decodedReturnPath.startsWith(`${path}?`)
    );

    return isInternalPath && isAllowedTreePath ? decodedReturnPath : TREE_RETURN_FALLBACK_PATH;
  } catch {
    return TREE_RETURN_FALLBACK_PATH;
  }
}

type ProfileRelationships = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

const EMPTY_RELATIONSHIPS: ProfileRelationships = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  irmaos: [],
};

export function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [pessoa, setPessoa] = useState<Pessoa | undefined>();
  const [relacionamentos, setRelacionamentos] = useState<ProfileRelationships>(EMPTY_RELATIONSHIPS);
  const [loading, setLoading] = useState(true);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [forumTopicos, setForumTopicos] = useState<ForumTopico[]>([]);
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<PessoaSocialProfile[]>([]);
  const [profileBadges, setProfileBadges] = useState<ProfileQuestionnaireSelectableOption[]>([]);
  const [rawRelationships, setRawRelationships] = useState<Relacionamento[]>([]);
  const [relationshipHistoricalFiles, setRelationshipHistoricalFiles] = useState<ArquivoHistorico[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [linkedPessoaId, setLinkedPessoaId] = useState<string | null>(null);
  const [currentPersonCanEditLink, setCurrentPersonCanEditLink] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allPeople, setAllPeople] = useState<Pessoa[]>([]);
  const [allRelationships, setAllRelationships] = useState<Relacionamento[]>([]);
  const [relationshipDegreeContextComplete, setRelationshipDegreeContextComplete] = useState(false);
  const canEdit = useMemo(
    () => canEditPerson({ currentUser: user, pessoaId: id, linkedPessoaId, isAdmin }) || currentPersonCanEditLink,
    [id, linkedPessoaId, user, isAdmin, currentPersonCanEditLink],
  );
  const treeReturnPath = useMemo(
    () => getSafeTreeReturnPath(searchParams.get('voltar')),
    [searchParams]
  );
  const profileHeaderActions = useMemo<HeaderAction[]>(
    () => [
      { label: 'Voltar para árvore', to: treeReturnPath, icon: ArrowLeft, responsiveLabel: 'lg' },
      { label: 'Favoritos', to: '/meus-favoritos', icon: Star, responsiveLabel: 'xl' },
      { label: 'Notificações', to: '/notificacoes', icon: Bell, responsiveLabel: 'xl' },
    ],
    [treeReturnPath]
  );
  const timelineItems = useMemo(() => {
    if (!pessoa) return [];

    return buildPersonTimeline({
      pessoa,
      relacionamentos: rawRelationships,
      pessoas: allPeople.length > 0 ? allPeople : [pessoa],
      filhos: relacionamentos.filhos,
      arquivosHistoricosPessoa: pessoa.arquivos_historicos ?? [],
      arquivosHistoricosRelacionamentos: relationshipHistoricalFiles,
      eventosPessoais: personEvents,
    });
  }, [allPeople, pessoa, personEvents, rawRelationships, relationshipHistoricalFiles, relacionamentos.filhos]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.debug('[profile-navigation] PersonProfile route mounted/updated', {
      id,
      pathname: window.location.pathname,
    });
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadPerson() {
      if (!id) return;

      setLoading(true);
      setPessoa(undefined);
      setPersonEvents([]);
      setSocialProfiles([]);
      setProfileBadges([]);
      setRelacionamentos(EMPTY_RELATIONSHIPS);
      setRawRelationships([]);
      setRelationshipHistoricalFiles([]);
      setRelationshipsLoading(false);
      const pessoaData = await obterPessoaPorId(id);
      const [arquivosHistoricos, eventosDaPessoa, socialProfileRows, questionnaireBadgesResult] = pessoaData
        ? await Promise.all([
          listarArquivosHistoricosPorPessoa(pessoaData.id),
          listarEventosDaPessoa(pessoaData.id),
          listarPessoaSocialProfiles(pessoaData.id, { onlyVisible: true }).catch(() => []),
          getProfileQuestionnaireSelectedBadges(pessoaData.id).catch(() => ({ data: [] })),
        ])
        : [[], [], [], { data: [] }];

      if (!mounted) return;

      setPessoa(pessoaData ? { ...pessoaData, arquivos_historicos: arquivosHistoricos } : undefined);
      setPersonEvents(eventosDaPessoa);
      setSocialProfiles(socialProfileRows);
      setProfileBadges(questionnaireBadgesResult.data);
      setLoading(false);
    }

    loadPerson();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadPermissionContext() {
      if (!user) {
        setLinkedPessoaId(null);
        setCurrentPersonCanEditLink(false);
        setIsAdmin(false);
        return;
      }

      const [{ data }, adminResult, targetLinkResult] = await Promise.all([
        getLinkedPessoaIdForUser(user.id),
        isAdminUser(user),
        id ? getLinkedPersonWithPessoa(user.id, id) : Promise.resolve({ error: undefined, data: null }),
      ]);

      if (mounted) {
        setLinkedPessoaId(data);
        setIsAdmin(adminResult.isAdmin);
        setCurrentPersonCanEditLink(canEditLinkedPersonRecord(targetLinkResult.data));
      }
    }

    loadPermissionContext();

    return () => {
      mounted = false;
    };
  }, [id, user]);


  useEffect(() => {
    let mounted = true;

    async function loadRelationships() {
      if (!id || pessoa?.id !== id) return;

      setRelationshipsLoading(true);
      try {
        const [rels, detailedRelationships] = await Promise.all([
          obterRelacionamentosDaPessoa(id),
          obterRelacionamentosDetalhadosDaPessoa(id),
        ]);
        let relationshipFiles: ArquivoHistorico[] = [];

        const uniqueConjugalRelationshipIds = Array.from(
          new Set(
            detailedRelationships
              .filter((rel) => rel.tipo_relacionamento === 'conjuge')
              .map((rel) => rel.id)
              .filter(Boolean)
          )
        );

        const filesByRelationship = await Promise.all(
          uniqueConjugalRelationshipIds.map(async (relationshipId) => {
            try {
              return await listarArquivosHistoricosDoRelacionamento(relationshipId);
            } catch (error) {
              console.warn('Não foi possível carregar arquivos históricos de um relacionamento da timeline.', error);
              return [];
            }
          })
        );

        relationshipFiles = filesByRelationship.flat();

        if (!mounted) return;

        setRelacionamentos(rels);
        setRawRelationships(detailedRelationships);
        setRelationshipHistoricalFiles(relationshipFiles);
      } catch (error) {
        console.warn('Não foi possível carregar relacionamentos para o perfil.', error);
        if (mounted) {
          setRelacionamentos(EMPTY_RELATIONSHIPS);
          setRawRelationships([]);
          setRelationshipHistoricalFiles([]);
        }
      } finally {
        if (mounted) setRelationshipsLoading(false);
      }
    }

    loadRelationships();

    return () => {
      mounted = false;
    };
  }, [id, pessoa]);

  const handleEditProfile = () => {
    navigate(isAdmin ? `/admin/pessoas/${id}` : '/meus-dados');
  };


  useEffect(() => {
    let mounted = true;

    async function loadRelationshipDegreeContext() {
      try {
        const cachedTreeData = getCachedTreeData();

        if (cachedTreeData) {
          if (mounted) {
            setAllPeople(cachedTreeData.pessoas);
            setAllRelationships(cachedTreeData.relacionamentos);
            setRelationshipDegreeContextComplete(true);
          }
          return;
        }

        const [pessoasResult, relacionamentosResult] = await Promise.allSettled([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
        ]);

        if (!mounted) return;

        setAllPeople(pessoasResult.status === 'fulfilled' ? pessoasResult.value : []);
        setAllRelationships(relacionamentosResult.status === 'fulfilled' ? relacionamentosResult.value : []);
        setRelationshipDegreeContextComplete(relacionamentosResult.status === 'fulfilled');
      } catch (error) {
        console.error('Erro ao carregar contexto para parentesco:', error);
        if (mounted) {
          setAllPeople([]);
          setAllRelationships([]);
          setRelationshipDegreeContextComplete(false);
        }
      }
    }

    loadRelationshipDegreeContext();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadForumDiscussions() {
      if (!id || !user) {
        setForumTopicos([]);
        setForumLoading(false);
        return;
      }

      setForumLoading(true);
      const topicos = await listarTopicosForum({ pessoaRelacionadaId: id, limite: 6 });

      if (!mounted) return;

      setForumTopicos(topicos);
      setForumLoading(false);
    }

    loadForumDiscussions();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  if (!id) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Pessoa não encontrada</p>
            <Button onClick={() => navigate(treeReturnPath)} className="mt-4 w-full">
              Voltar para a árvore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relationshipFinderRelationships = relationshipDegreeContextComplete ? allRelationships : rawRelationships;
  const relationshipFinderScopeNotice = relationshipDegreeContextComplete
    ? undefined
    : 'O cálculo usará apenas os vínculos já carregados nesta tela enquanto a base completa visível não estiver disponível.';

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title={pessoa.nome_completo}
        subtitle="Perfil individual da árvore familiar"
        icon={UserCircle2}
        actions={profileHeaderActions}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-2 py-6 sm:px-4 sm:py-8 lg:px-5 xl:px-6">
        <PersonDataView
          pessoa={pessoa}
          socialProfiles={socialProfiles}
          profileBadges={profileBadges}
          afterOverviewContent={(
            <RelationshipFinder
              pessoaBase={pessoa}
              linkedPessoaId={linkedPessoaId}
              pessoas={allPeople.length > 0 ? allPeople : [pessoa]}
              relacionamentos={relationshipFinderRelationships}
              dataScopeNotice={relationshipFinderScopeNotice}
            />
          )}
          afterGeneratedInsightsContent={(
            <PersonRelationshipsView
              relationships={relacionamentos}
              loading={relationshipsLoading}
              treeReturnPath={treeReturnPath}
            />
          )}
          sideContent={<PersonTimeline items={timelineItems} isAdmin={isAdmin} />}
          headerAction={(
            <div className="flex items-center gap-2">
              <FavoriteButton
                entityType="person"
                entityId={pessoa.id}
                label={pessoa.nome_completo}
                description="Perfil individual da árvore familiar"
                href={`/pessoa/${pessoa.id}`}
                metadata={{ source: 'person_profile' }}
                variant="icon"
                size="sm"
                className="shadow-sm"
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  aria-label="Editar perfil"
                  title="Editar perfil"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />

        <PersonEventsList eventos={personEvents} />

        {user && (
          <section>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="flex min-w-0 items-center gap-2 break-words text-lg font-semibold text-gray-900">
                      <MessageCircle className="h-5 w-5 shrink-0 text-blue-600" />
                      <span className="min-w-0 break-words">Discussões relacionadas</span>
                    </h2>
                    <p className="mt-1 break-words text-sm text-gray-500">
                      Tópicos do fórum ligados a esta pessoa da árvore.
                    </p>
                  </div>

                  <Link to={`/forum/novo?pessoaId=${pessoa.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Criar discussão sobre esta pessoa
                    </Button>
                  </Link>
                </div>

                <div className="mt-5">
                  {forumLoading ? (
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Carregando discussões...</p>
                  ) : forumTopicos.length === 0 ? (
                    <ForumEmptyState
                      titulo="Nenhuma discussão relacionada"
                      descricao="Ainda não há tópicos do fórum vinculados a esta pessoa."
                      actionLabel="Criar discussão"
                      onAction={() => navigate(`/forum/novo?pessoaId=${pessoa.id}`)}
                    />
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                      {forumTopicos.map((topico) => (
                        <Link
                          key={topico.id}
                          to={`/forum/topico/${topico.id}`}
                          className="block p-4 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="break-words font-semibold text-gray-900">{topico.titulo}</h3>
                              <p className="mt-1 line-clamp-2 break-words text-sm text-gray-500">{topico.conteudo}</p>
                            </div>
                            <span className="shrink-0 self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {topico.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {pessoa.arquivos_historicos && pessoa.arquivos_historicos.length > 0 && (
          <ArquivosHistoricos
            arquivos={pessoa.arquivos_historicos}
            onChange={() => {}}
            pessoaId={pessoa.id}
            readOnly={true}
          />
        )}
      </main>

    </div>
  );
}
