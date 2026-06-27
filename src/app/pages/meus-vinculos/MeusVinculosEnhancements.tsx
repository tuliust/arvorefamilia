import { useEffect } from 'react';

const NO_SPOUSE_MESSAGE = 'Cadastre inicialmente um cônjuge na seção anterior.';

function findSection(id: string) {
  return document.getElementById(id);
}

function moveSpousesBeforeChildren() {
  const spousesSection = findSection('vinculos-conjuges');
  const childrenSection = findSection('vinculos-filhos');
  const parent = childrenSection?.parentElement;

  if (!spousesSection || !childrenSection || !parent) return;
  if (childrenSection.previousElementSibling === spousesSection) return;

  parent.insertBefore(spousesSection, childrenSection);
}

function getCurrentSpouseOptions() {
  return Array.from(document.querySelectorAll<HTMLElement>('#vinculos-conjuges article[data-relationship-group="conjuges"]'))
    .filter((card) => card.dataset.relationshipStatus !== 'removed_pending')
    .map((card) => ({
      id: String(card.dataset.personId ?? '').trim(),
      name: String(card.dataset.personName ?? '').trim(),
    }))
    .filter((item) => item.id && item.name)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }));
}

function ensureSpouseMessage(wrapper: HTMLElement, visible: boolean) {
  let message = wrapper.querySelector<HTMLParagraphElement>('[data-child-spouse-required-message="true"]');

  if (!visible) {
    message?.remove();
    return;
  }

  if (!message) {
    message = document.createElement('p');
    message.dataset.childSpouseRequiredMessage = 'true';
    message.className = 'text-sm text-amber-700';
    wrapper.appendChild(message);
  }

  message.textContent = NO_SPOUSE_MESSAGE;
}

function replaceSelectOptionsWithSpouses(select: HTMLSelectElement, spouseOptions: Array<{ id: string; name: string }>) {
  const currentValue = select.value;
  const nextAllowedValues = new Set(['', ...spouseOptions.map((option) => option.id)]);

  Array.from(select.options).forEach((option) => option.remove());

  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = 'Não informado';
  select.appendChild(emptyOption);

  spouseOptions.forEach((spouse) => {
    const option = document.createElement('option');
    option.value = spouse.id;
    option.textContent = spouse.name;
    select.appendChild(option);
  });

  select.value = nextAllowedValues.has(currentValue) ? currentValue : '';
  select.disabled = spouseOptions.length === 0;
  select.dataset.meusVinculosSpouseOnly = 'true';
}

function enhanceChildrenOtherParentSelects() {
  const spouseOptions = getCurrentSpouseOptions();

  document.querySelectorAll<HTMLSelectElement>('select[id^="child-other-parent-"]').forEach((select) => {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${select.id}"]`);
    if (label) label.textContent = 'Mãe do filho (a)';

    replaceSelectOptionsWithSpouses(select, spouseOptions);

    const wrapper = select.closest('.space-y-2') as HTMLElement | null;
    if (wrapper) ensureSpouseMessage(wrapper, spouseOptions.length === 0);

    const legacyHelp = Array.from(select.closest('.space-y-3')?.querySelectorAll<HTMLParagraphElement>('p') ?? [])
      .find((paragraph) => paragraph.textContent?.includes('Adicione um cônjuge ou cadastre o outro pai/mãe'));
    if (legacyHelp) legacyHelp.textContent = NO_SPOUSE_MESSAGE;
  });
}

function openPetModalFromPetsButton(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest('button');
  const petsSection = button?.closest('#vinculos-pets');
  if (!button || !petsSection) return;
  if (!button.textContent?.includes('Adicionar pet')) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  window.dispatchEvent(new CustomEvent('meus-vinculos:open-pet-modal'));
}

export function MeusVinculosEnhancements() {
  useEffect(() => {
    const applyLayoutTweaks = () => {
      moveSpousesBeforeChildren();
      enhanceChildrenOtherParentSelects();
    };

    applyLayoutTweaks();

    const observer = new MutationObserver(applyLayoutTweaks);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener('click', openPetModalFromPetsButton, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', openPetModalFromPetsButton, true);
    };
  }, []);

  return null;
}
