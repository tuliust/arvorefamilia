import { Phone } from 'lucide-react';
import { Input } from '../ui/input';
import { PERSON_FIELD_LABELS } from '../../utils/personFields';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { SocialProfileForm, SocialProfilesEditor } from './SocialProfilesEditor';
import { PersonFormSection } from './PersonFormSection';

type PersonContactFieldsValue = {
  telefone: string;
  endereco: string;
  complemento?: string;
};

type PersonContactFieldsProps = {
  value: PersonContactFieldsValue;
  socialProfiles: SocialProfileForm[];
  onChange: (field: keyof PersonContactFieldsValue, value: string) => void;
  onPhoneChange: (value: string) => void;
  onSocialProfilesChange: (profiles: SocialProfileForm[]) => void;
};

export function PersonContactFields({
  value,
  socialProfiles,
  onChange,
  onPhoneChange,
  onSocialProfilesChange,
}: PersonContactFieldsProps) {
  return (
    <PersonFormSection
      title="Contato, endereço e redes sociais"
      description="Dados de contato podem ser exibidos conforme as preferências de privacidade. Redes sociais incompletas são tratadas de forma segura no salvamento."
      icon={<Phone className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {PERSON_FIELD_LABELS.telefone}
          </label>
          <Input
            type="tel"
            value={value.telefone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>
      </div>

      <SocialProfilesEditor
        profiles={socialProfiles}
        onChange={onSocialProfilesChange}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {PERSON_FIELD_LABELS.endereco}
        </label>
        <AddressAutocompleteInput
          value={value.endereco}
          onChange={(nextValue) => onChange('endereco', nextValue)}
          placeholder="Rua, número, bairro, cidade"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {PERSON_FIELD_LABELS.complemento}
        </label>
        <Input
          type="text"
          value={value.complemento ?? ''}
          onChange={(event) => onChange('complemento', event.target.value)}
          placeholder="Ex.: Apto 402, Bloco B, Torre Norte"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use para apartamento, bloco, torre, casa ou referência interna.
        </p>
      </div>
    </PersonFormSection>
  );
}
