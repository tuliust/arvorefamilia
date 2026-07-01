import { useEffect, useMemo, useState } from 'react';
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
  shortMessage?: string;
  longMessage?: string;
  cta?: string;
};

const CHANNEL_OPTIONS: TipoCanalNotificacao[] = ['interna', 'email', 'push', 'whatsapp'];
const EDITABLE_FIELDS = ['title', 'shortMessage', 'longMessage', 'cta'] as const;

type EditableField = typeof EDITABLE_FIELDS[number];

function getDraftContent(
  template: AdminNotificationTemplateDefinition | undefined,
  override: AdminNotificationContentOverride | undefined,
) {
  return {
    title: override?.title ?? template?.title ?? '',
    shortMessage: override?.shortMessage ?? template?.shortMessage ?? '',
    longMessage: override?.longMessage ?? template?.longMessage ?? '',
    cta: override?.cta ?? template?.cta ?? '',
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
  onFrequencyChange: (typeId: string, frequency: AdminNotificationFrequencyId) => void;
  onContentChange: (templateId: string, content: AdminNotificationContentOverride) => void;
  onChannelsChange: (typeId: string, channels: TipoCanalNotificacao[]) => void;
  onRecipientsChange: (typeId: string, recipientGroupIds: string[]) => void;
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(props.types[0]?.id ?? '');
  const [activeField, setActiveField] = useState<EditableField>('longMessage');

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
  const variables = selectedTemplate?.variables ?? [];

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

  const insertVariable = (variable: string) => {
    updateDraft(activeField, `${draft[activeField]}${draft[activeField] ? ' ' : ''}${variable}`);
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
        <CardHeader>
          <CardTitle className="text-base">Configuração da notificação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
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
                value={draft.title}
                onFocus={() => setActiveField('title')}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-short">Texto curto</Label>
              <Textarea
                id="notification-short"
                value={draft.shortMessage}
                onFocus={() => setActiveField('shortMessage')}
                onChange={(event) => updateDraft('shortMessage', event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-long">Texto</Label>
              <Textarea
                id="notification-long"
                value={draft.longMessage}
                onFocus={() => setActiveField('longMessage')}
                onChange={(event) => updateDraft('longMessage', event.target.value)}
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-cta">CTA</Label>
              <Input
                id="notification-cta"
                value={draft.cta}
                onFocus={() => setActiveField('cta')}
                onChange={(event) => updateDraft('cta', event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variáveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Clique para inserir no campo ativo: {formatAdminNotificationLabel(activeField)}.
              </p>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button key={variable} type="button" variant="outline" size="sm" onClick={() => insertVariable(variable)}>
                    {formatAdminNotificationVariable(variable)}
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
