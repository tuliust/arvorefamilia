import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { getProfileQuestionnaireSelectedBadges } from '../services/profileQuestionnaireService';
import type { Pessoa, Relacionamento } from '../types';
import { CuriosidadesAiSection } from './curiosidades/CuriosidadesAiSection';
import { CuriosidadesAstrology } from './curiosidades/CuriosidadesAstrology';
import { CuriosidadesCharts } from './curiosidades/CuriosidadesCharts';
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
import type { ProfileBadgesByPersonId } from './curiosidades/curiosidadesUtils';

async function loadProfileBadgesByPersonId(pessoas: Pessoa[]): Promise<ProfileBadgesByPersonId> {
  if (pessoas.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    pessoas.map(async (pessoa) => {
      try {
        const result = await getProfileQuestionnaireSelectedBadges(pessoa.id);

        if (result.error || !Array.isArray(result.data) || result.data.length === 0) {
          return [pessoa.id, []] as const;
        }

        return [
          pessoa.id,
          result.data.map((badge) => ({
            id: badge.id,
            label: badge.label,
            category: badge.category,
          })),
        ] as const;
      } catch (error) {
        console.warn(`NÃ£o foi possÃ­vel carregar badges do perfil ${pessoa.id}:`, error);
        return [pessoa.id, []] as const;
      }
    })
  );

  return entries.reduce<ProfileBadgesByPersonId>((accumulator, [pessoaId, badges]) => {
    if (badges.length > 0) {
      accumulator[pessoaId] = [...badges];
    }

    return accumulator;
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
        setError(loadError instanceof Error ? loadError.message : 'NÃ£o foi possÃ­vel carregar os dados familiares.');
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
        subtitle="Descobertas, histÃ³rias e conexÃµes da famÃ­lia"
        icon={Sparkles}
      />

      <main className={`${PAGE_CONTAINER_CLASS} min-w-0 space-y-4 py-4 pb-36 sm:space-y-6 sm:py-6 md:pb-8`}>
        <CuriosidadesHero />
        <div id="numeros-da-familia" className="scroll-mt-24">
          <CuriosidadesStats {...curiosityDataProps} />
        </div>
        <div id="hoje-na-familia" className="scroll-mt-24">
          <CuriosidadesToday {...curiosityDataProps} />
        </div>
        <div id="voce-sabia" className="scroll-mt-24">
          <CuriosidadesRankings {...curiosityDataProps} />
        </div>
        <div id="graficos" className="scroll-mt-24">
          <CuriosidadesCharts {...curiosityDataProps} />
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 space-y-4">
            <div id="geracoes" className="scroll-mt-24">
              <CuriosidadesGenerations {...curiosityDataProps} />
            </div>
            <div id="descobertas" className="scroll-mt-24">
              <CuriosidadesDiscoverySection {...curiosityDataProps} />
            </div>
            <div id="conexoes" className="scroll-mt-24">
              <CuriosidadesConnectionSection {...curiosityDataProps} />
            </div>
            <div id="rota" className="scroll-mt-24">
              <CuriosidadesRouteSection {...curiosityDataProps} />
            </div>
            <div id="mural" className="scroll-mt-24">
              <CuriosidadesMemoryWall />
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div id="bodas" className="scroll-mt-24">
              <CuriosidadesCouples {...curiosityDataProps} />
            </div>
            <div id="ia" className="scroll-mt-24">
              <CuriosidadesAiSection {...curiosityDataProps} />
            </div>
            <div id="quiz" className="scroll-mt-24">
              <CuriosidadesQuizSection {...curiosityDataProps} />
            </div>
            <div id="interesses" className="scroll-mt-24">
              <CuriosidadesInterestsSection {...curiosityDataProps} />
            </div>
            <div id="astrologia" className="scroll-mt-24">
              <CuriosidadesAstrology {...curiosityDataProps} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

