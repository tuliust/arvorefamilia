import { Input } from '../ui/input';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { SocialProfileForm, SocialProfilesEditor } from './SocialProfilesEditor';
import { PersonFormSection } from './PersonFormSection';

type PersonContactFieldsValue = {
  telefone: string;
  endereco: string;
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
    <PersonFormSection title="Informações de Contato">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
        <AddressAutocompleteInput
          value={value.endereco}
          onChange={(nextValue) => onChange('endereco', nextValue)}
          placeholder="Rua, número, bairro, cidade"
        />
      </div>
    </PersonFormSection>
  );
}
