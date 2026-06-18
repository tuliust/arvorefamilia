import { useState, type ReactNode } from 'react';
import type React from 'react';
import { Share2 } from 'lucide-react';

import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { FavoriteButton } from '../../components/favorites/FavoriteButton';
import type { PersonGeneratedInsight } from '../../services/personInsightsService';
import type { Pessoa } from '../../types';
import { ContactInfo } from './ContactInfo';
import { DiscoverResultCard } from './DiscoverResultCard';
import {
  CURIOSITY_TOPIC_OPTIONS,
  type CuriosityTopic,
} from './homeCuriositiesUtils';

const HISTORICAL_TOPIC = CURIOSITY_TOPIC_OPTIONS[3];
const ASTROLOGY_TOPIC = CURIOSITY_TOPIC_OPTIONS[4];
const TREE_TOPIC = CURIOSITY_TOPIC_OPTIONS[5];

type DiscoverMoreFlowProps = {
  pessoas: Pessoa[];
  selectedPersonId: string;
  onSelectedPersonIdChange: (value: string) => void;
  selectedPerson?: Pessoa | null;
  selectedTopics: CuriosityTopic[];
  onToggleTopic: (topic: CuriosityTopic) => void;
  submitted: boolean;
  loading: boolean;
  error: string | null;
  astrologyInsight?: PersonGeneratedInsight | null;
  historicalInsight?: PersonGeneratedInsight | null;
  onResetResults: () => void;
  onSubmittedChange: (value: boolean) => void;
  onBack: () => void;
  onGenerate: () => void;
  onOpenTree: (personId: string) => void;
  selectVariant?: 'native' | 'design-system';
  generateLabel?: string;
  submittedHeaderClassName?: string;
  submittedIcon?: React.ReactNode;
};

function getPersonDisplayName(pessoa?: Pessoa | null) {
  return String(pessoa?.nome_completo || 'Pessoa sem nome').trim();
}

function normalizeDiscoveryId(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getDiscoveryEntityId(personId: string, topic: CuriosityTopic) {
  return `person-${personId}-${normalizeDiscoveryId(topic)}`;
}

type DiscoveryCardActionsProps = {
  person: Pessoa;
  topic: CuriosityTopic;
  title: string;
};

function DiscoveryCardActions({ person, topic, title }: DiscoveryCardActionsProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const personName = getPersonDisplayName(person);
  const shareText = `Descoberta sobre ${personName}: ${title}`;
  const href = '/curiosidades#descobertas';

  const handleShare = async () => {
    const url = new URL(href, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        return;
      }

      await navigator.clipboard?.writeText(`${shareText}\n${url}`);
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 1800);
    } catch (error) {
      console.error('[DiscoverMoreFlow] Erro ao compartilhar descoberta:', error);
    }
  };

  return (
    <>
      <FavoriteButton
        entityType="curiosity_discovery"
        entityId={getDiscoveryEntityId(person.id, topic)}
        label={`${title} - ${personName}`}
        description={`Descoberta de curiosidades sobre ${personName}.`}
        href={href}
        metadata={{
          person_id: person.id,
          topic,
          source: 'curiosidades_discovery',
        }}
        variant="icon"
        size="sm"
        className="h-8 w-8"
      />
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
        aria-label={shareStatus === 'copied' ? 'Link copiado' : 'Compartilhar descoberta'}
        title={shareStatus === 'copied' ? 'Link copiado' : 'Compartilhar'}
      >
        <Share2 className="h-4 w-4" />
      </button>
    </>
  );
}

