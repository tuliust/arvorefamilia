import React from 'react';
import { Calendar, Dog, Globe, Home, MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pessoa } from '../../types';
import { formatPhone, getPersonZodiacSign } from '../../utils/personFields';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm">
        {label}: <strong>{value}</strong>
      </span>
    </div>
  );
}

export function PersonDataView({ pessoa }: { pessoa: Pessoa }) {
  const isPet = pessoa.humano_ou_pet === 'Pet';
  const isFalecido = Boolean(pessoa.data_falecimento);
  const zodiacSign = getPersonZodiacSign(pessoa);
  const canShowSocial = Boolean(pessoa.permitir_exibir_instagram && (pessoa.instagram_url || pessoa.instagram_usuario || pessoa.rede_social));
  const canShowPhone = Boolean(pessoa.permitir_mensagens_whatsapp && pessoa.telefone);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <div className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full ${isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'}`}>
                {pessoa.foto_principal_url ? (
                  <img src={pessoa.foto_principal_url} alt={pessoa.nome_completo} className="h-32 w-32 object-cover" />
                ) : isPet ? (
                  <Dog className="h-16 w-16 text-amber-700" />
                ) : (
                  <User className="h-16 w-16 text-blue-700" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{pessoa.nome_completo}</h1>
              <div className="mb-4 flex flex-wrap gap-2">
                {isPet && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">Pet da família</span>}
                {isFalecido && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">In Memoriam</span>}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Nascimento" value={pessoa.data_nascimento} />
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Signo" value={zodiacSign || 'Não identificado'} />
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Local de nascimento" value={pessoa.local_nascimento} />
                {!isFalecido && <InfoItem icon={<Home className="h-4 w-4" />} label="Residência atual" value={pessoa.local_atual} />}
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Falecimento" value={pessoa.data_falecimento} />
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Local de falecimento" value={pessoa.local_falecimento} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(pessoa.minibio || pessoa.curiosidades) && (
        <Card>
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pessoa.minibio && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Mini bio</h3>
                <p className="text-sm leading-relaxed text-gray-600">{pessoa.minibio}</p>
              </div>
            )}
            {pessoa.curiosidades && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Curiosidades</h3>
                <p className="text-sm leading-relaxed text-gray-600">{pessoa.curiosidades}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isFalecido && (canShowPhone || pessoa.endereco || canShowSocial) && (
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {canShowPhone && (
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Telefone" value={formatPhone(String(pessoa.telefone ?? ''))} />
            )}
            <InfoItem icon={<Home className="h-4 w-4" />} label="Endereço" value={pessoa.endereco} />
            {canShowSocial && (
              <InfoItem
                icon={<Globe className="h-4 w-4" />}
                label="Rede social"
                value={pessoa.instagram_url ? <a href={pessoa.instagram_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{pessoa.instagram_url}</a> : pessoa.instagram_usuario || pessoa.rede_social}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
