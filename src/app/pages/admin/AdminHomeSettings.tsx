import { useEffect, useMemo, useState } from 'react';
import { Clock, Diff, Globe2, History, ImageIcon, Link2, Monitor, Palette, Save, Search, Settings, Smartphone, Sparkles, Trash2, Type, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DEFAULT_SITE_VISUAL_SETTINGS,
  getSiteVisualSettings,
  getSiteVisualSettingsDiff,
  GLOBAL_THEME_COLOR_OPTIONS,
  HOME_BACKGROUND_COLORS,
  publishDueSiteVisualSettings,
  publishSiteVisualSettingsDraft,
  saveSiteVisualSettings,
  saveSiteVisualSettingsDraft,
  scheduleSiteVisualSettingsPublication,
  SiteVisualSettings,
  SiteVisualSettingsDiff,
} from '../../services/siteVisualSettingsService';
import {
  createSiteVisualSettingsAudit,
  listSiteVisualSettingsAudit,
  SiteVisualSettingsAuditRecord,
} from '../../services/siteVisualSettingsAuditService';
import {
  listSiteVisualSettingsAuditChanges,
  type SiteVisualSettingsAuditChange,
} from '../../services/siteVisualSettingsAuditDiffService';
import { uploadSiteMediaFile } from '../../services/storageService';

type MediaField = 'home_logo_media_url' | 'home_background_media_url' | 'social_share_image_url';
type PreviewMode = 'mobile' | 'desktop';

type TextField = keyof Pick<
  SiteVisualSettings,
  | 'global_identity_name'
  | 'global_identity_short_name'
  | 'global_identity_tagline'
  | 'home_logo_alt_text'
  | 'entrance_eyebrow'
  | 'entrance_title'
  | 'entrance_description'
  | 'entrance_login_title'
  | 'entrance_login_description'
  | 'entrance_first_access_title'
  | 'entrance_first_access_description'
  | 'entrance_confirmation_title'
  | 'entrance_confirmation_description'
  | 'entrance_login_cta_label'
  | 'entrance_first_access_cta_label'
  | 'entrance_create_account_cta_label'
  | 'entrance_forgot_password_label'
  | 'entrance_footer_note'
  | 'public_terms_label'
  | 'public_terms_url'
  | 'public_privacy_label'
  | 'public_privacy_url'
  | 'public_support_label'
  | 'public_support_url'
  | 'seo_title'
  | 'seo_description'
>;

type ColorField = keyof Pick<
  SiteVisualSettings,
  | 'global_primary_color'
  | 'global_accent_color'
  | 'global_text_color'
  | 'global_muted_text_color'
  | 'global_card_background_color'
>;

type SizeField = keyof Pick<SiteVisualSettings, 'global_button_radius' | 'global_card_radius'>;

