import { Plus, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminNotificationFrequencyId,
  AdminNotificationRecipientGroupDefinition,
  AdminNotificationTemplateDefinition,
  AdminNotificationTypeDefinition,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
} from '../../../constants/adminNotificationCatalog';
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

export type AdminNotificationCustomDefinition = {
  type: AdminNotificationTypeDefinition;
  template: AdminNotificationTemplateDefinition;
};

const CHANNEL_OPTIONS: TipoCanalNotificacao[] = ['interna', 'email', 'push', 'whatsapp'];
const EDITABLE_FIELDS = ['title', 'longMessage', 'cta'] as const;

type EditableField = typeof EDITABLE_FIELDS[number];

function getDraftContent(
  template: AdminNotificationTemplateDefinition | undefined,
  override: AdminNotificationContentOverride | undefined,
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
  customTypeCount: number;
  onFrequencyChange: (typeId: string, frequency: AdminNotificationFrequencyId) => void;
  onContentChange: (templateId: string, content: AdminNotificationContentOverride) => void;
  onChannelsChange: (typeId: string, channels: TipoCanalNotificacao[]) => void;
  onRecipientsChange: (typeId: string, recipientGroupIds: string[]) => void;
  onActiveChange: (typeId: string, active: boolean) => void;
  onVariablesChange: (templateId: string, variables: string[]) => void;
  onCreateType: (definition: AdminNotificationCustomDefinition) => void;
  onSave: () => void;
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(props.types[0]?.id ?? '');
  const [activeField, setActiveField] = useState<EditableField>('longMessage');
  const [newVariableName, setNewVariableName] = useState('');
  const fieldRefs = {
    title: useRef<HTMLInputElement | null>(null),
    longMessage: useRef<HTMLTextAreaElement | null>(null),
    cta: useRef<HTMLInputElement | null>(null),
  };

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
  const selectedFrequency = selectedType
    ? props.frequencyOverrides[selectedType.id] ?? selectedType.defaultFrequency
    : 'manual';
  const selectedActive = selectedType
    ? props.activeOverrides[selectedType.id] ?? selectedType.active
    : true;
  const variables = selectedTemplate
    ? props.variableOverrides[selectedTemplate.id] ?? selectedTemplate.variables
    : [];

  useEffect(() => {
    if (!selectedTypeId && props.types[0]?.id) {
      setSelectedTypeId(props.types[0].id);
    }
  }, [props.types, selectedTypeId]);

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
    const next = checked
      ? Array.from(new Set([...selectedRecipients, recipientId]))
      : selectedRecipients.filter((item) => item !== recipientId);
    props.onRecipientsChange(selectedType.id, next);
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
          <CardTitle className="text-base">Configuração da notificação</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleCreateType}>
              <Plus className="h-4 w-4" />
              Novo tipo
            </Button>
            <Button type="button" onClick={props.onSave}>
              <Save className="h-4 w-4" />
              Salvar
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
                    {item.administrativeName}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
            <CardContent className="space-y-3">
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
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {props.recipientGroups.map((group) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
