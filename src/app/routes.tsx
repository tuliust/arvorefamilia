import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MemberRoute } from './components/MemberRoute';
import { TreeAccessRoute } from './components/TreeAccessRoute';
import { getTreeViewModeFromPath } from './components/FamilyTree/treeViewMode';
import { MobileGlobalTweaks } from './components/MobileGlobalTweaks';

const Home = React.lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const BuscaResultados = React.lazy(() => import('./pages/BuscaResultados').then((module) => ({ default: module.BuscaResultados })));
const PersonProfile = React.lazy(() => import('./pages/PersonProfile').then((module) => ({ default: module.PersonProfile })));
const CalendarioFamiliar = React.lazy(() => import('./pages/CalendarioFamiliar').then((module) => ({ default: module.CalendarioFamiliar })));
const Curiosidades = React.lazy(() => import('./pages/Curiosidades').then((module) => ({ default: module.Curiosidades })));
const MeusFavoritos = React.lazy(() => import('./pages/MeusFavoritos').then((module) => ({ default: module.MeusFavoritos })));
const Notificacoes = React.lazy(() => import('./pages/Notificacoes').then((module) => ({ default: module.Notificacoes })));
const AjustarNotificacoes = React.lazy(() => import('./pages/AjustarNotificacoes').then((module) => ({ default: module.AjustarNotificacoes })));
const Duvidas = React.lazy(() => import('./pages/Duvidas').then((module) => ({ default: module.Duvidas })));
const Entrar = React.lazy(() => import('./pages/Entrar').then((module) => ({ default: module.Entrar })));
const Privacidade = React.lazy(() => import('./pages/Privacidade').then((module) => ({ default: module.Privacidade })));
const Termos = React.lazy(() => import('./pages/Termos').then((module) => ({ default: module.Termos })));
const MeusDados = React.lazy(() => import('./pages/MeusDados').then((module) => ({ default: module.MeusDados })));
const MeusVinculos = React.lazy(() => import('./pages/MeusVinculosMobileShortcutsPage').then((module) => ({ default: module.MeusVinculosMobileShortcutsPage })));
const ArquivosHistoricosPage = React.lazy(() => import('./pages/ArquivosHistoricosPage').then((module) => ({ default: module.ArquivosHistoricosPage })));
const PreferenciasPage = React.lazy(() => import('./pages/PreferenciasPage').then((module) => ({ default: module.PreferenciasPage })));
const RevisaoDados = React.lazy(() => import('./pages/RevisaoDados').then((module) => ({ default: module.RevisaoDados })));
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
const AdminMigrationTool = React.lazy(() => import('./pages/admin/AdminMigrarDados').then((module) => ({ default: module.AdminMigrarDados })));
const AdminDiagnostico = React.lazy(() => import('./pages/admin/AdminDiagnostico').then((module) => ({ default: module.AdminDiagnostico })));
const AdminIntegridade = React.lazy(() => import('./pages/admin/AdminIntegridade').then((module) => ({ default: module.AdminIntegridade })));
const AdminAtividades = React.lazy(() => import('./pages/admin/AdminAtividades').then((module) => ({ default: module.AdminAtividades })));
const AdminSolicitacoesVinculos = React.lazy(() => import('./pages/admin/AdminSolicitacoesVinculos').then((module) => ({ default: module.AdminSolicitacoesVinculos })));
const AdminNotificacoes = React.lazy(() => import('./pages/admin/AdminNotificacoes').then((module) => ({ default: module.AdminNotificacoes })));
const AdminDuvidas = React.lazy(() => import('./pages/admin/AdminDuvidas').then((module) => ({ default: module.AdminDuvidas })));
const MobileHorizontalFamilyMapPageLazy = React.lazy(() => import('./pages/MobileHorizontalFamilyMapPage').then((module) => ({ default: module.MobileHorizontalFamilyMapPage })));
const LinhaGeracionalLazy = React.lazy(() => import('./pages/LinhaGeracional').then((module) => ({ default: module.LinhaGeracional })));

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

function RouteErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-sm text-gray-600">
          Atualize a página para carregar os arquivos mais recentes.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
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

class RouteErrorBoundary extends React.Component<React.PropsWithChildren, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <RouteErrorFallback />;
    return this.props.children;
  }
}

function lazyRoute(
  element: React.ReactNode,
  options: { disableMobileGlobalTweaks?: boolean } = {},
) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        {!options.disableMobileGlobalTweaks && <MobileGlobalTweaks />}
        {element}
      </Suspense>
    </RouteErrorBoundary>
  );
}

function RedirectToMapaFamiliar() {
  const location = useLocation();
  return <Navigate to={`/mapa-familiar${location.search}`} replace />;
}

function RedirectToMeusDados() {
  const location = useLocation();
  return <Navigate to={`/meus-dados${location.search}`} replace />;
}

function TreeHomeShell() {
  const location = useLocation();
  const treeViewMode = getTreeViewModeFromPath(location.pathname);

  return (
    <div
      className="contents"
      data-tree-route-view={treeViewMode === 'mapa-familiar-horizontal' ? 'mapa-familiar-horizontal' : undefined}
    >
      <Home />
    </div>
  );
}

const adminMigrationPath = '/admin/migrar-dados';
const treeHomeRouteElement = lazyRoute(<TreeAccessRoute><TreeHomeShell /></TreeAccessRoute>);
const horizontalMapRouteElement = lazyRoute(
  <TreeAccessRoute><MobileHorizontalFamilyMapPageLazy /></TreeAccessRoute>,
  { disableMobileGlobalTweaks: true },
);
const linhaGeracionalRouteElement = lazyRoute(
  <TreeAccessRoute><LinhaGeracionalLazy /></TreeAccessRoute>,
  { disableMobileGlobalTweaks: true },
);

export const router = createBrowserRouter([
  { path: '/', element: lazyRoute(<TreeAccessRoute><RedirectToMapaFamiliar /></TreeAccessRoute>) },
  { path: '/mapa-familiar', element: treeHomeRouteElement },
  { path: '/mapa-familiar-horizontal', element: horizontalMapRouteElement },
  { path: '/linha-geracional', element: linhaGeracionalRouteElement },
  { path: '/busca', element: lazyRoute(<TreeAccessRoute><BuscaResultados /></TreeAccessRoute>) },
  { path: '/entrar', element: lazyRoute(<Entrar />) },
  { path: '/termos', element: lazyRoute(<Termos />) },
  { path: '/privacidade', element: lazyRoute(<Privacidade />) },
  { path: '/duvidas', element: lazyRoute(<Duvidas />) },
  { path: '/minha-arvore/editar', element: lazyRoute(<MemberRoute><RedirectToMeusDados /></MemberRoute>) },
  { path: '/meus-dados', element: lazyRoute(<MemberRoute><MeusDados /></MemberRoute>) },
  { path: '/meus-vinculos', element: lazyRoute(<MemberRoute><MeusVinculos /></MemberRoute>) },
  { path: '/arquivos-historicos', element: lazyRoute(<MemberRoute><ArquivosHistoricosPage /></MemberRoute>) },
  { path: '/preferencias', element: lazyRoute(<MemberRoute><PreferenciasPage /></MemberRoute>) },
  { path: '/revisao-dados', element: lazyRoute(<MemberRoute><RevisaoDados /></MemberRoute>) },
  { path: '/vincular-perfil', element: lazyRoute(<MemberRoute><VincularPerfil /></MemberRoute>) },
  { path: '/pessoa/:id', element: lazyRoute(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/pessoas/:id', element: lazyRoute(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/calendario-familiar', element: lazyRoute(<MemberRoute><CalendarioFamiliar /></MemberRoute>) },
  { path: '/curiosidades', element: lazyRoute(<MemberRoute><Curiosidades /></MemberRoute>) },
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
  { path: '/admin/duvidas', element: lazyRoute(<ProtectedRoute><AdminDuvidas /></ProtectedRoute>) },
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
