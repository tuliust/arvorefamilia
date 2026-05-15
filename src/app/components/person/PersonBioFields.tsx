import { PersonFormSection } from './PersonFormSection';

type PersonBioFieldsValue = {
  minibio: string;
  curiosidades: string;
};

type PersonBioFieldsProps = {
  value: PersonBioFieldsValue;
  onChange: (field: keyof PersonBioFieldsValue, value: string) => void;
};

export function PersonBioFields({ value, onChange }: PersonBioFieldsProps) {
  return (
    <PersonFormSection title="Biografia e Curiosidades">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mini Biografia</label>
        <textarea
          value={value.minibio}
          onChange={(event) => onChange('minibio', event.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Breve biografia da pessoa..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Curiosidades</label>
        <textarea
          value={value.curiosidades}
          onChange={(event) => onChange('curiosidades', event.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Fatos interessantes, hobbies, conquistas..."
        />
      </div>
    </PersonFormSection>
  );
}
