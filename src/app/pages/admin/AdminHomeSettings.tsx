import { useEffect, useState } from 'react';
import { Globe2, ImageIcon, Link2, Palette, Save, Search, Settings, Sparkles, Trash2, Type, Upload } from 'lucide-react';
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
  GLOBAL_THEME_COLOR_OPTIONS,
  HOME_BACKGROUND_COLORS,
  saveSiteVisualSettings,
  SiteVisualSettings,
} from '../../services/siteVisualSettingsService';
import { uploadSiteMediaFile } from '../../services/storageService';

type MediaField = 'home_logo_media_url' | 'home_background_media_url' | 'social_share_image_url';

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

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        setLoading(true);
        const data = await getSiteVisualSettings();
        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar as configurações públicas.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedSettings = await saveSiteVisualSettings(settings);
      setSettings(savedSettings);
      toast.success('Configurações públicas salvas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar as configurações públicas.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (!window.confirm('Restaurar os textos, cores e links padrão? As imagens enviadas serão removidas desta configuração.')) return;
    setSettings(DEFAULT_SITE_VISUAL_SETTINGS);
    toast.info('Configuração restaurada localmente. Salve para publicar.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Configurações públicas"
        subtitle="Gerencie a tela de entrada, identidade visual, links públicos, SEO e base de tema do site."
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
            <Button onClick={handleSave} disabled={saving || loading} className="w-full rounded-xl shadow-sm sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        )}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="entrar" className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="grid min-w-[720px] grid-cols-5">
              <TabsTrigger value="entrar">/entrar</TabsTrigger>
              <TabsTrigger value="visual">Identidade visual</TabsTrigger>
              <TabsTrigger value="links">Links públicos</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="entrar" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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

              <PreviewCard settings={settings} />
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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

              <PreviewCard settings={settings} />
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
                  title="Curto prazo"
                  items={[
                    'Texto e identidade da tela /entrar',
                    'Logo, background e cores globais',
                    'Links de termos, privacidade e suporte',
                  ]}
                />
                <RoadmapCard
                  title="Médio prazo"
                  items={[
                    'Aplicar provider de tema em páginas públicas',
                    'Gerenciar blocos editoriais da home pública',
                    'Criar preview responsivo mobile/desktop',
                  ]}
                />
                <RoadmapCard
                  title="Longo prazo"
                  items={[
                    'Templates por família ou domínio',
                    'Versionamento e agendamento de campanhas públicas',
                    'Auditoria de alterações visuais e publicação em etapas',
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

function PreviewCard({ settings }: { settings: SiteVisualSettings }) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-lg">Prévia da entrada</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
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
