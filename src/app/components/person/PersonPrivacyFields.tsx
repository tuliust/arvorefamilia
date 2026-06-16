import { Shield } from 'lucide-react';
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
  privacyContext?: 'member' | 'admin';
};

export function PersonPrivacyFields({
  value,
  onChange,
  onSocialPrivacyChange,
  privacyContext = 'member',
}: PersonPrivacyFieldsProps) {
  const labels = privacyContext === 'admin'
    ? {
        birthDate: 'Exibir data de nascimento desta pessoa para familiares',
        phone: 'Exibir telefone/WhatsApp desta pessoa para familiares',
        address: 'Exibir endereço desta pessoa para familiares',
        social: 'Exibir rede social desta pessoa para familiares',
        whatsapp: 'Permitir mensagens por WhatsApp para esta pessoa',
      }
    : {
        birthDate: 'Exibir minha data de nascimento para outros familiares',
        phone: 'Exibir meu telefone/WhatsApp para outros familiares',
        address: 'Exibir meu endereço para outros familiares',
        social: 'Exibir minha rede social para outros familiares',
        whatsapp: 'Permitir mensagens por WhatsApp',
      };

  return (
    <PersonFormSection
      title="Privacidade"
      description="Defina quais dados pessoais podem aparecer para outros familiares. Essas opções podem ser ajustadas depois."
      icon={<Shield className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PrivacyCheckbox
          label={labels.birthDate}
          checked={value.permitir_exibir_data_nascimento !== false}
          onChange={(checked) => onChange('permitir_exibir_data_nascimento', checked)}
        />
        <PrivacyCheckbox
          label={labels.phone}
          checked={value.permitir_exibir_telefone !== false}
          onChange={(checked) => onChange('permitir_exibir_telefone', checked)}
        />
        <PrivacyCheckbox
          label={labels.address}
          checked={value.permitir_exibir_endereco !== false}
          onChange={(checked) => onChange('permitir_exibir_endereco', checked)}
        />
        <PrivacyCheckbox
          label={labels.social}
          checked={value.permitir_exibir_rede_social !== false && value.permitir_exibir_instagram !== false}
          onChange={onSocialPrivacyChange}
        />
        <PrivacyCheckbox
          label={labels.whatsapp}
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
