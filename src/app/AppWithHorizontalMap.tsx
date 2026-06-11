import { RouterProvider } from 'react-router/dom';
import { useEffect } from 'react';
import { routerWithHorizontalMap } from './routesWithHorizontalMap';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';

export default function AppWithHorizontalMap() {
  useEffect(() => {
    document.title = 'Árvore Genealógica da Família';
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={routerWithHorizontalMap} />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
