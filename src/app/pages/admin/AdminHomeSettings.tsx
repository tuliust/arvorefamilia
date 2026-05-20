import { useEffect, useState } from 'react';
import { ImageIcon, Palette, Save, Settings, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  DEFAULT_SITE_VISUAL_SETTINGS,
  getSiteVisualSettings,
  HOME_BACKGROUND_COLORS,
  saveSiteVisualSettings,
  SiteVisualSettings,
} from '../../services/siteVisualSettingsService';
import { uploadSiteMediaFile } from '../../services/storageService';

type MediaField = 'home_logo_media_url' | 'home_background_media_url';

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
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a aparência da home.');
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

  const handleUpload = async (field: MediaField, file?: File) => {
    if (!file) return;

    setUploadingField(field);
    try {
      const upload = await uploadSiteMediaFile(file);
      updateSettings({ [field]: upload.url });
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
      toast.success('Aparência da home salva.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a aparência da home.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Aparência da home"
        subtitle="Configurações visuais da tela de entrada pública."
        icon={Palette}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
        ]}
        customActions={(
          <Button onClick={handleSave} disabled={saving || loading} className="w-full rounded-xl shadow-sm sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        )}
      />

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <MediaUploadCard
            title="Logo da home"
            description="Imagem exibida acima do título Árvore Genealógica. Sem configuração, usa /favicon.svg."
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-blue-700" />
                Cor de fundo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      <span
                        className="h-8 w-8 shrink-0 rounded border border-gray-300"
                        style={{ backgroundColor: color.value }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-medium text-gray-900">{color.label}</span>
                        <span className="block text-xs text-gray-500">{color.value}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opacidade do background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Prévia</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative min-h-72 overflow-hidden rounded-lg border border-gray-200 p-5"
              style={{ backgroundColor: settings.home_background_color }}
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
                  alt="Árvore Genealógica da Família"
                  className="mb-5 h-auto w-24 object-contain"
                />
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Árvore Genealógica</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-950">Família Barros Souza</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Use o código de primeiro acesso para ativar sua conta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
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
