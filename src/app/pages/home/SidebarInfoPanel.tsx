import React from 'react';
import { FileDown, ImageDown, Printer, Scan } from 'lucide-react';

interface SidebarInfoPanelProps {
  onSelectArea: () => void;
  onSavePdf: () => void;
  onSaveImage: () => void;
  onPrint: () => void;
  onWhatsApp?: () => void;
}

export function SidebarInfoPanel({
  onSelectArea,
  onSavePdf,
  onSaveImage,
  onPrint,
}: SidebarInfoPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-[clamp(0.75rem,1.65vh,1.1rem)]">
      <div>
        <h2 className="text-[clamp(14px,2.1vh,16px)] font-semibold leading-tight text-gray-900">Informações da árvore</h2>
        <p className="mt-[clamp(0.25rem,0.75vh,0.45rem)] text-[clamp(11px,1.6vh,13px)] leading-snug text-gray-500">
          Ações para exportar ou compartilhar a visualização atual da árvore.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-[clamp(0.5rem,1.25vh,0.8rem)] pr-0.5">
        <SidebarActionButton icon={Scan} label="Selecionar área" onClick={onSelectArea} />
        <SidebarActionButton icon={FileDown} label="Salvar como PDF" onClick={onSavePdf} />
        <SidebarActionButton icon={ImageDown} label="Salvar como Imagem" onClick={onSaveImage} />
        <SidebarActionButton icon={Printer} label="Imprimir" onClick={onPrint} />
      </div>
    </section>
  );
}

function SidebarActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[clamp(44px,6.2vh,56px)] w-full items-center gap-[clamp(0.6rem,1.25vh,0.85rem)] rounded-xl border border-gray-200 bg-white px-[clamp(0.75rem,1.6vh,1rem)] py-[clamp(0.45rem,1.05vh,0.65rem)] text-left text-[clamp(12px,1.7vh,14px)] font-medium leading-tight text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Icon className="h-[clamp(16px,2.25vh,18px)] w-[clamp(16px,2.25vh,18px)] shrink-0 text-gray-500" />
      <span>{label}</span>
    </button>
  );
}
