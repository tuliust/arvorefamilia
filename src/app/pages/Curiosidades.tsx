import { Sparkles } from 'lucide-react';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { CuriosidadesAiSection } from './curiosidades/CuriosidadesAiSection';
import { CuriosidadesAstrology } from './curiosidades/CuriosidadesAstrology';
import { CuriosidadesConnectionSection } from './curiosidades/CuriosidadesConnectionSection';
import { CuriosidadesCouples } from './curiosidades/CuriosidadesCouples';
import { CuriosidadesDiscoverySection } from './curiosidades/CuriosidadesDiscoverySection';
import { CuriosidadesGenerations } from './curiosidades/CuriosidadesGenerations';
import { CuriosidadesHero } from './curiosidades/CuriosidadesHero';
import { CuriosidadesInterestsSection } from './curiosidades/CuriosidadesInterestsSection';
import { CuriosidadesMemoryWall } from './curiosidades/CuriosidadesMemoryWall';
import { CuriosidadesQuizSection } from './curiosidades/CuriosidadesQuizSection';
import { CuriosidadesRankings } from './curiosidades/CuriosidadesRankings';
import { CuriosidadesRouteSection } from './curiosidades/CuriosidadesRouteSection';
import { CuriosidadesStats } from './curiosidades/CuriosidadesStats';
import { CuriosidadesToday } from './curiosidades/CuriosidadesToday';

export function Curiosidades() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <MemberPageHeader
        title="Curiosidades"
        subtitle="Descobertas, histórias e conexões da família"
        icon={Sparkles}
        actions={[
          { label: 'Árvore Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.ArrowLeft, responsiveLabel: 'always' },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'Fórum', to: '/forum', icon: HEADER_ACTION_ICONS.MessageCircle },
          { label: 'Alertas', to: '/notificacoes', icon: HEADER_ACTION_ICONS.Bell, responsiveLabel: 'never' },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6 pb-40 md:pb-8`}>
        <CuriosidadesHero />
        <CuriosidadesStats />
        <CuriosidadesToday />
        <CuriosidadesRankings />
        <div className="grid gap-4 lg:grid-cols-2">
          <CuriosidadesGenerations />
          <CuriosidadesCouples />
          <CuriosidadesDiscoverySection />
          <CuriosidadesAiSection />
          <CuriosidadesConnectionSection />
          <CuriosidadesQuizSection />
          <CuriosidadesRouteSection />
          <CuriosidadesInterestsSection />
          <CuriosidadesMemoryWall />
          <CuriosidadesAstrology />
        </div>
      </main>
    </div>
  );
}

