import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Network,
  Pencil,
  Sparkles,
  Star,
  UserCircle2,
  X,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { isAdminUser } from '../../services/permissionService';
import { getMemberProfile, getPrimaryLinkedPersonWithPessoa, MemberProfile } from '../../services/memberProfileService';
import { clearTreeDataCache } from '../../services/treeDataCache';
import { listarNotificacoesSupabase } from '../../services/userEngagementService';
import type { NotificacaoUsuario, Pessoa } from '../../types';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../FamilyTree/treeColorPalettes';

function getInitials(displayName: string) {
  const cleanName = displayName.trim();
  if (!cleanName) return '';

  const parts = cleanName.includes('@')
    ? cleanName.split('@')[0].split(/[._\-\s]+/)
    : cleanName.split(/\s+/);

  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getNotificationTitle(notificacao: NotificacaoUsuario) {
  return String(notificacao.titulo || notificacao.mensagem || 'Nova notificação').trim();
}

function getFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Conta';

  const beforeEmail = clean.includes('@') ? clean.split('@')[0] : clean;
  return beforeEmail.split(/\s+/)[0] || 'Conta';
}

const TREE_VIEW_OPTIONS = [
  { label: 'Mapa Familiar', path: '/mapa-familiar' },
  { label: 'Mapa Familiar Horizontal', path: '/mapa-familiar-horizontal' },
];

const paletteOptions: TreeColorPalette[] = ['white', 'orange', 'brown', 'visual'];

function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

interface UserProfileMenuProps {
  variant?: 'avatar' | 'home-header';
  notificationBadgeCount?: number;
}

