import { Baby, CalendarDays, Heart, MapPin, UserRound, Users } from 'lucide-react';
import { Pessoa } from '../../types';
import { getInitials } from '../../utils/personFields';
import { formatOptionalValue } from './meusVinculosUtils';
import { RelationshipOverviewGroup } from './types';

type RelationshipOverviewProps = {
  person: Pessoa;
  avatarSrc?: string | null;
  groups: RelationshipOverviewGroup[];
};

function PersonAvatar({ person, avatarSrc }: { person: Pessoa; avatarSrc?: string | null }) {
  const photo = String(avatarSrc || person.foto_principal_url || '').trim();

  return (
    <div className="flex h-16 w-16 shrink-0 overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
      {photo ? (
        <img src={photo} alt={person.nome_completo} className="h-full w-full object-cover" />
      ) : (
        <span className="inline-flex h-full w-full items-center justify-center text-base font-semibold">
          {getInitials(person.nome_completo)}
        </span>
      )}
    </div>
  );
}

const GROUP_ICONS = {
  pais: UserRound,
  filhos: Baby,
  conjuges: Heart,
  irmaos: Users,
};

export function RelationshipOverview({ person, avatarSrc, groups }: RelationshipOverviewProps) {
  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Pessoa em revisão</p>
        <div className="mt-3 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <PersonAvatar person={person} avatarSrc={avatarSrc} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600">Você está revisando os vínculos familiares de:</p>
            <h2 className="mt-1 min-w-0 break-words text-xl font-semibold leading-tight text-gray-950">
              {person.nome_completo}
            </h2>
            <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
              {formatOptionalValue(person.data_nascimento) && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">Nascimento: {formatOptionalValue(person.data_nascimento)}</span>
                </span>
              )}
              {formatOptionalValue(person.local_nascimento || person.local_atual) && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{formatOptionalValue(person.local_nascimento || person.local_atual)}</span>
                </span>
              )}
            </div>
            <p className="mt-3 break-words text-sm text-gray-600">
              Confira se os familiares abaixo estão corretos. Você pode adicionar vínculos, solicitar correções ou seguir se estiver tudo certo.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.key];
          return (
            <div key={group.key} className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-blue-700" />
                    <p className="font-semibold text-gray-900">{group.label}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {group.count === 0 ? 'Nenhum vínculo' : `${group.count} vínculo(s)`}
                    {group.pendingCount > 0 ? ` · ${group.pendingCount} em análise` : ''}
                  </p>
                </div>
                {group.pendingCount > 0 && (
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Em análise
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
