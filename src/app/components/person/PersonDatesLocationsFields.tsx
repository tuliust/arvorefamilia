import { Input } from '../ui/input';
import {
  maskBirthDate,
  normalizeLocationByMode,
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

export function PersonDatesLocationsFields({ value, isFalecido, onChange }: PersonDatesLocationsFieldsProps) {
  return (
    <PersonFormSection title="Datas e Locais">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
          <Input
            type="text"
            value={value.data_nascimento}
            onChange={(event) => onChange('data_nascimento', maskBirthDate(event.target.value))}
            placeholder="Ex: 1990 ou 15/03/1990"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Local de Nascimento</label>
          <Input
            type="text"
            value={value.local_nascimento}
            onChange={(event) => onChange('local_nascimento', event.target.value)}
            onBlur={() => onChange('local_nascimento', normalizeLocationByMode(value.local_nascimento, {
              international: value.local_nascimento_exterior,
            }))}
            placeholder={value.local_nascimento_exterior ? 'Ex: Dublin (Irlanda)' : 'Ex: São Paulo/SP'}
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={value.local_nascimento_exterior === true}
              onChange={(event) => onChange('local_nascimento_exterior', event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            Nascimento fora do Brasil
          </label>
        </div>

        <div className="md:col-span-2">
          <PrivacyCheckbox
            label="Pessoa falecida"
            description="Marque mesmo que a data ou o local de falecimento sejam desconhecidos."
            checked={value.falecido === true}
            onChange={(checked) => onChange('falecido', checked)}
          />
        </div>

        {value.falecido === true && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Falecimento</label>
              <Input
                type="text"
                value={value.data_falecimento}
                onChange={(event) => onChange('data_falecimento', maskBirthDate(event.target.value))}
                placeholder="Ex: 2020 ou 15/03/2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local de Falecimento</label>
              <Input
                type="text"
                value={value.local_falecimento}
                onChange={(event) => onChange('local_falecimento', event.target.value)}
                onBlur={() => onChange('local_falecimento', normalizeLocationByMode(value.local_falecimento, {
                  international: value.local_falecimento_exterior,
                }))}
                placeholder={value.local_falecimento_exterior ? 'Ex: Lisboa (Portugal)' : 'Ex: Rio de Janeiro/RJ'}
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={value.local_falecimento_exterior === true}
                  onChange={(event) => onChange('local_falecimento_exterior', event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                Falecimento fora do Brasil
              </label>
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Local Atual (residência)</label>
          <Input
            type="text"
            value={value.local_atual}
            onChange={(event) => onChange('local_atual', event.target.value)}
            onBlur={() => onChange('local_atual', normalizeLocationByMode(value.local_atual, {
              international: value.local_atual_exterior,
            }))}
            placeholder={value.local_atual_exterior ? 'Ex: Londres (Reino Unido)' : 'Ex: Belo Horizonte/MG'}
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={value.local_atual_exterior === true}
              onChange={(event) => onChange('local_atual_exterior', event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            Moro no exterior
          </label>
        </div>
      </div>
    </PersonFormSection>
  );
}
