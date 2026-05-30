import { RouterProvider } from 'react-router/dom';
import { useEffect } from 'react';
import { router } from './routes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { startTextEncodingRepair } from './utils/textEncodingRepair';

export default function App() {
  useEffect(() => {
    document.title = 'Árvore Genealógica da Família';
  }, []);

  useEffect(() => {
    return startTextEncodingRepair();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
