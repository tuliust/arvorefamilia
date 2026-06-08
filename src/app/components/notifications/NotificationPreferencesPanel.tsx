import React, { useCallback, useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { PreferenciaNotificacao } from '../../types';
import {
  obterPreferenciasNotificacao,
  salvarPreferenciasNotificacao,
} from '../../services/userEngagementService';

type EmailPreferenceKey =
  | 'receber_email_novo_usuario'
  | 'receber_email_datas_especiais'
  | 'receber_email_novas_mensagens_forum'
  | 'receber_email_novos_registros_historicos'
  | 'receber_email_evento_historico_familia';

type GeneralPreferenceKey =
  | 'receber_aniversarios'
  | 'receber_datas_memoria'
  | 'receber_eventos'
  | 'receber_avisos_gerais'
  | 'receber_push'
  | 'receber_whatsapp';

const GENERAL_OPTIONS: Array<{ key: GeneralPreferenceKey; label: string; description: string }> = [
  {
    key: 'receber_aniversarios',
    label: 'Aniversários',
    description: 'Avisos sobre aniversários de familiares.',
  },
  {
    key: 'receber_datas_memoria',
    label: 'Datas de memória',
    description: 'Lembretes de datas marcantes da família.',
  },
  {
    key: 'receber_eventos',
    label: 'Eventos familiares',
    description: 'Convites e atualizações de eventos.',
  },
  {
    key: 'receber_avisos_gerais',
    label: 'Publicações e avisos gerais',
    description: 'Menções, pessoas relacionadas em publicações e comunicados importantes da plataforma.',
  },
  {
    key: 'receber_push',
    label: 'Notificações push',
    description: 'Avisos pelo navegador quando disponíveis.',
  },
  {
    key: 'receber_whatsapp',
    label: 'Avisos por WhatsApp',
    description: 'Comunicações familiares por WhatsApp quando disponíveis.',
  },
];

const EMAIL_OPTIONS: Array<{ key: EmailPreferenceKey; label: string; description: string }> = [
  {
    key: 'receber_email_novo_usuario',
    label: 'Novo usuário adicionado',
    description: 'Avisos quando um novo familiar entra na plataforma.',
  },
  {
    key: 'receber_email_datas_especiais',
    label: 'Datas especiais',
    description: 'Aniversários, memórias e datas importantes da família.',
  },
  {
    key: 'receber_email_novas_mensagens_forum',
    label: 'Novas mensagens no fórum',
    description: 'Atualizações, menções e relações em conversas e tópicos familiares.',
  },
  {
    key: 'receber_email_novos_registros_historicos',
    label: 'Novos registros históricos',
    description: 'Fotos, documentos e memórias adicionados à árvore.',
  },
  {
    key: 'receber_email_evento_historico_familia',
    label: 'Evento histórico da família',
    description: 'Avisos em dias relacionados à história familiar.',
  },
];

interface NotificationPreferencesPanelProps {
  userId: string;
}

export function NotificationPreferencesPanel({ userId }: NotificationPreferencesPanelProps) {
  const [preferencias, setPreferencias] = useState<PreferenciaNotificacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carregarPreferencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await obterPreferenciasNotificacao(userId);
      setPreferencias(prefs);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erro ao carregar preferências.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregarPreferencias();
  }, [carregarPreferencias]);

  const atualizarPreferencia = async (key: keyof PreferenciaNotificacao, checked: boolean) => {
    if (!preferencias) return;

    const previous = preferencias;
    const next = {
      ...preferencias,
      [key]: checked,
    };

    setPreferencias(next);
    setSavingKey(String(key));
    setError(null);

    try {
      const saved = await salvarPreferenciasNotificacao(userId, next);
      setPreferencias(saved);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Erro ao salvar preferências.';
      setError(message);
      setPreferencias(previous);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Card className="w-full min-w-0 rounded-lg border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Mail className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <CardTitle className="break-words text-base">Notificações</CardTitle>
            <p className="break-words text-xs text-gray-500">
              A lista interna continua visível mesmo com canais desligados.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="break-words rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </div>
        )}

        {loading && !preferencias ? (
          <p className="break-words text-sm text-gray-500">Carregando preferências...</p>
        ) : preferencias ? (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {GENERAL_OPTIONS.map((option) => (
                <PreferenceToggle
                  key={option.key}
                  label={option.label}
                  description={option.description}
                  checked={preferencias[option.key] !== false}
                  disabled={savingKey === option.key}
                  onCheckedChange={(checked) => atualizarPreferencia(option.key, checked)}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <PreferenceToggle
                label="Receber notificações por email"
                description="Controle geral para todos os emails opcionais."
                checked={preferencias.receber_email !== false}
                disabled={savingKey === 'receber_email'}
                onCheckedChange={(checked) => atualizarPreferencia('receber_email', checked)}
              />
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {EMAIL_OPTIONS.map((option) => (
                  <PreferenceToggle
                    key={option.key}
                    label={option.label}
                    description={option.description}
                    checked={preferencias[option.key] !== false}
                    disabled={preferencias.receber_email === false || savingKey === option.key}
                    muted={preferencias.receber_email === false}
                    onCheckedChange={(checked) => atualizarPreferencia(option.key, checked)}
                  />
                ))}
              </div>
            </div>

            {savingKey && <p className="break-words text-xs text-gray-500">Salvando preferências...</p>}
          </>
        ) : (
          <p className="break-words text-sm text-red-600">Não foi possível carregar as preferências.</p>
        )}
      </CardContent>
    </Card>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  disabled,
  muted,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  muted?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={[
        'flex h-full min-w-0 items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3',
        muted ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-gray-900">{label}</p>
        <p className="break-words text-xs leading-relaxed text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}
