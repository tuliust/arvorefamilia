import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MemberRoute } from './components/MemberRoute';
import { TreeAccessRoute } from './components/TreeAccessRoute';
import { getTreeViewModeFromPath } from './components/FamilyTree/treeViewMode';

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
const MinhaArvore = React.lazy(() => import('./pages/MinhaArvore').then((module) => ({ default: module.MinhaArvore })));
const MeusDados = React.lazy(() => import('./pages/MeusDados').then((module) => ({ default: module.MeusDados })));
const MeusVinculos = React.lazy(() => import('./pages/MeusVinculos').then((module) => ({ default: module.MeusVinculos })));
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

function Loading() {
  return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
}

function route(element: React.ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
}

function RedirectToMapaFamiliar() {
  const location = useLocation();
  return <Navigate to={`/mapa-familiar${location.search}`} replace />;
}

function TreeHomeShell() {
  const location = useLocation();
  const treeViewMode = getTreeViewModeFromPath(location.pathname);
  return <div className="contents" data-tree-route-view={treeViewMode === 'mapa-familiar-horizontal' ? 'mapa-familiar-horizontal' : undefined}><Home /></div>;
}

const adminMigrationPath = '/admin/migrar-dados';
const treeHomeRouteElement = route(<TreeAccessRoute><TreeHomeShell /></TreeAccessRoute>);

export const router = createBrowserRouter([
  { path: '/', element: route(<TreeAccessRoute><RedirectToMapaFamiliar /></TreeAccessRoute>) },
  { element: treeHomeRouteElement, children: [{ path: 'mapa-familiar' }, { path: 'mapa-familiar-horizontal' }] },
  { path: '/busca', element: route(<TreeAccessRoute><BuscaResultados /></TreeAccessRoute>) },
  { path: '/entrar', element: route(<Entrar />) },
  { path: '/termos', element: route(<Termos />) },
  { path: '/privacidade', element: route(<Privacidade />) },
  { path: '/duvidas', element: route(<Duvidas />) },
  { path: '/minha-arvore/editar', element: route(<MemberRoute><MinhaArvore /></MemberRoute>) },
  { path: '/meus-dados', element: route(<MemberRoute><MeusDados /></MemberRoute>) },
  { path: '/meus-vinculos', element: route(<MemberRoute><MeusVinculos /></MemberRoute>) },
  { path: '/arquivos-historicos', element: route(<MemberRoute><ArquivosHistoricosPage /></MemberRoute>) },
  { path: '/preferencias', element: route(<MemberRoute><PreferenciasPage /></MemberRoute>) },
  { path: '/revisao-dados', element: route(<MemberRoute><RevisaoDados /></MemberRoute>) },
  { path: '/vincular-perfil', element: route(<MemberRoute><VincularPerfil /></MemberRoute>) },
  { path: '/pessoa/:id', element: route(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/pessoas/:id', element: route(<MemberRoute><PersonProfile /></MemberRoute>) },
  { path: '/calendario-familiar', element: route(<MemberRoute><CalendarioFamiliar /></MemberRoute>) },
  { path: '/curiosidades', element: route(<MemberRoute><Curiosidades /></MemberRoute>) },
  { path: '/meus-favoritos', element: route(<MemberRoute><MeusFavoritos /></MemberRoute>) },
  { path: '/notificacoes', element: route(<MemberRoute><Notificacoes /></MemberRoute>) },
  { path: '/ajustar-notificacoes', element: route(<MemberRoute><AjustarNotificacoes /></MemberRoute>) },
  { path: '/forum', element: route(<MemberRoute><ForumHome /></MemberRoute>) },
  { path: '/forum/novo', element: route(<MemberRoute><ForumNovoTopico /></MemberRoute>) },
  { path: '/forum/topico/:id', element: route(<MemberRoute><ForumTopico /></MemberRoute>) },
  { path: '/forum/topico/:id/editar', element: route(<MemberRoute><ForumEditarTopico /></MemberRoute>) },
  { path: '/admin', element: route(<ProtectedRoute><AdminDashboard /></ProtectedRoute>) },
  { path: '/admin/login', element: route(<AdminLogin />) },
  { path: '/admin/dashboard', element: route(<ProtectedRoute><AdminDashboard /></ProtectedRoute>) },
  { path: '/admin/home', element: route(<ProtectedRoute><AdminHomeSettings /></ProtectedRoute>) },
  { path: '/admin/pessoas', element: route(<ProtectedRoute><AdminPessoas /></ProtectedRoute>) },
  { path: '/admin/pessoas/nova', element: route(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/pessoas/:id/editar', element: route(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/pessoas/:id', element: route(<ProtectedRoute><AdminPessoaForm /></ProtectedRoute>) },
  { path: '/admin/relacionamentos', element: route(<ProtectedRoute><AdminRelacionamentos /></ProtectedRoute>) },
  { path: '/admin/relacionamentos/novo', element: route(<ProtectedRoute><AdminRelacionamentoForm /></ProtectedRoute>) },
  { path: '/admin/importacao', element: route(<ProtectedRoute><AdminImportacao /></ProtectedRoute>) },
  { path: adminMigrationPath, element: route(<ProtectedRoute><AdminMigrationTool /></ProtectedRoute>) },
  { path: '/admin/diagnostico', element: route(<ProtectedRoute><AdminDiagnostico /></ProtectedRoute>) },
  { path: '/admin/integridade', element: route(<ProtectedRoute><AdminIntegridade /></ProtectedRoute>) },
  { path: '/admin/atividades', element: route(<ProtectedRoute><AdminAtividades /></ProtectedRoute>) },
  { path: '/admin/notificacoes', element: route(<ProtectedRoute><AdminNotificacoes /></ProtectedRoute>) },
  { path: '/admin/duvidas', element: route(<ProtectedRoute><AdminDuvidas /></ProtectedRoute>) },
  { path: '/admin/solicitacoes-vinculos', element: route(<ProtectedRoute><AdminSolicitacoesVinculos /></ProtectedRoute>) },
  { path: '*', element: <div className="min-h-screen flex items-center justify-center bg-gray-50">Página não encontrada</div> },
]);
