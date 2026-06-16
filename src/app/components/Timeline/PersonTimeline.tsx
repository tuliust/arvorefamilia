import React from 'react';
import {
  Baby,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarX,
  Circle,
  FileText,
  Heart,
  HeartCrack,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { PersonTimelineItem, PersonTimelineItemType } from '../../utils/buildPersonTimeline';

type PersonTimelineProps = {
  items?: PersonTimelineItem[];
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
};

const TYPE_LABELS: Record<PersonTimelineItemType, string> = {
  birth: 'Nascimento',
  death: 'Óbito',
  marriage: 'Casamento',
  union: 'União',
  separation: 'Separação',
  child_birth: 'Nasceu o filho',
  historical_file: 'Arquivo',
  person_event: 'Evento',
  family_event: 'Família',
  memory: 'Memória',
  other: 'Outro',
};

const TYPE_STYLES: Record<PersonTimelineItemType, string> = {
  birth: 'bg-blue-50 text-blue-700 ring-blue-100',
  death: 'bg-gray-100 text-gray-700 ring-gray-200',
  marriage: 'bg-rose-50 text-rose-700 ring-rose-100',
  union: 'bg-rose-50 text-rose-700 ring-rose-100',
  separation: 'bg-orange-50 text-orange-700 ring-orange-100',
  child_birth: 'bg-sky-50 text-sky-700 ring-sky-100',
  historical_file: 'bg-amber-50 text-amber-700 ring-amber-100',
  person_event: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  family_event: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  memory: 'bg-violet-50 text-violet-700 ring-violet-100',
  other: 'bg-gray-50 text-gray-700 ring-gray-200',
};

function getTimelineIcon(type: PersonTimelineItemType) {
  const className = 'h-4 w-4';

  switch (type) {
    case 'birth':
    case 'child_birth':
      return <Baby className={className} />;
    case 'death':
      return <CalendarX className={className} />;
    case 'marriage':
    case 'union':
      return <Heart className={className} />;
    case 'separation':
      return <HeartCrack className={className} />;
    case 'historical_file':
      return <FileText className={className} />;
    case 'person_event':
      return <Calendar className={className} />;
    case 'family_event':
      return <Users className={className} />;
    case 'memory':
      return <BookOpen className={className} />;
    default:
      return <Circle className={className} />;
  }
}

function getDateLabel(item: PersonTimelineItem) {
  if (item.dateLabel && item.precision !== 'unknown') return item.dateLabel;
  return undefined;
}

export function PersonTimeline({
  items = [],
  isAdmin = false,
  title = 'Linha do tempo',
  subtitle = 'Eventos importantes registrados a partir dos dados disponíveis.',
  embedded = false,
}: PersonTimelineProps) {
  const shouldHideEmbeddedHeader = embedded && title === 'Eventos automáticos e manuais';
  const content = (
    <>
      {embedded ? (
        !shouldHideEmbeddedHeader && (
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        )
      ) : (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </CardHeader>
      )}
      <CardContent className={embedded ? 'px-0 pb-0 pt-0' : undefined}>
        {items.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            Ainda não há eventos suficientes para montar a linha do tempo desta pessoa.
          </p>
        ) : (
          <div className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-gray-200 sm:before:left-5">
            {items.map((item) => {
              const dateLabel = getDateLabel(item);
              const badgeLabel = item.badgeLabel ?? TYPE_LABELS[item.type];

              return (
                <article key={item.id} className="relative pl-11 sm:pl-14">
                  <div className="absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm sm:h-10 sm:w-10">
                    {getTimelineIcon(item.type)}
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TYPE_STYLES[item.type]}`}
                      >
                        {badgeLabel}
                      </span>

                      {dateLabel && (
                        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-600">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {dateLabel}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-base font-semibold leading-6 text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{item.description}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      {content}
    </Card>
  );
}
