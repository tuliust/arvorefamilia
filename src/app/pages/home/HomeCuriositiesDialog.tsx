import React from 'react';
import { Sparkles, UserSearch } from 'lucide-react';

import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { PersonGeneratedInsight } from '../../services/personInsightsService';
import type { Pessoa } from '../../types';
import type { RelationshipDegreeResult } from '../../utils/relationshipDegree';
import { AiQuestionPanel } from './AiQuestionPanel';
import { ConnectionDiscoveryPanel } from './ConnectionDiscoveryPanel';
import { ContactInfo } from './ContactInfo';
import { DiscoverResultCard } from './DiscoverResultCard';
import {
  CURIOSITY_TOPIC_OPTIONS,
  type CityCuriosity,
  type CuriosityTopic,
  calculateCuriosities,
  formatYear,
} from './homeCuriositiesUtils';

export type CuriosidadesTab = 'voce-sabia' | 'descubra' | 'pergunte-ia' | 'conexao';

type CuriosityTabOption = {
  id: CuriosidadesTab;
  label: string;
  icon: React.ElementType<{ className?: string }>;
};

interface HomeCuriositiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curiosityTabs: CuriosityTabOption[];
  activeCuriosityTab: CuriosidadesTab;
  onActiveCuriosityTabChange: (tab: CuriosidadesTab) => void;
  stats: {
    totalPessoas: number;
    pessoasVivas: number;
    pessoasFalecidas: number;
  };
  curiosities: ReturnType<typeof calculateCuriosities>;
  pessoas: Pessoa[];
  selectedCuriosityPersonId: string;
  onSelectedCuriosityPersonIdChange: (value: string) => void;
  selectedCuriosityPerson?: Pessoa;
  selectedCuriosityTopics: CuriosityTopic[];
  toggleCuriosityTopic: (topic: CuriosityTopic) => void;
  discoverSubmitted: boolean;
  discoverLoading: boolean;
  discoverError: string | null;
  discoverAstrologyInsight?: PersonGeneratedInsight | null;
  discoverHistoricalInsight?: PersonGeneratedInsight | null;
  setDiscoverResultsEmpty: () => void;
  onDiscoverSubmittedChange: (value: boolean) => void;
  handleBackToDiscoverForm: () => void;
  handleAdvanceCuriosityPrompt: () => void;
  handleOpenPersonTree: (personId: string) => void;
  aiQuestion: string;
  aiAnswer: string;
  aiLoading: boolean;
  aiError: string | null;
  canAskAi: boolean;
  aiQuestionPlaceholder: string;
  onAiQuestionChange: (value: string) => void;
  onAiErrorChange: (value: string | null) => void;
  handleAskAi: () => void;
  handleNewAiQuestion: () => void;
  connectionPersonOneId: string;
  connectionPersonTwoId: string;
  connectionIncludeInactiveSpouses: boolean;
  connectionLoading: boolean;
  connectionError: string | null;
  connectionResult: RelationshipDegreeResult | null;
  connectionMetricLabels: string[];
  connectionPathText: string;
  connectionRelationText: string;
  connectionWarnings: string[];
  onConnectionPersonOneIdChange: (value: string) => void;
  onConnectionPersonTwoIdChange: (value: string) => void;
  onConnectionIncludeInactiveSpousesChange: (value: boolean) => void;
  clearConnectionResult: () => void;
  clearConnectionError: () => void;
  handleDiscoverConnection: () => void;
}

