import { Bell, Settings } from 'lucide-react';
import { AppLink as Link } from '../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { NotificationPreferencesPanel } from '../components/notifications/NotificationPreferencesPanel';
import { useAuth } from '../contexts/AuthContext';

export function AjustarNotificacoes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <Settings className="mx-auto mb-3 h-8 w-8 text-gray-500" />
          <h1 className="break-words text-xl font-bold text-gray-900">Preferências</h1>
          <p className="mt-2 break-words text-sm text-gray-600">
            Faça login para gerenciar suas preferências de notificações familiares.
          </p>
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
        title="Preferências"
        subtitle="Escolha quais avisos deseja receber e por quais canais."
        icon={Settings}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'Notificações', to: '/notificacoes', icon: Bell },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        <div className="w-full">
          <NotificationPreferencesPanel userId={user.id} />
        </div>
      </main>
    </div>
  );
}

