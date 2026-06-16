import { CalendarDays } from 'lucide-react';
import { Input } from '../ui/input';
import {
  maskBirthDate,
  normalizeLocationByMode,
  PERSON_FIELD_LABELS,
} from '../../utils/personFields';
import { PersonFormSection } from './PersonFormSection';
import { PrivacyCheckbox } from './PersonPrivacyFields';

type PersonDatesLocationsValue = {
  data_nascimento: string;
  local_nascimento: string;
  local_nascimento_exterior?: boolean;
  falecido?: boolean;
  data_falecimento: string;
  local_falecimento: string;
  local_falecimento_exterior?: boolean;
  local_atual: string;
  local_atual_exterior?: boolean;
};

type PersonDatesLocationsFieldsProps = {
  value: PersonDatesLocationsValue;
  isFalecido: boolean;
  onChange: (field: keyof PersonDatesLocationsValue, value: string | boolean) => void;
};

function CompactToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mb-1 inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
      />
      <span className="whitespace-nowrap">{label}</span>
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PersonDatesLocationsFields({ value, isFalecido, onChange }: PersonDatesLocationsFieldsProps) {
  const isDeceased = isFalecido || value.falecido === true;

  return (
    <PersonFormSection
      title="Datas e locais"
      description="Informe nascimento, residência ou falecimento usando dia completo ou apenas ano quando a data exata não for conhecida."
      icon={<CalendarDays className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={PERSON_FIELD_LABELS.data_nascimento}>
          <Input
            type="text"
            value={value.data_nascimento}
            onChange={(event) => onChange('data_nascimento', maskBirthDate(event.target.value))}
            placeholder="Ex: 1990 ou 15/03/1990"
          />
        </Field>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <Field label={PERSON_FIELD_LABELS.local_nascimento}>
            <Input
              type="text"
              value={value.local_nascimento}
              onChange={(event) => onChange('local_nascimento', event.target.value)}
              onBlur={() => onChange('local_nascimento', normalizeLocationByMode(value.local_nascimento, {
                international: value.local_nascimento_exterior,
              }))}
              placeholder={value.local_nascimento_exterior ? 'Ex: Dublin (Irlanda)' : 'Ex: São Paulo/SP'}
            />
          </Field>

          <CompactToggle
            label="Estrangeiro"
            checked={value.local_nascimento_exterior === true}
            onChange={(checked) => onChange('local_nascimento_exterior', checked)}
          />
        </div>

        <div className="md:col-span-2">
          <PrivacyCheckbox
            label="Pessoa falecida"
            description="Marque mesmo que a data ou o local de falecimento sejam desconhecidos."
            checked={isDeceased}
            onChange={(checked) => onChange('falecido', checked)}
          />
        </div>

        {isDeceased ? (
          <>
            <Field label={PERSON_FIELD_LABELS.data_falecimento}>
              <Input
                type="text"
                value={value.data_falecimento}
                onChange={(event) => onChange('data_falecimento', maskBirthDate(event.target.value))}
                placeholder="Ex: 2020 ou 15/03/2020"
              />
            </Field>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <Field label={PERSON_FIELD_LABELS.local_falecimento}>
                <Input
                  type="text"
                  value={value.local_falecimento}
                  onChange={(event) => onChange('local_falecimento', event.target.value)}
                  onBlur={() => onChange('local_falecimento', normalizeLocationByMode(value.local_falecimento, {
                    international: value.local_falecimento_exterior,
                  }))}
                  placeholder={value.local_falecimento_exterior ? 'Ex: Lisboa (Portugal)' : 'Ex: Rio de Janeiro/RJ'}
                />
              </Field>

              <CompactToggle
                label="Exterior"
                checked={value.local_falecimento_exterior === true}
                onChange={(checked) => onChange('local_falecimento_exterior', checked)}
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 md:col-span-2">
            <Field label={PERSON_FIELD_LABELS.local_atual}>
              <Input
                type="text"
                value={value.local_atual}
                onChange={(event) => onChange('local_atual', event.target.value)}
                onBlur={() => onChange('local_atual', normalizeLocationByMode(value.local_atual, {
                  international: value.local_atual_exterior,
                }))}
                placeholder={value.local_atual_exterior ? 'Ex: Londres (Reino Unido)' : 'Ex: Belo Horizonte/MG'}
              />
            </Field>

            <CompactToggle
              label="Exterior"
              checked={value.local_atual_exterior === true}
              onChange={(checked) => onChange('local_atual_exterior', checked)}
            />
          </div>
        )}
      </div>
    </PersonFormSection>
  );
}
