import React, { useEffect, useMemo, useState } from 'react';
import { AppLink as Link } from '../components/AppLink';
import { useSearchParams } from 'react-router';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import { ChevronLeft, ChevronRight, CalendarSync, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { Pessoa, Relacionamento } from '../types';
import {
  CalendarEventCategory,
  criarEventosDoCalendario,
  EventoCalendarioFamiliar,
  getCalendarCategory,
} from '../utils/familyDates';
import { useAuth } from '../contexts/AuthContext';
import {
  desconectarGoogleCalendar,
  iniciarConexaoGoogleCalendar,
  obterStatusGoogleCalendar,
  sincronizarGoogleCalendar,
  GoogleCalendarStatus,
} from '../services/googleCalendarService';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const CALENDAR_CATEGORY_COLORS = {
  aniversarios: {
    label: 'Aniversários',
    background: '#EFF6FF',
    border: '#93C5FD',
    text: '#1D4ED8',
    dot: '#3B82F6',
  },
  casamento: {
    label: 'Data de Casamento',
    background: '#FEF2F2',
    border: '#FCA5A5',
    text: '#B91C1C',
    dot: '#EF4444',
  },
  falecimento: {
    label: 'Dia de Falecimento',
    background: '#F5F3FF',
    border: '#C4B5FD',
    text: '#6D28D9',
    dot: '#8B5CF6',
  },
  eventos_historicos: {
    label: 'Eventos Históricos',
    background: '#FEFCE8',
    border: '#FDE047',
    text: '#854D0E',
    dot: '#EAB308',
  },
  confraternizacoes: {
    label: 'Reuniões',
    background: '#F0FDF4',
    border: '#86EFAC',
    text: '#166534',
    dot: '#22C55E',
  },
} as const;

const CALENDAR_CATEGORY_KEYS = Object.keys(CALENDAR_CATEGORY_COLORS) as CalendarEventCategory[];

const MOBILE_CALENDAR_LEGEND_ITEMS: Array<{ category: CalendarEventCategory; label: string }> = [
  { category: 'aniversarios', label: 'Anivers\u00e1rio' },
  { category: 'casamento', label: 'Casamento' },
  { category: 'falecimento', label: 'Falecimento' },
  { category: 'eventos_historicos', label: 'Outros' },
  { category: 'confraternizacoes', label: 'Reuni\u00e3o' },
];

const DEFAULT_ACTIVE_CATEGORIES: Record<CalendarEventCategory, boolean> = {
  aniversarios: true,
  casamento: true,
  falecimento: true,
  eventos_historicos: true,
  confraternizacoes: true,
};

function construirGradeMes(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const totalDias = ultimoDia.getDate();
  const inicioSemana = primeiroDia.getDay();

  const grade: Array<number | null> = [];

  for (let i = 0; i < inicioSemana; i += 1) {
    grade.push(null);
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    grade.push(dia);
  }

  while (grade.length % 7 !== 0) {
    grade.push(null);
  }

  return grade;
}

function agruparPorDia(eventos: EventoCalendarioFamiliar[]) {
  const mapa = new Map<number, EventoCalendarioFamiliar[]>();

  for (const evento of eventos) {
    const lista = mapa.get(evento.dia) ?? [];
    lista.push(evento);
    mapa.set(evento.dia, lista);
  }

  return mapa;
}

function formatEventCount(count: number) {
  return count === 1 ? '1 evento' : `${count} eventos`;
}

function getFirstDisplayName(nome: string) {
  return nome.trim().split(/\s+/)[0] || nome;
}

function getDeathAnniversaryYears(evento: EventoCalendarioFamiliar) {
  const match = evento.titulo.match(/\b(\d+)\s+anos?\s+de\s+falecimento\b/i);
  return match?.[1];
}

function formatCalendarEventTitle(evento: EventoCalendarioFamiliar) {
  if (evento.category === 'aniversarios' || evento.tipo === 'aniversario') {
    return `Aniversário de ${getFirstDisplayName(evento.nome)}`;
  }

  if (evento.category === 'falecimento' || evento.tipo === 'falecimento') {
    const anos = getDeathAnniversaryYears(evento);
    return anos ? `${anos} anos de falecimento` : 'Falecimento';
  }

  return evento.titulo;
}

function formatCalendarEventDescription(evento: EventoCalendarioFamiliar) {
  if (evento.category === 'falecimento' || evento.tipo === 'falecimento') {
    return `Memória de ${evento.nome}`;
  }

  if (evento.category !== 'aniversarios' && evento.tipo !== 'aniversario') {
    return evento.descricao;
  }

  const match = evento.descricao.match(/^(\d+)\s+anos?/);
  if (!match) return evento.descricao;

  return `Faz ${match[1]} anos`;
}

function formatDeathSidebarTitle(evento: EventoCalendarioFamiliar) {
  const anos = getDeathAnniversaryYears(evento);
  return anos ? `${anos} anos da morte de ${evento.nome}` : `Morte de ${evento.nome}`;
}

export function CalendarioFamiliar() {
  const hoje = new Date();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataAtual, setDataAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus>({ conectado: false });
  const [showGoogleCalendarMobileCard, setShowGoogleCalendarMobileCard] = useState(false);
  const [incluirAniversarios, setIncluirAniversarios] = useState(true);
  const [incluirMemorias, setIncluirMemorias] = useState(true);
  const [ultimoResultadoSync, setUltimoResultadoSync] = useState<{
    totalCriados?: number;
    totalAtualizados?: number;
    totalIgnorados?: number;
  } | null>(null);
  const [activeCategories, setActiveCategories] = useState<Record<CalendarEventCategory, boolean>>(DEFAULT_ACTIVE_CATEGORIES);
  const [selectedDayEvents, setSelectedDayEvents] = useState<EventoCalendarioFamiliar[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [dadosPessoas, dadosRelacionamentos] = await Promise.all([
        obterTodasPessoas(),
        obterTodosRelacionamentos(),
      ]);
      setPessoas(Array.isArray(dadosPessoas) ? dadosPessoas : []);
      setRelacionamentos(Array.isArray(dadosRelacionamentos) ? dadosRelacionamentos : []);
      setLoading(false);
    };

    carregar();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function carregarStatusGoogle() {
      if (!user) {
        setGoogleStatus({ conectado: false });
        return;
      }

      const status = await obterStatusGoogleCalendar(user.id);
      if (mounted) setGoogleStatus(status);
    }

    carregarStatusGoogle();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const status = searchParams.get('google_calendar');

    if (status === 'connected') {
      setGoogleStatus((current) => ({ ...current, conectado: true }));
      toast.success('Google Agenda conectado.');
      if (user) {
        obterStatusGoogleCalendar(user.id).then(setGoogleStatus);
      }
    }

    if (status === 'error') {
      toast.error('Não foi possível conectar o Google Agenda. Tente novamente.');
    }

    if (status) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('google_calendar');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, user]);

  async function conectarGoogleCalendar() {
    if (!user) {
      toast.error('Entre na sua conta para conectar o Google Agenda.');
      return;
    }

    setGoogleLoading(true);
    const { error } = await iniciarConexaoGoogleCalendar();
    if (error) {
      toast.error(error);
      setGoogleLoading(false);
    }
  }

  async function sincronizarEventosGoogle() {
    if (!user) {
      toast.error('Entre na sua conta para sincronizar eventos.');
      return;
    }

    setGoogleLoading(true);
    const { data, error } = await sincronizarGoogleCalendar({
      incluirAniversarios,
      incluirMemorias,
    });
    setGoogleLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setUltimoResultadoSync({
      totalCriados: data?.totalCriados ?? 0,
      totalAtualizados: data?.totalAtualizados ?? 0,
      totalIgnorados: data?.totalIgnorados ?? 0,
    });
    setGoogleStatus(await obterStatusGoogleCalendar(user.id));
    toast.success(`Sincronização concluída: ${data?.totalCriados ?? 0} criado(s), ${data?.totalAtualizados ?? 0} atualizado(s).`);
  }

  async function desconectarGoogle() {
    if (!window.confirm('Deseja desconectar o Google Agenda deste usuário?')) return;

    setGoogleLoading(true);
    const { error } = await desconectarGoogleCalendar();
    setGoogleLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setGoogleStatus({ conectado: false });
    setUltimoResultadoSync(null);
    toast.success('Google Agenda desconectado.');
  }

  function toggleCategory(category: CalendarEventCategory) {
    setActiveCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  function scrollToMonthSummary(eventosDia: EventoCalendarioFamiliar[]) {
    if (eventosDia.length === 0) return;

    const hasBirthday = eventosDia.some((evento) => getCalendarCategory(evento) === 'aniversarios');
    const hasMemory = eventosDia.some((evento) => getCalendarCategory(evento) === 'falecimento');
    const targetId = hasBirthday ? 'aniversariantes' : hasMemory ? 'memoria' : 'categorias-calendario';
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const eventos = useMemo(
    () => criarEventosDoCalendario(pessoas, relacionamentos, dataAtual.getFullYear()),
    [pessoas, relacionamentos, dataAtual]
  );

  const eventosDoMes = useMemo(() => {
    return eventos.filter((evento) => {
      if (evento.mes !== dataAtual.getMonth()) return false;
      return activeCategories[getCalendarCategory(evento)];
    });
  }, [eventos, dataAtual, activeCategories]);

  const eventosPorDia = useMemo(() => agruparPorDia(eventosDoMes), [eventosDoMes]);
  const grade = useMemo(() => construirGradeMes(dataAtual.getFullYear(), dataAtual.getMonth()), [dataAtual]);

  const aniversariantesMes = eventosDoMes.filter((evento) => evento.category === 'aniversarios');
  const falecimentosMes = eventosDoMes.filter((evento) => evento.category === 'falecimento');

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <MemberPageHeader
        title="Calendário Familiar"
        subtitle="Aniversários e datas de memória da árvore genealógica"
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Minha Árvore', to: '/minha-arvore', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Favoritos', to: '/meus-favoritos', icon: HEADER_ACTION_ICONS.Star },
          { label: 'Notificações', to: '/notificacoes', icon: HEADER_ACTION_ICONS.Bell },
        ]}
        mobileCustomActions={user ? (
          <button
            type="button"
            onClick={() => setShowGoogleCalendarMobileCard((value) => !value)}
            className={[
              'inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              showGoogleCalendarMobileCard
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
            ].join(' ')}
            aria-label="Google Agenda"
            title="Google Agenda"
            aria-pressed={showGoogleCalendarMobileCard}
          >
            <CalendarSync className="h-5 w-5" />
          </button>
        ) : undefined}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid w-full max-w-md grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
              <button
                type="button"
                onClick={() => setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1))}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-500">Mês exibido</p>
                <h2 className="break-words text-2xl font-bold text-gray-900">
                  {MESES[dataAtual.getMonth()]} de {dataAtual.getFullYear()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1))}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <p className="max-w-md text-sm text-gray-500">
              Use as categorias abaixo para filtrar aniversários, casamentos, falecimentos e eventos familiares.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm md:hidden" aria-label="Filtros do calend\u00e1rio">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-semibold text-gray-700 min-[390px]:grid-cols-3">
            {MOBILE_CALENDAR_LEGEND_ITEMS.map((item) => {
              const colors = CALENDAR_CATEGORY_COLORS[item.category];
              const active = activeCategories[item.category];

              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => toggleCategory(item.category)}
                  aria-pressed={active}
                  className="flex min-w-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition"
                  style={{
                    borderColor: active ? colors.border : '#E5E7EB',
                    backgroundColor: active ? colors.background : '#FFFFFF',
                    color: active ? colors.text : '#6B7280',
                    opacity: active ? 1 : 0.62,
                  }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors.dot }} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {user && (
          <section className={[
            showGoogleCalendarMobileCard ? 'block' : 'hidden',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            'md:block md:p-5',
          ].join(' ')}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <CalendarSync className="h-5 w-5 text-blue-600" />
                  Google Agenda
                </h2>
                {googleStatus.conectado ? (
                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    <p className="font-medium text-emerald-700">Google Agenda conectado</p>
                    {googleStatus.google_account_email && <p>Conta: {googleStatus.google_account_email}</p>}
                    <p>
                      Última sincronização:{' '}
                      {googleStatus.last_sync_at
                        ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(googleStatus.last_sync_at))
                        : 'ainda não sincronizado'}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Conecte sua conta Google para receber aniversários e datas de memória no Google Agenda.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {googleStatus.conectado && (
                  <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:flex-row sm:items-center">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={incluirAniversarios}
                        onChange={() => setIncluirAniversarios((value) => !value)}
                      />
                      Sincronizar aniversários
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={incluirMemorias}
                        onChange={() => setIncluirMemorias((value) => !value)}
                      />
                      Sincronizar datas de memória
                    </label>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  {!googleStatus.conectado && (
                    <button
                      type="button"
                      onClick={conectarGoogleCalendar}
                      disabled={googleLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <CalendarSync className="h-4 w-4" />
                      Conectar Google Agenda
                    </button>
                  )}

                  {googleStatus.conectado && (
                    <>
                      <button
                        type="button"
                        onClick={sincronizarEventosGoogle}
                        disabled={googleLoading || (!incluirAniversarios && !incluirMemorias)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <CalendarSync className="h-4 w-4" />
                        {googleLoading ? 'Sincronizando...' : 'Sincronizar agora'}
                      </button>

                      <button
                        type="button"
                        onClick={desconectarGoogle}
                        disabled={googleLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Desconectar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {ultimoResultadoSync && (
              <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                  Criados: <strong>{ultimoResultadoSync.totalCriados ?? 0}</strong>
                </div>
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-800">
                  Atualizados: <strong>{ultimoResultadoSync.totalAtualizados ?? 0}</strong>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">
                  Ignorados: <strong>{ultimoResultadoSync.totalIgnorados ?? 0}</strong>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {DIAS_SEMANA.map((diaSemana) => (
                <div key={diaSemana} className="px-1 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:px-2 sm:text-xs">
                  {diaSemana}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando calendário...</div>
            ) : (
              <div className="grid grid-cols-7">
                {grade.map((dia, index) => {
                  const eventosDia = dia ? eventosPorDia.get(dia) ?? [] : [];
                  const isHoje =
                    dia === hoje.getDate() &&
                    dataAtual.getMonth() === hoje.getMonth() &&
                    dataAtual.getFullYear() === hoje.getFullYear();
                  const firstEventCategory = eventosDia[0] ? getCalendarCategory(eventosDia[0]) : null;
                  const firstEventColors = firstEventCategory ? CALENDAR_CATEGORY_COLORS[firstEventCategory] : null;

                  return (
                    <div
                      key={`${dia ?? 'vazio'}-${index}`}
                      className="min-h-[76px] border-b border-r border-gray-200 p-1 align-top sm:min-h-[96px] sm:p-2 md:min-h-[132px]"
                    >
                      {dia ? (
                        <>
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                isHoje ? 'bg-gray-200 text-gray-900 ring-1 ring-gray-300' : 'text-gray-900'
                              }`}
                            >
                              {dia}
                            </span>
                            {eventosDia.length > 0 && (
                              <span className="hidden text-[10px] font-semibold text-gray-500 md:inline">
                                {formatEventCount(eventosDia.length)}
                              </span>
                            )}
                          </div>

                          {eventosDia.length > 0 && firstEventColors && (
                            <button
                              type="button"
                              className="mx-auto mt-1 flex h-3 w-3 items-center justify-center rounded-full md:hidden"
                              style={{ backgroundColor: firstEventColors.dot }}
                              onClick={() => scrollToMonthSummary(eventosDia)}
                              aria-label={`Abrir ${formatEventCount(eventosDia.length)} do dia ${dia}`}
                              title={formatEventCount(eventosDia.length)}
                            >
                              <span className="sr-only">{formatEventCount(eventosDia.length)}</span>
                            </button>
                          )}

                          <div className="hidden space-y-2 md:block">
                            {eventosDia.slice(0, 3).map((evento) => {
                              const category = getCalendarCategory(evento);
                              const colors = CALENDAR_CATEGORY_COLORS[category];
                              return (
                                <Link
                                  key={evento.id}
                                  to={evento.link || `/pessoa/${evento.pessoaId}`}
                                  className="block rounded-lg border px-2 py-1.5 text-[11px] leading-tight transition-colors hover:brightness-95"
                                  style={{
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                    color: colors.text,
                                  }}
                                >
                                  <div className="mb-1 flex min-w-0 items-center gap-1 font-semibold">
                                    <span
                                      className="h-2 w-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: colors.dot }}
                                    />
                                    <span className="min-w-0 break-words">{formatCalendarEventTitle(evento)}</span>
                                  </div>
                                  <p className="break-words">{formatCalendarEventDescription(evento)}</p>
                                </Link>
                              );
                            })}

                            {eventosDia.length > 3 && (
                              <div className="px-1 text-[11px] font-medium text-gray-500">
                                +{formatEventCount(eventosDia.length - 3)}
                              </div>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div id="categorias-calendario" className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Categorias</h3>
              <p className="mb-4 text-sm text-gray-500">Clique para ativar ou ocultar categorias do calendário.</p>
              <div className="space-y-3 text-sm text-gray-700">
                {CALENDAR_CATEGORY_KEYS.map((category) => {
                  const colors = CALENDAR_CATEGORY_COLORS[category];
                  const count = eventos.filter((evento) => evento.mes === dataAtual.getMonth() && getCalendarCategory(evento) === category).length;
                  const active = activeCategories[category];
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-pressed={active}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:shadow-sm"
                      style={{
                        backgroundColor: active ? colors.background : '#FFFFFF',
                        borderColor: active ? colors.border : '#E5E7EB',
                        color: active ? colors.text : '#6B7280',
                        opacity: active ? 1 : 0.62,
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.dot }} />
                        {colors.label}
                      </span>
                      <strong>{formatEventCount(count)}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <div id="aniversariantes" className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Aniversariantes</h3>
              <div className="space-y-3">
                {aniversariantesMes.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum aniversário neste mês com os filtros atuais.</p>
                ) : (
                  aniversariantesMes.map((evento) => (
                    <Link
                      key={evento.id}
                      to={`/pessoa/${evento.pessoaId}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 px-3 py-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{evento.nome}</p>
                        <p className="text-xs text-gray-500">Dia {evento.dia}</p>
                      </div>
                      <span className="text-xs font-medium" style={{ color: CALENDAR_CATEGORY_COLORS.aniversarios.text }}>
                        {formatCalendarEventDescription(evento)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {falecimentosMes.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Memória</h3>
                <div className="space-y-3">
                  {falecimentosMes.map((evento) => (
                    <Link
                      key={evento.id}
                      to={evento.link || `/pessoa/${evento.pessoaId}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 px-3 py-3 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 break-words">{formatDeathSidebarTitle(evento)}</p>
                        <p className="text-xs text-gray-500">Dia {evento.dia}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium" style={{ color: CALENDAR_CATEGORY_COLORS.falecimento.text }}>
                        {CALENDAR_CATEGORY_COLORS.falecimento.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>

      <Dialog
        open={selectedDayEvents.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDayEvents([]);
            setSelectedDay(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogTitle>
            Eventos de {selectedDay ? `${selectedDay} de ${MESES[dataAtual.getMonth()]}` : 'do dia'}
          </DialogTitle>
          <div className="mt-3 space-y-3">
            {selectedDayEvents.map((evento) => {
              const category = getCalendarCategory(evento);
              const colors = CALENDAR_CATEGORY_COLORS[category];
              return (
                <Link
                  key={evento.id}
                  to={evento.link || `/pessoa/${evento.pessoaId}`}
                  className="block rounded-xl border px-3 py-3 text-sm transition hover:brightness-95"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  <div className="flex min-w-0 items-center gap-2 font-semibold">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors.dot }} />
                    <span className="min-w-0 break-words">{formatCalendarEventTitle(evento)}</span>
                  </div>
                  <p className="mt-1 break-words text-xs leading-relaxed">{formatCalendarEventDescription(evento)}</p>
                </Link>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
