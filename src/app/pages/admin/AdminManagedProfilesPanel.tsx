import { useEffect, useMemo, useState } from 'react';
import { Baby, CheckCircle2, Clock, ShieldCheck, Skull, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  adminListAllUserPersonLinks,
  adminListProfilesForLinking,
  type AdminLinkableProfile,
  type UserPersonLinkRecord,
} from '../../services/memberProfileService';
import {
  AdminProfileControlRequestRecord,
  adminListProfileControlRequests,
  adminReviewProfileControlRequest,
} from '../../services/profileControlRequestService';
import { obterTodasPessoas } from '../../services/dataService';
import { Pessoa, UserPersonPermissionRole } from '../../types';
import {
  getManageableProfileEligibility,
  getProfileEligibilityReasonLabel,
} from '../../utils/manageableProfiles';

type LinkRecordWithPessoa = UserPersonLinkRecord & { pessoa?: Pessoa | null };

type ManageableProfileCandidate = {
  person: Pessoa;
  reasonLabel: string;
  detail: string;
  managerCount: number;
  managers: LinkRecordWithPessoa[];
  pendingRequestCount: number;
};

function getRoleLabel(role?: UserPersonPermissionRole | string | null) {
  if (role === 'owner') return 'Responsável principal';
  if (role === 'legacy_editor') return 'Editor legado';
  if (role === 'guardian') return 'Responsável por criança';
  if (role === 'viewer') return 'Somente leitura';
  return 'Editor';
}

function getDefaultRoleForRequest(request: AdminProfileControlRequestRecord): UserPersonPermissionRole {
  if (request.reason === 'deceased') return 'legacy_editor';
  if (request.reason === 'minor_or_dependent') return 'guardian';
  return 'editor';
}

function getRequestReasonLabel(reason: AdminProfileControlRequestRecord['reason']) {
  if (reason === 'deceased') return 'Pessoa falecida';
  if (reason === 'minor_or_dependent') return 'Criança ou dependente';
  if (reason === 'close_family') return 'Familiar próximo';
  return 'Outro motivo';
}

function getRequestStatusLabel(status: AdminProfileControlRequestRecord['status']) {
  if (status === 'pending') return 'Pendente';
  if (status === 'approved') return 'Aprovada';
  if (status === 'rejected') return 'Rejeitada';
  return 'Cancelada';
}

function buildProfileLabel(profile?: AdminLinkableProfile, fallback?: string) {
  return profile?.nome_exibicao || profile?.email || fallback || 'Usuário responsável';
}

