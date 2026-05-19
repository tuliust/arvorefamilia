import React from 'react';

import type { TreeViewMode } from './ViewModeToggle';
import { FAMILY_TREE_COLORS } from './visualTokens';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_LEGEND_BACKGROUNDS,
  DIRECT_FAMILY_STATUS_BORDER_COLORS,
} from './directFamilyColors';

interface TreeLegendProps {
  viewMode?: TreeViewMode;
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

const viewModeDescriptions: Record<TreeViewMode, { title: string; description: string }> = {
  'minha-arvore': {
    title: 'Minha Árvore',
    description: 'Mostra a família em torno da pessoa central selecionada, com grupos diretos de parentes.',
  },
  genealogia: {
    title: 'Genealogia',
    description: 'Organiza o escopo pessoal por gerações, usando colunas e conectores ortogonais.',
  },
  'visao-completa': {
    title: 'Visão Completa',
    description: 'Usa o layout por gerações, mas considera toda a base familiar cadastrada.',
  },
};

const marriageStatusItems = [
  {
    label: 'União ativa',
    description: 'Casamento ou união sem separação registrada.',
    background: '#FFFFFF',
    border: '#D1D5DB',
  },
  {
    label: 'Separado/divorciado',
    description: 'Relação inativa, separada ou com data de separação.',
    background: '#FEF3C7',
    border: '#F59E0B',
  },
  {
    label: 'Viuvez',
    description: 'Um dos cônjuges foi marcado como falecido.',
    background: '#E5E7EB',
    border: '#9CA3AF',
  },
  {
    label: 'Status desconhecido',
    description: 'Dados conjugais insuficientes para classificar a relação.',
    background: '#FFFFFF',
    border: '#D1D5DB',
  },
];

const lineItems = [
  {
    label: 'Linha conjugal',
    description: 'Conecta cônjuges ou companheiros. Nas views por geração, o anel fica no meio da linha.',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SPOUSE} />,
  },
  {
    label: 'Pais e filhos',
    description: 'Conexão de filiação. Em Genealogia e Visão Completa, os traçados são retos/ortogonais, sem diagonais.',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_CHILD} />,
  },
  {
    label: 'Irmãos',
    description: 'Relação lateral entre pessoas da mesma geração, quando exibida pelo modo atual.',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SIBLING} dashed />,
  },
  {
    label: 'Barramento vertical',
    description: 'Agrupa filhos de um mesmo núcleo familiar nas views por geração.',
    sample: <LegendBus />,
  },
];

export function TreeLegend({
  viewMode = 'minha-arvore',
  compact = false,
  className = '',
  showTitle = true,
}: TreeLegendProps) {
  const viewDescription = viewModeDescriptions[viewMode];
  const backgroundItems = DIRECT_FAMILY_LEGEND_BACKGROUNDS;

  return (
    <section
      className={[
        compact ? 'space-y-3' : 'space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-3',
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Legenda visual da árvore"
    >
      {showTitle && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Legendas visuais</h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Referência rápida para interpretar cards, linhas, anéis e modos da árvore.
          </p>
        </div>
      )}

      <LegendGroup title="Visualização atual">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950">
          <p className="font-semibold">{viewDescription.title}</p>
          <p className="mt-1">{viewDescription.description}</p>
        </div>
      </LegendGroup>

      <LegendGroup title="Cards de pessoas">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.alive}` }}
              />
            )}
            label="Pessoa viva"
            description="Card de pessoa sem marcação de falecimento."
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased}` }}
              />
            )}
            label="Pessoa falecida"
            description="Card com falecimento informado por checkbox, data ou local."
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${FAMILY_TREE_COLORS.CARD_BORDER_PET}` }}
              />
            )}
            label="Pet"
            description="Pessoa cadastrada como pet, quando esse tipo estiver visível."
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white shadow-inner ring-2 ring-slate-800"
              />
            )}
            label="Pessoa central"
            description="Referência principal usada para montar a visualização atual."
          />
        </div>
      </LegendGroup>

      <LegendGroup title="Linhas e conectores">
        <div className="space-y-2">
          {lineItems.map((item) => (
            <LegendItem
              key={item.label}
              sample={item.sample}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
      </LegendGroup>

      <LegendGroup title="Anel de casamento">
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-gray-600">
            O anel 💍 aparece entre cônjuges. Clique nele para abrir o modal conjugal quando houver dados disponíveis. Observações internas continuam restritas a administradores.
          </p>
          <div className="space-y-2">
            {marriageStatusItems.map((item) => (
              <LegendItem
                key={item.label}
                sample={<MarriageRingSample background={item.background} border={item.border} />}
                label={item.label}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </LegendGroup>

      {!compact && (
        <LegendGroup title="Cores dos grupos">
          <div className="grid grid-cols-2 gap-2">
            {backgroundItems.map((item) => (
              <div key={item.label} className="flex min-w-0 items-center gap-2 text-xs text-gray-600">
                <span
                  className="h-5 w-9 shrink-0 rounded border"
                  style={{
                    background: item.background,
                    borderColor: item.solid,
                  }}
                />
                <span className="leading-snug">{item.label}</span>
              </div>
            ))}
          </div>
        </LegendGroup>
      )}

      <LegendGroup title="Diferenças entre views">
        <dl className="space-y-2 text-xs leading-relaxed text-gray-600">
          {Object.entries(viewModeDescriptions).map(([key, item]) => (
            <div key={key}>
              <dt className="font-semibold text-gray-800">{item.title}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </LegendGroup>
    </section>
  );
}

function LegendGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-normal text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function LegendItem({
  sample,
  label,
  description,
}: {
  sample: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <span className="flex h-8 w-12 shrink-0 items-center justify-center">{sample}</span>
      <span className="min-w-0 text-xs leading-relaxed">
        <span className="block font-semibold text-gray-900">{label}</span>
        <span className="block text-gray-600">{description}</span>
      </span>
    </div>
  );
}

function LegendLine({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <span
      className="block h-0 w-10 border-t-2"
      style={{
        borderColor: color,
        borderStyle: dashed ? 'dashed' : 'solid',
      }}
    />
  );
}

function LegendBus() {
  return (
    <span className="relative block h-7 w-10">
      <span className="absolute left-1/2 top-0 h-7 border-l-2 border-slate-500" />
      <span className="absolute left-1 top-1/2 w-8 border-t-2 border-slate-500" />
    </span>
  );
}

function MarriageRingSample({ background, border }: { background: string; border: string }) {
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full border text-base shadow-sm"
      style={{ backgroundColor: background, borderColor: border }}
      aria-hidden="true"
    >
      💍
    </span>
  );
}

export default TreeLegend;
