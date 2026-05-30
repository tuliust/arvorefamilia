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
    <section className="flex h-full min-h-0 flex-col gap-[clamp(0.45rem,1.05vh,0.75rem)]">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Informações da árvore</h2>
        <p className="mt-[clamp(0.15rem,0.45vh,0.25rem)] text-[clamp(10px,1.45vh,12px)] leading-snug text-gray-500">
          Ações para exportar ou compartilhar a visualização atual da árvore.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-[clamp(0.25rem,0.75vh,0.5rem)] overflow-y-auto pr-0.5">
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
      className="flex min-h-[clamp(32px,4.6vh,38px)] w-full items-center gap-[clamp(0.45rem,0.9vh,0.625rem)] rounded-md border border-gray-200 bg-white px-[clamp(0.55rem,1.15vh,0.75rem)] py-[clamp(0.25rem,0.65vh,0.375rem)] text-left text-[clamp(11px,1.55vh,14px)] font-medium leading-tight text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Icon className="h-[clamp(14px,2vh,16px)] w-[clamp(14px,2vh,16px)] shrink-0 text-gray-500" />
      <span>{label}</span>
    </button>
  );
}
