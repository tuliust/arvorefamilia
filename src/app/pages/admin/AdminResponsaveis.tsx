import { Settings, UserCheck } from 'lucide-react';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { AdminUserPersonLinksTab } from './AdminUserPersonLinksTab';

export function AdminResponsaveis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Responsáveis por Usuários"
        subtitle="Administração de vínculos entre usuários cadastrados e pessoas da árvore"
        icon={UserCheck}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        <AdminUserPersonLinksTab />
      </main>
    </div>
  );
}
