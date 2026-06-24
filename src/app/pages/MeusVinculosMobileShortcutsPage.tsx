import React, { useEffect, useState } from 'react';
import { Archive, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
} from '../services/memberProfileService';
import { MeusVinculosWithProfileBio } from './MeusVinculosWithProfileBio';

function MeusVinculosMobileShortcuts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarding, setIsOnboarding] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAccessMode() {
      if (!user) return;

      await resolveFirstAccessLinkForUser(user);
      const { data } = await getPrimaryLinkedPersonWithPessoa(user.id);
      if (mounted) setIsOnboarding(data?.dados_confirmados === false);
    }

    void loadAccessMode();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (isOnboarding) return null;

  return (
    <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-3 md:hidden" aria-label="Atalhos de edição do perfil">
      <Button type="button" variant="outline" className="w-full justify-center" onClick={() => navigate('/meus-dados')}>
        <UserCircle2 className="h-4 w-4" />
        Dados
      </Button>
      <Button type="button" variant="outline" className="w-full justify-center" onClick={() => navigate('/arquivos-historicos')}>
        <Archive className="h-4 w-4" />
        Arquivos
      </Button>
    </nav>
  );
}

export function MeusVinculosMobileShortcutsPage() {
  return (
    <div>
      <MeusVinculosMobileShortcuts />
      <MeusVinculosWithProfileBio />
    </div>
  );
}