function AvatarNotificationBadge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white md:hidden"
      aria-label={`${count} notificação${count === 1 ? '' : 'es'} não lida${count === 1 ? '' : 's'}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function UserProfileMenu({ variant = 'avatar', notificationBadgeCount = 0 }: UserProfileMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [linkedPerson, setLinkedPerson] = useState<Pessoa | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);
  const [recentNotifications, setRecentNotifications] = useState<NotificacaoUsuario[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserProfileMenuData() {
      if (!user?.id) {
        setProfile(null);
        setLinkedPerson(null);
        setIsAdmin(false);
        return;
      }

      const [profileResult, linkedPersonResult, adminResult] = await Promise.all([
        getMemberProfile(user.id),
        getPrimaryLinkedPersonWithPessoa(user.id),
        isAdminUser(user),
      ]);

      if (cancelled) return;

      setProfile(profileResult.data ?? null);
      setLinkedPerson(linkedPersonResult.data?.pessoa ?? null);
      setIsAdmin(adminResult.isAdmin);
    }

    loadUserProfileMenuData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  useEffect(() => {
    if (!user?.id) {
      setRecentNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadRecentUserNotifications() {
      try {
        const notificacoes = await listarNotificacoesSupabase(user.id);
        if (!cancelled) {
          setRecentNotifications(notificacoes.slice(0, 8));
        }
      } catch {
        if (!cancelled) {
          setRecentNotifications([]);
        }
      }
    }

    void loadRecentUserNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    document.documentElement.classList.toggle('mobile-user-menu-open', open);

    return () => {
      document.documentElement.classList.remove('mobile-user-menu-open');
    };
  }, [open]);

  const displayName = String(
    linkedPerson?.nome_completo ||
    profile?.nome_exibicao ||
    user?.user_metadata?.nome_exibicao ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    ''
  ).trim();

  const firstName = getFirstName(displayName);
  const avatarUrl = String(linkedPerson?.foto_principal_url || profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '').trim();
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path, { replace: false, flushSync: true });
  };

  const handleSignOut = async () => {
    setOpen(false);
    clearTreeDataCache();
    await signOut();
    navigate('/', { replace: true });
  };

  const itemClassName =
    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 transition hover:bg-blue-50 hover:text-blue-800';
  const notificationPreviewItems = recentNotifications.slice(0, 2);
  const remainingNotificationCount = Math.max(recentNotifications.length - notificationPreviewItems.length, 0);
  const isHomeHeaderVariant = variant === 'home-header';

  return (
    <div className="relative z-[520] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          isHomeHeaderVariant
            ? 'group relative flex h-10 min-w-[154px] shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-h-12 sm:py-1.5'
            : 'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:h-10 md:w-10'
        }
        aria-label={user ? `Menu de ${firstName}` : 'Login'}
        title={user ? `Menu de ${firstName}` : 'Login'}
        aria-expanded={open}
      >
        <span
          className={
            isHomeHeaderVariant
              ? 'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-semibold text-white sm:h-9 sm:w-9'
              : 'flex h-full w-full items-center justify-center overflow-hidden rounded-full'
          }
        >
          {user && avatarUrl ? (
            <img src={avatarUrl} alt={displayName || 'Usuário'} className="h-full w-full object-cover" />
          ) : user && initials ? (
            <span>{initials}</span>
          ) : (
            <UserCircle2 className="h-6 w-6" />
          )}
        </span>
        {!isHomeHeaderVariant && <AvatarNotificationBadge count={notificationBadgeCount} />}
        {isHomeHeaderVariant && (
          <>
            <span className="min-w-0 flex-1 leading-none">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">MENU</span>
              <span className="mt-1 block truncate text-sm font-semibold text-gray-800">
                {user ? firstName : 'Login'}
              </span>
            </span>
            <ChevronDown
              className={[
                'h-4 w-4 shrink-0 text-gray-500 transition-transform',
                open ? 'rotate-180' : '',
              ].join(' ')}
            />
          </>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[10000] bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu do usuário"
          />

          <div
            ref={menuRef}
            className="fixed left-4 right-4 top-20 z-[10020] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:max-h-[80vh] md:w-72 md:rounded-2xl"
          >
            <div className="mb-3 flex items-start gap-2 border-b border-gray-100 pb-4">
              <button
                type="button"
                onClick={() => goTo(user ? '/meus-dados' : '/entrar')}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title={user ? 'Atualizar perfil' : 'Entrar'}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
                  {user && avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || 'Usuário'} className="h-full w-full object-cover" />
                  ) : user && initials ? (
                    <span>{initials}</span>
                  ) : (
                    <UserCircle2 className="h-8 w-8" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-gray-900">{user ? firstName : 'Visitante'}</span>
                  <span className="block truncate text-xs text-gray-500">{user?.email || 'Entre para acessar sua conta'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="Fechar menu"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!user ? (
              <button type="button" className={itemClassName} onClick={() => goTo('/entrar')}>
                <LogIn className="h-5 w-5 text-blue-700" />
                Login
              </button>
            ) : (
              <div className="space-y-1">
                <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 p-2 md:hidden">
                  <div className="mb-2 px-2 pt-1 text-xs font-bold uppercase tracking-wide text-blue-900">
                    Visualização
                  </div>
                  <div className="grid grid-cols-2 gap-0.5 rounded-2xl bg-white/80 p-0.5 shadow-inner">
                    {TREE_VIEW_OPTIONS.map((option) => {
                      const active = location.pathname === option.path || (option.path === '/mapa-familiar' && location.pathname === '/');

                      return (
                        <button
                          key={option.path}
                          type="button"
                          onClick={() => goTo(`${option.path}${location.search}`)}
                          className={[
                            'flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-xl px-0.5 py-1.5 text-center text-[10px] font-bold leading-none tracking-[-0.02em] transition min-[390px]:text-[11px]',
                            active
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-blue-800 hover:bg-blue-100',
                          ].join(' ')}
                          aria-current={active ? 'page' : undefined}
                          title={option.label}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-t border-blue-100 px-1 pt-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-900">Cores da árvore</div>
                    <div className="flex items-center gap-3">
                      {paletteOptions.map((paletteKey) => {
                        const palette = TREE_COLOR_PALETTES[paletteKey];
                        const isActive = paletteKey === treeColorPalette;

                        return (
                          <button
                            key={paletteKey}
                            type="button"
                            aria-label={palette.ariaLabel}
                            aria-pressed={isActive}
                            title={palette.label}
                            className={[
                              'h-7 w-7 rounded-full border transition',
                              isActive
                                ? 'scale-110 ring-2 ring-slate-900 ring-offset-2'
                                : 'hover:scale-105 hover:ring-2 hover:ring-slate-300 hover:ring-offset-1',
                            ].join(' ')}
                            style={{
                              backgroundColor: palette.swatch,
                              borderColor: palette.swatchBorder,
                            }}
                            onClick={() => setTreeColorPalette(paletteKey)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {notificationPreviewItems.length > 0 && (
                  <button
                    type="button"
                    className="mb-3 w-full rounded-2xl border border-blue-100 bg-blue-50 p-3 text-left shadow-sm transition hover:bg-blue-100 md:hidden"
                    onClick={() => goTo('/notificacoes')}
                    aria-label="Abrir notificações recentes"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-900">
                        <Bell className="h-4 w-4" />
                        Alertas recentes
                      </span>
                      {remainingNotificationCount > 0 && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          +{remainingNotificationCount}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {notificationPreviewItems.map((notificacao) => (
                        <p key={notificacao.id} className="truncate text-sm font-semibold text-blue-950">
                          {getNotificationTitle(notificacao)}
                        </p>
                      ))}
                    </div>
                  </button>
                )}

                <button type="button" className={itemClassName} onClick={() => goTo('/mapa-familiar')}>
                  <Home className="h-5 w-5 text-blue-700" />
                  Home
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/meus-dados')}>
                  <Pencil className="h-5 w-5 text-blue-700" />
                  Atualizar perfil
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/forum')}>
                  <MessageCircle className="h-5 w-5 text-blue-700" />
                  Fórum
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/calendario-familiar')}>
                  <CalendarDays className="h-5 w-5 text-blue-700" />
                  Calendário
                </button>
                <button type="button" className="hidden w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 transition hover:bg-blue-50 hover:text-blue-800 md:flex" onClick={() => goTo('/curiosidades')}>
                  <Sparkles className="h-5 w-5 text-blue-700" />
                  Curiosidades
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/meus-favoritos')}>
                  <Star className="h-5 w-5 text-blue-700" />
                  Favoritos
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/notificacoes')}>
                  <Bell className="h-5 w-5 text-blue-700" />
                  Notificações
                </button>
                {isAdmin && (
                  <button type="button" className={itemClassName} onClick={() => goTo('/admin')}>
                    <Network className="h-5 w-5 text-blue-700" />
                    Painel Admin
                  </button>
                )}

                <div className="my-2 border-t border-gray-100" />

                <div className="flex items-center justify-between gap-3 px-1 pt-1">
                  <button
                    type="button"
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-blue-50 hover:text-blue-800"
                    onClick={() => goTo('/duvidas')}
                  >
                    Dúvidas?
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
