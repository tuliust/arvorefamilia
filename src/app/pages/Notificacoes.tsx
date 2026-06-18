import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BellRing, CheckCheck, Inbox, Settings, Trash2 } from 'lucide-react';
import { AppLink as Link } from '../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { NotificacaoUsuario } from '../types';
import {
  listarNotificacoesSupabase,
  marcarNotificacaoSupabaseComoLida,
  marcarTodasNotificacoesSupabaseComoLidas,
  removerNotificacaoSupabase,
} from '../services/userEngagementService';

function formatarHora(data: Date) {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatarDataNotificacao(valor?: string) {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  const agora = new Date();
  const diffMs = Math.max(0, agora.getTime() - data.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) return 'Agora';
  if (diffMinutes < 2) return 'Agora há pouco';
  if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;

  if (isSameCalendarDay(data, agora)) {
    return `Hoje, às ${formatarHora(data)}`;
  }

  if (diffHours < 24) {
    return `Há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  }

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);

  if (isSameCalendarDay(data, ontem)) {
    return `Ontem, às ${formatarHora(data)}`;
  }

  const dataCurta = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  return `Dia ${dataCurta}, às ${formatarHora(data)}`;
}

function formatarContagemNaoLidas(total: number) {
  if (total <= 0) return 'Todas lidas';
  if (total === 1) return '1 não lida';
  return `${total} não lidas`;
}

function normalizeNotificationText(value?: string | null) {
  return String(value ?? '')
    .replace(/\bData de memoria\b/g, 'Data de memória')
    .replace(/\bHoje e uma data de memoria\b/g, 'Hoje é uma data de memória')
    .replace(/\bAniversario na familia\b/g, 'Aniversário na família')
    .replace(/\bHoje e aniversario\b/g, 'Hoje é aniversário');
}

export function Notificacoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const lista = await listarNotificacoesSupabase(user.id);

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

  const abrirConteudo = useCallback(
    (link?: string) => {
      if (!link) return;
      navigate(link);
    },
    [navigate]
  );

  const notificarAtualizacaoNotificacoes = () => {
    window.dispatchEvent(new Event('arvorefamilia:notifications-updated'));
  };

  const marcarComoLida = async (id: string) => {
    if (!user) return;

    setNotificacoes((current) =>
      current.map((notificacao) => (notificacao.id === id ? { ...notificacao, lida: true } : notificacao))
    );
    await marcarNotificacaoSupabaseComoLida(id, user.id);
    notificarAtualizacaoNotificacoes();
  };

  const marcarTodas = async () => {
    if (!user) return;
    setNotificacoes((current) => current.map((notificacao) => ({ ...notificacao, lida: true })));
    await marcarTodasNotificacoesSupabaseComoLidas(user.id);
    notificarAtualizacaoNotificacoes();
  };

  const remover = async (id: string) => {
    if (!user) return;

    setNotificacoes((current) => current.filter((notificacao) => notificacao.id !== id));
    await removerNotificacaoSupabase(id, user.id);
    notificarAtualizacaoNotificacoes();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
          <h1 className="break-words text-xl font-bold text-gray-900">Notificações</h1>
          <p className="mt-2 break-words text-sm text-gray-600">Faça login para gerenciar suas notificações familiares.</p>
          <Link
            to="/entrar"
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Notificações"
        subtitle="Gerencie seus avisos e acompanhe atualizações importantes da família."
        hideFavoriteButton
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'Ajustar notificações', to: '/ajustar-notificacoes', icon: HEADER_ACTION_ICONS.Settings },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 pb-40 md:pb-6`}>
        <Card className="min-w-0 rounded-lg border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  {naoLidas > 0 ? <BellRing className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <CardTitle className="break-words text-base">Recentes</CardTitle>
                  <p className="break-words text-xs text-gray-500">
                    {formatarContagemNaoLidas(naoLidas)}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/ajustar-notificacoes')}
                >
                  <Settings className="h-4 w-4" />
                  Personalizar Notificações
                </Button>
                <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={marcarTodas} disabled={naoLidas === 0}>
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como lidas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="mb-4 break-words rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="break-words rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <Inbox className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="break-words text-sm font-medium text-gray-700">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificacoes.map((item) => {
                  const hasLink = Boolean(item.link);
                  const titulo = normalizeNotificationText(item.titulo);
                  const mensagem = normalizeNotificationText(item.mensagem);

                  return (
                    <article
                      key={item.id}
                      role={hasLink ? 'link' : undefined}
                      tabIndex={hasLink ? 0 : undefined}
                      aria-label={hasLink ? `Abrir notificação: ${titulo}` : undefined}
                      onClick={hasLink ? () => abrirConteudo(item.link) : undefined}
                      onKeyDown={
                        hasLink
                          ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                abrirConteudo(item.link);
                              }
                            }
                          : undefined
                      }
                      className={[
                        'rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5',
                        hasLink ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2' : '',
                        item.lida ? 'border-gray-200' : 'border-blue-200',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <span
                          className={[
                            'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                            item.lida ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white',
                          ].join(' ')}
                        >
                          {item.lida ? 'Lida' : 'Nova'}
                        </span>

                        <div className="flex shrink-0 flex-row gap-2">
                          {!item.lida && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                marcarComoLida(item.id);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
                              aria-label="Marcar como lida"
                              title="Marcar como lida"
                            >
                              <CheckCheck className="h-4 w-4 shrink-0" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              remover(item.id);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                            aria-label="Remover notificação"
                            title="Remover notificação"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h2 className="break-words text-base font-bold leading-snug text-gray-900">{titulo}</h2>
                        <p className="break-words text-sm leading-relaxed text-gray-600">{mensagem}</p>
                      </div>

                      <p className="mt-4 break-words text-sm font-medium text-gray-500">
                        {formatarDataNotificacao(item.created_at)}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
