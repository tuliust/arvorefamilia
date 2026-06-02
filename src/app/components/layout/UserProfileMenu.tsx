import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Bell,
  CalendarDays,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Network,
  Pencil,
  Star,
  UserCircle2,
  X,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { getMemberProfile, getPrimaryLinkedPersonWithPessoa, MemberProfile } from '../../services/memberProfileService';
import type { Pessoa } from '../../types';

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

function getFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Conta';

  const beforeEmail = clean.includes('@') ? clean.split('@')[0] : clean;
  return beforeEmail.split(/\s+/)[0] || 'Conta';
}

const TREE_VIEW_OPTIONS = [
  { label: 'Minha Árvore', path: '/minha-arvore' },
  { label: 'Genealogia', path: '/genealogia' },
  { label: 'Visão Completa', path: '/visao-completa' },
];

export function UserProfileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [linkedPerson, setLinkedPerson] = useState<Pessoa | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUserProfileMenuData() {
      if (!user?.id) {
        setProfile(null);
        setLinkedPerson(null);
        return;
      }

      const [profileResult, linkedPersonResult] = await Promise.all([
        getMemberProfile(user.id),
        getPrimaryLinkedPersonWithPessoa(user.id),
      ]);

      if (cancelled) return;

      setProfile(profileResult.data ?? null);
      setLinkedPerson(linkedPersonResult.data?.pessoa ?? null);
    }

    loadUserProfileMenuData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
    await signOut();
    navigate('/', { replace: true });
  };

  const itemClassName =
    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 transition hover:bg-blue-50 hover:text-blue-800';

  return (
    <div className="relative z-[520] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label={user ? `Menu de ${firstName}` : 'Login'}
        title={user ? `Menu de ${firstName}` : 'Login'}
        aria-expanded={open}
      >
        {user && avatarUrl ? (
          <img src={avatarUrl} alt={displayName || 'Usuario'} className="h-full w-full object-cover" />
        ) : user && initials ? (
          <span>{initials}</span>
        ) : (
          <UserCircle2 className="h-6 w-6" />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu do usuario"
          />

          <div
            ref={menuRef}
            className="fixed left-4 right-4 top-20 z-[90] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:max-h-[80vh] md:w-72 md:rounded-2xl"
          >
            <div className="mb-3 flex items-start gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
                {user && avatarUrl ? (
                  <img src={avatarUrl} alt={displayName || 'Usuario'} className="h-full w-full object-cover" />
                ) : user && initials ? (
                  <span>{initials}</span>
                ) : (
                  <UserCircle2 className="h-8 w-8" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-gray-900">{user ? firstName : 'Visitante'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || 'Entre para acessar sua conta'}</p>
              </div>

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
                  <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-xs font-bold uppercase tracking-wide text-blue-900">
                    <Network className="h-4 w-4" />
                    Visualização
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {TREE_VIEW_OPTIONS.map((option) => {
                      const active = location.pathname === option.path || (option.path === '/minha-arvore' && location.pathname === '/');

                      return (
                        <button
                          key={option.path}
                          type="button"
                          onClick={() => goTo(option.path)}
                          className={[
                            'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition',
                            active
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-blue-800 hover:bg-blue-100',
                          ].join(' ')}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span>{option.label}</span>
                          {active && <span className="text-xs font-semibold opacity-90">Atual</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="button" className={itemClassName} onClick={() => goTo('/minha-arvore')}>
                  <Home className="h-5 w-5 text-blue-700" />
                  Home
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/minha-arvore/editar')}>
                  <Pencil className="h-5 w-5 text-blue-700" />
                  Atualizar perfil
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/forum')}>
                  <MessageCircle className="h-5 w-5 text-blue-700" />
                  Forum
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/calendario-familiar')}>
                  <CalendarDays className="h-5 w-5 text-blue-700" />
                  Calendario
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/meus-favoritos')}>
                  <Star className="h-5 w-5 text-blue-700" />
                  Favoritos
                </button>
                <button type="button" className={itemClassName} onClick={() => goTo('/notificacoes')}>
                  <Bell className="h-5 w-5 text-blue-700" />
                  Notificacoes
                </button>

                <div className="my-2 border-t border-gray-100" />

                <button type="button" className={`${itemClassName} text-red-700 hover:bg-red-50 hover:text-red-800`} onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
