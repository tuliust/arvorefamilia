import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, GitPullRequest, RefreshCcw, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas } from '../../services/dataService';
import {
  adminListProfilesForLinking,
  getPrimaryLinkedPerson,
  type AdminLinkableProfile,
} from '../../services/memberProfileService';
import {
  approveRelationshipChangeRequest,
  listPendingRelationshipChangeRequests,
  rejectRelationshipChangeRequest,
} from '../../services/relationshipChangeRequestService';
import type { Pessoa, RelationshipChangeRequest } from '../../types';

type AdminLinkableProfileWithCreatedAt = AdminLinkableProfile & {
  created_at?: string | null;
};

function getProfileCreatedAtTime(profile: AdminLinkableProfile) {
  const value = (profile as AdminLinkableProfileWithCreatedAt).created_at;
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getProfileDisplayName(profile: AdminLinkableProfile) {
  return String(profile.nome_exibicao || profile.email || profile.id || 'Usuário cadastrado').trim();
}

function getProfileSubtitle(profile: AdminLinkableProfile) {
  return String(profile.email || profile.id || 'Cadastro sem e-mail informado').trim();
}

function formatDate(value?: string | null) {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getActionLabel(action: RelationshipChangeRequest['action']) {
  if (action === 'create') return 'Novo vínculo';
  if (action === 'update') return 'Edição de vínculo';
  return 'Remoção de vínculo';
}

function getRelationshipLabel(value: RelationshipChangeRequest['relationship_type']) {
  const labels: Record<RelationshipChangeRequest['relationship_type'], string> = {
    conjuge: 'Cônjuge',
    pai: 'Pai',
    mae: 'Mãe',
    filho: 'Filho(a)',
    irmao: 'Irmão(ã)',
  };

  return labels[value] ?? value;
}

function getRelationshipSubtypeLabel(value?: string | null) {
  if (!value || value === 'sangue' || value === 'adotivo') return null;

  const labels: Record<string, string> = {
    casamento: 'Casamento',
    uniao: 'União',
    separado: 'Separado',
  };

  return labels[value] ?? value.replace(/_/g, ' ').replace(/^./, (char) => char.toLocaleUpperCase('pt-BR'));
}

function getPersonName(peopleById: Map<string, Pessoa>, id?: string | null) {
  if (!id) return 'Pessoa não informada';
  return peopleById.get(id)?.nome_completo || id;
}

export function AdminAprovacoes() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [relationshipRequests, setRelationshipRequests] = useState<RelationshipChangeRequest[]>([]);
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people],
  );

  async function loadData() {
    setLoading(true);

    try {
      const [peopleData, pendingRequests, profilesResult] = await Promise.all([
        obterTodasPessoas(),
        listPendingRelationshipChangeRequests({ limit: 1000 }),
        adminListProfilesForLinking(),
      ]);

      const orderedProfiles = (profilesResult.error ? [] : profilesResult.data)
        .filter((profile) => Boolean(profile.id))
        .sort((left, right) => {
          const rightCreatedAt = getProfileCreatedAtTime(right);
          const leftCreatedAt = getProfileCreatedAtTime(left);
          if (rightCreatedAt !== leftCreatedAt) return rightCreatedAt - leftCreatedAt;
          return getProfileDisplayName(left).localeCompare(getProfileDisplayName(right), 'pt-BR');
        });

      setPeople(Array.isArray(peopleData) ? peopleData : []);
      setRelationshipRequests(Array.isArray(pendingRequests) ? pendingRequests : []);
      setProfiles(orderedProfiles.slice(0, 20));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar as aprovações.');
      setRelationshipRequests([]);
      setProfiles([]);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  async function handleApprove(request: RelationshipChangeRequest) {
    setReviewingId(request.id);

    try {
      await approveRelationshipChangeRequest(request.id);
      setRelationshipRequests((current) => current.filter((item) => item.id !== request.id));
      toast.success('Solicitação aprovada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível aprovar a solicitação.');
    } finally {
      setReviewingId(null);
    }
  }

  async function handleReject(request: RelationshipChangeRequest) {
    setReviewingId(request.id);

    try {
      await rejectRelationshipChangeRequest(request.id);
      setRelationshipRequests((current) => current.filter((item) => item.id !== request.id));
      toast.success('Solicitação rejeitada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível rejeitar a solicitação.');
    } finally {
      setReviewingId(null);
    }
  }

  async function handleOpenProfile(profile: AdminLinkableProfile) {
    if (!profile.id) return;

    const linkedPerson = await getPrimaryLinkedPerson(profile.id);

    if (linkedPerson.error || !linkedPerson.data?.pessoa_id) {
      toast.error(linkedPerson.error || 'Este cadastro ainda não tem uma pessoa vinculada na árvore.');
      return;
    }

    navigate(`/pessoa/${linkedPerson.data.pessoa_id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Aprovações"
        subtitle="Solicitações de novos usuários, vínculos e edições pendentes."
        icon={GitPullRequest}
        actions={[...DEFAULT_MEMBER_HEADER_ACTIONS, { label: 'Sair', onClick: handleSignOut, variant: 'ghost' }]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} pb-32 pt-6 sm:py-8`}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao painel
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <Card className="min-w-0 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-950">
                <GitPullRequest className="h-5 w-5 text-blue-600" />
                Solicitações de vínculos e edições
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Carregando solicitações...</p>
              ) : relationshipRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-600">
                  Nenhuma solicitação pendente.
                </div>
              ) : (
                <div className="space-y-3">
                  {relationshipRequests.map((request) => {
                    const subtypeLabel = getRelationshipSubtypeLabel(request.relationship_subtype);

                    return (
                    <article key={request.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {getActionLabel(request.action)}
                            </span>
                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                              {getRelationshipLabel(request.relationship_type)}
                            </span>
                          </div>
                          <h2 className="mt-3 break-words text-base font-semibold text-gray-950">
                            {getPersonName(peopleById, request.target_pessoa_id)} → {getPersonName(peopleById, request.related_pessoa_id)}
                          </h2>
                          <p className="mt-1 break-words text-sm text-gray-600">
                            Solicitante: {getPersonName(peopleById, request.requester_pessoa_id)} · {formatDate(request.created_at)}
                          </p>
                          {subtypeLabel && (
                            <p className="mt-1 break-words text-xs text-gray-500">
                              Subtipo: {subtypeLabel}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() => void handleApprove(request)}
                            disabled={reviewingId === request.id}
                          >
                            <Check className="h-4 w-4" />
                            Aprovar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto"
                            onClick={() => void handleReject(request)}
                            disabled={reviewingId === request.id}
                          >
                            <X className="h-4 w-4" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-950">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Novos usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Carregando usuários...</p>
              ) : profiles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-600">
                  Nenhum novo usuário encontrado.
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      className="w-full rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => void handleOpenProfile(profile)}
                    >
                      <p className="break-words text-sm font-semibold text-gray-950">{getProfileDisplayName(profile)}</p>
                      <p className="mt-1 break-words text-xs text-gray-500">{getProfileSubtitle(profile)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
