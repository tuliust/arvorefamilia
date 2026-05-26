import React from 'react';
import { FileDown, ImageDown, MessageCircle, Printer, Scan } from 'lucide-react';

interface SidebarInfoPanelProps {
  onSelectArea: () => void;
  onSavePdf: () => void;
  onSaveImage: () => void;
  onPrint: () => void;
  onWhatsApp: () => void;
}

export function SidebarInfoPanel({
  onSelectArea,
  onSavePdf,
  onSaveImage,
  onPrint,
  onWhatsApp,
}: SidebarInfoPanelProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Informações da árvore</h2>
        <p className="mt-1 text-xs leading-snug text-gray-500">
          Ações para exportar ou compartilhar a visualização atual da árvore.
        </p>
      </div>

      <div className="space-y-1.5">
        <SidebarActionButton icon={Scan} label="Selecionar área" onClick={onSelectArea} />
        <SidebarActionButton icon={FileDown} label="Salvar como PDF" onClick={onSavePdf} />
        <SidebarActionButton icon={ImageDown} label="Salvar como Imagem" onClick={onSaveImage} />
        <SidebarActionButton icon={Printer} label="Imprimir" onClick={onPrint} />
        <SidebarActionButton icon={MessageCircle} label="Enviar WhatsApp" onClick={onWhatsApp} />
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
      className="flex h-9 w-full items-center gap-2.5 rounded-md border border-gray-200 bg-white px-3 text-left text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Icon className="h-4 w-4 shrink-0 text-gray-500" />
      <span>{label}</span>
    </button>
  );
}
