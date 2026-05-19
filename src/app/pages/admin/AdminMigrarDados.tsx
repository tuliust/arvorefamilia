import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Database, AlertCircle } from 'lucide-react';

export function AdminMigrarDados() {
  const navigate = useNavigate();
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="max-w-4xl mx-auto flex min-w-0 items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="min-w-0 break-words text-xl font-bold text-gray-900">
              Migrar Dados para o Banco
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex min-w-0 items-center gap-2 break-words">
              <Database className="h-5 w-5 shrink-0" />
              Migração de Dados
            </CardTitle>
            <CardDescription className="break-words">
              Migração destrutiva desativada no frontend. Execute apenas via rotina server-side/transacional em ambiente controlado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="mb-2 break-words font-semibold text-blue-900">📋 Antes de começar:</h3>
              <ol className="list-inside list-decimal space-y-2 break-words text-sm text-blue-800">
                <li>Certifique-se de que as migrations atuais foram aplicadas no ambiente correto</li>
                <li>Qualquer carga destrutiva deve rodar fora do browser, com transação e backup validado</li>
                <li>Não execute deletes/inserts parciais a partir do frontend</li>
                <li>Use uma rotina server-side/RPC revisada para ambientes locais ou staging</li>
              </ol>
            </div>

            {/* Informações sobre os dados */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="mb-2 break-words font-semibold text-gray-900">📊 Estado da ferramenta:</h3>
              <ul className="space-y-1 break-words text-sm text-gray-700">
                <li>• Execução destrutiva client-side removida</li>
                <li>• Esta tela permanece apenas como aviso operacional</li>
                <li>• Uma nova rotina deve ser transacional e validar admin no servidor</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-red-900 mb-2">
                Confirmação desativada. A frase abaixo não libera execução pelo frontend.
              </label>
              <input
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                className="flex h-10 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="MIGRAR DADOS"
              />
            </div>

            {/* Botão de ação */}
            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                disabled
                className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
              >
                <Database className="w-4 h-4 mr-2" />
                Migração desativada
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aviso importante */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="mb-2 flex min-w-0 items-start gap-2 break-words font-semibold text-red-900">
            <AlertCircle className="h-5 w-5 shrink-0" />
            ⚠️ AVISO IMPORTANTE
          </h3>
          <p className="break-words text-sm text-red-800">
            Esta operação é <strong>irreversível</strong> e irá apagar todos os dados existentes.
            Certifique-se de ter um backup se necessário antes de executar.
            Em produção, implemente um sistema de backup automático.
          </p>
        </div>
      </main>
    </div>
  );
}
