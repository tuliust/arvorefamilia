import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MemberRoute } from './components/MemberRoute';
import { TreeAccessRoute } from './components/TreeAccessRoute';

const Home = React.lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const BuscaResultados = React.lazy(() => import('./pages/BuscaResultados').then((module) => ({ default: module.BuscaResultados })));
const PersonProfile = React.lazy(() => import('./pages/PersonProfile').then((module) => ({ default: module.PersonProfile })));
const CalendarioFamiliar = React.lazy(() => import('./pages/CalendarioFamiliar').then((module) => ({ default: module.CalendarioFamiliar })));
const MeusFavoritos = React.lazy(() => import('./pages/MeusFavoritos').then((module) => ({ default: module.MeusFavoritos })));
const Notificacoes = React.lazy(() => import('./pages/Notificacoes').then((module) => ({ default: module.Notificacoes })));
const AjustarNotificacoes = React.lazy(() => import('./pages/AjustarNotificacoes').then((module) => ({ default: module.AjustarNotificacoes })));
const Entrar = React.lazy(() => import('./pages/Entrar').then((module) => ({ default: module.Entrar })));
const Privacidade = React.lazy(() => import('./pages/Privacidade').then((module) => ({ default: module.Privacidade })));
const Termos = React.lazy(() => import('./pages/Termos').then((module) => ({ default: module.Termos })));
const MinhaArvore = React.lazy(() => import('./pages/MinhaArvore').then((module) => ({ default: module.MinhaArvore })));
const MeusDados = React.lazy(() => import('./pages/MeusDados').then((module) => ({ default: module.MeusDados })));
const MeusVinculos = React.lazy(() => import('./pages/MeusVinculos').then((module) => ({ default: module.MeusVinculos })));
const VincularPerfil = React.lazy(() => import('./pages/VincularPerfil').then((module) => ({ default: module.VincularPerfil })));
const ForumHome = React.lazy(() => import('./pages/forum/ForumHome').then((module) => ({ default: module.ForumHome })));
const ForumTopico = React.lazy(() => import('./pages/forum/ForumTopico').then((module) => ({ default: module.ForumTopico })));
const ForumNovoTopico = React.lazy(() => import('./pages/forum/ForumNovoTopico').then((module) => ({ default: module.ForumNovoTopico })));
const ForumEditarTopico = React.lazy(() => import('./pages/forum/ForumEditarTopico').then((module) => ({ default: module.ForumEditarTopico })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminHomeSettings = React.lazy(() => import('./pages/admin/AdminHomeSettings').then((module) => ({ default: module.AdminHomeSettings })));
const AdminPessoas = React.lazy(() => import('./pages/admin/AdminPessoas').then((module) => ({ default: module.AdminPessoas })));
const AdminPessoaForm = React.lazy(() => import('./pages/admin/AdminPessoaForm').then((module) => ({ default: module.AdminPessoaForm })));
const AdminRelacionamentos = React.lazy(() => import('./pages/admin/AdminRelacionamentos').then((module) => ({ default: module.AdminRelacionamentos })));
const AdminRelacionamentoForm = React.lazy(() => import('./pages/admin/AdminRelacionamentoForm').then((module) => ({ default: module.AdminRelacionamentoForm })));
const AdminImportacao = React.lazy(() => import('./pages/admin/AdminImportacao').then((module) => ({ default: module.AdminImportacao })));
const AdminMigrationTool = React.lazy(() => import('./pages/admin/Admin' + 'MigrarDados').then((module) => ({ default: module.AdminMigrarDados })));
const AdminDiagnostico = React.lazy(() => import('./pages/admin/AdminDiagnostico').then((module) => ({ default: module.AdminDiagnostico })));
const AdminIntegridade = React.lazy(() => import('./pages/admin/AdminIntegridade').then((module) => ({ default: module.AdminIntegridade })));
const AdminAtividades = React.lazy(() => import('./pages/admin/AdminAtividades').then((module) => ({ default: module.AdminAtividades })));
const AdminSolicitacoesVinculos = React.lazy(() => import('./pages/admin/AdminSolicitacoesVinculos').then((module) => ({ default: module.AdminSolicitacoesVinculos })));
const AdminNotificacoes = React.lazy(() => import('./pages/admin/AdminNotificacoes').then((module) => ({ default: module.AdminNotificacoes })));

const ROUTE_CHUNK_RELOAD_KEY = 'arvorefamilia:route-chunk-reload-at';
const ROUTE_CHUNK_RELOAD_COOLDOWN_MS = 10000;

type WindowWithChunkHandler = Window & {
  __arvorefamiliaChunkReloadHandlerInstalled?: boolean;
};

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="route-loading">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

function reloadForFreshAssets() {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(ROUTE_CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - lastReloadAt < ROUTE_CHUNK_RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(ROUTE_CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // Se o storage estiver indisponível, ainda tenta recuperar a versão nova do app.
  }

  window.location.reload();
  return true;
}

function RouteErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-sm text-gray-600">
          A versão do site aberta no navegador pode estar desatualizada. Atualize a página para carregar os arquivos mais recentes.
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.removeItem(ROUTE_CHUNK_RELOAD_KEY);
            } catch {
              // Ignora falhas de storage no clique manual de recuperação.
            }
            window.location.reload();
          }}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Atualizar página
        </button>
      </div>
    </div>
  );
}

