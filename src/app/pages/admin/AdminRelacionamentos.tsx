import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { obterTodosRelacionamentos, obterTodasPessoas, excluirRelacionamento } from '../../services/dataService';
import { Relacionamento } from '../../types';
import { ArrowLeft, Plus, Trash2, Heart, Users as UsersIcon } from 'lucide-react';

export function AdminRelacionamentos() {
  const navigate = useNavigate();
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [pessoasMap, setPessoasMap] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Carregar relacionamentos
    const relsData = await obterTodosRelacionamentos();
    setRelacionamentos(Array.isArray(relsData) ? relsData : []);
    
    // Carregar todas as pessoas para mapear IDs -> Nomes
    const pessoas = await obterTodasPessoas();
    const map = new Map();
    if (Array.isArray(pessoas)) {
      pessoas.forEach(p => map.set(p.id, p));
    }
    setPessoasMap(map);
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este relacionamento?')) {
      const success = await excluirRelacionamento(id);
      if (success) {
        await loadData();
      } else {
        alert('Erro ao excluir relacionamento');
      }
    }
  };

  const getRelacionamentoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'conjuge': '💑 Cônjuge',
      'pai': '👨 Pai',
      'mae': '👩 Mãe',
      'filho': '👶 Filho(a)'
    };
    return labels[tipo] || tipo;
  };

  const relacionamentosPorTipo = {
    conjuge: relacionamentos.filter(r => r.tipo_relacionamento === 'conjuge'),
    filiacao: relacionamentos.filter(r => r.tipo_relacionamento === 'filho')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-xl text-gray-900">Gerenciar Relacionamentos</h1>
          </div>
          
          <Button onClick={() => navigate('/admin/relacionamentos/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Relacionamento
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Relacionamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{relacionamentos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Casamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {relacionamentosPorTipo.conjuge.length / 2}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Filiações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {relacionamentosPorTipo.filiacao.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conjugal Relationships */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Relacionamentos Conjugais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relacionamentosPorTipo.conjuge.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum relacionamento conjugal cadastrado
                </div>
              ) : (
                relacionamentosPorTipo.conjuge
                  .filter((rel, index, self) => 
                    index === self.findIndex(r => 
                      (r.pessoa_origem_id === rel.pessoa_origem_id && r.pessoa_destino_id === rel.pessoa_destino_id) ||
                      (r.pessoa_origem_id === rel.pessoa_destino_id && r.pessoa_destino_id === rel.pessoa_origem_id)
                    )
                  )
                  .map((rel) => {
                    const pessoa1 = pessoasMap.get(rel.pessoa_origem_id);
                    const pessoa2 = pessoasMap.get(rel.pessoa_destino_id);
                    
                    return (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Heart className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {pessoa1?.nome_completo} ❤️ {pessoa2?.nome_completo}
                            </p>
                            {rel.subtipo_relacionamento && (
                              <p className="text-xs text-gray-500 mt-1">
                                Tipo: {rel.subtipo_relacionamento}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(rel.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parent-Child Relationships */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              Relacionamentos de Filiação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relacionamentosPorTipo.filiacao.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum relacionamento de filiação cadastrado
                </div>
              ) : (
                relacionamentosPorTipo.filiacao.map((rel) => {
                  const pai = pessoasMap.get(rel.pessoa_origem_id);
                  const filho = pessoasMap.get(rel.pessoa_destino_id);
                  
                  return (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {pai?.nome_completo} → {filho?.nome_completo}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rel.subtipo_relacionamento === 'adotivo' ? 'Filho(a) adotivo(a)' : 'Filho(a) biológico(a)'}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(rel.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}