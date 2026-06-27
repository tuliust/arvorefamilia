import { useEffect, useMemo, useState } from 'react';
import { Bell, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { adminListProfilesForLinking, adminListAllUserPersonLinks, type AdminLinkableProfile } from '../../services/memberProfileService';
import { listNotificationGroupsAdmin, upsertNotificationGroupAdmin, deleteNotificationGroupAdmin, listNotificationGroupMembersAdmin, replaceNotificationGroupMembersAdmin, listNotificationGroupRulesAdmin, replaceNotificationGroupRulesAdmin } from '../../services/notificationGroupsAdminService';
import { adminUpsertNotificationPreferences, listRecentNotificationPreferencesAdmin } from '../../services/notificationAdminService';
import { listPersonVisibilitySettings } from '../../services/personVisibilitySettingsService';
import { NotificationGroup, PersonVisibilitySettings, PreferenciaNotificacao } from '../../types';

const NOTIFICATION_TYPE_OPTIONS = [
  'aniversarios',
  'fatos_do_dia',
  'astrologia',
  'novos_arquivos',
  'novos_vinculos',
  'alteracoes_em_perfil',
  'avisos_administrativos',
  'forum',
  'curiosidades',
];

const PREFERENCE_FIELDS: Array<{ key: keyof PreferenciaNotificacao; label: string }> = [
  { key: 'receber_aniversarios', label: 'Aniversarios' },
  { key: 'receber_datas_memoria', label: 'Datas de memoria' },
  { key: 'receber_eventos', label: 'Eventos' },
  { key: 'receber_avisos_gerais', label: 'Avisos gerais' },
  { key: 'receber_email', label: 'E-mail' },
  { key: 'receber_push', label: 'Push' },
  { key: 'receber_whatsapp', label: 'WhatsApp' },
];

export function AdminNotificationGroupsTab() {
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [preferences, setPreferences] = useState<PreferenciaNotificacao[]>([]);
  const [visibilitySettings, setVisibilitySettings] = useState<PersonVisibilitySettings[]>([]);
  const [linksByUserId, setLinksByUserId] = useState<Map<string, string>>(new Map());
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedRuleTypes, setSelectedRuleTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);

  const selectedPreferences = useMemo(
    () => preferences.find((item) => item.user_id === selectedUserId) ?? null,
    [preferences, selectedUserId],
  );

  const selectedVisibility = useMemo(() => {
    const pessoaId = linksByUserId.get(selectedUserId);
    if (!pessoaId) return null;
    return visibilitySettings.find((item) => item.pessoa_id === pessoaId) ?? null;
  }, [linksByUserId, selectedUserId, visibilitySettings]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesResult, groupsResult, preferencesResult, linksResult, visibilityResult] = await Promise.all([
        adminListProfilesForLinking(),
        listNotificationGroupsAdmin(),
        listRecentNotificationPreferencesAdmin(500),
        adminListAllUserPersonLinks(),
        listPersonVisibilitySettings(),
      ]);

      if (profilesResult.error) throw new Error(profilesResult.error);
      if (linksResult.error) throw new Error(linksResult.error);

      setProfiles(profilesResult.data);
      setGroups(groupsResult);
      setPreferences(preferencesResult);
      setVisibilitySettings(visibilityResult);
      setLinksByUserId(new Map(linksResult.data.map((link) => [link.user_id, link.pessoa_id])));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel carregar grupos e preferencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    async function loadGroupDetails() {
      try {
        const [members, rules] = await Promise.all([
          listNotificationGroupMembersAdmin(selectedGroupId),
          listNotificationGroupRulesAdmin(selectedGroupId),
        ]);
        setSelectedMemberIds(members.map((member) => member.user_id));
        setSelectedRuleTypes(rules.filter((rule) => rule.enabled).map((rule) => rule.notification_type));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Nao foi possivel carregar detalhes do grupo.');
      }
    }

    void loadGroupDetails();
  }, [selectedGroupId]);

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Informe o nome do grupo.');
      return;
    }

    try {
      setSaving(true);
      const group = await upsertNotificationGroupAdmin({
        id: selectedGroupId || undefined,
        nome: groupName,
        descricao: groupDescription,
        ativo: true,
      });

      await replaceNotificationGroupMembersAdmin(group.id, selectedMemberIds);
      await replaceNotificationGroupRulesAdmin(group.id, selectedRuleTypes);
      toast.success('Grupo salvo.');
      setSelectedGroupId(group.id);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel salvar grupo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId || saving) return;
    setDeleteGroupDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!selectedGroupId || saving) return;

    try {
      setSaving(true);
      await deleteNotificationGroupAdmin(selectedGroupId);
      toast.success('Grupo removido.');
      setDeleteGroupDialogOpen(false);
      setSelectedGroupId('');
      setGroupName('');
      setGroupDescription('');
      setSelectedMemberIds([]);
      setSelectedRuleTypes([]);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel remover grupo.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceToggle = async (key: keyof PreferenciaNotificacao, value: boolean) => {
    if (!selectedUserId) return;

    try {
      setSaving(true);
      const saved = await adminUpsertNotificationPreferences(selectedUserId, { [key]: value });
      setPreferences((current) => {
        const next = current.filter((item) => item.user_id !== selectedUserId);
        next.push(saved);
        return next;
      });
      toast.success('Preferencia atualizada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel salvar preferencia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-700" />
              Grupos de notificacao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Grupo existente</span>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
                  value={selectedGroupId}
                  onChange={(event) => {
                    const nextGroup = groups.find((group) => group.id === event.target.value) ?? null;
                    setSelectedGroupId(event.target.value);
                    setGroupName(nextGroup?.nome ?? '');
                    setGroupDescription(nextGroup?.descricao ?? '');
                  }}
                >
                  <option value="">Novo grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.nome}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Nome</span>
                <input className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-700">Descricao</span>
              <textarea className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Usuarios do grupo</p>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {profiles.map((profile) => (
                    <label key={profile.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(profile.id)}
                        onChange={(event) => setSelectedMemberIds((current) => (
                          event.target.checked
                            ? [...current, profile.id]
                            : current.filter((item) => item !== profile.id)
                        ))}
                      />
                      <span>{profile.nome_exibicao || profile.email || profile.id}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Tipos de notificacao</p>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {NOTIFICATION_TYPE_OPTIONS.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedRuleTypes.includes(type)}
                        onChange={(event) => setSelectedRuleTypes((current) => (
                          event.target.checked
                            ? [...current, type]
                            : current.filter((item) => item !== type)
                        ))}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {selectedGroupId ? (
                <Button type="button" variant="outline" onClick={handleDeleteGroup} disabled={saving} className="text-red-700">
                  Remover grupo
                </Button>
              ) : null}
              <Button type="button" onClick={handleSaveGroup} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar grupo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700" />
              Preferencias por usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-700">Usuario</span>
              <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                <option value="">Selecione</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>{profile.nome_exibicao || profile.email || profile.id}</option>
                ))}
              </select>
            </label>

            {loading ? (
              <p className="text-sm text-gray-500">Carregando preferencias...</p>
            ) : selectedPreferences ? (
              <div className="space-y-3">
                {PREFERENCE_FIELDS.map((field) => (
                  <label key={field.key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm">
                    <span>{field.label}</span>
                    <input
                      type="checkbox"
                      checked={selectedPreferences[field.key] !== false}
                      onChange={(event) => void handlePreferenceToggle(field.key, event.target.checked)}
                      disabled={saving}
                    />
                  </label>
                ))}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Visibilidade vinculada</p>
                  {selectedVisibility ? (
                    <ul className="mt-2 space-y-1">
                      <li>Perfil: {selectedVisibility.perfil_visivel ? 'visivel' : 'oculto'}</li>
                      <li>Arvore: {selectedVisibility.arvore_visivel ? 'visivel' : 'oculto'}</li>
                      <li>Curiosidades: {selectedVisibility.curiosidades_visivel ? 'visivel' : 'oculto'}</li>
                      <li>Dados sensiveis: {selectedVisibility.dados_sensiveis_visiveis ? 'visivel' : 'oculto'}</li>
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">Nao ha configuracao extra de visibilidade para a pessoa principal vinculada.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                Selecione um usuario para consultar preferencias e visibilidade.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteGroupDialogOpen}
        onOpenChange={(open) => {
          if (!saving) setDeleteGroupDialogOpen(open);
        }}
        title="Remover grupo de notificacao"
        description="Remover este grupo de notificacao? Esta acao nao pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={confirmDeleteGroup}
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