type RouteErrorBoundaryState = {
  hasError: boolean;
};

function isDynamicImportError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Expected a JavaScript-or-Wasm module script|MIME type/i.test(message);
}

function isAssetScriptLoadError(event: ErrorEvent | Event) {
  if (!(event instanceof Event)) return false;
  const target = event.target;
  if (!(target instanceof HTMLScriptElement)) return false;
  return /\/assets\/.+\.js(\?.*)?$/.test(target.src);
}

function installChunkLoadErrorReloadHandler() {
  if (typeof window === 'undefined') return;

  const win = window as WindowWithChunkHandler;
  if (win.__arvorefamiliaChunkReloadHandlerInstalled) return;
  win.__arvorefamiliaChunkReloadHandlerInstalled = true;

  window.addEventListener(
    'error',
    (event) => {
      if (isDynamicImportError((event as ErrorEvent).error ?? (event as ErrorEvent).message) || isAssetScriptLoadError(event)) {
        reloadForFreshAssets();
      }
    },
    true,
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (isDynamicImportError(event.reason)) reloadForFreshAssets();
  });
}

installChunkLoadErrorReloadHandler();

class RouteErrorBoundary extends React.Component<React.PropsWithChildren, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (isDynamicImportError(error)) reloadForFreshAssets();
  }

  render() {
    if (this.state.hasError) return <RouteErrorFallback />;
    return this.props.children;
  }
}

function lazyRoute(element: React.ReactNode) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>{element}</Suspense>
    </RouteErrorBoundary>
  );
}

function RedirectToMinhaArvore() {
  const location = useLocation();
  return <Navigate to={`/minha-arvore${location.search}`} replace />;
}

const adminMigrationPath = '/admin/' + 'migrar-dados';

