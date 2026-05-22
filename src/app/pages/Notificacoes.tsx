import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CheckCheck, ExternalLink, Inbox, Trash2 } from 'lucide-react';
import { AppLink as Link } from '../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { NotificacaoUsuario } from '../types';
import {
  garantirNotificacaoInicialSupabase,
  listarNotificacoesSupabase,
  marcarNotificacaoSupabaseComoLida,
  marcarTodasNotificacoesSupabaseComoLidas,
  removerNotificacaoSupabase,
} from '../services/userEngagementService';

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
  const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await garantirNotificacaoInicialSupabase(user.id);
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

  const marcarComoLida = async (id: string) => {
    if (!user) return;

    setNotificacoes((current) =>
      current.map((notificacao) => (notificacao.id === id ? { ...notificacao, lida: true } : notificacao))
    );
    await marcarNotificacaoSupabaseComoLida(id, user.id);
  };

  const marcarTodas = async () => {
    if (!user) return;
    setNotificacoes((current) => current.map((notificacao) => ({ ...notificacao, lida: true })));
    await marcarTodasNotificacoesSupabaseComoLidas(user.id);
  };

  const remover = async (id: string) => {
    if (!user) return;

    setNotificacoes((current) => current.filter((notificacao) => notificacao.id !== id));
    await removerNotificacaoSupabase(id, user.id);
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
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Minha Árvore', to: '/minha-arvore', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'Ajustar notificações', to: '/ajustar-notificacoes', icon: HEADER_ACTION_ICONS.Settings },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6`}>
        <Card className="min-w-0 rounded-lg border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  {naoLidas > 0 ? <BellRing className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <CardTitle className="break-words text-base">Notificações recentes</CardTitle>
                  <p className="break-words text-xs text-gray-500">{naoLidas} não lida(s)</p>
                </div>
              </div>

              <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={marcarTodas} disabled={naoLidas === 0}>
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {notificacoes.map((item) => (
                  <article
                    key={item.id}
                    className={[
                      'rounded-2xl border p-4 shadow-sm transition hover:shadow-md sm:p-5',
                      item.lida ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/60',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                              item.lida ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white',
                            ].join(' ')}
                          >
                            {item.lida ? 'Lida' : 'Nova'}
                          </span>
                          <span className="break-all rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-100">
                            {item.tipo}
                          </span>
                          <span className="break-words text-xs text-gray-400">{formatarData(item.created_at)}</span>
                        </div>

                        <div className="space-y-2">
                          <h2 className="break-words text-base font-bold leading-snug text-gray-900">{item.titulo}</h2>
                          <p className="break-words text-sm leading-relaxed text-gray-600">{item.mensagem}</p>
                        </div>

                        {item.link && (
                          <Link
                            to={item.link}
                            className="inline-flex items-center gap-1.5 rounded-lg px-0 text-sm font-semibold text-blue-700 hover:underline"
                          >
                            Abrir conteúdo
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-row gap-2 border-t border-gray-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        {!item.lida && (
                          <button
                            type="button"
                            onClick={() => marcarComoLida(item.id)}
                            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                            aria-label="Marcar como lida"
                            title="Marcar como lida"
                          >
                            <CheckCheck className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">Lida</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remover(item.id)}
                          className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          aria-label="Remover notificação"
                          title="Remover notificação"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">Remover</span>
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
