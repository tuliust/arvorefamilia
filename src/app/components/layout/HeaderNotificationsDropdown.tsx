import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Check, Trash2 } from 'lucide-react';

import { AppLink as Link } from '../AppLink';
import { useAuth } from '../../contexts/AuthContext';
import {
  contarNotificacoesNaoLidasSupabase,
  listarNotificacoesSupabase,
  marcarNotificacaoSupabaseComoLida,
  removerNotificacaoSupabase,
} from '../../services/userEngagementService';
import type { NotificacaoUsuario } from '../../types';

interface HeaderNotificationsDropdownProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

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

function normalizeNotificationText(value?: string | null) {
  return String(value ?? '')
    .replace(/\bData de memoria\b/g, 'Data de memória')
    .replace(/\bHoje e uma data de memoria\b/g, 'Hoje é uma data de memória')
    .replace(/\bAniversario na familia\b/g, 'Aniversário na família')
    .replace(/\bHoje e aniversario\b/g, 'Hoje é aniversário');
}

function NotificationCountBadge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white"
      aria-label={String(count) + ' notificação' + (count === 1 ? '' : 'es') + ' não lida' + (count === 1 ? '' : 's')}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function HeaderNotificationsDropdown({
  wrapperClassName = 'relative hidden md:inline-flex',
  buttonClassName = 'h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  iconClassName = 'h-4 w-4',
}: HeaderNotificationsDropdownProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    const count = await contarNotificacoesNaoLidasSupabase(user.id);
    setUnreadNotificationsCount(count);
  }, [user]);

  const carregarUltimas = useCallback(async () => {
    if (!user?.id) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const lista = await listarNotificacoesSupabase(user.id);
      setNotificacoes(lista.slice(0, 5));
    } catch (error) {
      console.error('[Supabase] Erro ao carregar últimas notificações:', error);
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshUnreadNotificationsCount();

    window.addEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
    window.addEventListener('focus', refreshUnreadNotificationsCount);

    return () => {
      window.removeEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
      window.removeEventListener('focus', refreshUnreadNotificationsCount);
    };
  }, [refreshUnreadNotificationsCount]);

  useEffect(() => {
    if (!open) return;
    void carregarUltimas();
  }, [carregarUltimas, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const notificarAtualizacao = useCallback(() => {
    window.dispatchEvent(new Event('arvorefamilia:notifications-updated'));
    void refreshUnreadNotificationsCount();
  }, [refreshUnreadNotificationsCount]);

  const navegarPara = useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to);
    },
    [navigate]
  );

  const marcarComoLida = useCallback(
    async (notificacaoId: string) => {
      if (!user?.id) return;

      setNotificacoes((current) =>
        current.map((notificacao) =>
          notificacao.id === notificacaoId ? { ...notificacao, lida: true } : notificacao
        )
      );
      await marcarNotificacaoSupabaseComoLida(notificacaoId, user.id);
      notificarAtualizacao();
    },
    [notificarAtualizacao, user?.id]
  );

  const remover = useCallback(
    async (notificacaoId: string) => {
      if (!user?.id) return;

      setNotificacoes((current) => current.filter((notificacao) => notificacao.id !== notificacaoId));
      await removerNotificacaoSupabase(notificacaoId, user.id);
      notificarAtualizacao();
    },
    [notificarAtualizacao, user?.id]
  );

  return (
    <div ref={rootRef} className={wrapperClassName}>
      <button
        type="button"
        className={`relative flex ${buttonClassName}`}
        title="Alertas"
        aria-label="Abrir menu de alertas"
        aria-haspopup="menu"
        aria-expanded={open}
        data-tour-target="alerts"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className={iconClassName} />
        <NotificationCountBadge count={unreadNotificationsCount} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[650] mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl ring-1 ring-black/5"
          role="menu"
          aria-label="Últimas notificações"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Últimas notificações</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} não lida${unreadNotificationsCount === 1 ? '' : 's'}`
                  : 'Todas lidas'}
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Bell className="h-4 w-4" />
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {!user?.id ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Faça login para ver suas notificações.
              </div>
            ) : loading ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Nenhuma notificação recente.
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((item) => {
                  const titulo = normalizeNotificationText(item.titulo);
                  const mensagem = normalizeNotificationText(item.mensagem);
                  const hasLink = Boolean(item.link);

                  return (
                    <article
                      key={item.id}
                      role={hasLink ? 'button' : undefined}
                      tabIndex={hasLink ? 0 : undefined}
                      aria-label={hasLink ? `Abrir notificação: ${titulo}` : undefined}
                      onClick={hasLink ? () => navegarPara(item.link as string) : undefined}
                      onKeyDown={
                        hasLink
                          ? (event: React.KeyboardEvent<HTMLElement>) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                navegarPara(item.link as string);
                              }
                            }
                          : undefined
                      }
                      className={[
                        'rounded-xl border p-3 transition',
                        item.lida ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50/60',
                        hasLink ? 'cursor-pointer hover:border-blue-200 hover:bg-blue-50' : '',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={[
                                'h-2 w-2 shrink-0 rounded-full',
                                item.lida ? 'bg-gray-300' : 'bg-blue-600',
                              ].join(' ')}
                              aria-hidden="true"
                            />
                            <h3 className="truncate text-sm font-bold text-gray-900">{titulo}</h3>
                          </div>
                          <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-gray-600">
                            {mensagem}
                          </p>
                          <p className="mt-2 text-[11px] font-medium text-gray-400">
                            {formatarDataNotificacao(item.created_at)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!item.lida && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void marcarComoLida(item.id);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              title="Marcar como lida"
                              aria-label="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void remover(item.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            title="Excluir notificação"
                            aria-label="Excluir notificação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/notificacoes"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center whitespace-normal rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-bold leading-tight text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Ver todas as notificações
            </Link>
            <Link
              to="/ajustar-notificacoes"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center whitespace-normal rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-bold leading-tight text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Personalizar preferências
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
