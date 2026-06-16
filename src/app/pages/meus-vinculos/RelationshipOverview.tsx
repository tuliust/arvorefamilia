import { Baby, Heart, UserRound, Users } from 'lucide-react';
import { Pessoa } from '../../types';
import { getInitials } from '../../utils/personFields';
import { formatCount, getFirstName } from './meusVinculosUtils';
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
  const firstName = getFirstName(person.nome_completo);

  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <PersonAvatar person={person} avatarSrc={avatarSrc} />
          <div className="min-w-0 flex-1">
            <h2 className="min-w-0 break-words text-xl font-semibold leading-tight text-gray-950">
              {firstName ? `Familiares de ${firstName}` : 'Familiares'}
            </h2>
            <p className="mt-3 break-words text-sm text-gray-600">
              Confira se os familiares abaixo estão corretos. Você pode adicionar vínculos, solicitar correções ou seguir se estiver tudo certo.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.key];
          return (
            <a
              key={group.key}
              href={`#vinculos-${group.key}`}
              className="block min-w-0 rounded-xl border border-gray-200 bg-white p-2 text-center shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 min-[390px]:p-3 sm:p-4 sm:text-left"
            >
              <div className="flex min-w-0 flex-col items-center gap-1.5 sm:items-start sm:gap-2">
                <Icon className="h-4 w-4 shrink-0 text-blue-700 sm:h-5 sm:w-5" />
                <p className="max-w-full truncate text-[11px] font-semibold leading-tight text-gray-900 min-[390px]:text-xs sm:text-base">
                  {group.label}
                </p>
                <p className="text-[10px] leading-tight text-gray-600 min-[390px]:text-[11px] sm:text-sm">
                  {formatCount(group.count, 'vínculo', 'vínculos')}
                </p>
                {group.pendingCount > 0 && (
                  <span className="max-w-full truncate rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-amber-800 sm:px-2 sm:text-xs">
                    {group.pendingCount} em análise
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
