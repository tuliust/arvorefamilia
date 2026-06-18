import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import type { Pessoa, Relacionamento } from '../types';
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
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCuriosidadesData() {
      try {
        setLoading(true);
        setError(null);

        const [loadedPessoas, loadedRelacionamentos] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
        ]);

        if (cancelled) return;

        setPessoas(Array.isArray(loadedPessoas) ? loadedPessoas : []);
        setRelacionamentos(Array.isArray(loadedRelacionamentos) ? loadedRelacionamentos : []);
      } catch (loadError) {
        if (cancelled) return;

        console.error('Erro ao carregar dados de curiosidades:', loadError);
        setError(loadError instanceof Error ? loadError.message : 'NÃ£o foi possÃ­vel carregar os dados familiares.');
        setPessoas([]);
        setRelacionamentos([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCuriosidadesData();

    return () => {
      cancelled = true;
    };
  }, []);

  const curiosityDataProps = {
    pessoas,
    relacionamentos,
    loading,
    error,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <MemberPageHeader
        title="Curiosidades"
        subtitle="Descobertas, histÃ³rias e conexÃµes da famÃ­lia"
        icon={Sparkles}
        actions={[
          { label: 'Ãrvore Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.ArrowLeft, responsiveLabel: 'always' },
          { label: 'CalendÃ¡rio', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'FÃ³rum', to: '/forum', icon: HEADER_ACTION_ICONS.MessageCircle },
          { label: 'Alertas', to: '/notificacoes', icon: HEADER_ACTION_ICONS.Bell, responsiveLabel: 'never' },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6 pb-40 md:pb-8`}>
        <CuriosidadesHero />
        <CuriosidadesStats {...curiosityDataProps} />
        <CuriosidadesToday {...curiosityDataProps} />
        <CuriosidadesRankings {...curiosityDataProps} />
        <div className="grid gap-4 lg:grid-cols-2">
          <CuriosidadesGenerations {...curiosityDataProps} />
          <CuriosidadesCouples {...curiosityDataProps} />
          <CuriosidadesDiscoverySection {...curiosityDataProps} />
          <CuriosidadesAiSection {...curiosityDataProps} />
          <CuriosidadesConnectionSection {...curiosityDataProps} />
          <CuriosidadesQuizSection {...curiosityDataProps} />
          <CuriosidadesRouteSection {...curiosityDataProps} />
          <CuriosidadesInterestsSection {...curiosityDataProps} />
          <CuriosidadesMemoryWall />
          <CuriosidadesAstrology {...curiosityDataProps} />
        </div>
      </main>
    </div>
  );
}

