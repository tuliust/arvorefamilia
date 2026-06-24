import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Archive, Link2, UserCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

const TABS = [
  { label: 'Dados', path: '/meus-dados', icon: UserCircle2 },
  { label: 'Vínculos', path: '/meus-vinculos', icon: Link2 },
  { label: 'Fatos e Arquivos', path: '/arquivos-historicos', icon: Archive },
] as const;

export function ProfileEditMobileTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="grid grid-cols-3 gap-2 md:hidden" aria-label="Atalhos de edição do perfil">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;

        return (
          <Button
            key={tab.path}
            type="button"
            variant={active ? 'default' : 'outline'}
            className="flex h-auto w-full flex-col items-center justify-center gap-1 py-2 text-xs leading-tight"
            onClick={() => navigate(tab.path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-center">{tab.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
