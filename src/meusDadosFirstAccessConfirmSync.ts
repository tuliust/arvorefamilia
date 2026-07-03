import { confirmOwnLinkedPersonData, getCurrentUserLinkedPeople, updateOwnLinkedPerson, type EditableOwnPersonPayload } from './app/services/memberProfileService';

const PROFILE_RESULT_HOST_ID = 'meus-dados-profile-bio-result-host';

let pendingSync = false;

function isMeusDadosPage() {
  return window.location.pathname.replace(/\/$/, '') === '/meus-dados';
}

function isProfileResultVisible() {
  const resultHost = document.getElementById(PROFILE_RESULT_HOST_ID);
  return Boolean(resultHost && !resultHost.classList.contains('hidden') && resultHost.textContent?.includes('Mini Bio'));
}

function getTextAreaValue(id: string) {
  const field = document.getElementById(id);
  return field instanceof HTMLTextAreaElement ? field.value.trim() : '';
}

function buildProfileTextPayload(): EditableOwnPersonPayload {
  const payload: EditableOwnPersonPayload = {};
  const minibio = getTextAreaValue('meus-dados-minibio');
  const curiosidades = getTextAreaValue('meus-dados-curiosidades');

  if (minibio) payload.minibio = minibio;
  if (curiosidades) payload.curiosidades = curiosidades;

  return payload;
}

async function syncFirstAccessConfirmation() {
  if (pendingSync || !isMeusDadosPage() || !isProfileResultVisible()) return;
  pendingSync = true;

  try {
    const links = await getCurrentUserLinkedPeople();
    if (links.error) throw new Error(links.error);

    const selectedPessoaId = (document.getElementById('linked-profile-selector') as HTMLSelectElement | null)?.value;
    const link = (selectedPessoaId ? links.data.find((item) => item.pessoa_id === selectedPessoaId) : null)
      || links.data.find((item) => item.principal)
      || links.data[0];

    if (!link?.id || !link.pessoa_id || link.can_edit === false) return;

    const profileTextPayload = buildProfileTextPayload();
    if (Object.keys(profileTextPayload).length > 0) {
      await updateOwnLinkedPerson(link.pessoa_id, profileTextPayload);
    }

    await confirmOwnLinkedPersonData(link.id);
  } catch (error) {
    console.warn('[Meus Dados] Falha ao sincronizar confirmação de primeiro acesso:', error);
  } finally {
    pendingSync = false;
  }
}

function scheduleFirstAccessConfirmationSync() {
  window.setTimeout(() => {
    void syncFirstAccessConfirmation();
  }, 1200);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!isMeusDadosPage() || !isProfileResultVisible()) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>('button');
    if (!button || !button.textContent?.includes('Confirmar meus dados')) return;

    scheduleFirstAccessConfirmationSync();
  }, true);

  document.addEventListener('submit', () => {
    if (!isMeusDadosPage() || !isProfileResultVisible()) return;
    scheduleFirstAccessConfirmationSync();
  }, true);
}

export {};
