import React from 'react';

import { WhatsAppContactButton } from '../../components/person/WhatsAppContactButton';
import type { Pessoa } from '../../types';
import { formatPhone, getPersonZodiacSign, isPersonDeceased } from '../../utils/personFields';
import { canUseWhatsAppContact } from '../../utils/whatsapp';

export function ContactInfo({ pessoa }: { pessoa: Pessoa }) {
  const canShowBirthDate = pessoa.permitir_exibir_data_nascimento !== false;
  const ageLabel = canShowBirthDate ? getCurrentAgeLabel(pessoa.data_nascimento) : undefined;
  const zodiacSign = canShowBirthDate ? getPersonZodiacSign(pessoa) : undefined;
  const canShowPhoneNumber = pessoa.permitir_exibir_telefone === true && Boolean(pessoa.telefone);
  const canShowWhatsAppContact = canUseWhatsAppContact(pessoa);
  const contactItems = [
    ['Nome completo', pessoa.nome_completo],
    canShowBirthDate
      ? ['Nascimento', pessoa.data_nascimento ? String(pessoa.data_nascimento) : undefined]
      : null,
    pessoa.local_nascimento
      ? ['Local de nascimento', pessoa.local_nascimento]
      : null,
    pessoa.local_atual
      ? ['Local atual', pessoa.local_atual]
      : null,
    pessoa.data_falecimento
      ? ['Data de falecimento', String(pessoa.data_falecimento)]
      : isPersonDeceased(pessoa)
        ? ['Falecimento', 'Falecido(a)']
        : null,
    pessoa.local_falecimento
      ? ['Local de falecimento', pessoa.local_falecimento]
      : null,
    canShowBirthDate && ageLabel
      ? ['Idade', ageLabel]
      : null,
    canShowBirthDate && zodiacSign
      ? ['Signo', zodiacSign]
      : null,
    canShowPhoneNumber
      ? ['Telefone', formatPhone(String(pessoa.telefone ?? ''))]
      : null,
    pessoa.permitir_exibir_rede_social === true || pessoa.permitir_exibir_instagram === true
      ? ['Redes sociais', pessoa.rede_social || pessoa.instagram_usuario || pessoa.instagram_url]
      : null,
    pessoa.permitir_exibir_endereco === true
      ? ['Endereço', pessoa.endereco]
      : null,
  ].filter((item): item is [string, string] => Boolean(item?.[1]));

  if (contactItems.length <= 1 && !canShowWhatsAppContact) {
    return (
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">{pessoa.nome_completo}</p>
        <p>Esta pessoa não disponibilizou dados ou contatos para visualização.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <dl className="space-y-2">
        {contactItems.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
            <dd className="text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
      {canShowWhatsAppContact && (
        <WhatsAppContactButton
          telefone={pessoa.telefone ?? null}
          permitirExibirTelefone={pessoa.permitir_exibir_telefone ?? null}
          permitirMensagensWhatsApp={pessoa.permitir_mensagens_whatsapp ?? null}
          personId={pessoa.id}
          personName={pessoa.nome_completo}
          className="mt-3"
        />
      )}
    </div>
  );
}

function getCurrentAgeLabel(value?: string | number | null) {
  const birthDate = parseSimpleBirthDate(value);
  if (!birthDate || !Number.isFinite(birthDate.year)) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.year;

  if (birthDate.hasFullDate && birthDate.month && birthDate.day) {
    const hasHadBirthday =
      today.getMonth() + 1 > birthDate.month ||
      (today.getMonth() + 1 === birthDate.month && today.getDate() >= birthDate.day);
    if (!hasHadBirthday) age -= 1;
  }

  if (age < 0 || age > 130) return undefined;
  return birthDate.hasFullDate ? `${age} anos` : `aprox. ${age} anos`;
}

function parseSimpleBirthDate(value?: string | number | null) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brDate) {
    const [, day, month, year] = brDate;
    return {
      day: Number(day),
      month: Number(month),
      year: Number(year),
      hasFullDate: true,
    };
  }

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return {
      day: Number(day),
      month: Number(month),
      year: Number(year),
      hasFullDate: true,
    };
  }

  const year = text.match(/(?:^|[^\d])(\d{4})(?:[^\d]|$)/)?.[1];
  if (!year) return null;

  return {
    year: Number(year),
    hasFullDate: false,
  };
}
