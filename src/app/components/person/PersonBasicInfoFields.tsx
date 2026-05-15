import { Input } from '../ui/input';
import { TipoEntidade, LadoPessoa } from '../../types';
import { PersonFormSection } from './PersonFormSection';

type PersonBasicInfoValue = {
  nome_completo: string;
  humano_ou_pet: TipoEntidade;
  manual_generation: string;
  lado?: LadoPessoa;
};

type PersonBasicInfoFieldsProps = {
  value: PersonBasicInfoValue;
  onChange: (field: keyof PersonBasicInfoValue, value: string) => void;
};

export function PersonBasicInfoFields({ value, onChange }: PersonBasicInfoFieldsProps) {
  return (
    <PersonFormSection title="Informações Básicas">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
        <Input
          type="text"
          value={value.nome_completo}
          onChange={(event) => onChange('nome_completo', event.target.value)}
          required
          placeholder="Ex: João da Silva"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            value={value.humano_ou_pet}
            onChange={(event) => onChange('humano_ou_pet', event.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="Humano">Humano</option>
            <option value="Pet">Pet</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Geração</label>
          <select
            value={value.manual_generation}
            onChange={(event) => onChange('manual_generation', event.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Automática</option>
            {Array.from({ length: 7 }, (_, index) => index + 1).map((generation) => (
              <option key={generation} value={generation}>
                Geração {generation}
              </option>
            ))}
          </select>
        </div>
      </div>
    </PersonFormSection>
  );
}
