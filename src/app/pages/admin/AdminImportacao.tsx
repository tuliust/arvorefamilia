import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { importarDadosFamilia } from '../../services/dataService';
import { DadosImportacao } from '../../types';
import { Upload, CheckCircle, AlertCircle, FileJson, Settings } from 'lucide-react';

export function AdminImportacao() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    pessoas: number;
    relacionamentos: number;
    erros: string[];
  } | null>(null);

  const handleImportar = async () => {
    setLoading(true);
    setResultado(null);
    
    try {
      const dados: DadosImportacao[] = JSON.parse(jsonInput);
      const result = await importarDadosFamilia(dados);
      
      setResultado({
        sucesso: result.sucesso || false,
        pessoas: result.pessoas?.length || 0,
        relacionamentos: result.relacionamentos?.length || 0,
        erros: result.erros || []
      });
    } catch (error) {
      setResultado({
        sucesso: false,
        pessoas: 0,
        relacionamentos: 0,
        erros: [`Erro ao processar JSON: ${error.message}`]
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleData = `[
  {
    "Nome completo": "João da Silva",
    "Data de nascimento": 1980,
    "Local de Nascimento": "São Paulo/SP",
    "Pai": "José da Silva",
    "Mãe": "Maria da Silva",
    "Cônjuge": "Ana Santos",
    "Filho (a) de (de sangue; adotivo": "Sangue",
    "Humano ou pet": "Humano"
  }
]`;

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Importar Dados"
        subtitle="Carga administrativa de pessoas e relacionamentos por JSON"
        icon={FileJson}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
        ]}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Instructions */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex min-w-0 items-center gap-2 break-words">
              <FileJson className="h-5 w-5 shrink-0" />
              Como Importar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none break-words">
              <p className="text-gray-600">
                Cole um array JSON com os dados das pessoas seguindo o formato abaixo. 
                O sistema criará automaticamente os relacionamentos baseado nos nomes.
              </p>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Campos disponíveis:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Nome completo</strong>: Nome da pessoa (obrigatório)</li>
                <li><strong>Data de nascimento</strong>: Ano ou data completa</li>
                <li><strong>Local de Nascimento</strong>: Cidade/Estado</li>
                <li><strong>Data de falecimento</strong>: Ano ou data</li>
                <li><strong>Local de falecimento</strong>: Cidade/Estado</li>
                <li><strong>Pai</strong>: Nome completo do pai</li>
                <li><strong>Mãe</strong>: Nome completo da mãe</li>
                <li><strong>Cônjuge</strong>: Nome completo do cônjuge</li>
                <li><strong>Filho (a) de (de sangue; adotivo</strong>: "Sangue" ou "Adotivo"</li>
                <li><strong>Humano ou pet</strong>: "Humano" ou "Pet"</li>
              </ul>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
              <pre className="text-xs">
                {exampleData}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Import Form */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Cole o JSON para Importar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={15}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm"
              placeholder="Cole o JSON aqui..."
            />
            
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button onClick={handleImportar} disabled={!jsonInput.trim() || loading} className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Importando...' : 'Importar Dados'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setJsonInput(exampleData)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Usar Exemplo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setJsonInput('');
                  setResultado(null);
                }}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {resultado && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex min-w-0 items-center gap-2 break-words">
                {resultado.sucesso ? (
                  <>
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    Importação Concluída
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    Erro na Importação
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultado.sucesso && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="break-words text-sm text-green-800">
                      ✅ <strong>{resultado.pessoas}</strong> pessoas importadas
                    </p>
                    <p className="break-words text-sm text-green-800">
                      ✅ <strong>{resultado.relacionamentos}</strong> relacionamentos criados
                    </p>
                  </div>

                  <Button onClick={() => navigate('/admin/pessoas')} className="w-full sm:w-auto">
                    Ver Pessoas Importadas
                  </Button>
                </div>
              )}

              {resultado.erros.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="mb-2 break-words font-semibold text-amber-900">Avisos e Erros:</h4>
                  <ul className="space-y-1">
                    {resultado.erros.map((erro, index) => (
                      <li key={index} className="break-words text-sm text-amber-800">
                        • {erro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Dicas Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 break-words text-sm text-gray-600">
              <li>✓ Os nomes devem ser exatamente iguais para criar relacionamentos</li>
              <li>✓ Nomes provisórios (ex: "Mulher de João") são aceitos</li>
              <li>✓ Campos vazios são permitidos e podem ser preenchidos depois</li>
              <li>✓ A importação não sobrescreve dados existentes</li>
              <li>✓ Relacionamentos duplicados são automaticamente evitados</li>
              <li>✓ Use "Sangue" ou "Adotivo" para especificar o tipo de filiação</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
