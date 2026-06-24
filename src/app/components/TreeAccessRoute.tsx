import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { MobileHorizontalFamilyMapPage } from '../pages/MobileHorizontalFamilyMapPage';
import { resolveFirstAccessLinkForUser } from '../services/memberProfileService';

const RECENT_LOGIN_LIMIT_MS = 60 * 60 * 1000;
const MOBILE_HORIZONTAL_BREAKPOINT = 768;

function AccessLoading({ message = 'Verificando acesso...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function hasRecentLogin(lastSignInAt?: string | null) {
  if (!lastSignInAt) return false;

  const lastSignInTime = new Date(lastSignInAt).getTime();
  if (!Number.isFinite(lastSignInTime)) return false;

  return Date.now() - lastSignInTime <= RECENT_LOGIN_LIMIT_MS;
}

function getInitialMobileMatch() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_HORIZONTAL_BREAKPOINT;
}

function useMobileHorizontalRoute() {
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(getInitialMobileMatch);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_HORIZONTAL_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(window.innerWidth < MOBILE_HORIZONTAL_BREAKPOINT);

    update();
    mediaQuery.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return isMobile && location.pathname === '/mapa-familiar-horizontal';
}

export function TreeAccessRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const shouldUseMobileHorizontalPage = useMobileHorizontalRoute();
  const [checking, setChecking] = React.useState(true);
  const [target, setTarget] = React.useState<'tree' | 'auth' | 'profile'>('auth');

  React.useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      if (loading) return;

      if (!user) {
        setTarget('auth');
        setChecking(false);
        return;
      }

      if (!hasRecentLogin(user.last_sign_in_at)) {
        setTarget('auth');
        setChecking(false);
        return;
      }

      setChecking(true);
      const result = await resolveFirstAccessLinkForUser(user);

      if (!mounted) return;

      if (result.status !== 'linked') {
        setTarget('auth');
      } else if (result.created && !result.data.dados_confirmados) {
        setTarget('profile');
      } else {
        setTarget('tree');
      }

      setChecking(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [loading, user?.id, user?.last_sign_in_at]);

  if (loading || checking) {
    return <AccessLoading />;
  }

  if (!user || target === 'auth') {
    return <Navigate to="/entrar" replace />;
  }

  if (target === 'profile') {
    return <Navigate to="/meus-dados" replace />;
  }

  if (shouldUseMobileHorizontalPage) {
    return <MobileHorizontalFamilyMapPage />;
  }

  return <>{children}</>;
}
