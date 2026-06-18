import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';

import { DiscoverMoreFlow } from '../home/DiscoverMoreFlow';
import {
  CURIOSITY_TOPIC_OPTIONS,
  type CuriosityTopic,
} from '../home/homeCuriositiesUtils';
import {
  getInsightByType,
  obterInsightsGeradosPessoa,
  type PersonGeneratedInsight,
} from '../../services/personInsightsService';
import {
  curiositySectionCardClassName,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesDiscoverySection({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const navigate = useNavigate();
  const selectablePeople = useMemo(
    () => pessoas.filter((pessoa) => !isPet(pessoa) && pessoa.nome_completo),
    [pessoas]
  );

  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<CuriosityTopic[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [insights, setInsights] = useState<PersonGeneratedInsight[]>([]);

  const selectedPerson = selectablePeople.find((pessoa) => pessoa.id === selectedPersonId) ?? selectablePeople[0] ?? null;
  const astrologyInsight = getInsightByType(insights, 'astrology');
  const historicalInsight = getInsightByType(insights, 'historical_events');

  const resetDiscoveryResults = () => {
    setDiscoverError(null);
    setInsights([]);
  };

  useEffect(() => {
    if (selectablePeople.length === 0) {
      if (selectedPersonId) {
        setSelectedPersonId('');
        setSelectedTopics([]);
        setSubmitted(false);
        resetDiscoveryResults();
      }
      return;
    }

    const selectedPersonStillExists = selectablePeople.some((pessoa) => pessoa.id === selectedPersonId);

    if (!selectedPersonId || !selectedPersonStillExists) {
      setSelectedPersonId(selectablePeople[0].id);
      setSelectedTopics([]);
      setSubmitted(false);
      resetDiscoveryResults();
    }
  }, [selectablePeople, selectedPersonId]);

  const toggleTopic = (topic: CuriosityTopic) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );
    setSubmitted(false);
    resetDiscoveryResults();
  };

  const handleGenerate = async () => {
    if (!selectedPerson || selectedTopics.length === 0) return;

    setSubmitted(true);
    setDiscoverLoading(true);
    resetDiscoveryResults();

    try {
      const shouldLoadInsights = selectedTopics.some((topic) =>
        topic === CURIOSITY_TOPIC_OPTIONS[3] || topic === CURIOSITY_TOPIC_OPTIONS[4]
      );

      if (shouldLoadInsights) {
        const result = await obterInsightsGeradosPessoa(selectedPerson.id);
        setInsights(Array.isArray(result) ? result : []);
      }
    } catch (loadError) {
      setDiscoverError(loadError instanceof Error ? loadError.message : 'N\u00e3o foi poss\u00edvel carregar as informa\u00e7\u00f5es selecionadas.');
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleBack = () => {
    setSubmitted(false);
    setDiscoverError(null);
  };

  const handleOpenTree = (personId: string) => {
    navigate(`/mapa-familiar?pessoa=${encodeURIComponent(personId)}`);
  };

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Descubra mais sobre...</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Escolha uma pessoa da \u00e1rvore e selecione os t\u00f3picos que deseja explorar.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          N\u00e3o foi poss\u00edvel carregar as pessoas para descoberta agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && selectablePeople.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda n\u00e3o h\u00e1 pessoas cadastradas para explorar nesta se\u00e7\u00e3o.
        </div>
      )}

      {!error && !loading && selectedPerson && (
        <div className="mt-5 space-y-4">
          <DiscoverMoreFlow
            pessoas={selectablePeople}
            selectedPersonId={selectedPerson.id}
            onSelectedPersonIdChange={setSelectedPersonId}
            selectedPerson={selectedPerson}
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
            submitted={submitted}
            loading={discoverLoading}
            error={discoverError}
            astrologyInsight={astrologyInsight}
            historicalInsight={historicalInsight}
            onResetResults={resetDiscoveryResults}
            onSubmittedChange={setSubmitted}
            onBack={handleBack}
            onGenerate={handleGenerate}
            onOpenTree={handleOpenTree}
            selectVariant="native"
            generateLabel="Gerar descoberta"
            submittedHeaderClassName="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-start sm:justify-between"
            submittedIcon={<Sparkles className="h-6 w-6 text-blue-700" />}
          />
        </div>
      )}
    </section>
  );
}