export function AdminManagedProfilesPanel() {
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [links, setLinks] = useState<LinkRecordWithPessoa[]>([]);
  const [requests, setRequests] = useState<AdminProfileControlRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending'),
    [requests]
  );

  const linksByPessoaId = useMemo(() => {
    return links.reduce<Map<string, LinkRecordWithPessoa[]>>((map, link) => {
      const current = map.get(link.pessoa_id) ?? [];
      current.push(link);
      map.set(link.pessoa_id, current);
      return map;
    }, new Map());
  }, [links]);

  const pendingRequestCountByPessoaId = useMemo(() => {
    return pendingRequests.reduce<Map<string, number>>((map, request) => {
      map.set(request.target_pessoa_id, (map.get(request.target_pessoa_id) ?? 0) + 1);
      return map;
    }, new Map());
  }, [pendingRequests]);

  const manageableProfiles = useMemo<ManageableProfileCandidate[]>(() => {
    return people
      .map((person) => {
        const eligibility = getManageableProfileEligibility(person);
        if (!eligibility.eligible) return null;

        const managers = (linksByPessoaId.get(person.id) ?? []).filter((link) => link.can_edit !== false);

        return {
          person,
          reasonLabel: getProfileEligibilityReasonLabel(eligibility.reason),
          detail: eligibility.detail,
          managerCount: managers.length,
          managers,
          pendingRequestCount: pendingRequestCountByPessoaId.get(person.id) ?? 0,
        };
      })
      .filter(Boolean)
      .sort((left, right) => {
        const a = left as ManageableProfileCandidate;
        const b = right as ManageableProfileCandidate;
        if (a.managerCount === 0 && b.managerCount > 0) return -1;
        if (a.managerCount > 0 && b.managerCount === 0) return 1;
        if (a.pendingRequestCount !== b.pendingRequestCount) return b.pendingRequestCount - a.pendingRequestCount;
        return a.person.nome_completo.localeCompare(b.person.nome_completo, 'pt-BR');
      }) as ManageableProfileCandidate[];
  }, [linksByPessoaId, pendingRequestCountByPessoaId, people]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleResult, profilesResult, linksResult, requestsResult] = await Promise.all([
        obterTodasPessoas(),
        adminListProfilesForLinking(),
        adminListAllUserPersonLinks(),
        adminListProfileControlRequests(),
      ]);

      if (profilesResult.error) throw new Error(profilesResult.error);
      if (linksResult.error) throw new Error(linksResult.error);
      if (requestsResult.error) throw new Error(requestsResult.error);

      setPeople(peopleResult);
      setProfiles(profilesResult.data);
      setLinks(linksResult.data);
      setRequests(requestsResult.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar perfis gerenciáveis.');
      setPeople([]);
      setProfiles([]);
      setLinks([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleReviewRequest = async (
    request: AdminProfileControlRequestRecord,
    status: 'approved' | 'rejected'
  ) => {
    const defaultRole = getDefaultRoleForRequest(request);
    const confirmed = status === 'approved'
      ? window.confirm(`Aprovar solicitação e vincular ${request.requester_label} como ${getRoleLabel(defaultRole)} de ${request.target_label}?`)
      : window.confirm(`Rejeitar solicitação de ${request.requester_label} para administrar ${request.target_label}?`);

    if (!confirmed) return;

    try {
      setReviewingRequestId(request.id);
      const result = await adminReviewProfileControlRequest({
        requestId: request.id,
        status,
        permissionRole: status === 'approved' ? defaultRole : null,
      });

      if (result.error) throw new Error(result.error);
      toast.success(status === 'approved' ? 'Solicitação aprovada e vínculo criado.' : 'Solicitação rejeitada.');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível revisar a solicitação.');
    } finally {
      setReviewingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-700" />
            Perfis legados e crianças
          </CardTitle>
          <p className="text-sm text-gray-500">
            Pessoas falecidas ou crianças até 10 anos que podem ter um ou mais usuários responsáveis.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Carregando perfis gerenciáveis...</p>
          ) : manageableProfiles.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Nenhum perfil legado ou de criança encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {manageableProfiles.map((candidate) => {
                const Icon = candidate.reasonLabel === 'Falecido' ? Skull : Baby;

                return (
                  <div key={candidate.person.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-gray-900">{candidate.person.nome_completo}</p>
                            <p className="mt-1 break-words text-xs text-gray-500">{candidate.detail}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{candidate.reasonLabel}</Badge>
                          <Badge variant={candidate.managerCount === 0 ? 'outline' : 'secondary'}>
                            {candidate.managerCount === 0
                              ? 'Sem responsável'
                              : `${candidate.managerCount} responsável(is)`}
                          </Badge>
                          {candidate.pendingRequestCount > 0 ? (
                            <Badge variant="secondary">{candidate.pendingRequestCount} solicitação(ões)</Badge>
                          ) : null}
                        </div>

                        {candidate.managers.length > 0 ? (
                          <p className="break-words text-xs text-gray-500">
                            Responsáveis: {candidate.managers.map((manager) => buildProfileLabel(profilesById.get(manager.user_id), manager.user_id)).join(', ')}
                          </p>
                        ) : null}
                      </div>

                      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900 xl:max-w-xs">
                        Para vincular manualmente, use o formulário “Vínculos de usuários” abaixo e selecione o papel correto.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Solicitações de administração
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Carregando solicitações...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Nenhuma solicitação pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const defaultRole = getDefaultRoleForRequest(request);

                return (
                  <div key={request.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="break-words text-sm font-semibold text-gray-900">
                          {request.requester_label} solicitou administrar {request.target_label}
                        </p>
                        <p className="break-words text-xs text-gray-600">
                          {request.requester_email ? `${request.requester_email} • ` : ''}{getRequestReasonLabel(request.reason)}
                        </p>
                        {request.description ? (
                          <p className="break-words rounded-md border border-amber-200 bg-white/70 px-3 py-2 text-xs text-gray-700">
                            {request.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{getRequestStatusLabel(request.status)}</Badge>
                          <Badge variant="secondary">Papel sugerido: {getRoleLabel(defaultRole)}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
                        <Button
                          type="button"
                          onClick={() => void handleReviewRequest(request, 'approved')}
                          disabled={reviewingRequestId === request.id}
                          className="w-full sm:w-auto"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleReviewRequest(request, 'rejected')}
                          disabled={reviewingRequestId === request.id}
                          className="w-full text-red-700 sm:w-auto"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
