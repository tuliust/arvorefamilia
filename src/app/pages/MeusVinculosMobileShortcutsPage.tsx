import { MeusVinculos } from './MeusVinculos';
import { MeusVinculosEnhancements } from './meus-vinculos/MeusVinculosEnhancements';
import { MeusVinculosPetEditorPortal } from './meus-vinculos/MeusVinculosPetEditorPortal';

export function MeusVinculosMobileShortcutsPage() {
  return (
    <div>
      <MeusVinculosEnhancements />
      <MeusVinculosPetEditorPortal />
      <MeusVinculos />
    </div>
  );
}