export function AdminHomeSettings() {
  const [settings, setSettings] = useState<SiteVisualSettings>(DEFAULT_SITE_VISUAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<MediaField | null>(null);
  const [auditRecords, setAuditRecords] = useState<SiteVisualSettingsAuditRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [scheduledPublishAt, setScheduledPublishAt] = useState('');

  const draftDiff = useMemo(() => getSiteVisualSettingsDiff(settings), [settings]);

  const publicationLabel = useMemo(() => {
    if (settings.publication_status === 'draft') return 'Rascunho salvo';
    if (settings.publication_status === 'scheduled') return 'Publicação agendada';
    return 'Publicado';
  }, [settings.publication_status]);

  const loadAudit = async () => {
    setAuditLoading(true);
    const result = await listSiteVisualSettingsAudit(30);
    if (result.error) {
      toast.warning(`Não foi possível carregar o histórico: ${result.error}`);
    } else {
      setAuditRecords(result.data);
    }
    setAuditLoading(false);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSiteVisualSettings();
      setSettings(data);
      await loadAudit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar as configurações públicas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updateSettings = (patch: Partial<SiteVisualSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const updateTextField = (field: TextField, value: string) => {
    updateSettings({ [field]: value } as Partial<SiteVisualSettings>);
  };

  const updateColorField = (field: ColorField, value: string) => {
    updateSettings({ [field]: value } as Partial<SiteVisualSettings>);
  };

  const updateSizeField = (field: SizeField, value: string) => {
    updateSettings({ [field]: value } as Partial<SiteVisualSettings>);
  };

  const handleUpload = async (field: MediaField, file?: File) => {
    if (!file) return;

    setUploadingField(field);
    try {
      const upload = await uploadSiteMediaFile(file);
      updateSettings({ [field]: upload.url } as Partial<SiteVisualSettings>);
      toast.success('Imagem enviada. Salve para publicar a alteração.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadingField(null);
    }
  };

  const handlePublish = async () => {
    const previousSettings = settings;
    setSaving(true);
    try {
      const savedSettings = await saveSiteVisualSettings(settings);
      setSettings(savedSettings);
      await createSiteVisualSettingsAudit({
        action: 'published',
        previousPayload: previousSettings,
        nextPayload: savedSettings,
        note: 'Publicação manual via /admin/home.',
      });
      await loadAudit();
      toast.success('Configurações públicas publicadas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível publicar as configurações públicas.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const savedSettings = await saveSiteVisualSettingsDraft(settings);
      setSettings(savedSettings);
      await createSiteVisualSettingsAudit({
        action: 'draft_saved',
        nextPayload: settings,
        note: 'Rascunho salvo via /admin/home.',
      });
      await loadAudit();
      toast.success('Rascunho salvo. A versão pública ainda não foi alterada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o rascunho.');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedulePublication = async () => {
    if (!scheduledPublishAt) {
      toast.error('Informe data e hora para agendar a publicação.');
      return;
    }

    setSaving(true);
    try {
      const savedSettings = await scheduleSiteVisualSettingsPublication(settings, scheduledPublishAt);
      setSettings(savedSettings);
      await createSiteVisualSettingsAudit({
        action: 'scheduled',
        nextPayload: settings,
        note: `Publicação agendada para ${new Date(scheduledPublishAt).toLocaleString('pt-BR')}.`,
      });
      await loadAudit();
      toast.success('Publicação agendada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível agendar a publicação.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!settings.draft_payload) {
      toast.info('Não há rascunho salvo para publicar.');
      return;
    }

    setSaving(true);
    try {
      const savedSettings = await publishSiteVisualSettingsDraft();
      setSettings(savedSettings);
      await createSiteVisualSettingsAudit({
        action: 'published',
        nextPayload: savedSettings,
        note: 'Rascunho publicado via /admin/home.',
      });
      await loadAudit();
      toast.success('Rascunho publicado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível publicar o rascunho.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishDue = async () => {
    setSaving(true);
    try {
      const result = await publishDueSiteVisualSettings();
      await loadSettings();
      if (result.published) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível executar publicações vencidas.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (!window.confirm('Restaurar os textos, cores e links padrão? As imagens enviadas serão removidas desta configuração.')) return;
    setSettings(DEFAULT_SITE_VISUAL_SETTINGS);
    toast.info('Configuração restaurada localmente. Publique para alterar a versão pública.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Configurações públicas"
        subtitle="Gerencie a tela de entrada, identidade visual, links públicos, SEO, rascunhos, publicação e histórico visual."
        icon={Palette}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
        ]}
        customActions={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={resetSettings} disabled={saving || loading} className="w-full rounded-xl sm:w-auto">
              Restaurar padrão
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving || loading} className="w-full rounded-xl sm:w-auto">
              Salvar rascunho
            </Button>
            <Button onClick={handlePublish} disabled={saving || loading} className="w-full rounded-xl shadow-sm sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Publicar agora'}
            </Button>
          </div>
        )}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <StatusCard
          publicationLabel={publicationLabel}
          settings={settings}
          draftDiff={draftDiff}
          scheduledPublishAt={scheduledPublishAt}
          onScheduledPublishAtChange={setScheduledPublishAt}
          onSchedule={handleSchedulePublication}
          onPublishDraft={handlePublishDraft}
          onPublishDue={handlePublishDue}
          saving={saving || loading}
        />

        <Tabs defaultValue="entrar" className="mt-6 space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="grid min-w-[860px] grid-cols-6">
              <TabsTrigger value="entrar">/entrar</TabsTrigger>
              <TabsTrigger value="visual">Identidade visual</TabsTrigger>
              <TabsTrigger value="links">Links públicos</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="entrar" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Type className="h-5 w-5 text-blue-700" />
                      Conteúdo editorial da tela de entrada
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Textos usados na área pública de login e primeiro acesso.
                    </p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4">
                    <TextInput label="Chamada superior" value={settings.entrance_eyebrow} onChange={(value) => updateTextField('entrance_eyebrow', value)} />
                    <TextInput label="Título principal" value={settings.entrance_title} onChange={(value) => updateTextField('entrance_title', value)} />
                    <TextareaInput label="Descrição principal" value={settings.entrance_description} rows={5} onChange={(value) => updateTextField('entrance_description', value)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-blue-700" />
                      Formulários e chamadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput label="Título do login" value={settings.entrance_login_title} onChange={(value) => updateTextField('entrance_login_title', value)} />
                    <TextInput label="Descrição do login" value={settings.entrance_login_description} onChange={(value) => updateTextField('entrance_login_description', value)} />
                    <TextInput label="Título do primeiro acesso" value={settings.entrance_first_access_title} onChange={(value) => updateTextField('entrance_first_access_title', value)} />
                    <TextInput label="Descrição do primeiro acesso" value={settings.entrance_first_access_description} onChange={(value) => updateTextField('entrance_first_access_description', value)} />
                    <TextInput label="Título de confirmação" value={settings.entrance_confirmation_title} onChange={(value) => updateTextField('entrance_confirmation_title', value)} />
                    <TextInput label="Descrição de confirmação" value={settings.entrance_confirmation_description} onChange={(value) => updateTextField('entrance_confirmation_description', value)} />
                    <TextInput label="Botão de login" value={settings.entrance_login_cta_label} onChange={(value) => updateTextField('entrance_login_cta_label', value)} />
                    <TextInput label="Botão de validar código" value={settings.entrance_first_access_cta_label} onChange={(value) => updateTextField('entrance_first_access_cta_label', value)} />
                    <TextInput label="Botão de criar conta" value={settings.entrance_create_account_cta_label} onChange={(value) => updateTextField('entrance_create_account_cta_label', value)} />
                    <TextInput label="Link de recuperação de senha" value={settings.entrance_forgot_password_label} onChange={(value) => updateTextField('entrance_forgot_password_label', value)} />
                  </CardContent>
                </Card>
              </div>

              <PreviewCard settings={settings} previewMode={previewMode} onPreviewModeChange={setPreviewMode} />
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe2 className="h-5 w-5 text-blue-700" />
                      Identidade global
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Base textual reutilizável por páginas públicas e futuras áreas institucionais.
                    </p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput label="Nome completo" value={settings.global_identity_name} onChange={(value) => updateTextField('global_identity_name', value)} />
                    <TextInput label="Nome curto" value={settings.global_identity_short_name} onChange={(value) => updateTextField('global_identity_short_name', value)} />
                    <TextInput label="Tagline" value={settings.global_identity_tagline} onChange={(value) => updateTextField('global_identity_tagline', value)} />
                    <TextInput label="Alt text da logo" value={settings.home_logo_alt_text} onChange={(value) => updateTextField('home_logo_alt_text', value)} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <MediaUploadCard
                    title="Logo da home"
                    description="Imagem exibida acima do título da tela pública. Sem configuração, usa /favicon.svg."
                    value={settings.home_logo_media_url}
                    previewFallback="/favicon.svg"
                    uploading={uploadingField === 'home_logo_media_url'}
                    onUpload={(file) => handleUpload('home_logo_media_url', file)}
                    onRemove={() => updateSettings({ home_logo_media_url: null })}
                  />

                  <MediaUploadCard
                    title="Mídia de background"
                    description="Imagem de fundo opcional exibida acima da cor configurada."
                    value={settings.home_background_media_url}
                    uploading={uploadingField === 'home_background_media_url'}
                    onUpload={(file) => handleUpload('home_background_media_url', file)}
                    onRemove={() => updateSettings({ home_background_media_url: null })}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-blue-700" />
                      Cores, raios e superfície
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {HOME_BACKGROUND_COLORS.map((color) => {
                        const selected = settings.home_background_color === color.value;

                        return (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => updateSettings({ home_background_color: color.value })}
                            className={[
                              'flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition',
                              selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300',
                            ].join(' ')}
                          >
                            <span className="h-8 w-8 shrink-0 rounded border border-gray-300" style={{ backgroundColor: color.value }} aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block break-words text-sm font-medium text-gray-900">{color.label}</span>
                              <span className="block text-xs text-gray-500">{color.value}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <ColorInput label="Cor primária" value={settings.global_primary_color} onChange={(value) => updateColorField('global_primary_color', value)} />
                      <ColorInput label="Cor de destaque" value={settings.global_accent_color} onChange={(value) => updateColorField('global_accent_color', value)} />
                      <ColorInput label="Cor do texto" value={settings.global_text_color} onChange={(value) => updateColorField('global_text_color', value)} />
                      <ColorInput label="Cor do texto secundário" value={settings.global_muted_text_color} onChange={(value) => updateColorField('global_muted_text_color', value)} />
                      <ColorInput label="Cor dos cards" value={settings.global_card_background_color} onChange={(value) => updateColorField('global_card_background_color', value)} />
                      <SizeInput label="Raio dos botões" value={settings.global_button_radius} onChange={(value) => updateSizeField('global_button_radius', value)} />
                      <SizeInput label="Raio dos cards" value={settings.global_card_radius} onChange={(value) => updateSizeField('global_card_radius', value)} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {GLOBAL_THEME_COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => updateSettings({ global_primary_color: color.value })}
                          className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-gray-300"
                        >
                          <span className="h-8 w-8 shrink-0 rounded border border-gray-300" style={{ backgroundColor: color.value }} aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block break-words text-sm font-medium text-gray-900">{color.label}</span>
                            <span className="block text-xs text-gray-500">Aplicar como primária</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <Label>Opacidade do background</Label>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={settings.home_background_media_opacity}
                        onChange={(event) => updateSettings({ home_background_media_opacity: Number(event.target.value) })}
                        aria-label="Opacidade do background"
                      />
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={settings.home_background_media_opacity}
                          onChange={(event) => updateSettings({ home_background_media_opacity: Number(event.target.value) })}
                          className="w-28"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <PreviewCard settings={settings} previewMode={previewMode} onPreviewModeChange={setPreviewMode} />
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link2 className="h-5 w-5 text-blue-700" />
                  Links e rodapé público
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Links usados na tela de entrada e preparados para demais páginas públicas.
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput label="Label de termos" value={settings.public_terms_label} onChange={(value) => updateTextField('public_terms_label', value)} />
                <TextInput label="URL de termos" value={settings.public_terms_url} onChange={(value) => updateTextField('public_terms_url', value)} />
                <TextInput label="Label de privacidade" value={settings.public_privacy_label} onChange={(value) => updateTextField('public_privacy_label', value)} />
                <TextInput label="URL de privacidade" value={settings.public_privacy_url} onChange={(value) => updateTextField('public_privacy_url', value)} />
                <TextInput label="Label de suporte" value={settings.public_support_label ?? ''} onChange={(value) => updateTextField('public_support_label', value)} />
                <TextInput label="URL de suporte" value={settings.public_support_url ?? ''} onChange={(value) => updateTextField('public_support_url', value)} />
                <div className="md:col-span-2">
                  <TextareaInput label="Nota de rodapé" value={settings.entrance_footer_note ?? ''} rows={3} onChange={(value) => updateTextField('entrance_footer_note', value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-blue-700" />
                  SEO e compartilhamento
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Base de metadados para páginas públicas. A tela /entrar já atualiza o título do documento com estes dados.
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <TextInput label="Título SEO" value={settings.seo_title} onChange={(value) => updateTextField('seo_title', value)} />
                <TextareaInput label="Descrição SEO" value={settings.seo_description} rows={4} onChange={(value) => updateTextField('seo_description', value)} />
                <MediaUploadCard
                  title="Imagem de compartilhamento"
                  description="Imagem preparada para cards sociais e futuras páginas públicas."
                  value={settings.social_share_image_url}
                  uploading={uploadingField === 'social_share_image_url'}
                  onUpload={(file) => handleUpload('social_share_image_url', file)}
                  onRemove={() => updateSettings({ social_share_image_url: null })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <AuditPanel records={auditRecords} loading={auditLoading} onRefresh={loadAudit} />
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-blue-700" />
                  Próximas áreas gerenciáveis
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Base criada para curto, médio e longo prazo. Estes itens ficam documentados na interface para orientar as próximas frentes.
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RoadmapCard
                  title="Concluído nesta frente"
                  items={[
                    'Texto e identidade da tela /entrar',
                    'Tema público aplicado a /termos e /privacidade',
                    'Preview mobile/desktop no admin',
                    'Histórico visual e auditoria',
                  ]}
                />
                <RoadmapCard
                  title="Base pronta"
                  items={[
                    'Rascunho persistido no banco',
                    'Agendamento persistido no banco',
                    'Publicação manual de rascunho',
                    'Publicação automática por RPC e Edge Function',
                  ]}
                />
                <RoadmapCard
                  title="Longo prazo"
                  items={[
                    'Configurar scheduler externo da Edge Function',
                    'Templates por família ou domínio',
                    'Comparativo visual com screenshots',
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatusCard({
  publicationLabel,
  settings,
  draftDiff,
  scheduledPublishAt,
  onScheduledPublishAtChange,
  onSchedule,
  onPublishDraft,
  onPublishDue,
  saving,
}: {
  publicationLabel: string;
  settings: SiteVisualSettings;
  draftDiff: SiteVisualSettingsDiff[];
  scheduledPublishAt: string;
  onScheduledPublishAtChange: (value: string) => void;
  onSchedule: () => void;
  onPublishDraft: () => void;
  onPublishDue: () => void;
  saving: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-950">Status: {publicationLabel}</p>
            <p className="text-sm text-gray-500">
              {settings.publication_status === 'scheduled' && settings.scheduled_publish_at
                ? `Agendada para ${new Date(settings.scheduled_publish_at).toLocaleString('pt-BR')}.`
                : settings.draft_payload
                  ? 'Há um rascunho salvo que pode ser publicado manualmente.'
                  : 'A versão pública está sincronizada com a última publicação manual.'}
            </p>
            {settings.last_published_at ? (
              <p className="text-xs text-gray-400">Última publicação: {new Date(settings.last_published_at).toLocaleString('pt-BR')}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="datetime-local"
              value={scheduledPublishAt}
              onChange={(event) => onScheduledPublishAtChange(event.target.value)}
              className="sm:w-56"
              aria-label="Data e hora de publicação agendada"
            />
            <Button type="button" variant="outline" onClick={onSchedule} disabled={saving}>
              <Clock className="mr-2 h-4 w-4" />
              Agendar
            </Button>
            <Button type="button" variant="outline" onClick={onPublishDue} disabled={saving}>
              Executar vencidas
            </Button>
            <Button type="button" variant="outline" onClick={onPublishDraft} disabled={saving || !settings.draft_payload}>
              Publicar rascunho
            </Button>
          </div>
        </div>
        <DraftComparisonPanel diff={draftDiff} />
      </CardContent>
    </Card>
  );
}

function DraftComparisonPanel({ diff }: { diff: SiteVisualSettingsDiff[] }) {
  if (diff.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        Não há diferenças entre a versão publicada e o rascunho salvo.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-950">
        <Diff className="h-4 w-4" />
        Comparativo publicado x rascunho ({diff.length} alterações)
      </div>
      <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-blue-100 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-blue-100 bg-blue-50/60 text-xs uppercase tracking-wide text-blue-900">
            <tr>
              <th className="px-3 py-2">Campo</th>
              <th className="px-3 py-2">Publicado</th>
              <th className="px-3 py-2">Rascunho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {diff.map((item) => (
              <tr key={item.field}>
                <td className="px-3 py-2 font-medium text-gray-900">{item.label}</td>
                <td className="max-w-xs break-words px-3 py-2 text-gray-500">{item.publishedValue}</td>
                <td className="max-w-xs break-words px-3 py-2 text-gray-700">{item.draftValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextareaInput({ label, value, rows = 4, onChange }: { label: string; value: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <Textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="flex gap-2">
        <Input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 shrink-0 p-1" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function SizeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <Input value={value} placeholder="0.75rem" onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function MediaUploadCard({
  title,
  description,
  value,
  previewFallback,
  uploading,
  onUpload,
  onRemove,
}: {
  title: string;
  description: string;
  value: string | null;
  previewFallback?: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onRemove: () => void;
}) {
  const previewUrl = value || previewFallback;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-blue-700" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 sm:w-40">
            {previewUrl ? (
              <img src={previewUrl} alt={title} className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-10 w-10 text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <Label className="block">
              <div className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-4 py-3 transition hover:bg-gray-50">
                <Upload className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{uploading ? 'Enviando...' : value ? 'Alterar imagem' : 'Enviar imagem'}</span>
              </div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={(event) => {
                  onUpload(event.target.files?.[0]);
                  event.target.value = '';
                }}
                disabled={uploading}
                className="hidden"
              />
            </Label>

            <p className="text-xs text-gray-500">Formatos aceitos: JPG, PNG, WebP, GIF e SVG. Tamanho máximo: 5MB.</p>

            <Button type="button" variant="outline" onClick={onRemove} disabled={!value || uploading} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Remover imagem
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewCard({
  settings,
  previewMode,
  onPreviewModeChange,
}: {
  settings: SiteVisualSettings;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
}) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">Prévia responsiva</CardTitle>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => onPreviewModeChange('mobile')}
              className={[
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                previewMode === 'mobile' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500',
              ].join(' ')}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => onPreviewModeChange('desktop')}
              className={[
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                previewMode === 'desktop' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500',
              ].join(' ')}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={previewMode === 'mobile' ? 'mx-auto max-w-[390px]' : 'w-full'}>
          <div
            className="relative min-h-96 overflow-hidden rounded-lg border border-gray-200 p-5"
            style={{ backgroundColor: settings.home_background_color, color: settings.global_text_color }}
          >
            {settings.home_background_media_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${settings.home_background_media_url}")`,
                  opacity: settings.home_background_media_opacity / 100,
                }}
                aria-hidden="true"
              />
            ) : null}
            <div className="relative z-10">
              <img
                src={settings.home_logo_media_url || '/favicon.svg'}
                alt={settings.home_logo_alt_text}
                className="mb-5 h-auto w-24 object-contain"
              />
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: settings.global_primary_color }}>
                {settings.entrance_eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold" style={{ color: settings.global_text_color }}>
                {settings.entrance_title}
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: settings.global_muted_text_color }}>
                {settings.entrance_description}
              </p>
              <div className="mt-6 rounded-xl border border-gray-200 p-4 shadow-sm" style={{ backgroundColor: settings.global_card_background_color, borderRadius: settings.global_card_radius }}>
                <p className="text-lg font-semibold" style={{ color: settings.global_text_color }}>{settings.entrance_login_title}</p>
                <p className="mt-1 text-xs" style={{ color: settings.global_muted_text_color }}>{settings.entrance_login_description}</p>
                <div className="mt-4 h-10 rounded-lg" style={{ backgroundColor: settings.global_primary_color, borderRadius: settings.global_button_radius }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditPanel({ records, loading, onRefresh }: { records: SiteVisualSettingsAuditRecord[]; loading: boolean; onRefresh: () => void }) {
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);
  const [changesByRecord, setChangesByRecord] = useState<Record<string, SiteVisualSettingsAuditChange[]>>({});
  const [loadingRecordId, setLoadingRecordId] = useState<string | null>(null);
  const [errorByRecord, setErrorByRecord] = useState<Record<string, string>>({});

  const handleToggleChanges = async (record: SiteVisualSettingsAuditRecord) => {
    if (openRecordId === record.id) {
      setOpenRecordId(null);
      return;
    }

    setOpenRecordId(record.id);

    if (changesByRecord[record.id] || loadingRecordId === record.id) return;

    setLoadingRecordId(record.id);
    setErrorByRecord((current) => ({ ...current, [record.id]: '' }));

    const result = await listSiteVisualSettingsAuditChanges(record.id);

    if (result.error) {
      setErrorByRecord((current) => ({ ...current, [record.id]: result.error ?? 'Não foi possível carregar as alterações.' }));
    } else {
      setChangesByRecord((current) => ({ ...current, [record.id]: result.data }));
    }

    setLoadingRecordId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-blue-700" />
              Histórico visual
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">Registro das ações de publicação, rascunho e agendamento feitas no admin.</p>
          </div>
          <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}>
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Carregando histórico...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum registro de auditoria encontrado.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const changeCount = countAuditChangedFields(record);
              const isOpen = openRecordId === record.id;
              const changes = changesByRecord[record.id] ?? [];
              const isLoadingChanges = loadingRecordId === record.id;
              const error = errorByRecord[record.id];

              return (
                <div key={record.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-gray-900">{getAuditActionLabel(record.action)}</p>
                    <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  {record.note ? <p className="mt-2 text-sm text-gray-600">{record.note}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">Campos alterados: {changeCount}</span>
                    {record.created_by ? <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">Usuário: {record.created_by}</span> : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full px-3 text-xs"
                      onClick={() => handleToggleChanges(record)}
                      disabled={changeCount === 0 || isLoadingChanges}
                      aria-expanded={isOpen}
                    >
                      <Diff className="mr-1 h-3.5 w-3.5" />
                      {isLoadingChanges ? 'Carregando...' : isOpen ? 'Ocultar alterações' : 'Ver alterações'}
                    </Button>
                  </div>

                  {isOpen ? (
                    <AuditChangesPanel
                      changes={changes}
                      loading={isLoadingChanges}
                      error={error}
                    />
                  ) : null}

                  <p className="mt-2 text-xs text-gray-400">ID: {record.id}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AuditChangesPanel({
  changes,
  loading,
  error,
}: {
  changes: SiteVisualSettingsAuditChange[];
  loading: boolean;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        Carregando alterações detalhadas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        Nenhuma diferença detalhada retornada para este registro.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-auto rounded-xl border border-blue-100 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-blue-100 bg-blue-50/60 text-xs uppercase tracking-wide text-blue-900">
          <tr>
            <th className="px-3 py-2">Campo</th>
            <th className="px-3 py-2">Antes</th>
            <th className="px-3 py-2">Depois</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {changes.map((change) => (
            <tr key={change.field_key}>
              <td className="px-3 py-2 font-medium text-gray-900">{change.field_label}</td>
              <td className="max-w-xs break-words px-3 py-2 text-gray-500">{formatAuditValue(change.previous_value)}</td>
              <td className="max-w-xs break-words px-3 py-2 text-gray-700">{formatAuditValue(change.next_value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatAuditValue(value?: string | null) {
  const cleanValue = String(value ?? '').trim();
  return cleanValue || '—';
}

function countAuditChangedFields(record: SiteVisualSettingsAuditRecord) {
  if (!record.previous_payload || !record.next_payload) return record.next_payload ? Object.keys(record.next_payload).length : 0;

  const keys = new Set([
    ...Object.keys(record.previous_payload),
    ...Object.keys(record.next_payload),
  ]);

  return Array.from(keys).filter((key) => (
    JSON.stringify(record.previous_payload?.[key as keyof typeof record.previous_payload] ?? null) !==
    JSON.stringify(record.next_payload?.[key as keyof typeof record.next_payload] ?? null)
  )).length;
}

function getAuditActionLabel(action: SiteVisualSettingsAuditRecord['action']) {
  const labels: Record<SiteVisualSettingsAuditRecord['action'], string> = {
    created: 'Configuração criada',
    updated: 'Configuração atualizada',
    published: 'Publicação realizada',
    scheduled: 'Publicação agendada',
    draft_saved: 'Rascunho salvo',
    restored: 'Padrão restaurado',
  };

  return labels[action] ?? action;
}

function RoadmapCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="font-semibold text-gray-900">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
