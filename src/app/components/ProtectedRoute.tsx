import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { isMainAdmin } from '../services/permissionService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isMainAdmin(user)) {
    return <Navigate to="/entrar" replace />;
  }

  return <>{children}</>;
}
