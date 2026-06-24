import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { getProfileQuestionnaireSelectedBadges } from '../services/profileQuestionnaireService';
import type { Pessoa, Relacionamento } from '../types';
import { CuriosidadesAiSection } from './curiosidades/CuriosidadesAiSection';
import { CuriosidadesCharts } from './curiosidades/CuriosidadesCharts';
import { CuriosidadesCouples } from './curiosidades/CuriosidadesCouples';
import { CuriosidadesGenerations } from './curiosidades/CuriosidadesGenerations';
import { CuriosidadesHero } from './curiosidades/CuriosidadesHero';
import { CuriosidadesInsightTabs } from './curiosidades/CuriosidadesInsightTabs';
import { CuriosidadesMemoryWall } from './curiosidades/CuriosidadesMemoryWall';
import { CuriosidadesQuizSection } from './curiosidades/CuriosidadesQuizSection';
import { CuriosidadesRankings } from './curiosidades/CuriosidadesRankings';
import { CuriosidadesRouteSection } from './curiosidades/CuriosidadesRouteSection';
import { CuriosidadesStats } from './curiosidades/CuriosidadesStats';
import { CuriosidadesToday } from './curiosidades/CuriosidadesToday';
import type { ProfileBadgesByPersonId } from './curiosidades/curiosidadesUtils';

async function loadProfileBadgesByPersonId(pessoas: Pessoa[]): Promise<ProfileBadgesByPersonId> {
  if (pessoas.length === 0) {
    return {};
  }

  const badgesByPersonId: ProfileBadgesByPersonId = {};

  for (const pessoa of pessoas) {
    try {
      const result = await getProfileQuestionnaireSelectedBadges(pessoa.id);

      if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
        badgesByPersonId[pessoa.id] = result.data.map((badge) => ({
          id: badge.id,
          label: badge.label,
          category: badge.category,
        }));
      }
    } catch (error) {
      console.warn(`Não foi possível carregar badges do perfil ${pessoa.id}:`, error);
    }
  }

  return badgesByPersonId;
}

export function Curiosidades() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [profileBadgesByPersonId, setProfileBadgesByPersonId] = useState<ProfileBadgesByPersonId>({});
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

        const normalizedPessoas = Array.isArray(loadedPessoas) ? loadedPessoas : [];
        const normalizedRelacionamentos = Array.isArray(loadedRelacionamentos) ? loadedRelacionamentos : [];
        const loadedProfileBadgesByPersonId = await loadProfileBadgesByPersonId(normalizedPessoas);

        if (cancelled) return;

        setPessoas(normalizedPessoas);
        setRelacionamentos(normalizedRelacionamentos);
        setProfileBadgesByPersonId(loadedProfileBadgesByPersonId);
      } catch (loadError) {
        if (cancelled) return;

        console.error('Erro ao carregar dados de curiosidades:', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os dados familiares.');
        setPessoas([]);
        setRelacionamentos([]);
        setProfileBadgesByPersonId({});
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
    profileBadgesByPersonId,
    loading,
    error,
  };

  return (
    <div className="curiosidades-page min-h-screen overflow-x-hidden bg-gray-50 pb-24 md:pb-0">
      <MemberPageHeader
        title="Curiosidades"
        subtitle="Descobertas, histórias e conexões da família"
        icon={Sparkles}
      />

      <main className={`${PAGE_CONTAINER_CLASS} min-w-0 space-y-4 py-4 pb-36 sm:space-y-6 sm:py-6 md:pb-8`}>
        <CuriosidadesHero />

        <div className="grid min-w-0 gap-4 sm:gap-4 xl:grid-cols-5 xl:items-start">
          <div id="hoje-na-familia" className="min-w-0 scroll-mt-24 xl:col-span-2">
            <CuriosidadesToday {...curiosityDataProps} />
          </div>

          <div id="ia" className="min-w-0 scroll-mt-24 xl:col-span-3">
            <CuriosidadesAiSection {...curiosityDataProps} />
          </div>

          <div id="numeros-da-familia" className="min-w-0 scroll-mt-24 xl:col-span-5">
            <CuriosidadesStats {...curiosityDataProps} />
          </div>

          <div id="quiz" className="min-w-0 scroll-mt-24 xl:col-span-3">
            <CuriosidadesQuizSection {...curiosityDataProps} />
          </div>

          <div id="mural" className="min-w-0 scroll-mt-24 xl:col-span-2">
            <CuriosidadesMemoryWall />
          </div>
        </div>

        <div id="voce-sabia" className="scroll-mt-24">
          <CuriosidadesRankings {...curiosityDataProps} />
        </div>

        <div id="graficos" className="scroll-mt-24">
          <CuriosidadesCharts {...curiosityDataProps} />
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="min-w-0 lg:h-full">
            <div id="geracoes" className="scroll-mt-24 lg:h-full">
              <CuriosidadesGenerations {...curiosityDataProps} className="lg:h-full" />
            </div>
          </div>

          <div className="min-w-0 space-y-4 lg:flex lg:h-full lg:flex-col lg:space-y-0 lg:gap-4">
            <div id="bodas" className="scroll-mt-24 lg:flex-1">
              <CuriosidadesCouples {...curiosityDataProps} className="lg:h-full" />
            </div>

            <div id="rota" className="scroll-mt-24 lg:flex-1">
              <CuriosidadesRouteSection {...curiosityDataProps} className="lg:h-full" />
            </div>
          </div>
        </div>

        <div id="exploracoes-familiares" className="scroll-mt-24">
          <CuriosidadesInsightTabs {...curiosityDataProps} />
        </div>
      </main>
    </div>
  );
}
