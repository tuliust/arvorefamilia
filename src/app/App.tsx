import { RouterProvider } from 'react-router/dom';
import { useEffect } from 'react';
import { router } from './routes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';

function DesktopHelpFloatingButton() {
  return (
    <a
      href="/duvidas"
      className="fixed bottom-8 right-8 z-[850] hidden h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-extrabold leading-none text-white shadow-xl shadow-blue-900/25 transition hover:bg-blue-700 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:flex"
      aria-label="Abrir dúvidas"
      title="Dúvidas"
    >
      ?
    </a>
  );
}

export default function App() {
  useEffect(() => {
    document.title = 'Árvore Genealógica da Família';
  }, []);


  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <DesktopHelpFloatingButton />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
