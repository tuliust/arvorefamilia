import { Plus, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AdminNotificationFrequencyId,
  AdminNotificationRecipientGroupDefinition,
  AdminNotificationTemplateDefinition,
  AdminNotificationTypeDefinition,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
} from '../../../constants/adminNotificationCatalog';
import { adminListProfilesForLinking, AdminLinkableProfile } from '../../../services/memberProfileService';
import {
  loadAdminNotificationConfiguration,
  saveAdminNotificationConfiguration,
} from '../../../services/adminNotificationConfigurationService';
import { TipoCanalNotificacao } from '../../../types';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { formatAdminNotificationLabel, formatAdminNotificationVariable } from './adminNotificationFormatters';

export type AdminNotificationContentOverride = {
  title?: string;
  longMessage?: string;
  cta?: string;
};

export type AdminNotificationVariableSetting = {
  source?: 'auto' | 'fixed' | 'trigger_context' | 'profile' | 'date';
  value?: string;
  dateFormat?: 'short' | 'long' | 'relative' | 'custom';
  customFormat?: string;
  description?: string;
};

export type AdminNotificationVariableSettings = Record<string, Record<string, AdminNotificationVariableSetting>>;

export type AdminNotificationCustomDefinition = {
  type: AdminNotificationTypeDefinition;
  template: AdminNotificationTemplateDefinition;
};

const CHANNEL_OPTIONS: TipoCanalNotificacao[] = ['interna', 'email', 'push', 'whatsapp'];
const EDITABLE_FIELDS = ['title', 'longMessage', 'cta'] as const;
const SPECIFIC_USER_PREFIX = 'specific_user:';
const TRIGGER_EVENT_PREFIX = 'trigger_event:';

const TRIGGER_EVENT_OPTIONS = [
  {
    id: 'first_map_access',
    label: 'Primeiro acesso ao mapa familiar',
    description: 'Dispara quando o usuário acessa /mapa-familiar pela primeira vez. Este é o gatilho já implementado.',
    status: 'implementado',
  },
  {
    id: 'first_login',
    label: 'Primeiro login',
    description: 'Prepara a regra para primeiro login autenticado. Depende de conexão posterior ao fluxo de autenticação.',
    status: 'preparado',
  },
  {
    id: 'onboarding_completed',
    label: 'Conclusão do primeiro acesso',
    description: 'Prepara a regra para conclusão de revisão/onboarding antes de entrar na árvore.',
    status: 'preparado',
  },
  {
    id: 'profile_updated',
    label: 'Atualização própria de perfil',
    description: 'Prepara a regra para ações feitas pelo próprio usuário em seus dados.',
    status: 'preparado',
  },
] as const;

const EXTRA_RECIPIENT_GROUPS: AdminNotificationRecipientGroupDefinition[] = [
  {
    id: 'trigger_user',
    title: 'Usuário do gatilho',
    description: 'Usuário que realizou a ação que originou a notificação, como primeiro login ou atualização própria.',
    kind: 'gatilho',
    availability: 'available',
  },
  {
    id: 'specific_users',
    title: 'Usuários específicos',
    description: 'Permite selecionar um ou mais usuários manualmente para receber a notificação.',
    kind: 'manual_futuro',
    availability: 'available',
  },
  {
    id: 'close_family',
    title: 'Familiares próximos',
    description: 'Pai, mãe, irmãos, cônjuge ativo, filhos, netos e sobrinhos do usuário ou pessoa do gatilho.',
    kind: 'gatilho',
    availability: 'available',
  },
];

type EditableField = typeof EDITABLE_FIELDS[number];

function getDraftContent(
  template: AdminNotificationTemplateDefinition | undefined,
  override: AdminNotificationContentOverride | undefined
) {
  return {
    title: override?.title ?? template?.title ?? '',
    longMessage: override?.longMessage ?? template?.longMessage ?? '',
    cta: override?.cta ?? template?.cta ?? '',
  };
}

