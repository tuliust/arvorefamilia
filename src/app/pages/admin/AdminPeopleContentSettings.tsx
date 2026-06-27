import { useEffect, useMemo, useState } from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { atualizarGeracaoManualPessoa, atualizarPessoa, obterTodasPessoas } from '../../services/dataService';
import { deletePersonGeneratedInsight, gerarInsightsPessoa, getInsightByType, obterInsightsGeradosPessoa, upsertPersonGeneratedInsight, type PersonGeneratedInsight } from '../../services/personInsightsService';
import { getPersonVisibilitySettings, upsertPersonVisibilitySettings } from '../../services/personVisibilitySettingsService';
import { getZodiacSignFromBirthDate } from '../../utils/zodiac';
import { PersonVisibilitySettings, Pessoa } from '../../types';

type InsightDraftState = {
  astrologyBody: string;
  astrologySign: string;
  historicalTitle: string;
  historicalMainEvent: string;
};

function createEmptyDraft(): InsightDraftState {
  return {
    astrologyBody: '',
    astrologySign: '',
    historicalTitle: '',
    historicalMainEvent: '',
  };
}

export function AdminPeopleContentSettings() {
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [visibility, setVisibility] = useState<PersonVisibilitySettings | null>(null);
  const [insights, setInsights] = useState<PersonGeneratedInsight[]>([]);
  const [insightDraft, setInsightDraft] = useState<InsightDraftState>(() => createEmptyDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [insightToClear, setInsightToClear] = useState<'astrology' | 'historical_events' | null>(null);

  const filteredPeople = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return people;
    return people.filter((person) => person.nome_completo.toLowerCase().includes(normalized));
  }, [filter, people]);

  const selectedPessoa = useMemo(
    () => people.find((person) => person.id === selectedPessoaId) ?? null,
    [people, selectedPessoaId],
  );

  const astrologyInsight = getInsightByType(insights, 'astrology');
  const historicalInsight = getInsightByType(insights, 'historical_events');

  useEffect(() => {
    let mounted = true;

    async function loadPeople() {
      try {
        setLoading(true);
        const loadedPeople = await obterTodasPessoas();
        if (!mounted) return;
        setPeople(loadedPeople);
        if (!selectedPessoaId && loadedPeople[0]?.id) {
          setSelectedPessoaId(loadedPeople[0].id);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar pessoas.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPeople();

    return () => {
      mounted = false;
    };
  }, [selectedPessoaId]);

  useEffect(() => {
    if (!selectedPessoaId) return;

    async function loadDetails() {
      try {
        setLoading(true);
        const [visibilitySettings, generatedInsights] = await Promise.all([
          getPersonVisibilitySettings(selectedPessoaId),
          obterInsightsGeradosPessoa(selectedPessoaId),
        ]);

        setVisibility(visibilitySettings);
        setInsights(generatedInsights);

        const nextAstrology = getInsightByType(generatedInsights, 'astrology');
        const nextHistorical = getInsightByType(generatedInsights, 'historical_events');

        setInsightDraft({
          astrologyBody: String(nextAstrology?.conteudo?.body ?? ''),
          astrologySign: String(nextAstrology?.conteudo?.sign ?? getZodiacSignFromBirthDate(selectedPessoa?.data_nascimento) ?? ''),
          historicalTitle: String(nextHistorical?.conteudo?.title ?? ''),
          historicalMainEvent: String(nextHistorical?.conteudo?.main_event ?? ''),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar configurações da pessoa.');
      } finally {
        setLoading(false);
      }
    }

    void loadDetails();
  }, [selectedPessoa?.data_nascimento, selectedPessoaId]);

  const handleSaveGeneration = async () => {
    if (!selectedPessoa) return;
    try {
      setSaving(true);
      const generation = Number(selectedPessoa.manual_generation ?? 0);
      if (!Number.isInteger(generation) || generation < 1 || generation > 7) {
        throw new Error('Informe uma geração manual entre 1 e 7.');
      }
      await atualizarGeracaoManualPessoa(selectedPessoa.id, generation);
      toast.success('Geração atualizada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar geração.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVisibility = async () => {
    if (!selectedPessoa || !visibility) return;
    try {
      setSaving(true);
      const saved = await upsertPersonVisibilitySettings(selectedPessoa.id, visibility);
      setVisibility(saved);
      toast.success('Visibilidade atualizada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar visibilidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInsights = async (force: boolean) => {
    if (!selectedPessoa) return;

    try {
      setSaving(true);
      await gerarInsightsPessoa(selectedPessoa.id, force);
      const refreshed = await obterInsightsGeradosPessoa(selectedPessoa.id);
      setInsights(refreshed);
      toast.success(force ? 'Conteúdos regenerados.' : 'Conteúdos gerados.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar conteúdos.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInsights = async () => {
    if (!selectedPessoa) return;

    try {
      setSaving(true);
      const birthDate = String(selectedPessoa.data_nascimento ?? '').trim();
      if (!birthDate) throw new Error('A pessoa precisa de data de nascimento para persistir os conteúdos.');

      await Promise.all([
        upsertPersonGeneratedInsight({
          pessoaId: selectedPessoa.id,
          tipo: 'astrology',
          dataNascimento: birthDate,
          conteudo: {
            body: insightDraft.astrologyBody,
            sign: insightDraft.astrologySign || getZodiacSignFromBirthDate(selectedPessoa.data_nascimento),
          },
        }),
        upsertPersonGeneratedInsight({
          pessoaId: selectedPessoa.id,
          tipo: 'historical_events',
          dataNascimento: birthDate,
          conteudo: {
            title: insightDraft.historicalTitle,
            main_event: insightDraft.historicalMainEvent,
          },
        }),
      ]);

      setInsights(await obterInsightsGeradosPessoa(selectedPessoa.id));
      toast.success('Conteúdos automáticos salvos.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar conteúdos.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearInsight = (tipo: 'astrology' | 'historical_events') => {
    if (!selectedPessoa || saving) return;
    setInsightToClear(tipo);
  };

  const confirmClearInsight = async () => {
    if (!selectedPessoa || !insightToClear || saving) return;

    const tipo = insightToClear;
    try {
      setSaving(true);
      await deletePersonGeneratedInsight(selectedPessoa.id, tipo);
      setInsights(await obterInsightsGeradosPessoa(selectedPessoa.id));
      if (tipo === 'astrology') {
        setInsightDraft((current) => ({ ...current, astrologyBody: '', astrologySign: '' }));
      } else {
        setInsightDraft((current) => ({ ...current, historicalTitle: '', historicalMainEvent: '' }));
      }
      setInsightToClear(null);
      toast.success('Conteudo limpo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel limpar conteudo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Gestão de Conteúdo de Pessoas"
        subtitle="Geração, visibilidade e conteúdos automáticos por pessoa"
        icon={Settings2}
        actions={[
          { label: 'Admin', to: '/admin', icon: Settings2 },
          { label: 'Pessoas', to: '/admin/pessoas', icon: Sparkles },
        ]}
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 xl:grid-cols-[22rem_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Buscar pessoa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar por nome" />
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {filteredPeople.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedPessoaId(person.id)}
                  className={[
                    'w-full rounded-lg border px-3 py-3 text-left text-sm',
                    selectedPessoaId === person.id ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700',
                  ].join(' ')}
                >
                  <p className="font-semibold">{person.nome_completo}</p>
                  <p className="mt-1 text-xs text-gray-500">{person.data_nascimento ? `Nascimento: ${person.data_nascimento}` : 'Sem data de nascimento'}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {loading || !selectedPessoa ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Selecione uma pessoa para carregar configurações.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Geração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <label className="space-y-1 text-sm">
                      <span className="font-medium text-gray-700">Geração manual</span>
                      <input
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
                        type="number"
                        min={1}
                        max={7}
                        value={selectedPessoa.manual_generation ?? ''}
                        onChange={(event) => setPeople((current) => current.map((person) => (
                          person.id === selectedPessoa.id
                            ? { ...person, manual_generation: Number(event.target.value) || null }
                            : person
                        )))}
                      />
                    </label>
                    <div className="md:col-span-2 flex items-end">
                      <Button type="button" onClick={handleSaveGeneration} disabled={saving}>Salvar geração</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visibilidade de páginas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {visibility ? ([
                    ['perfil_visivel', 'Perfil'],
                    ['arvore_visivel', 'Árvore'],
                    ['mapa_familiar_visivel', 'Mapa familiar'],
                    ['curiosidades_visivel', 'Curiosidades'],
                    ['arquivos_historicos_visivel', 'Arquivos históricos'],
                    ['calendario_visivel', 'Calendário'],
                    ['forum_visivel', 'Fórum'],
                    ['dados_sensiveis_visiveis', 'Dados sensíveis'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={visibility[key]}
                        onChange={(event) => setVisibility({ ...visibility, [key]: event.target.checked })}
                      />
                    </label>
                  )) : null}
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="button" onClick={handleSaveVisibility} disabled={saving}>Salvar visibilidade</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conteúdos automáticos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => void handleGenerateInsights(false)} disabled={saving}>
                      Gerar conteúdos ausentes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void handleGenerateInsights(true)} disabled={saving}>
                      Regenerar conteúdos
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900">Astrologia</p>
                      <p className="text-xs text-gray-500">
                        Estado atual: {astrologyInsight?.status || 'ausente'}.
                      </p>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-gray-700">Signo solar</span>
                        <input className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={insightDraft.astrologySign} onChange={(event) => setInsightDraft((current) => ({ ...current, astrologySign: event.target.value }))} />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-gray-700">Resumo</span>
                        <textarea className="min-h-40 w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={insightDraft.astrologyBody} onChange={(event) => setInsightDraft((current) => ({ ...current, astrologyBody: event.target.value }))} />
                      </label>
                      <Button type="button" variant="outline" onClick={() => void handleClearInsight('astrology')} disabled={saving}>Limpar astrologia</Button>
                    </div>

                    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900">Fatos do nascimento</p>
                      <p className="text-xs text-gray-500">
                        Estado atual: {historicalInsight?.status || 'ausente'}.
                      </p>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-gray-700">Título</span>
                        <input className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={insightDraft.historicalTitle} onChange={(event) => setInsightDraft((current) => ({ ...current, historicalTitle: event.target.value }))} />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-gray-700">Resumo principal</span>
                        <textarea className="min-h-40 w-full rounded-lg border border-gray-200 bg-white px-3 py-2" value={insightDraft.historicalMainEvent} onChange={(event) => setInsightDraft((current) => ({ ...current, historicalMainEvent: event.target.value }))} />
                      </label>
                      <Button type="button" variant="outline" onClick={() => void handleClearInsight('historical_events')} disabled={saving}>Limpar fatos</Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={handleSaveInsights} disabled={saving}>Salvar conteúdos automáticos</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacidade básica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    ['permitir_exibir_data_nascimento', 'Exibir data de nascimento'],
                    ['permitir_exibir_endereco', 'Exibir endereço'],
                    ['permitir_exibir_rede_social', 'Exibir rede social'],
                    ['permitir_exibir_telefone', 'Exibir telefone'],
                    ['permitir_mensagens_whatsapp', 'Permitir mensagens por WhatsApp'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedPessoa[key as keyof Pessoa])}
                        onChange={(event) => setPeople((current) => current.map((person) => (
                          person.id === selectedPessoa.id
                            ? { ...person, [key]: event.target.checked }
                            : person
                        )))}
                      />
                    </label>
                  ))}
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await atualizarPessoa(selectedPessoa.id, {
                            permitir_exibir_data_nascimento: selectedPessoa.permitir_exibir_data_nascimento,
                            permitir_exibir_endereco: selectedPessoa.permitir_exibir_endereco,
                            permitir_exibir_rede_social: selectedPessoa.permitir_exibir_rede_social,
                            permitir_exibir_telefone: selectedPessoa.permitir_exibir_telefone,
                            permitir_mensagens_whatsapp: selectedPessoa.permitir_mensagens_whatsapp,
                          });
                          toast.success('Privacidade básica atualizada.');
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Não foi possível salvar privacidade.');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                    >
                      Salvar privacidade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={Boolean(insightToClear)}
        onOpenChange={(open) => {
          if (!open && !saving) setInsightToClear(null);
        }}
        title={insightToClear === 'astrology' ? 'Limpar astrologia' : 'Limpar fatos'}
        description={insightToClear === 'astrology' ? 'Limpar o conteudo salvo de astrologia? Esta acao nao pode ser desfeita.' : 'Limpar o conteudo salvo de fatos do nascimento? Esta acao nao pode ser desfeita.'}
        confirmText="Limpar"
        cancelText="Cancelar"
        onConfirm={confirmClearInsight}
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
