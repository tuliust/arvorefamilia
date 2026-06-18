import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '../../components/ui/button';
import { ContactInfo } from '../home/ContactInfo';
import { DiscoverResultCard } from '../home/DiscoverResultCard';
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
  getPersonDisplayName,
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

  useEffect(() => {
    if (!selectedPersonId && selectablePeople[0]?.id) {
      setSelectedPersonId(selectablePeople[0].id);
    }
  }, [selectablePeople, selectedPersonId]);

  const toggleTopic = (topic: CuriosityTopic) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );
    setSubmitted(false);
    setDiscoverError(null);
    setInsights([]);
  };

  const handleGenerate = async () => {
    if (!selectedPerson || selectedTopics.length === 0) return;

    setSubmitted(true);
    setDiscoverLoading(true);
    setDiscoverError(null);
    setInsights([]);

    try {
      const shouldLoadInsights = selectedTopics.some((topic) =>
        topic === 'Fatos Históricos do Dia de Nascimento' || topic === 'O que diz a Astrologia'
      );

      if (shouldLoadInsights) {
        const result = await obterInsightsGeradosPessoa(selectedPerson.id);
        setInsights(Array.isArray(result) ? result : []);
      }
    } catch (loadError) {
      setDiscoverError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as informações selecionadas.');
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleBack = () => {
    setSubmitted(false);
    setDiscoverError(null);
  };

  const handleOpenTree = () => {
    if (!selectedPerson) return;
    navigate(`/mapa-familiar?pessoa=${encodeURIComponent(selectedPerson.id)}`);
  };

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Descubra mais sobre...</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Escolha uma pessoa da árvore e selecione os tópicos que deseja explorar.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as pessoas para descoberta agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && selectablePeople.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há pessoas cadastradas para explorar nesta seção.
        </div>
      )}

      {!error && !loading && selectedPerson && !submitted && (
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Pessoa
            <select
              value={selectedPerson.id}
              onChange={(event) => {
                setSelectedPersonId(event.target.value);
                setSubmitted(false);
                setDiscoverError(null);
                setInsights([]);
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {selectablePeople.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {getPersonDisplayName(pessoa)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            {CURIOSITY_TOPIC_OPTIONS.map((topic) => {
              const checked = selectedTopics.includes(topic);

              return (
                <label
                  key={topic}
                  className={[
                    'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition',
                    checked
                      ? 'border-blue-200 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{topic}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={selectedTopics.length === 0 || discoverLoading}
              className="w-full sm:w-auto"
            >
              {discoverLoading ? 'Carregando...' : 'Gerar descoberta'}
            </Button>
          </div>
        </div>
      )}

      {!error && !loading && selectedPerson && submitted && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pessoa selecionada</p>
              <h3 className="mt-1 text-lg font-bold text-gray-950">{getPersonDisplayName(selectedPerson)}</h3>
              <p className="mt-1 text-sm text-blue-900">Informações selecionadas sobre esta pessoa.</p>
            </div>
            <Sparkles className="h-6 w-6 text-blue-700" />
          </div>

          {discoverLoading && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Carregando informações selecionadas...
            </div>
          )}

          {discoverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {discoverError}
            </div>
          )}

          {!discoverLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {selectedTopics.includes('Dados e Contato') && (
                <DiscoverResultCard title="Dados e Contato">
                  <ContactInfo pessoa={selectedPerson} />
                </DiscoverResultCard>
              )}

              {selectedTopics.includes('Biografia') && (
                <DiscoverResultCard title="Biografia">
                  {selectedPerson.minibio ? <p>{selectedPerson.minibio}</p> : <p>Esta pessoa ainda não possui biografia cadastrada.</p>}
                </DiscoverResultCard>
              )}

              {selectedTopics.includes('Curiosidades') && (
                <DiscoverResultCard title="Curiosidades">
                  {selectedPerson.curiosidades ? <p>{selectedPerson.curiosidades}</p> : <p>Esta pessoa ainda não possui curiosidades cadastradas.</p>}
                </DiscoverResultCard>
              )}

              {selectedTopics.includes('Fatos Históricos do Dia de Nascimento') && (
                <DiscoverResultCard title="Fatos Históricos do Dia do Nascimento">
                  {historicalInsight?.conteudo ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">{historicalInsight.conteudo.title}</p>
                      {historicalInsight.conteudo.main_event && <p>{historicalInsight.conteudo.main_event}</p>}
                      <p className="font-semibold text-slate-800">
                        {historicalInsight.conteudo.period_title || 'O que estava acontecendo na época'}
                      </p>
                      {Array.isArray(historicalInsight.conteudo.brazil?.body) && (
                        <div>
                          <p className="font-medium text-slate-800">{historicalInsight.conteudo.brazil?.title || 'Brasil'}</p>
                          {historicalInsight.conteudo.brazil.body.map((item: string, index: number) => (
                            <p key={`brazil-${index}`}>{item}</p>
                          ))}
                        </div>
                      )}
                      {Array.isArray(historicalInsight.conteudo.world?.body) && (
                        <div>
                          <p className="font-medium text-slate-800">{historicalInsight.conteudo.world?.title || 'Mundo'}</p>
                          {historicalInsight.conteudo.world.body.map((item: string, index: number) => (
                            <p key={`world-${index}`}>{item}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Os acontecimentos históricos ainda não foram gerados para esta pessoa.</p>
                  )}
                </DiscoverResultCard>
              )}

              {selectedTopics.includes('O que diz a Astrologia') && (
                <DiscoverResultCard title="O que diz a astrologia">
                  {selectedPerson.permitir_exibir_data_nascimento === false ? (
                    <p>Esta informação está oculta pelas preferências de privacidade.</p>
                  ) : astrologyInsight?.conteudo?.body ? (
                    <p>{astrologyInsight.conteudo.body}</p>
                  ) : (
                    <p>O texto de astrologia ainda não foi gerado para esta pessoa.</p>
                  )}
                </DiscoverResultCard>
              )}

              {selectedTopics.includes('Árvore Genealógica') && (
                <DiscoverResultCard title="Árvore Genealógica">
                  <div className="space-y-3">
                    <p>Abrir a árvore genealógica de {getPersonDisplayName(selectedPerson)} como pessoa central.</p>
                    <Button type="button" variant="outline" className="w-full bg-white sm:w-auto" onClick={handleOpenTree}>
                      Abrir árvore
                    </Button>
                  </div>
                </DiscoverResultCard>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleBack} className="w-full bg-white sm:w-auto">
              Voltar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