function normalizeVariableName(value: string) {
  const normalized = value
    .trim()
    .replace(/[{}]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized ? `{{${normalized}}}` : '';
}

function getVariableInsertionToken(variable: string) {
  if (variable === '{{nome}}') return '{{nome_curto}}';
  if (variable === '{{nome_autor}}') return '{{nome_autor_curto}}';
  return variable;
}

function createCustomNotificationDefinition(index: number): AdminNotificationCustomDefinition {
  const id = `custom_notification_${Date.now()}_${index}`;
  return {
    type: {
      id,
      group: 'engajamento',
      administrativeName: `Nova notificação ${index}`,
      shortName: `Nova ${index}`,
      description: 'Notificação personalizada criada no painel administrativo.',
      priority: 'media',
      allowedChannels: ['interna'],
      defaultFrequency: 'manual',
      defaultAudience: 'admins',
      shortTemplate: 'Nova notificação personalizada.',
      longTemplate: 'Escreva aqui o texto da notificação personalizada.',
      defaultLink: '/notificacoes',
      active: true,
      automationMode: 'manual',
    },
    template: {
      id: `${id}_template`,
      typeId: id,
      themeId: 'administrativo',
      title: `Nova notificação ${index}`,
      shortMessage: 'Nova notificação personalizada.',
      longMessage: 'Escreva aqui o texto da notificação personalizada.',
      cta: 'Abrir detalhe',
      defaultLink: '/notificacoes',
      variables: ['{{nome}}', '{{data}}', '{{link}}'],
      allowedChannels: ['interna'],
      active: true,
    },
  };
}

function getSpecificUserToken(userId: string) {
  return `${SPECIFIC_USER_PREFIX}${userId}`;
}

function getSpecificUserIdFromToken(token: string) {
  return token.startsWith(SPECIFIC_USER_PREFIX) ? token.slice(SPECIFIC_USER_PREFIX.length) : null;
}

function getTriggerEventToken(eventId: string) {
  return `${TRIGGER_EVENT_PREFIX}${eventId}`;
}

function getTriggerEventIdFromToken(token: string) {
  return token.startsWith(TRIGGER_EVENT_PREFIX) ? token.slice(TRIGGER_EVENT_PREFIX.length) : null;
}

function getProfileLabel(profile: AdminLinkableProfile) {
  return String(profile.nome_exibicao || profile.email || profile.id).trim();
}

function mergeRecipientGroups(groups: AdminNotificationRecipientGroupDefinition[]) {
  const map = new Map<string, AdminNotificationRecipientGroupDefinition>();
  [...groups, ...EXTRA_RECIPIENT_GROUPS].forEach((group) => map.set(group.id, group));
  return Array.from(map.values());
}

function cleanDisplayTitle(value: string, fallback: string) {
  const normalized = value.trim();
  return normalized || fallback;
}

export function AdminNotificationConfiguration(props: {
  types: AdminNotificationTypeDefinition[];
  templates: AdminNotificationTemplateDefinition[];
  recipientGroups: AdminNotificationRecipientGroupDefinition[];
  frequencyOverrides: Record<string, AdminNotificationFrequencyId>;
  contentOverrides: Record<string, AdminNotificationContentOverride>;
  channelOverrides: Record<string, TipoCanalNotificacao[]>;
  recipientOverrides: Record<string, string[]>;
  activeOverrides: Record<string, boolean>;
  variableOverrides: Record<string, string[]>;
  variableSettings: AdminNotificationVariableSettings;
  customTypeCount: number;
  onFrequencyChange: (typeId: string, frequency: AdminNotificationFrequencyId) => void;
  onContentChange: (templateId: string, content: AdminNotificationContentOverride) => void;
  onChannelsChange: (typeId: string, channels: TipoCanalNotificacao[]) => void;
  onRecipientsChange: (typeId: string, recipientGroupIds: string[]) => void;
  onActiveChange: (typeId: string, active: boolean) => void;
  onVariablesChange: (templateId: string, variables: string[]) => void;
  onVariableSettingsChange: (templateId: string, settings: Record<string, AdminNotificationVariableSetting>) => void;
  onCreateType: (definition: AdminNotificationCustomDefinition) => void;
  onSave: () => void;
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(props.types[0]?.id ?? '');
  const [activeField, setActiveField] = useState<EditableField>('longMessage');
  const [newVariableName, setNewVariableName] = useState('');
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [persistedConfigLoading, setPersistedConfigLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const persistedConfigLoadedRef = useRef(false);
  const fieldRefs = {
    title: useRef<HTMLInputElement | null>(null),
    longMessage: useRef<HTMLTextAreaElement | null>(null),
    cta: useRef<HTMLInputElement | null>(null),
  };

  const recipientGroups = useMemo(() => mergeRecipientGroups(props.recipientGroups), [props.recipientGroups]);
  const selectedType = useMemo(
    () => props.types.find((item) => item.id === selectedTypeId) ?? props.types[0],
    [props.types, selectedTypeId],
  );
  const selectedTemplate = useMemo(
    () => props.templates.find((item) => item.typeId === selectedType?.id),
    [props.templates, selectedType?.id],
  );

  const templateId = selectedTemplate?.id ?? '';
  const draft = getDraftContent(selectedTemplate, templateId ? props.contentOverrides[templateId] : undefined);
  const selectedChannels = selectedType
    ? props.channelOverrides[selectedType.id] ?? selectedType.allowedChannels
    : [];
  const selectedRecipients = selectedType
    ? props.recipientOverrides[selectedType.id] ?? [selectedType.defaultAudience].filter(Boolean)
    : [];
  const selectedSpecificUserIds = selectedRecipients
    .map(getSpecificUserIdFromToken)
    .filter((userId): userId is string => Boolean(userId));
  const selectedTriggerEventIds = selectedRecipients
    .map(getTriggerEventIdFromToken)
    .filter((eventId): eventId is string => Boolean(eventId));
  const selectedFrequency = selectedType
    ? props.frequencyOverrides[selectedType.id] ?? selectedType.defaultFrequency
    : 'manual';
  const selectedActive = selectedType
    ? props.activeOverrides[selectedType.id] ?? selectedType.active
    : true;
  const variables = selectedTemplate
    ? props.variableOverrides[selectedTemplate.id] ?? selectedTemplate.variables
    : [];
  const selectedVariableSettings = templateId ? props.variableSettings[templateId] ?? {} : {};

  const getTypeDisplayName = (type: AdminNotificationTypeDefinition) => {
    const template = props.templates.find((item) => item.typeId === type.id);
    const content = getDraftContent(template, template ? props.contentOverrides[template.id] : undefined);
    return cleanDisplayTitle(content.title, type.administrativeName);
  };

  useEffect(() => {
    if (!selectedTypeId && props.types[0]?.id) {
      setSelectedTypeId(props.types[0].id);
    }
  }, [props.types, selectedTypeId]);

  useEffect(() => {
    let mounted = true;

    async function loadProfiles() {
      try {
        setProfilesLoading(true);
        const result = await adminListProfilesForLinking();
        if (mounted) setProfiles(result.data);
      } catch (error) {
        console.warn('[Notificações] Não foi possível carregar usuários para seleção específica:', error);
        if (mounted) setProfiles([]);
      } finally {
        if (mounted) setProfilesLoading(false);
      }
    }

    void loadProfiles();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (persistedConfigLoadedRef.current) return;
    persistedConfigLoadedRef.current = true;

    let mounted = true;

    async function loadPersistedConfig() {
      try {
        setPersistedConfigLoading(true);
        const config = await loadAdminNotificationConfiguration();
        if (!mounted) return;

        Object.entries(config.frequencyOverrides ?? {}).forEach(([typeId, frequency]) => props.onFrequencyChange(typeId, frequency));
        Object.entries(config.contentOverrides ?? {}).forEach(([templateIdKey, content]) => props.onContentChange(templateIdKey, content));
        Object.entries(config.channelOverrides ?? {}).forEach(([typeId, channels]) => props.onChannelsChange(typeId, channels));
        Object.entries(config.recipientOverrides ?? {}).forEach(([typeId, recipients]) => props.onRecipientsChange(typeId, recipients));
        Object.entries(config.activeOverrides ?? {}).forEach(([typeId, active]) => props.onActiveChange(typeId, active));
        Object.entries(config.variableOverrides ?? {}).forEach(([templateIdKey, nextVariables]) => props.onVariablesChange(templateIdKey, nextVariables));
        Object.entries(config.variableSettings ?? {}).forEach(([templateIdKey, settings]) => props.onVariableSettingsChange(templateIdKey, settings));

        (config.customDefinitions ?? [])
          .filter((definition) => !props.types.some((type) => type.id === definition.type.id))
          .forEach((definition) => props.onCreateType(definition));
      } catch (error) {
        console.warn('[Notificações] Não foi possível aplicar configuração persistida:', error);
      } finally {
        if (mounted) setPersistedConfigLoading(false);
      }
    }

    void loadPersistedConfig();

    return () => {
      mounted = false;
    };
  }, []);

  const updateDraft = (field: EditableField, value: string) => {
    if (!templateId) return;
    props.onContentChange(templateId, {
      ...draft,
      [field]: value,
    });
  };

  const insertAtCursor = (variable: string) => {
    const token = getVariableInsertionToken(variable);
    const currentValue = draft[activeField] ?? '';
    const element = fieldRefs[activeField].current;
    const selectionStart = element?.selectionStart ?? currentValue.length;
    const selectionEnd = element?.selectionEnd ?? selectionStart;
    const nextValue = `${currentValue.slice(0, selectionStart)}${token}${currentValue.slice(selectionEnd)}`;

    updateDraft(activeField, nextValue);

    window.requestAnimationFrame(() => {
      const nextElement = fieldRefs[activeField].current;
      const cursor = selectionStart + token.length;
      nextElement?.focus();
      nextElement?.setSelectionRange(cursor, cursor);
    });
  };

  const toggleChannel = (channel: TipoCanalNotificacao, checked: boolean) => {
    if (!selectedType) return;
    const next = checked
      ? Array.from(new Set([...selectedChannels, channel]))
      : selectedChannels.filter((item) => item !== channel);
    props.onChannelsChange(selectedType.id, next);
  };

  const toggleRecipient = (recipientId: string, checked: boolean) => {
    if (!selectedType) return;
    const withoutSpecificUsers = recipientId === 'specific_users'
      ? selectedRecipients.filter((item) => !item.startsWith(SPECIFIC_USER_PREFIX))
      : selectedRecipients;
    const withoutTriggerEvents = recipientId === 'trigger_user'
      ? withoutSpecificUsers.filter((item) => !item.startsWith(TRIGGER_EVENT_PREFIX))
      : withoutSpecificUsers;
    const base = withoutTriggerEvents;
    const next = checked
      ? Array.from(new Set([
        ...base,
        recipientId,
        ...(recipientId === 'trigger_user' ? [getTriggerEventToken('first_map_access')] : []),
      ]))
      : base.filter((item) => item !== recipientId);
    props.onRecipientsChange(selectedType.id, next);
  };

  const toggleSpecificUser = (userId: string, checked: boolean) => {
    if (!selectedType) return;
    const token = getSpecificUserToken(userId);
    const baseRecipients = selectedRecipients.includes('specific_users')
      ? selectedRecipients
      : [...selectedRecipients, 'specific_users'];
    const next = checked
      ? Array.from(new Set([...baseRecipients, token]))
      : baseRecipients.filter((item) => item !== token);
    props.onRecipientsChange(selectedType.id, next);
  };

  const toggleTriggerEvent = (eventId: string, checked: boolean) => {
    if (!selectedType) return;
    const token = getTriggerEventToken(eventId);
    const baseRecipients = selectedRecipients.includes('trigger_user')
      ? selectedRecipients
      : [...selectedRecipients, 'trigger_user'];
    const next = checked
      ? Array.from(new Set([...baseRecipients, token]))
      : baseRecipients.filter((item) => item !== token);
    props.onRecipientsChange(selectedType.id, next);
  };

  const updateVariableSetting = (variable: string, patch: AdminNotificationVariableSetting) => {
    if (!templateId) return;
    props.onVariableSettingsChange(templateId, {
      ...selectedVariableSettings,
      [variable]: {
        ...(selectedVariableSettings[variable] ?? {}),
        ...patch,
      },
    });
  };

  const handleCreateType = () => {
    const definition = createCustomNotificationDefinition(props.customTypeCount + 1);
    props.onCreateType(definition);
    setSelectedTypeId(definition.type.id);
  };

  const handleAddVariable = () => {
    if (!templateId) return;
    const variable = normalizeVariableName(newVariableName);
    if (!variable) return;
    props.onVariablesChange(templateId, Array.from(new Set([...variables, variable])));
    setNewVariableName('');
  };

  const buildCustomDefinitionsForSave = (): AdminNotificationCustomDefinition[] => {
    return props.types
      .filter((type) => type.id.startsWith('custom_notification_'))
      .map((type) => {
        const template = props.templates.find((item) => item.typeId === type.id);
        if (!template) return null;
        const content = getDraftContent(template, props.contentOverrides[template.id]);
        const title = cleanDisplayTitle(content.title, type.administrativeName);
        const variablesForTemplate = props.variableOverrides[template.id] ?? template.variables;
        const settingsForTemplate = props.variableSettings[template.id] ?? {};
        const linkSetting = settingsForTemplate['{{link}}'];
        const link = String(linkSetting?.value || template.defaultLink || type.defaultLink || '/notificacoes').trim();

        return {
          type: {
            ...type,
            administrativeName: title,
            shortName: title,
            shortTemplate: content.longMessage || template.shortMessage || type.shortTemplate,
            longTemplate: content.longMessage || type.longTemplate,
            defaultLink: link,
          },
          template: {
            ...template,
            title,
            longMessage: content.longMessage,
            cta: content.cta,
            defaultLink: link,
            variables: variablesForTemplate,
            variableSettings: settingsForTemplate,
          } as AdminNotificationTemplateDefinition,
        };
      })
      .filter((definition): definition is AdminNotificationCustomDefinition => Boolean(definition));
  };

  const handleSave = async () => {
    try {
      setSavingConfig(true);
      await saveAdminNotificationConfiguration({
        frequencyOverrides: props.frequencyOverrides,
        contentOverrides: props.contentOverrides,
        channelOverrides: props.channelOverrides,
        recipientOverrides: props.recipientOverrides,
        activeOverrides: props.activeOverrides,
        variableOverrides: props.variableOverrides,
        variableSettings: props.variableSettings,
        customDefinitions: buildCustomDefinitionsForSave(),
      });
      props.onSave();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar as configurações de notificação.');
    } finally {
      setSavingConfig(false);
    }
  };

  if (!selectedType || !selectedTemplate) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-gray-500">Nenhum tipo de notificação disponível para configurar.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Configuração da notificação</CardTitle>
            {persistedConfigLoading && <p className="mt-1 text-xs text-gray-500">Carregando configuração salva no Supabase...</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleCreateType}>
              <Plus className="h-4 w-4" />
              Novo tipo
            </Button>
            <Button type="button" onClick={handleSave} disabled={savingConfig}>
              <Save className="h-4 w-4" />
              {savingConfig ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="space-y-2">
            <Label htmlFor="notification-type">Tipo de notificação</Label>
            <Select value={selectedType.id} onValueChange={setSelectedTypeId}>
              <SelectTrigger id="notification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {props.types.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {getTypeDisplayName(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-frequency">Frequência</Label>
            <Select
              value={selectedFrequency}
              onValueChange={(value) => props.onFrequencyChange(selectedType.id, value as AdminNotificationFrequencyId)}
            >
              <SelectTrigger id="notification-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-status">Status</Label>
            <Select value={selectedActive ? 'ativo' : 'inativo'} onValueChange={(value) => props.onActiveChange(selectedType.id, value === 'ativo')}>
              <SelectTrigger id="notification-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Título, texto e CTA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Título</Label>
              <Input
                id="notification-title"
                ref={fieldRefs.title}
                value={draft.title}
                onFocus={() => setActiveField('title')}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
              {selectedType.id.startsWith('custom_notification_') && (
                <p className="text-xs text-gray-500">Este título também será usado como nome administrativo da notificação após salvar.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-long">Texto</Label>
              <Textarea
                id="notification-long"
                ref={fieldRefs.longMessage}
                value={draft.longMessage}
                onFocus={() => setActiveField('longMessage')}
                onChange={(event) => updateDraft('longMessage', event.target.value)}
                className="min-h-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-cta">CTA</Label>
              <Input
                id="notification-cta"
                ref={fieldRefs.cta}
                value={draft.cta}
                onFocus={() => setActiveField('cta')}
                onChange={(event) => updateDraft('cta', event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Variáveis</CardTitle>
              <div className="flex gap-2">
                <Input
                  value={newVariableName}
                  onChange={(event) => setNewVariableName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddVariable();
                    }
                  }}
                  placeholder="nova variável"
                  className="h-9"
                />
                <Button type="button" variant="outline" size="icon" aria-label="Adicionar variável" onClick={handleAddVariable}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Clique para inserir no cursor do campo ativo: {formatAdminNotificationLabel(activeField)}.
              </p>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button key={variable} type="button" variant="outline" size="sm" onClick={() => insertAtCursor(variable)}>
                    {formatAdminNotificationVariable(getVariableInsertionToken(variable))}
                  </Button>
                ))}
              </div>

              <details className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">Editar regras das variáveis</summary>
                <div className="mt-3 space-y-3">
                  {variables.map((variable) => {
                    const setting = selectedVariableSettings[variable] ?? {};
                    return (
                      <div key={variable} className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-gray-900">{variable}</span>
                          <Badge variant="outline">{setting.source ? formatAdminNotificationLabel(setting.source) : 'Automático'}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Origem</Label>
                            <Select
                              value={setting.source ?? 'auto'}
                              onValueChange={(value) => updateVariableSetting(variable, { source: value as AdminNotificationVariableSetting['source'] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Automática</SelectItem>
                                <SelectItem value="fixed">Valor fixo</SelectItem>
                                <SelectItem value="trigger_context">Contexto do gatilho</SelectItem>
                                <SelectItem value="profile">Perfil do usuário</SelectItem>
                                <SelectItem value="date">Data formatada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>{variable === '{{link}}' ? 'Link considerado' : 'Valor fixo ou fallback'}</Label>
                            <Input
                              value={setting.value ?? ''}
                              onChange={(event) => updateVariableSetting(variable, { value: event.target.value })}
                              placeholder={variable === '{{link}}' ? '/mapa-familiar' : 'Valor opcional'}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Formato de data</Label>
                            <Select
                              value={setting.dateFormat ?? 'short'}
                              onValueChange={(value) => updateVariableSetting(variable, { dateFormat: value as AdminNotificationVariableSetting['dateFormat'] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short">Curto: 01/07/2026</SelectItem>
                                <SelectItem value="long">Longo: 1 de julho de 2026</SelectItem>
                                <SelectItem value="relative">Relativo: hoje, amanhã</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Formato personalizado</Label>
                            <Input
                              value={setting.customFormat ?? ''}
                              onChange={(event) => updateVariableSetting(variable, { customFormat: event.target.value })}
                              placeholder="dd/MM/yyyy, d 'de' MMMM..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Canais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CHANNEL_OPTIONS.map((channel) => (
                <Label key={channel} className="flex items-center gap-3 rounded-md border border-gray-200 p-3">
                  <Checkbox
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={(checked) => toggleChannel(channel, checked === true)}
                  />
                  <span>{formatAdminNotificationLabel(channel)}</span>
                  {!selectedType.allowedChannels.includes(channel) && <Badge variant="secondary">extra</Badge>}
                </Label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destinatários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recipientGroups.map((group) => (
              <Label key={group.id} className="flex items-start gap-3 rounded-md border border-gray-200 p-3">
                <Checkbox
                  checked={selectedRecipients.includes(group.id)}
                  onCheckedChange={(checked) => toggleRecipient(group.id, checked === true)}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-gray-900">{group.title}</span>
                  <span className="mt-1 block text-sm font-normal leading-5 text-gray-600">{group.description}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline">{formatAdminNotificationLabel(group.kind)}</Badge>
                    <Badge variant={group.availability === 'available' ? 'outline' : 'secondary'}>
                      {formatAdminNotificationLabel(group.availability)}
                    </Badge>
                  </span>
                </span>
              </Label>
            ))}
          </div>

          {selectedRecipients.includes('trigger_user') && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <details open>
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                  Selecionar gatilhos que definem o usuário destinatário
                  {selectedTriggerEventIds.length > 0 ? ` (${selectedTriggerEventIds.length})` : ''}
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {TRIGGER_EVENT_OPTIONS.map((eventOption) => (
                    <Label key={eventOption.id} className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3">
                      <Checkbox
                        checked={selectedTriggerEventIds.includes(eventOption.id)}
                        onCheckedChange={(checked) => toggleTriggerEvent(eventOption.id, checked === true)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900">{eventOption.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-600">{eventOption.description}</span>
                        <Badge className="mt-2" variant={eventOption.status === 'implementado' ? 'outline' : 'secondary'}>
                          {eventOption.status === 'implementado' ? 'Implementado' : 'Preparado'}
                        </Badge>
                      </span>
                    </Label>
                  ))}
                </div>
              </details>
            </div>
          )}

          {selectedRecipients.includes('specific_users') && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                  Selecionar usuários específicos
                  {selectedSpecificUserIds.length > 0 ? ` (${selectedSpecificUserIds.length})` : ''}
                </summary>
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {profilesLoading && <p className="text-sm text-gray-500">Carregando usuários...</p>}
                  {!profilesLoading && profiles.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum usuário disponível para seleção.</p>
                  )}
                  {!profilesLoading && profiles.map((profile) => (
                    <Label key={profile.id} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-2">
                      <Checkbox
                        checked={selectedSpecificUserIds.includes(profile.id)}
                        onCheckedChange={(checked) => toggleSpecificUser(profile.id, checked === true)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">{getProfileLabel(profile)}</span>
                        {profile.email && <span className="block truncate text-xs text-gray-500">{profile.email}</span>}
                      </span>
                    </Label>
                  ))}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
