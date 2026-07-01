import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { resolveFirstAccessLinkForUser } from '../services/memberProfileService';

const ONBOARDING_PATHS = new Set([
  '/meus-dados',
  '/meus-vinculos',
  '/arquivos-historicos',
  '/preferencias',
  '/revisao-dados',
]);

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function isOnboardingPath(pathname: string) {
  return ONBOARDING_PATHS.has(normalizePath(pathname));
}

function MemberAccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verificando acesso...</p>
      </div>
    </div>
  );
}

export function MemberRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingFirstAccess, setCheckingFirstAccess] = React.useState(true);
  const [hasIncompleteFirstAccess, setHasIncompleteFirstAccess] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function checkFirstAccessStatus() {
      if (loading) return;

      if (!user) {
        setHasIncompleteFirstAccess(false);
        setCheckingFirstAccess(false);
        return;
      }

      setCheckingFirstAccess(true);
      const result = await resolveFirstAccessLinkForUser(user);

      if (!mounted) return;

      setHasIncompleteFirstAccess(result.status === 'linked' && !result.data.dados_confirmados);
      setCheckingFirstAccess(false);
    }

    void checkFirstAccessStatus();

    return () => {
      mounted = false;
    };
  }, [loading, location.pathname, user?.id]);

  if (loading || checkingFirstAccess) {
    return <MemberAccessLoading />;
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (hasIncompleteFirstAccess && !isOnboardingPath(location.pathname)) {
    return <Navigate to="/meus-dados" replace />;
  }

  return <>{children}</>;
}
