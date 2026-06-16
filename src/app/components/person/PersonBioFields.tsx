import React from 'react';
import { BookOpenText } from 'lucide-react';
import { PERSON_FIELD_LABELS } from '../../utils/personFields';
import { PersonFormSection } from './PersonFormSection';

type PersonBioFieldsValue = {
  minibio: string;
  curiosidades: string;
};

type PersonBioFieldsProps = {
  value: PersonBioFieldsValue;
  onChange: (field: keyof PersonBioFieldsValue, value: string) => void;
  headerAction?: React.ReactNode;
};

export function PersonBioFields({ value, onChange, headerAction }: PersonBioFieldsProps) {
  return (
    <PersonFormSection
      title="Mini bio e curiosidades"
      description="Separe dados objetivos de informações narrativas sobre trajetória, memórias, hábitos e detalhes familiares."
      icon={<BookOpenText className="h-5 w-5" />}
      headerAction={headerAction}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {PERSON_FIELD_LABELS.minibio}
        </label>
        <textarea
          value={value.minibio}
          onChange={(event) => onChange('minibio', event.target.value)}
          rows={4}
          maxLength={300}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Breve apresentação sobre a pessoa, sua trajetória, origem, profissão, valores ou relação com a família."
        />
        <p className="mt-1 text-right text-xs text-gray-500">{value.minibio.length}/300</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {PERSON_FIELD_LABELS.curiosidades}
        </label>
        <textarea
          value={value.curiosidades}
          onChange={(event) => onChange('curiosidades', event.target.value)}
          rows={4}
          maxLength={300}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Fatos interessantes, hobbies, costumes, viagens, talentos, apelidos ou lembranças marcantes."
        />
        <p className="mt-1 text-right text-xs text-gray-500">{value.curiosidades.length}/300</p>
      </div>
    </PersonFormSection>
  );
}