export function DiscoverMoreFlow({
  pessoas,
  selectedPersonId,
  onSelectedPersonIdChange,
  selectedPerson,
  selectedTopics,
  onToggleTopic,
  submitted,
  loading,
  error,
  astrologyInsight,
  historicalInsight,
  onResetResults,
  onSubmittedChange,
  onBack,
  onGenerate,
  onOpenTree,
  selectVariant = 'design-system',
  generateLabel = 'Avan\u00e7ar',
  submittedHeaderClassName,
  submittedIcon,
}: DiscoverMoreFlowProps) {
  const getCardActions = (topic: CuriosityTopic, title: string): ReactNode => (
    selectedPerson ? (
      <DiscoveryCardActions person={selectedPerson} topic={topic} title={title} />
    ) : null
  );

  const handlePersonChange = (value: string) => {
    onSelectedPersonIdChange(value);
    onSubmittedChange(false);
    onResetResults();
  };

  if (!submitted) {
    return (
      <>
        {selectVariant === 'native' ? (
          <label className="block text-sm font-semibold text-gray-700">
            Pessoa
            <select
              value={selectedPersonId}
              onChange={(event) => handlePersonChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {getPersonDisplayName(pessoa)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Select value={selectedPersonId} onValueChange={handlePersonChange}>
            <SelectTrigger className="h-12 rounded-lg border border-slate-500 bg-slate-100 px-4 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <SelectValue placeholder="Selecione uma pessoa" />
            </SelectTrigger>
            <SelectContent>
              {pessoas.map((pessoa) => (
                <SelectItem key={pessoa.id} value={pessoa.id}>
                  {getPersonDisplayName(pessoa)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CURIOSITY_TOPIC_OPTIONS.map((topic) => {
            const checked = selectedTopics.includes(topic);

            return (
              <label
                key={topic}
                className={[
                  'flex min-h-11 cursor-pointer items-center gap-2 border px-3 py-2 text-sm transition-colors',
                  selectVariant === 'native' ? 'rounded-xl' : 'rounded-lg',
                  checked
                    ? 'border-blue-200 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTopic(topic)}
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
            variant={selectVariant === 'native' ? 'default' : 'outline'}
            onClick={onGenerate}
            disabled={!selectedPerson || selectedTopics.length === 0 || loading}
            className={selectVariant === 'native' ? 'w-full sm:w-auto' : 'w-full bg-white sm:w-auto'}
          >
            {loading ? 'Carregando...' : generateLabel}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className={submittedHeaderClassName ?? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pessoa selecionada</p>
          <h3 className="mt-1 text-lg font-bold text-gray-950">
            {getPersonDisplayName(selectedPerson)}
          </h3>
          <p className="mt-1 text-sm text-blue-900">Informa\u00e7\u00f5es selecionadas sobre esta pessoa.</p>
        </div>
        {submittedIcon}
      </div>

      {loading && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Carregando informa\u00e7\u00f5es selecionadas...
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && selectedPerson && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {selectedTopics.includes('Dados e Contato') && (
            <DiscoverResultCard title="Dados e Contato" actions={getCardActions('Dados e Contato', 'Dados e Contato')}>
              <ContactInfo pessoa={selectedPerson} />
            </DiscoverResultCard>
          )}

          {selectedTopics.includes('Biografia') && (
            <DiscoverResultCard title="Biografia" actions={getCardActions('Biografia', 'Biografia')}>
              {selectedPerson.minibio ? (
                <p>{selectedPerson.minibio}</p>
              ) : (
                <p>Esta pessoa ainda n\u00e3o possui biografia cadastrada.</p>
              )}
            </DiscoverResultCard>
          )}

          {selectedTopics.includes('Curiosidades') && (
            <DiscoverResultCard title="Curiosidades" actions={getCardActions('Curiosidades', 'Curiosidades')}>
              {selectedPerson.curiosidades ? (
                <p>{selectedPerson.curiosidades}</p>
              ) : (
                <p>Esta pessoa ainda n\u00e3o possui curiosidades cadastradas.</p>
              )}
            </DiscoverResultCard>
          )}

          {selectedTopics.includes(HISTORICAL_TOPIC) && (
            <DiscoverResultCard title="Fatos Hist\u00f3ricos do Dia do Nascimento" actions={getCardActions(HISTORICAL_TOPIC, 'Fatos Hist\u00f3ricos do Dia do Nascimento')}>
              {historicalInsight?.conteudo ? (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">{historicalInsight.conteudo.title}</p>
                  {historicalInsight.conteudo.main_event && <p>{historicalInsight.conteudo.main_event}</p>}
                  <p className="font-semibold text-slate-800">
                    {historicalInsight.conteudo.period_title || 'O que estava acontecendo na \u00e9poca'}
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
                <p>Os acontecimentos hist\u00f3ricos ainda n\u00e3o foram gerados para esta pessoa.</p>
              )}
            </DiscoverResultCard>
          )}

          {selectedTopics.includes(ASTROLOGY_TOPIC) && (
            <DiscoverResultCard title="O que diz a astrologia" actions={getCardActions(ASTROLOGY_TOPIC, 'O que diz a astrologia')}>
              {selectedPerson.permitir_exibir_data_nascimento === false ? (
                <p>Esta informa\u00e7\u00e3o est\u00e1 oculta pelas prefer\u00eancias de privacidade.</p>
              ) : astrologyInsight?.conteudo?.body ? (
                <p>{astrologyInsight.conteudo.body}</p>
              ) : (
                <p>O texto de astrologia ainda n\u00e3o foi gerado para esta pessoa.</p>
              )}
            </DiscoverResultCard>
          )}

          {selectedTopics.includes(TREE_TOPIC) && (
            <DiscoverResultCard title="\u00c1rvore Geneal\u00f3gica" actions={getCardActions(TREE_TOPIC, '\u00c1rvore Geneal\u00f3gica')}>
              <div className="space-y-3">
                <p>Abrir a \u00e1rvore geneal\u00f3gica de {getPersonDisplayName(selectedPerson)} como pessoa central.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white sm:w-auto"
                  onClick={() => onOpenTree(selectedPerson.id)}
                >
                  Abrir \u00e1rvore
                </Button>
              </div>
            </DiscoverResultCard>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onBack} className="w-full bg-white sm:w-auto">
          Voltar
        </Button>
      </div>
    </div>
  );
}
