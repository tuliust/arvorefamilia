import { PersonFormSection } from './PersonFormSection';

type PersonPrivacyFieldsValue = {
  permitir_exibir_data_nascimento?: boolean;
  permitir_exibir_telefone?: boolean;
  permitir_exibir_endereco?: boolean;
  permitir_exibir_rede_social?: boolean;
  permitir_exibir_instagram?: boolean;
  permitir_mensagens_whatsapp?: boolean;
};

type PersonPrivacyFieldsProps = {
  value: PersonPrivacyFieldsValue;
  onChange: (field: keyof PersonPrivacyFieldsValue, value: boolean) => void;
  onSocialPrivacyChange: (checked: boolean) => void;
};

export function PersonPrivacyFields({ value, onChange, onSocialPrivacyChange }: PersonPrivacyFieldsProps) {
  return (
    <PersonFormSection title="Privacidade">
      <p className="text-sm text-gray-600">
        Defina quais dados pessoais podem aparecer para outros familiares. Essas opções podem ser ajustadas depois.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PrivacyCheckbox
          label="Exibir minha data de nascimento para outros familiares"
          checked={value.permitir_exibir_data_nascimento !== false}
          onChange={(checked) => onChange('permitir_exibir_data_nascimento', checked)}
        />
        <PrivacyCheckbox
          label="Exibir meu telefone para outros familiares"
          checked={value.permitir_exibir_telefone !== false}
          onChange={(checked) => onChange('permitir_exibir_telefone', checked)}
        />
        <PrivacyCheckbox
          label="Exibir meu endereço para outros familiares"
          checked={value.permitir_exibir_endereco !== false}
          onChange={(checked) => onChange('permitir_exibir_endereco', checked)}
        />
        <PrivacyCheckbox
          label="Exibir minha rede social para outros familiares"
          checked={value.permitir_exibir_rede_social !== false && value.permitir_exibir_instagram !== false}
          onChange={onSocialPrivacyChange}
        />
        <PrivacyCheckbox
          label="Permitir mensagens por WhatsApp"
          checked={value.permitir_mensagens_whatsapp !== false}
          onChange={(checked) => onChange('permitir_mensagens_whatsapp', checked)}
        />
      </div>
    </PersonFormSection>
  );
}

export function PrivacyCheckbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
      />
      <span>
        <span className="block">{label}</span>
        {description && <span className="mt-1 block text-xs text-gray-500">{description}</span>}
      </span>
    </label>
  );
}