export const router = createBrowserRouter([
  { path: '/', element: lazyRoute(<TreeAccessRoute><RedirectToMinhaArvore /></TreeAccessRoute>) },
  { path: '/minha-arvore', element: lazyRoute(<TreeAccessRoute><Home /></TreeAccessRoute>) },
  { path: '/mapa-familiar', element: lazyRoute(<TreeAccessRoute><Home /></TreeAccessRoute>) },
  { path: '/genealogia', element: lazyRoute(<TreeAccessRoute><Home /></TreeAccessRoute>) },
  { path: '/visao-completa', element: lazyRoute(<TreeAccessRoute><Home /></TreeAccessRoute>) },
  { path: '/busca', element: lazyRoute(<TreeAccessRoute><BuscaResultados /></TreeAccessRoute>) },
  { path: '/entrar', element: lazyRoute(<Entrar />) },
  { path: '/termos', element: lazyRoute(<Termos />) },
  { path: '/privacidade', element: lazyRoute(<Privacidade />) },
  { path: '/minha-arvore/editar', element: lazyRoute(<MemberRoute><MinhaArvore /></MemberRoute>) },
  { path: '/meus-dados', element: lazyRoute(<MemberRoute><MeusDados /></MemberRoute>) },
  { path: '/meus-vinculos', element: lazyRoute(<MemberRoute><MeusVinculos /></MemberRoute>) },
  { path: '/vincular-perfil', element: lazyRoute(<MemberRoute><VincularPerfil /></MemberRoute>) },
  { path: '/pessoa/:id', element: lazyRoute(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/pessoas/:id', element: lazyRoute(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/calendario-familiar', element: lazyRoute(<MemberRoute><CalendarioFamiliar /></MemberRoute>) },
  { path: '/meus-favoritos', element: lazyRoute(<MemberRoute><MeusFavoritos /></MemberRoute>) },
  { path: '/notificacoes', element: lazyRoute(<MemberRoute><Notificacoes /></MemberRoute>) },
  { path: '/ajustar-notificacoes', element: lazyRoute(<MemberRoute><AjustarNotificacoes /></MemberRoute>) },
  { path: '/forum', element: lazyRoute(<MemberRoute><ForumHome /></MemberRoute>) },
  { path: '/forum/novo', element: lazyRoute(<MemberRoute><ForumNovoTopico /></MemberRoute>) },
  { path: '/forum/topico/:id', element: lazyRoute(<MemberRoute><ForumTopico /></MemberRoute>) },
  { path: '/forum/topico/:id/editar', element: lazyRoute(<MemberRoute><ForumEditarTopico /></MemberRoute>) },
  { path: '/admin', element: lazyRoute(<ProtectedRoute><AdminDashboard /></ProtectedRoute>) },
  { path: '/admin/login', element: lazyRoute(<AdminLogin />) },
  { path: '/admin/dashboard', element: lazyRoute(<ProtectedRoute><AdminDashboard /></ProtectedRoute>) },
  { path: '/admin/home', element: lazyRoute(<ProtectedRoute><AdminHomeSettings /></ProtectedRoute>) },
  { path: '/admin/pessoas', element: lazyRoute(<ProtectedRoute><AdminPessoas /></ProtectedRoute>) },
  { path: '/admin/pessoas/nova', element: lazyRoute(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/pessoas/:id/editar', element: lazyRoute(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/pessoas/:id', element: lazyRoute(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/relacionamentos', element: lazyRoute(<ProtectedRoute><AdminRelacionamentos /></ProtectedRoute>) },
  { path: '/admin/relacionamentos/novo', element: lazyRoute(<ProtectedRoute><AdminRelacionamentoForm /></ProtectedRoute>) },
  { path: '/admin/importacao', element: lazyRoute(<ProtectedRoute><AdminImportacao /></ProtectedRoute>) },
  { path: adminMigrationPath, element: lazyRoute(<ProtectedRoute><AdminMigrationTool /></ProtectedRoute>) },
  { path: '/admin/diagnostico', element: lazyRoute(<ProtectedRoute><AdminDiagnostico /></ProtectedRoute>) },
  { path: '/admin/integridade', element: lazyRoute(<ProtectedRoute><AdminIntegridade /></ProtectedRoute>) },
  { path: '/admin/atividades', element: lazyRoute(<ProtectedRoute><AdminAtividades /></ProtectedRoute>) },
  { path: '/admin/notificacoes', element: lazyRoute(<ProtectedRoute><AdminNotificacoes /></ProtectedRoute>) },
  { path: '/admin/solicitacoes-vinculos', element: lazyRoute(<ProtectedRoute><AdminSolicitacoesVinculos /></ProtectedRoute>) },
  {
    path: '*',
    element: <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-4">Página não encontrada</p>
        <a href="/" className="text-blue-600 hover:underline">Voltar para home</a>
      </div>
    </div>,
  },
]);