export function HomeCuriositiesDialog({
  open,
  onOpenChange,
  curiosityTabs,
  activeCuriosityTab,
  onActiveCuriosityTabChange,
  stats,
  curiosities,
  pessoas,
  selectedCuriosityPersonId,
  onSelectedCuriosityPersonIdChange,
  selectedCuriosityPerson,
  selectedCuriosityTopics,
  toggleCuriosityTopic,
  discoverSubmitted,
  discoverLoading,
  discoverError,
  discoverAstrologyInsight,
  discoverHistoricalInsight,
  setDiscoverResultsEmpty,
  onDiscoverSubmittedChange,
  handleBackToDiscoverForm,
  handleAdvanceCuriosityPrompt,
  handleOpenPersonTree,
  aiQuestion,
  aiAnswer,
  aiLoading,
  aiError,
  canAskAi,
  aiQuestionPlaceholder,
  onAiQuestionChange,
  onAiErrorChange,
  handleAskAi,
  handleNewAiQuestion,
  connectionPersonOneId,
  connectionPersonTwoId,
  connectionIncludeInactiveSpouses,
  connectionLoading,
  connectionError,
  connectionResult,
  connectionMetricLabels,
  connectionPathText,
  connectionRelationText,
  connectionWarnings,
  onConnectionPersonOneIdChange,
  onConnectionPersonTwoIdChange,
  onConnectionIncludeInactiveSpousesChange,
  clearConnectionResult,
  clearConnectionError,
  handleDiscoverConnection,
}: HomeCuriositiesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-gray-100 pb-4">
          <DialogTitle className="flex items-center gap-2 px-6 pt-6">
            <Sparkles className="h-5 w-5" />
            Curiosidades
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {curiosityTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeCuriosityTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onActiveCuriosityTabChange(tab.id)}
                    className={`flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-center shadow-sm transition ${
                      active
                        ? 'border-2 border-blue-500 bg-blue-50 text-blue-900'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-9 w-9 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-sm font-semibold leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {activeCuriosityTab === 'voce-sabia' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Você Sabia?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Veja curiosidades rápidas sobre a família, datas, lugares e conexões da árvore.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Stat label="Pessoas cadastradas" value={stats.totalPessoas} />
                    <Stat label="Vivos" value={stats.pessoasVivas} />
                    <Stat label="Falecidos" value={stats.pessoasFalecidas} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CuriosityCard label="Mais velho" value={curiosities.oldest?.nome_completo || 'Sem data'} detail={formatYear(curiosities.oldest?.data_nascimento)} />
                    <CuriosityCard label="Mais novo" value={curiosities.youngest?.nome_completo || 'Sem data'} detail={formatYear(curiosities.youngest?.data_nascimento)} />
                    <CuriosityCard label="Mais filhos" value={curiosities.mostChildren?.name || 'Sem dados'} detail={`${curiosities.mostChildren?.count ?? 0} filhos`} />
                    <CuriosityCard label="Cidade com mais nascimentos" value={curiosities.topBirthCity?.city || 'Sem dados'} detail={`${curiosities.topBirthCity?.count ?? 0} pessoas`} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CuriosityList title="Onde moram" items={curiosities.topCurrentCities} />
                    <CuriosityList title="Onde nasceram" items={curiosities.topBirthCities} />
                  </div>
                </section>
              )}

              {activeCuriosityTab === 'descubra' && (
                <section className="space-y-4">
                  {!discoverSubmitted ? (
                    <>
                      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                        <UserSearch className="h-5 w-5 text-blue-600" />
                        Descubra mais sobre...
                      </h2>
                      <Select
                        value={selectedCuriosityPersonId}
                        onValueChange={(value) => {
                          onSelectedCuriosityPersonIdChange(value);
                          onDiscoverSubmittedChange(false);
                          setDiscoverResultsEmpty();
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-lg border border-slate-500 bg-slate-100 px-4 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                          <SelectValue placeholder="Selecione uma pessoa" />
                        </SelectTrigger>
                        <SelectContent>
                          {pessoas.map((pessoa) => (
                            <SelectItem key={pessoa.id} value={pessoa.id}>
                              {pessoa.nome_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CURIOSITY_TOPIC_OPTIONS.map((topic) => {
                          const checked = selectedCuriosityTopics.includes(topic);

                          return (
                            <label
                              key={topic}
                              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                checked
                                  ? 'border-blue-200 bg-blue-50 text-blue-900'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCuriosityTopic(topic)}
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
                          variant="outline"
                          onClick={discoverSubmitted ? handleBackToDiscoverForm : handleAdvanceCuriosityPrompt}
                          disabled={!discoverSubmitted && (!selectedCuriosityPerson || selectedCuriosityTopics.length === 0 || discoverLoading)}
                          className="w-full bg-white sm:w-auto"
                        >
                          {discoverLoading ? 'Carregando...' : discoverSubmitted ? 'Voltar' : 'Avançar'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {selectedCuriosityPerson?.nome_completo || 'Pessoa selecionada'}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Informações selecionadas sobre esta pessoa.
                          </p>
                        </div>
                      </div>

                      {discoverLoading && (
                        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          Carregando informações selecionadas...
                        </p>
                      )}

                      {discoverError && (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {discoverError}
                        </p>
                      )}

                      {!discoverLoading && selectedCuriosityPerson && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {selectedCuriosityTopics.includes('Dados e Contato') && (
                            <DiscoverResultCard title="Dados e Contato">
                              <ContactInfo pessoa={selectedCuriosityPerson} />
                            </DiscoverResultCard>
                          )}

                          {selectedCuriosityTopics.includes('Biografia') && (
                            <DiscoverResultCard title="Biografia">
                              <div className="space-y-2">
                                {selectedCuriosityPerson.minibio ? (
                                  <p>{selectedCuriosityPerson.minibio}</p>
                                ) : (
                                  <p>Esta pessoa ainda não possui biografia cadastrada.</p>
                                )}
                              </div>
                            </DiscoverResultCard>
                          )}

                          {selectedCuriosityTopics.includes('Curiosidades') && (
                            <DiscoverResultCard title="Curiosidades">
                              <div className="space-y-2">
                                {selectedCuriosityPerson.curiosidades && (
                                  <p>{selectedCuriosityPerson.curiosidades}</p>
                                )}
                                {!selectedCuriosityPerson.curiosidades && (
                                  <p>Esta pessoa ainda não possui curiosidades cadastradas.</p>
                                )}
                              </div>
                            </DiscoverResultCard>
                          )}

                          {selectedCuriosityTopics.includes('Fatos Históricos do Dia de Nascimento') && (
                            <DiscoverResultCard title="Fatos Históricos do Dia do Nascimento">
                              {discoverHistoricalInsight?.conteudo ? (
                                <div className="space-y-2">
                                  <p className="font-semibold text-slate-900">{discoverHistoricalInsight.conteudo.title}</p>
                                  {discoverHistoricalInsight.conteudo.main_event && <p>{discoverHistoricalInsight.conteudo.main_event}</p>}
                                  <p className="font-semibold text-slate-800">
                                    {discoverHistoricalInsight.conteudo.period_title || 'O que estava acontecendo na época'}
                                  </p>
                                  {Array.isArray(discoverHistoricalInsight.conteudo.brazil?.body) && (
                                    <div>
                                      <p className="font-medium text-slate-800">{discoverHistoricalInsight.conteudo.brazil?.title || 'Brasil'}</p>
                                      {discoverHistoricalInsight.conteudo.brazil.body.map((item: string, index: number) => (
                                        <p key={`brazil-${index}`}>{item}</p>
                                      ))}
                                    </div>
                                  )}
                                  {Array.isArray(discoverHistoricalInsight.conteudo.world?.body) && (
                                    <div>
                                      <p className="font-medium text-slate-800">{discoverHistoricalInsight.conteudo.world?.title || 'Mundo'}</p>
                                      {discoverHistoricalInsight.conteudo.world.body.map((item: string, index: number) => (
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

                          {selectedCuriosityTopics.includes('O que diz a Astrologia') && (
                            <DiscoverResultCard title="O que diz a astrologia">
                              {selectedCuriosityPerson.permitir_exibir_data_nascimento === false ? (
                                <p>Esta informação está oculta pelas preferências de privacidade.</p>
                              ) : discoverAstrologyInsight?.conteudo?.body ? (
                                <p>{discoverAstrologyInsight.conteudo.body}</p>
                              ) : (
                                <p>O texto de astrologia ainda não foi gerado para esta pessoa.</p>
                              )}
                            </DiscoverResultCard>
                          )}

                          {selectedCuriosityTopics.includes('Árvore Genealógica') && (
                            <DiscoverResultCard title="Árvore Genealógica">
                              <div className="space-y-3">
                                <p>
                                  Abrir a árvore genealógica de {selectedCuriosityPerson.nome_completo} como pessoa central.
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full bg-white sm:w-auto"
                                  onClick={() => {
                                    handleOpenPersonTree(selectedCuriosityPerson.id);
                                  }}
                                >
                                  Abrir árvore
                                </Button>
                              </div>
                            </DiscoverResultCard>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToDiscoverForm}
                          className="w-full bg-white sm:w-auto"
                        >
                          Voltar
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {activeCuriosityTab === 'pergunte-ia' && (
                <AiQuestionPanel
                  aiQuestion={aiQuestion}
                  aiAnswer={aiAnswer}
                  aiLoading={aiLoading}
                  aiError={aiError}
                  canAskAi={canAskAi}
                  placeholder={aiQuestionPlaceholder}
                  onQuestionChange={onAiQuestionChange}
                  onClearError={() => onAiErrorChange(null)}
                  onAskAi={handleAskAi}
                  onNewAiQuestion={handleNewAiQuestion}
                />
              )}

              {activeCuriosityTab === 'conexao' && (
                <ConnectionDiscoveryPanel
                  pessoas={pessoas}
                  connectionPersonOneId={connectionPersonOneId}
                  connectionPersonTwoId={connectionPersonTwoId}
                  connectionIncludeInactiveSpouses={connectionIncludeInactiveSpouses}
                  connectionLoading={connectionLoading}
                  connectionError={connectionError}
                  connectionResult={connectionResult}
                  connectionMetricLabels={connectionMetricLabels}
                  connectionPathText={connectionPathText}
                  connectionRelationText={connectionRelationText}
                  connectionWarnings={connectionWarnings}
                  onPersonOneChange={(value) => {
                    onConnectionPersonOneIdChange(value);
                    clearConnectionResult();
                    clearConnectionError();
                  }}
                  onPersonTwoChange={(value) => {
                    onConnectionPersonTwoIdChange(value);
                    clearConnectionResult();
                    clearConnectionError();
                  }}
                  onIncludeInactiveSpousesChange={(value) => {
                    onConnectionIncludeInactiveSpousesChange(value);
                    clearConnectionResult();
                    clearConnectionError();
                  }}
                  onDiscoverConnection={handleDiscoverConnection}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function CuriosityCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </div>
  );
}

function CuriosityList({ title, items }: { title: string; items: CityCuriosity[] }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-900">{title}</h2>
      <div className="space-y-2">
        {items.length > 0 ? items.map((item) => (
          <div
            key={item.city}
            className="group relative flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            title={`${item.city}\n${item.people.join('\n')}`}
          >
            <span className="truncate text-gray-600">{item.city}</span>
            <span className="font-semibold text-gray-900">{item.count}</span>
            <div className="pointer-events-none absolute left-3 right-3 top-[calc(100%+0.35rem)] z-20 hidden rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg group-hover:block">
              <p className="font-semibold text-gray-900">{item.city}</p>
              <p className="mt-1 text-gray-500">Pessoas:</p>
              <ul className="mt-1 space-y-1">
                {item.people.slice(0, 10).map((name) => (
                  <li key={name} className="truncate">
                    {name}
                  </li>
                ))}
              </ul>
              {item.people.length > 10 && (
                <p className="mt-2 font-medium text-gray-600">+ {item.people.length - 10} pessoas</p>
              )}
            </div>
          </div>
        )) : (
          <p className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">Sem dados.</p>
        )}
      </div>
    </div>
  );
}
