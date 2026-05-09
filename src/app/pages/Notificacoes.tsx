import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, BellRing, CheckCheck, ExternalLink, Inbox, Mail, Trash2 } from 'lucide-react';
import { AppLink as Link } from '../components/AppLink';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { NotificacaoUsuario, PreferenciaNotificacao } from '../types';
import {
  garantirNotificacaoInicialSupabase,
  listarNotificacoesSupabase,
  marcarNotificacaoSupabaseComoLida,
  marcarTodasNotificacoesSupabaseComoLidas,
  obterPreferenciasNotificacao,
  removerNotificacaoSupabase,
  salvarPreferenciasNotificacao,
} from '../services/userEngagementService';

type EmailPreferenceKey =
  | 'receber_email_novo_usuario'
  | 'receber_email_datas_especiais'
  | 'receber_email_novas_mensagens_forum'
  | 'receber_email_novos_registros_historicos'
  | 'receber_email_evento_historico_familia';

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
    description: 'Atualizações em conversas e tópicos familiares.',
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

function formatarData(valor?: string) {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Notificacoes() {
  const { user } = useAuth();
  const [preferencias, setPreferencias] = useState<PreferenciaNotificacao | null>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const prefs = await obterPreferenciasNotificacao(user.id);
      await garantirNotificacaoInicialSupabase(user.id);
      const lista = await listarNotificacoesSupabase(user.id);

      setPreferencias(prefs);
      setNotificacoes(lista);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erro ao carregar notificações.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const naoLidas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.lida).length,
    [notificacoes]
  );

  const atualizarPreferencia = async (key: keyof PreferenciaNotificacao, checked: boolean) => {
    if (!user || !preferencias) return;

    const next = {
      ...preferencias,
      [key]: checked,
    };

    setPreferencias(next);
    setSavingKey(String(key));

    try {
      const saved = await salvarPreferenciasNotificacao(user.id, next);
      setPreferencias(saved);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Erro ao salvar preferências.';
      setError(message);
      setPreferencias(preferencias);
    } finally {
      setSavingKey(null);
    }
  };

  const marcarComoLida = async (id: string) => {
    setNotificacoes((current) =>
      current.map((notificacao) => (notificacao.id === id ? { ...notificacao, lida: true } : notificacao))
    );
    await marcarNotificacaoSupabaseComoLida(id);
  };

  const marcarTodas = async () => {
    if (!user) return;
    setNotificacoes((current) => current.map((notificacao) => ({ ...notificacao, lida: true })));
    await marcarTodasNotificacoesSupabaseComoLidas(user.id);
  };

  const remover = async (id: string) => {
    setNotificacoes((current) => current.filter((notificacao) => notificacao.id !== id));
    await removerNotificacaoSupabase(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Notificações</h1>
          <p className="mt-2 text-sm text-gray-600">Faça login para gerenciar suas notificações familiares.</p>
          <Link
            to="/entrar"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
            <p className="text-sm text-gray-500">
              Gerencie seus avisos e acompanhe atualizações importantes da família.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit rounded-lg border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-base">Preferências por email</CardTitle>
                <p className="text-xs text-gray-500">A lista interna continua visível mesmo com email desligado.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && !preferencias ? (
              <p className="text-sm text-gray-500">Carregando preferências...</p>
            ) : preferencias ? (
              <>
                <PreferenceToggle
                  label="Receber notificações por email"
                  description="Controle geral para todos os emails opcionais."
                  checked={preferencias.receber_email}
                  disabled={savingKey === 'receber_email'}
                  onCheckedChange={(checked) => atualizarPreferencia('receber_email', checked)}
                />

                <div className="border-t border-gray-100 pt-3">
                  <div className="space-y-3">
                    {EMAIL_OPTIONS.map((option) => (
                      <PreferenceToggle
                        key={option.key}
                        label={option.label}
                        description={option.description}
                        checked={Boolean(preferencias[option.key])}
                        disabled={!preferencias.receber_email || savingKey === option.key}
                        muted={!preferencias.receber_email}
                        onCheckedChange={(checked) => atualizarPreferencia(option.key, checked)}
                      />
                    ))}
                  </div>
                </div>

                {savingKey && <p className="text-xs text-gray-500">Salvando preferências...</p>}
              </>
            ) : (
              <p className="text-sm text-red-600">Não foi possível carregar as preferências.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  {naoLidas > 0 ? <BellRing className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
                </span>
                <div>
                  <CardTitle className="text-base">Notificações recentes</CardTitle>
                  <p className="text-xs text-gray-500">{naoLidas} não lida(s)</p>
                </div>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={marcarTodas} disabled={naoLidas === 0}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <Inbox className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.map((item) => (
                  <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                              item.lida ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700',
                            ].join(' ')}
                          >
                            {item.lida ? 'Lida' : 'Nova'}
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {item.tipo}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">{item.titulo}</h2>
                        <p className="text-sm leading-relaxed text-gray-600">{item.mensagem}</p>
                        <p className="text-xs text-gray-400">{formatarData(item.created_at)}</p>
                        {item.link && (
                          <Link
                            to={item.link}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                          >
                            Abrir conteúdo
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!item.lida && (
                          <button
                            type="button"
                            onClick={() => marcarComoLida(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Marcar como lida"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remover(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remover notificação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
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
        'flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3',
        muted ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs leading-relaxed text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
