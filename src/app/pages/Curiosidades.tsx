import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { getProfileQuestionnaireSelectedBadgesByPersonIds } from '../services/profileQuestionnaireService';
import type { Pessoa, Relacionamento } from '../types';
import { CuriosidadesAiSection } from './curiosidades/CuriosidadesAiSection';
import { CuriosidadesCharts } from './curiosidades/CuriosidadesCharts';
import { CuriosidadesCouples } from './curiosidades/CuriosidadesCouples';
import { CuriosidadesGenerations } from './curiosidades/CuriosidadesGenerations';
import { CuriosidadesStickyNav } from './curiosidades/CuriosidadesStickyNav';
import { CuriosidadesInsightTabs } from './curiosidades/CuriosidadesInsightTabs';
import { CuriosidadesMemoryWall } from './curiosidades/CuriosidadesMemoryWall';
import { CuriosidadesPhotoSlider } from './curiosidades/CuriosidadesPhotoSlider';
import { CuriosidadesQuizSection } from './curiosidades/CuriosidadesQuizSection';
import { CuriosidadesRankings } from './curiosidades/CuriosidadesRankings';
import { CuriosidadesRouteSection } from './curiosidades/CuriosidadesRouteSection';
import { CuriosidadesToday } from './curiosidades/CuriosidadesToday';
import type { ProfileBadgesByPersonId } from './curiosidades/curiosidadesUtils';

async function loadProfileBadgesByPersonId(pessoas: Pessoa[]): Promise<ProfileBadgesByPersonId> {
  const pessoaIds = pessoas.map((pessoa) => pessoa.id).filter(Boolean);

  if (pessoaIds.length === 0) {
    return {};
  }

  const result = await getProfileQuestionnaireSelectedBadgesByPersonIds(pessoaIds);

  if (result.error) {
    console.warn('Nao foi possivel carregar badges dos perfis:', result.error);
    return {};
  }

  return Object.entries(result.data).reduce<ProfileBadgesByPersonId>((badgesByPersonId, [pessoaId, badges]) => {
    const normalizedBadges = badges.map((badge) => ({
      id: badge.id,
      label: badge.label,
      category: badge.category,
    }));

    if (normalizedBadges.length > 0) {
      badgesByPersonId[pessoaId] = normalizedBadges;
    }

    return badgesByPersonId;
  }, {});
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
        setProfileBadgesByPersonId({});

        const [loadedPessoas, loadedRelacionamentos] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
        ]);

        if (cancelled) return;

        const normalizedPessoas = Array.isArray(loadedPessoas) ? loadedPessoas : [];
        const normalizedRelacionamentos = Array.isArray(loadedRelacionamentos) ? loadedRelacionamentos : [];

        setPessoas(normalizedPessoas);
        setRelacionamentos(normalizedRelacionamentos);
        setLoading(false);

        try {
          const loadedProfileBadgesByPersonId = await loadProfileBadgesByPersonId(normalizedPessoas);

          if (cancelled) return;

          setProfileBadgesByPersonId(loadedProfileBadgesByPersonId);
        } catch (badgesError) {
          console.warn('Nao foi possivel carregar badges dos perfis:', badgesError);
        }
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
    <div className="curiosidades-page min-h-screen bg-gray-50 pb-24 md:pb-0">
      <MemberPageHeader
        title="Curiosidades"
        subtitle="Descobertas, histórias e conexões da família"
        icon={Sparkles}
      />

      <CuriosidadesStickyNav />

      <main className={`${PAGE_CONTAINER_CLASS} min-w-0 space-y-4 py-4 pb-36 sm:space-y-6 sm:py-6 md:pb-8`}>
        <div className="curiosidades-overview-layout grid min-w-0 gap-4 sm:gap-4 xl:grid-cols-5 xl:items-stretch">
          <div className="curiosidades-today-photo-stack min-w-0 space-y-4 xl:col-span-2 xl:flex xl:h-full xl:flex-col xl:space-y-0 xl:gap-4">
            <div id="hoje-na-familia" className="curiosidades-today-card-slot min-w-0 scroll-mt-32 xl:flex-1">
              <CuriosidadesToday {...curiosityDataProps} className="xl:h-full" />
            </div>

            <div id="fotos" className="curiosidades-photo-slider-slot min-w-0 scroll-mt-32 xl:flex-1">
              <CuriosidadesPhotoSlider pessoas={pessoas} loading={loading} className="xl:h-full" />
            </div>
          </div>

          <div id="ia" className="curiosidades-ai-card-slot min-w-0 scroll-mt-32 xl:col-span-3 xl:h-full xl:[&>section]:h-full">
            <CuriosidadesAiSection {...curiosityDataProps} />
          </div>

          <div id="quiz" className="curiosidades-quiz-slot min-w-0 scroll-mt-32 xl:col-span-3 xl:h-full">
            <CuriosidadesQuizSection {...curiosityDataProps} className="xl:h-full" />
          </div>

          <div id="mural" className="curiosidades-mural-slot min-w-0 scroll-mt-32 xl:col-span-2 xl:h-full">
            <CuriosidadesMemoryWall className="xl:h-full" />
          </div>
        </div>

        <div id="voce-sabia" className="scroll-mt-32">
          <CuriosidadesRankings {...curiosityDataProps} />
        </div>

        <div id="graficos" className="scroll-mt-32">
          <CuriosidadesCharts {...curiosityDataProps} />
        </div>

        <div className="curiosidades-family-layout grid min-w-0 gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="min-w-0 lg:h-full">
            <div id="geracoes" className="scroll-mt-32 lg:h-full">
              <CuriosidadesGenerations {...curiosityDataProps} className="lg:h-full" />
            </div>
          </div>

          <div className="min-w-0 space-y-4 lg:flex lg:h-full lg:flex-col lg:space-y-0 lg:gap-4">
            <div id="bodas" className="scroll-mt-32 lg:flex-1">
              <CuriosidadesCouples {...curiosityDataProps} className="lg:h-full" />
            </div>

            <div id="rota" className="scroll-mt-32 lg:flex-1">
              <CuriosidadesRouteSection {...curiosityDataProps} className="lg:h-full" />
            </div>
          </div>
        </div>

        <div id="exploracoes-familiares" className="scroll-mt-32">
          <CuriosidadesInsightTabs {...curiosityDataProps} />
        </div>
      </main>
    </div>
  );
}
