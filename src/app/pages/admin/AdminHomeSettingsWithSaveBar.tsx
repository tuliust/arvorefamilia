import { Save, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { AdminHomeSettings } from './AdminHomeSettings';

function clickOriginalAdminHomeAction(label: string) {
  const container = document.querySelector('[data-admin-home-settings-root]');
  const buttons = Array.from(container?.querySelectorAll('button') ?? []) as HTMLButtonElement[];
  const target = buttons.find((button) => button.textContent?.includes(label));

  if (!target) {
    toast.warning('Aguarde o carregamento das configurações antes de salvar.');
    return;
  }

  if (target.disabled) {
    toast.warning('A ação de salvar ainda não está disponível.');
    return;
  }

  target.click();
}

export function AdminHomeSettingsWithSaveBar() {
  return (
    <div className="relative pb-24">
      <div data-admin-home-settings-root>
        <AdminHomeSettings />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => clickOriginalAdminHomeAction('Salvar rascunho')}
            className="w-full rounded-xl sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar rascunho
          </Button>
          <Button
            type="button"
            onClick={() => clickOriginalAdminHomeAction('Publicar agora')}
            className="w-full rounded-xl shadow-sm sm:w-auto"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Salvar e publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
