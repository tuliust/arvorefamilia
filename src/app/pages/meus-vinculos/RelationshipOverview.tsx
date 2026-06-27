import { Baby, Heart, PawPrint, UserRound, Users } from 'lucide-react';
import type { Pessoa } from '../../types';
import { formatCount } from './meusVinculosUtils';
import { RelationshipOverviewGroup } from './types';

type RelationshipOverviewProps = {
  person: Pessoa;
  avatarSrc?: string | null;
  groups: RelationshipOverviewGroup[];
};

const GROUP_ICONS = {
  pais: UserRound,
  filhos: Baby,
  pets: PawPrint,
  conjuges: Heart,
  irmaos: Users,
};

export function RelationshipOverview({ groups }: RelationshipOverviewProps) {
  return (
    <section>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
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
