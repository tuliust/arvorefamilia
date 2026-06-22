import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Briefcase, Calendar, CalendarClock, Dog, Facebook, Globe, Home, Instagram, Linkedin, Lightbulb, MapPin, MessageCircle, Music2, Phone, Sparkles, Tags, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Pessoa, PessoaSocialProfile } from '../../types';
import type { ProfileQuestionnaireSelectableOption } from '../../types/profileQuestionnaire';
import { formatPhone, isPersonDeceased } from '../../utils/personFields';
import { getSocialLink, isBirthDate, shouldShowAquariusFallback } from '../../utils/personProfile';
import { buildWhatsAppUrl, canUseWhatsAppContact } from '../../utils/whatsapp';
import {
  getInsightByType,
  obterInsightsGeradosPessoa,
  PersonGeneratedInsight,
} from '../../services/personInsightsService';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm">
        {label}: <strong>{value}</strong>
      </span>
    </div>
  );
}

function toParagraphs(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim()) return [value];

  return [];
}

function ensureHttps(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function getSocialIcon(platform: string) {
  const normalized = platform.toLocaleLowerCase('pt-BR');
  if (normalized.includes('instagram')) return Instagram;
  if (normalized.includes('facebook')) return Facebook;
  if (normalized.includes('linkedin')) return Linkedin;
  if (normalized.includes('tiktok')) return Music2;
  return Globe;
}

function buildSocialHref(platform: string, value: string) {
  if (/^https?:\/\//i.test(value)) return value;

  const cleanValue = value.trim().replace(/^@+/, '');
  const normalized = platform.toLocaleLowerCase('pt-BR');

  if (normalized.includes('instagram')) return `https://instagram.com/${cleanValue}`;
  if (normalized.includes('facebook')) return `https://facebook.com/${cleanValue}`;
  if (normalized.includes('linkedin')) return `https://linkedin.com/in/${cleanValue}`;
  if (normalized.includes('tiktok')) return `https://tiktok.com/@${cleanValue}`;
  if (cleanValue.includes('.')) return ensureHttps(cleanValue);

  return '';
}

function getVisibleSocialLinks(pessoa: Pessoa, rows: PessoaSocialProfile[]) {
  if (pessoa.permitir_exibir_rede_social === false && pessoa.permitir_exibir_instagram === false) return [];

  const versionedLinks = rows
    .filter((row) => row.exibir_no_perfil !== false)
    .map((row) => {
      const href = String(row.url || row.perfil || '').trim();
      const label = String(row.perfil || row.url || row.rede).trim();
      if (!href || !label) return null;

      return {
        platform: row.rede,
        href: buildSocialHref(row.rede, href),
        label: row.rede ? `${row.rede}: ${label.replace(/^@+/, '@')}` : label,
        icon: getSocialIcon(row.rede),
      };
    })
    .filter((link): link is NonNullable<typeof link> => Boolean(link?.href));

  if (versionedLinks.length > 0) return versionedLinks;

  const legacyLink = getSocialLink(pessoa);
  return legacyLink
    ? [{
      platform: pessoa.rede_social || 'Rede social',
      href: legacyLink.href,
      label: legacyLink.label,
      icon: getSocialIcon(pessoa.rede_social || 'Rede social'),
    }]
    : [];
}

const BADGE_GROUPS = {
  personalidade: { title: 'Personalidade', className: 'border-blue-100 bg-blue-50 text-blue-700' },
  familia: { title: 'Família', className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  trabalho: { title: 'Trabalho', className: 'border-amber-100 bg-amber-50 text-amber-700' },
  lugares: { title: 'Lugares', className: 'border-cyan-100 bg-cyan-50 text-cyan-700' },
  momentos: { title: 'Momentos', className: 'border-rose-100 bg-rose-50 text-rose-700' },
  hobbies: { title: 'Hobbies', className: 'border-violet-100 bg-violet-50 text-violet-700' },
  marcas: { title: 'Marcas pessoais', className: 'border-slate-200 bg-slate-50 text-slate-700' },
} satisfies Record<ProfileQuestionnaireSelectableOption['category'], { title: string; className: string }>;

function groupProfileBadges(badges: ProfileQuestionnaireSelectableOption[]) {
  const groups = new Map<ProfileQuestionnaireSelectableOption['category'], ProfileQuestionnaireSelectableOption[]>();

  badges.forEach((badge) => {
    groups.set(badge.category, [...(groups.get(badge.category) ?? []), badge]);
  });

  return Array.from(groups.entries()).map(([category, groupBadges]) => ({
    category,
    badges: groupBadges,
    ...BADGE_GROUPS[category],
  }));
}

type PersonDataViewProps = {
  pessoa: Pessoa;
  socialProfiles?: PessoaSocialProfile[];
  profileBadges?: ProfileQuestionnaireSelectableOption[];
  headerAction?: React.ReactNode;
  afterOverviewContent?: React.ReactNode;
  afterGeneratedInsightsContent?: React.ReactNode;
  sideContent?: React.ReactNode;
};

export function PersonDataView({
  pessoa,
  socialProfiles = [],
  profileBadges = [],
  headerAction,
  afterOverviewContent,
  afterGeneratedInsightsContent,
  sideContent,
}: PersonDataViewProps) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState<PersonGeneratedInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const isPet = pessoa.humano_ou_pet === 'Pet';
  const isFalecido = isPersonDeceased(pessoa);
  const canShowBirthDate = pessoa.permitir_exibir_data_nascimento !== false;
  const canShowPhoneNumber = Boolean(pessoa.permitir_exibir_telefone === true && pessoa.telefone);
  const canShowWhatsAppButton = canUseWhatsAppContact(pessoa);
  const canShowAddress = Boolean(pessoa.permitir_exibir_endereco === true && pessoa.endereco);
  const socialLinks = useMemo(() => getVisibleSocialLinks(pessoa, socialProfiles), [pessoa, socialProfiles]);
  const badgeGroups = useMemo(() => groupProfileBadges(profileBadges), [profileBadges]);
  const phoneWhatsAppUrl = canShowPhoneNumber && canShowWhatsAppButton
    ? buildWhatsAppUrl(String(pessoa.telefone ?? ''))
    : null;

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      if (!pessoa.id || !pessoa.data_nascimento || isPet || !canShowBirthDate) {
        setGeneratedInsights([]);
        setInsightsError(null);
        setInsightsLoading(false);
        return;
      }

      try {
        setInsightsLoading(true);
        setInsightsError(null);

        const existing = await obterInsightsGeradosPessoa(pessoa.id);

        if (!cancelled) {
          setGeneratedInsights(existing);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Erro ao carregar conteúdos automáticos.';
          setInsightsError(message);
        }
      } finally {
        if (!cancelled) {
          setInsightsLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [pessoa.id, pessoa.data_nascimento, isPet, canShowBirthDate]);

  const astrologyInsight = useMemo(
    () => getInsightByType(generatedInsights, 'astrology'),
    [generatedInsights]
  );

  const historicalInsight = useMemo(
    () => getInsightByType(generatedInsights, 'historical_events'),
    [generatedInsights]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="relative pt-6">
          {headerAction && (
            <div className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
              {headerAction}
            </div>
          )}

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => pessoa.foto_principal_url && setPhotoOpen(true)}
                disabled={!pessoa.foto_principal_url}
                aria-label={pessoa.foto_principal_url ? `Ampliar foto de ${pessoa.nome_completo}` : undefined}
                className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full ${pessoa.foto_principal_url ? 'cursor-zoom-in ring-offset-2 transition hover:ring-2 hover:ring-blue-300' : 'cursor-default'} ${isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'}`}
              >
                {pessoa.foto_principal_url ? (
                  <img src={pessoa.foto_principal_url} alt={pessoa.nome_completo} className="h-32 w-32 object-cover" />
                ) : isPet ? (
                  <Dog className="h-16 w-16 text-amber-700" />
                ) : (
                  <User className="h-16 w-16 text-blue-700" />
                )}
              </button>
            </div>

            <div className="flex-1 pr-12 sm:pr-14">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{pessoa.nome_completo}</h1>
              <div className="mb-4 flex flex-wrap gap-2">
                {isPet && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">Pet da família</span>}
                {isFalecido && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">In Memoriam</span>}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {canShowBirthDate && (
                  <>
                    <InfoItem icon={<Calendar className="h-4 w-4" />} label="Nascimento" value={pessoa.data_nascimento} />
                  </>
                )}
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Local de nascimento" value={pessoa.local_nascimento} />
                <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Profissão" value={pessoa.profissao} />

                {!isFalecido && <InfoItem icon={<Home className="h-4 w-4" />} label="Residência atual" value={pessoa.local_atual} />}
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Falecimento" value={pessoa.data_falecimento || (isFalecido ? 'Falecido(a)' : undefined)} />
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Local de falecimento" value={pessoa.local_falecimento} />
              </div>

              {!isFalecido && (canShowPhoneNumber || canShowAddress || socialLinks.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {canShowPhoneNumber && (phoneWhatsAppUrl ? (
                    <a
                      href={phoneWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-words">{formatPhone(String(pessoa.telefone ?? ''))}</span>
                    </a>
                  ) : (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-words">{formatPhone(String(pessoa.telefone ?? ''))}</span>
                    </span>
                  ))}
                  {canShowAddress && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
                      <Home className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-words">{pessoa.endereco}</span>
                    </span>
                  )}
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`${link.platform}-${link.href}-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 break-words">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="border-0 bg-black/90 p-3 text-white shadow-2xl sm:max-w-[90vw]">
          <DialogTitle className="sr-only">Foto ampliada de {pessoa.nome_completo}</DialogTitle>
          {pessoa.foto_principal_url && (
            <img
              src={pessoa.foto_principal_url}
              alt={pessoa.nome_completo}
              className="mx-auto max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className={sideContent ? 'grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,64rem)_minmax(320px,1fr)] xl:items-start' : 'space-y-6'}>
        <div className="space-y-6">
          {(pessoa.minibio || pessoa.curiosidades || badgeGroups.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Sobre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pessoa.minibio && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-gray-800">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold">Mini bio</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{pessoa.minibio}</p>
              </div>
            )}
            {pessoa.curiosidades && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-gray-800">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold">Curiosidades</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{pessoa.curiosidades}</p>
              </div>
            )}
            </div>
            {badgeGroups.length > 0 && (
              <div className="mt-4 space-y-3">
                {badgeGroups.map((group) => (
                  <div key={group.category} className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                      <Tags className="h-3.5 w-3.5" />
                      {group.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.badges.map((badge) => (
                        <span
                          key={badge.id}
                          className={`max-w-full rounded-full border px-2.5 py-1 text-xs font-medium ${group.className}`}
                        >
                          <span className="break-words">{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          )}

          {afterOverviewContent}
          {pessoa.data_nascimento && !isPet && canShowBirthDate && (
            <>
          <PersonAstrologyCard
            pessoa={pessoa}
            insight={astrologyInsight}
            loading={insightsLoading}
            error={insightsError}
          />

          <PersonHistoricalEventsCard
            pessoa={pessoa}
            insight={historicalInsight}
            loading={insightsLoading}
            error={insightsError}
          />
            </>
          )}
          {afterGeneratedInsightsContent}
        </div>

        {sideContent && (
          <aside className="min-w-0 xl:sticky xl:top-6">
            {sideContent}
          </aside>
        )}
      </div>
    </div>
  );
}

export function PersonAstrologyCard({
  pessoa,
  insight,
  loading,
  error,
}: {
  pessoa: Pessoa;
  insight?: PersonGeneratedInsight;
  loading?: boolean;
  error?: string | null;
}) {
  const content = insight?.conteudo;
  const fallback = shouldShowAquariusFallback(pessoa);

  if (!content && !loading && !error && !fallback) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          O que diz a astrologia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
          {content?.body ? (
            <p className="text-sm leading-relaxed text-gray-700">{content.body}</p>
          ) : loading ? (
            <p className="text-sm leading-relaxed text-gray-700">Gerando conteúdo astrológico...</p>
          ) : error ? (
            <p className="text-sm leading-relaxed text-gray-700">Não foi possível gerar este conteúdo agora.</p>
          ) : (
            <p className="text-sm leading-relaxed text-gray-700">
              Dentro de Aquário, quem nasce em 23 de janeiro costuma carregar uma energia bem típica do signo: mental,
              independente, curiosa e voltada para novas ideias. Tende a ser alguém criativo, observador e mentalmente
              inquieto, que valoriza liberdade, autenticidade e conexões com propósito. Se dá bem com signos de Ar —
              Gêmeos, Libra e Aquário — e também pode ter boa sintonia com signos de Fogo, como Áries e Sagitário.
              Costuma ter mais desafios com signos de Terra — Touro, Virgem e Capricórnio — e de Água, especialmente
              Câncer, Escorpião e Peixes, quando há excesso de controle, apego ou cobrança emocional.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonHistoricalEventsCard({
  pessoa,
  insight,
  loading,
  error,
}: {
  pessoa: Pessoa;
  insight?: PersonGeneratedInsight;
  loading?: boolean;
  error?: string | null;
}) {
  const showHistoricalFallback = isBirthDate(pessoa.data_nascimento, 23, 1, 1989);
  const content = insight?.conteudo;
  const brazilParagraphs = toParagraphs(content?.brazil?.body);
  const worldParagraphs = toParagraphs(content?.world?.body);
  const shouldRender = Boolean(content || loading || error || showHistoricalFallback);

  if (!shouldRender) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          Acontecimentos históricos no dia do nascimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content ? (
          <div className="space-y-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{content.title}</h3>
              {content.main_event && (
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{content.main_event}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {content.period_title || 'O que estava acontecendo na época'}
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white/70 p-4">
                  <h4 className="text-sm font-semibold text-gray-800">{content.brazil?.title || 'Brasil'}</h4>
                  {brazilParagraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-2 text-sm leading-relaxed text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="rounded-lg bg-white/70 p-4">
                  <h4 className="text-sm font-semibold text-gray-800">{content.world?.title || 'Mundo'}</h4>
                  {worldParagraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-2 text-sm leading-relaxed text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
            Gerando acontecimentos históricos...
          </p>
        ) : error ? (
          <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
            Não foi possível gerar este conteúdo agora.
          </p>
        ) : showHistoricalFallback ? (
          <div className="space-y-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">23/01/1989 — principal acontecimento do dia</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                O fato histórico mais marcante de 23 de janeiro de 1989 foi a morte de Salvador Dalí, pintor espanhol
                ligado ao surrealismo, em Figueres, na Espanha, aos 84 anos. Ele é um dos artistas mais conhecidos do
                século XX, famoso por imagens oníricas, simbólicas e visualmente provocativas.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">O que estava acontecendo na época</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white/70 p-4">
                  <h4 className="text-sm font-semibold text-gray-800">Brasil</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Em janeiro de 1989, o Brasil vivia o governo José Sarney, a redemocratização ainda recente e uma
                    crise econômica severa, marcada por inflação muito alta. Naquele mês, o governo lançou o Plano
                    Verão, uma tentativa de conter a inflação, com mudança monetária e criação do Cruzado Novo.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Politicamente, 1989 seria um ano decisivo: em 15 de novembro e 17 de dezembro de 1989, o Brasil
                    realizou a primeira eleição presidencial direta desde 1960, já sob a Constituição de 1988. Fernando
                    Collor venceu Lula no segundo turno.
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 p-4">
                  <h4 className="text-sm font-semibold text-gray-800">Mundo</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    1989 foi um ano de virada histórica global. Em janeiro, esse processo ainda estava começando, mas
                    ao longo do ano ocorreriam eventos que mudariam a ordem mundial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
