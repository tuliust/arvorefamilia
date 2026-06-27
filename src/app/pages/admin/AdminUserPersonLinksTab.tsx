import { useEffect, useMemo, useState } from 'react';
import { Link2, Search, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { adminListProfilesForLinking, adminCreateUserPersonLink, adminDeleteUserPersonLink, adminListAllUserPersonLinks, adminUpdateUserPersonLink, type AdminLinkableProfile, type UserPersonLinkRecord } from '../../services/memberProfileService';
import { obterTodasPessoas } from '../../services/dataService';
import { Pessoa, UserPersonPermissionRole } from '../../types';
import { AdminManagedProfilesPanel } from './AdminManagedProfilesPanel';

const ROLE_OPTIONS: Array<{ value: UserPersonPermissionRole; label: string; canEdit: boolean }> = [
  { value: 'owner', label: 'owner', canEdit: true },
  { value: 'editor', label: 'editor', canEdit: true },
  { value: 'legacy_editor', label: 'legacy_editor', canEdit: true },
  { value: 'guardian', label: 'guardian', canEdit: true },
  { value: 'viewer', label: 'viewer', canEdit: false },
];

type LinkRecordWithPessoa = UserPersonLinkRecord & { pessoa?: Pessoa | null };

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getRoleMetadata(role?: UserPersonPermissionRole | null, canEdit?: boolean | null) {
  if (role) return ROLE_OPTIONS.find((option) => option.value === role) ?? ROLE_OPTIONS[1];
  if (canEdit === false) return ROLE_OPTIONS.find((option) => option.value === 'viewer')!;
  return ROLE_OPTIONS.find((option) => option.value === 'editor')!;
}

export function AdminUserPersonLinksTab() {
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [links, setLinks] = useState<LinkRecordWithPessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserPersonPermissionRole>('editor');
  const [linkToDeleteId, setLinkToDeleteId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState(false);

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesResult, peopleResult, linksResult] = await Promise.all([
        adminListProfilesForLinking(),
        obterTodasPessoas(),
        adminListAllUserPersonLinks(),
      ]);

      if (profilesResult.error) throw new Error(profilesResult.error);
      if (linksResult.error) throw new Error(linksResult.error);

      setProfiles(profilesResult.data);
      setPeople(peopleResult);
      setLinks(linksResult.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel carregar vinculos de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredLinks = useMemo(() => {
    const normalizedFilter = normalizeText(filter.trim());
    if (!normalizedFilter) return links;

    return links.filter((link) => {
      const profile = profilesById.get(link.user_id);
      const parts = [
        profile?.nome_exibicao,
        profile?.email,
        link.pessoa?.nome_completo,
        link.relacao_com_perfil,
        link.permission_role,
      ].filter(Boolean).map((value) => normalizeText(String(value)));

      return parts.some((value) => value.includes(normalizedFilter));
    });
  }, [filter, links, profilesById]);

  const handleCreate = async () => {
    if (!selectedUserId || !selectedPessoaId) {
      toast.error('Selecione usuario e pessoa.');
      return;
    }

    const roleMetadata = getRoleMetadata(selectedRole, selectedRole !== 'viewer');

    try {
      setSaving(true);
      const result = await adminCreateUserPersonLink({
        userId: selectedUserId,
        pessoaId: selectedPessoaId,
        relacaoComPerfil: roleMetadata.label,
        principal: selectedRole === 'owner',
        canEdit: roleMetadata.canEdit,
        permissionRole: selectedRole,
      });

      if (result.error) throw new Error(result.error);

      toast.success('Vinculo salvo.');
      await loadData();
      setSelectedPessoaId('');
      setSelectedRole('editor');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel salvar vinculo.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (link: LinkRecordWithPessoa, role: UserPersonPermissionRole) => {
    const roleMetadata = getRoleMetadata(role, role !== 'viewer');

    try {
      setSaving(true);
      const result = await adminUpdateUserPersonLink({
        linkId: link.id,
        relacaoComPerfil: roleMetadata.label,
        principal: role === 'owner',
        canEdit: roleMetadata.canEdit,
        permissionRole: role,
      });

      if (result.error) throw new Error(result.error);
      toast.success('Permissao atualizada.');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel atualizar permissao.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (linkId: string) => {
    if (deletingLink) return;
    setLinkToDeleteId(linkId);
  };

  const confirmDeleteLink = async () => {
    if (!linkToDeleteId || deletingLink) return;

    const linkId = linkToDeleteId;
    try {
      setDeletingLink(true);
      setSaving(true);
      const result = await adminDeleteUserPersonLink(linkId);
      if (result.error) throw new Error(result.error);
      toast.success('Vinculo removido.');
      setLinkToDeleteId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel remover vinculo.');
    } finally {
      setDeletingLink(false);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminManagedProfilesPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-700" />
            Vinculos de usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-700">Usuario</span>
              <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                <option value="">Selecione</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.nome_exibicao || profile.email || profile.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-700">Pessoa</span>
              <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={selectedPessoaId} onChange={(event) => setSelectedPessoaId(event.target.value)}>
                <option value="">Selecione</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.nome_completo}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-700">Permissao</span>
              <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as UserPersonPermissionRole)}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <Button type="button" onClick={handleCreate} disabled={saving} className="w-full">
                <Link2 className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Vincular usuario'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-700" />
            Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar por usuario, pessoa ou permissao"
          />

          {loading ? (
            <p className="text-sm text-gray-500">Carregando vinculos...</p>
          ) : filteredLinks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Nenhum vinculo encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => {
                const profile = profilesById.get(link.user_id);
                const currentRole = getRoleMetadata(link.permission_role ?? null, link.can_edit);

                return (
                  <div key={link.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="break-words text-sm font-semibold text-gray-900">
                          {profile?.nome_exibicao || profile?.email || link.user_id}
                        </p>
                        <p className="break-words text-xs text-gray-500">
                          {profile?.email || link.user_id} {'->'} {link.pessoa?.nome_completo || link.pessoa_id}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{currentRole.label}</Badge>
                          <Badge variant={link.can_edit === false ? 'outline' : 'secondary'}>
                            {link.can_edit === false ? 'Somente leitura' : 'Pode editar'}
                          </Badge>
                          {link.principal ? <Badge variant="secondary">Principal</Badge> : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          value={currentRole.value}
                          onChange={(event) => void handleRoleChange(link, event.target.value as UserPersonPermissionRole)}
                          disabled={saving}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <Button type="button" variant="outline" onClick={() => void handleDelete(link.id)} disabled={saving} className="text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
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

      <ConfirmDialog
        open={Boolean(linkToDeleteId)}
        onOpenChange={(open) => {
          if (!open && !deletingLink) setLinkToDeleteId(null);
        }}
        title="Remover vinculo"
        description="Remover este vinculo de usuario com a pessoa? Esta acao nao pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={confirmDeleteLink}
        variant="danger"
        loading={deletingLink}
      />
    </div>
  );
}
