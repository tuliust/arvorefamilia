import { toast } from 'sonner';
import {
  confirmOwnLinkedPersonData,
  ensureMemberProfile,
  getCurrentUserLinkedPeople,
  updateOwnLinkedPerson,
} from './app/services/memberProfileService';

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

let submitting = false;

function isMeusDadosOnboardingPage() {
  return window.location.pathname.replace(/\/$/, '') === '/meus-dados'
    && Boolean(document.body.textContent?.includes('Revisar meus dados'));
}

function findConfirmButton() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button[type="submit"], button'))
    .find((button) => button.textContent?.includes('Confirmar meus dados')) ?? null;
}

function findFieldByLabel(labelText: string): InputElement | null {
  const normalizedLabel = labelText.trim().toLowerCase();
  const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
  const label = labels.find((item) => item.textContent?.trim().toLowerCase() === normalizedLabel);
  if (!label) return null;

  const htmlFor = label.getAttribute('for');
  if (htmlFor) {
    const direct = document.getElementById(htmlFor);
    if (direct instanceof HTMLInputElement || direct instanceof HTMLTextAreaElement || direct instanceof HTMLSelectElement) {
      return direct;
    }
  }

  const container = label.closest<HTMLElement>('div, fieldset, section');
  const input = container?.querySelector<InputElement>('input, textarea, select');
  return input ?? null;
}

function getFieldValue(label: string) {
  return String(findFieldByLabel(label)?.value ?? '').trim();
}

function buildOptionalProfilePayload() {
  const payload: Record<string, string> = {};
  const fields: Array<[string, string]> = [
    ['nome_completo', 'Nome completo'],
    ['profissao', 'Profissão'],
    ['local_nascimento', 'Local de nascimento'],
    ['data_nascimento', 'Data de nascimento'],
    ['local_atual', 'Local atual'],
    ['telefone', 'Telefone'],
    ['endereco', 'Endereço'],
    ['complemento', 'Complemento'],
  ];

  fields.forEach(([field, label]) => {
    const value = getFieldValue(label);
    if (value) payload[field] = value;
  });

  return payload;
}

async function completeFirstAccessWithoutQuestionnaire() {
  if (submitting) return;
  submitting = true;

  const confirmButton = findConfirmButton();
  const originalText = confirmButton?.textContent ?? '';

  try {
    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent = 'Salvando...';
    }

    const links = await getCurrentUserLinkedPeople();
    if (links.error) throw new Error(links.error);

    const selectedPessoaId = (document.getElementById('linked-profile-selector') as HTMLSelectElement | null)?.value;
    const link = (selectedPessoaId ? links.data.find((item) => item.pessoa_id === selectedPessoaId) : null)
      || links.data.find((item) => item.principal)
      || links.data[0];

    if (!link?.id || !link.pessoa_id) throw new Error('Não foi possível localizar seu vínculo com a árvore.');
    if (link.can_edit === false) throw new Error('Este perfil está em modo somente leitura para sua conta.');

    const payload = buildOptionalProfilePayload();
    let updatedName = '';

    if (Object.keys(payload).length > 0) {
      const updateResult = await updateOwnLinkedPerson(link.pessoa_id, payload);
      if (updateResult.error) throw new Error(updateResult.error);
      updatedName = String(updateResult.data?.nome_completo ?? payload.nome_completo ?? '').trim();
    }

    const { data: authData } = await import('./app/lib/supabaseClient').then((module) => module.supabase.auth.getUser());
    if (authData.user?.id && link.relacao_com_perfil === 'Sou esta pessoa') {
      await ensureMemberProfile(authData.user.id, {
        nome_exibicao: updatedName || link.pessoa?.nome_completo || authData.user.email || null,
        avatar_url: link.pessoa?.foto_principal_url ?? null,
      });
    }

    const confirmResult = await confirmOwnLinkedPersonData(link.id);
    if (confirmResult.error) throw new Error(confirmResult.error);

    toast.success('Dados pessoais salvos.');
    window.location.assign('/meus-vinculos');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível confirmar seus dados.');
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.textContent = originalText || 'Confirmar meus dados';
    }
    submitting = false;
  }
}

function installOptionalFirstAccessSubmitHandler() {
  document.addEventListener('click', (event) => {
    if (!isMeusDadosOnboardingPage()) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>('button');
    if (!button || !button.textContent?.includes('Confirmar meus dados')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void completeFirstAccessWithoutQuestionnaire();
  }, true);

  document.addEventListener('submit', (event) => {
    if (!isMeusDadosOnboardingPage()) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void completeFirstAccessWithoutQuestionnaire();
  }, true);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installOptionalFirstAccessSubmitHandler();
}

export {};
