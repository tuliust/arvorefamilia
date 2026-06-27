import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adicionarPessoa, obterTodasPessoas } from '../../services/dataService';
import type { Pessoa } from '../../types';
import { isPetPerson } from './meusVinculosUtils';

const CREATE_NEW_PERSON_VALUE = '__create_new_person__';
const ENHANCED_SELECT_ATTRIBUTE = 'data-meus-vinculos-enhanced';
const CREATE_OPTION_ID = 'meus-vinculos-create-new-person-option';

function sortPeopleByName(people: Pessoa[]) {
  return [...people].sort((left, right) => (
    left.nome_completo.localeCompare(right.nome_completo, 'pt-BR', { sensitivity: 'base' })
  ));
}

function getChildIdFromSelect(select: HTMLSelectElement) {
  return select.id.replace('child-other-parent-', '');
}

function getExistingOptionValues(select: HTMLSelectElement) {
  return new Set(Array.from(select.options).map((option) => option.value));
}

function enhanceChildOtherParentSelect(select: HTMLSelectElement, people: Pessoa[]) {
  const childId = getChildIdFromSelect(select);
  const existingValues = getExistingOptionValues(select);
  const currentValue = select.value;

  sortPeopleByName(people)
    .filter((person) => person.id !== childId)
    .filter((person) => !isPetPerson(person))
    .forEach((person) => {
      if (existingValues.has(person.id)) return;

      const option = document.createElement('option');
      option.value = person.id;
      option.textContent = person.nome_completo;
      select.appendChild(option);
      existingValues.add(person.id);
    });

  const existingCreateOption = select.querySelector<HTMLSelectElement>(`option[value="${CREATE_NEW_PERSON_VALUE}"]`);
  if (!existingCreateOption) {
    const createOption = document.createElement('option');
    createOption.id = CREATE_OPTION_ID;
    createOption.value = CREATE_NEW_PERSON_VALUE;
    createOption.textContent = '+ Adicionar nova pessoa';
    select.appendChild(createOption);
  }

  if (currentValue) select.value = currentValue;
  select.setAttribute(ENHANCED_SELECT_ATTRIBUTE, 'true');
}

function focusPetEditor() {
  const petEditorInput = document.getElementById('meus-vinculos-pet-nome') as HTMLInputElement | null;
  if (!petEditorInput) return false;

  petEditorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => petEditorInput.focus(), 250);
  return true;
}

export function MeusVinculosEnhancements() {
  const [people, setPeople] = useState<Pessoa[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      try {
        const data = await obterTodasPessoas();
        if (!cancelled) setPeople(data);
      } catch (error) {
        console.warn('Não foi possível carregar pessoas para seletor de outro pai/mãe:', error);
      }
    }

    void loadPeople();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (people.length === 0) return undefined;

    const enhance = () => {
      document.querySelectorAll<HTMLSelectElement>('select[id^="child-other-parent-"]').forEach((select) => {
        enhanceChildOtherParentSelect(select, people);
      });
    };

    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [people]);

  useEffect(() => {
    const handleChildOtherParentChange = async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (!target.id.startsWith('child-other-parent-')) return;
      if (target.value !== CREATE_NEW_PERSON_VALUE) return;

      event.preventDefault();
      event.stopPropagation();
      target.value = '';

      const nome = window.prompt('Nome completo da nova pessoa');
      if (!nome?.trim()) return;

      const dataNascimento = window.prompt('Data de nascimento opcional. Use DD/MM/AAAA ou AAAA.') ?? '';

      try {
        const createdPerson = await adicionarPessoa({
          nome_completo: nome.trim(),
          data_nascimento: dataNascimento.trim() || undefined,
          humano_ou_pet: 'Humano',
        });

        if (!createdPerson) {
          throw new Error('Não foi possível criar a nova pessoa.');
        }

        setPeople((current) => sortPeopleByName([...current, createdPerson]));

        if (!Array.from(target.options).some((option) => option.value === createdPerson.id)) {
          const option = document.createElement('option');
          option.value = createdPerson.id;
          option.textContent = createdPerson.nome_completo;
          const createOption = target.querySelector(`option[value="${CREATE_NEW_PERSON_VALUE}"]`);
          target.insertBefore(option, createOption);
        }

        target.value = createdPerson.id;
        target.dispatchEvent(new Event('change', { bubbles: true }));
        toast.success('Pessoa criada e selecionada.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível criar a nova pessoa.');
      }
    };

    const handlePetAddClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button');
      const petsSection = button?.closest('#vinculos-pets');
      if (!button || !petsSection) return;
      if (!button.textContent?.includes('Adicionar pet')) return;
      if (!focusPetEditor()) return;

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('change', handleChildOtherParentChange, true);
    document.addEventListener('click', handlePetAddClick, true);

    return () => {
      document.removeEventListener('change', handleChildOtherParentChange, true);
      document.removeEventListener('click', handlePetAddClick, true);
    };
  }, []);

  return null;
}
