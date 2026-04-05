import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { FamilyTree } from '../components/FamilyTree/FamilyTree';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { obterTodasPessoas, obterTodosRelacionamentos, buscarPessoas } from '../services/dataService';
import { Pessoa, Relacionamento } from '../types';
import { Search, Users, Home as HomeIcon, Settings, ChevronLeft, ChevronRight, MapPin, Heart, Activity } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar quais tipos de linhas são exibidas
  const [edgeFilters, setEdgeFilters] = useState({
    conjugal: true,
    filiacao_sangue: true,
    filiacao_adotiva: true,
    irmaos: true,
  });

  // Estado para filtrar tipos de pessoas
  const [personFilters, setPersonFilters] = useState({
    vivos: true,
    falecidos: true,
    pets: true,
  });

  // Carregar dados inicialmente
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [pessoasData, relacionamentosData] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos()
        ]);
        
        setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
        setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setPessoas([]);
        setRelacionamentos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Atualizar busca quando searchTerm mudar
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setPessoasFiltradas([]);
      } else {
        const resultados = await buscarPessoas(searchTerm);
        setPessoasFiltradas(Array.isArray(resultados) ? resultados : []);
      }
    };
    
    // Debounce a busca para evitar muitas chamadas
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePersonClick = React.useCallback((pessoa: Pessoa) => {
    setSelectedPersonId(pessoa.id);
    navigate(`/pessoa/${pessoa.id}`);
  }, [navigate]);

  const handleSearchSelect = React.useCallback((pessoa: Pessoa) => {
    setSelectedPersonId(pessoa.id);
    setSearchTerm('');
  }, []);
  
  const toggleFilter = (filterKey: keyof typeof edgeFilters) => {
    setEdgeFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const togglePersonFilter = (filterKey: keyof typeof personFilters) => {
    setPersonFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Aplicar filtros de pessoas
  const pessoasVisiveis = useMemo(() => {
    return pessoas.filter(pessoa => {
      if (pessoa.humano_ou_pet === 'Pet') {
        return personFilters.pets;
      }
      if (pessoa.data_falecimento) {
        return personFilters.falecidos;
      }
      return personFilters.vivos;
    });
  }, [pessoas, personFilters]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const pessoasVivas = pessoas.filter(p => p.humano_ou_pet === 'Humano' && !p.data_falecimento);
    const pessoasFalecidas = pessoas.filter(p => p.humano_ou_pet === 'Humano' && p.data_falecimento);
    const pets = pessoas.filter(p => p.humano_ou_pet === 'Pet');
    
    // Casados - contar pessoas que têm relacionamento conjugal
    const pessoasComConjuge = new Set<string>();
    relacionamentos.filter(r => r.tipo_relacionamento === 'conjuge').forEach(r => {
      if (r.pessoa_origem_id) pessoasComConjuge.add(r.pessoa_origem_id);
      if (r.pessoa_destino_id) pessoasComConjuge.add(r.pessoa_destino_id);
    });
    
    // Cidades de nascimento
    const cidadesNascimento = new Map<string, number>();
    pessoas.forEach(p => {
      if (p.local_nascimento && p.humano_ou_pet === 'Humano') {
        const count = cidadesNascimento.get(p.local_nascimento) || 0;
        cidadesNascimento.set(p.local_nascimento, count + 1);
      }
    });
    
    // Cidades onde vivem atualmente (considerando pessoas vivas)
    const cidadesAtuais = new Set<string>();
    pessoasVivas.forEach(p => {
      if (p.local_atual) {
        cidadesAtuais.add(p.local_atual);
      }
    });

    // Ordenar cidades de nascimento por quantidade
    const topCidadesNascimento = Array.from(cidadesNascimento.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalPessoas: pessoas.length,
      pessoasVivas: pessoasVivas.length,
      pessoasFalecidas: pessoasFalecidas.length,
      pets: pets.length,
      casados: pessoasComConjuge.size,
      cidadesNascimento: topCidadesNascimento,
      cidadesAtuais: cidadesAtuais.size,
    };
  }, [pessoas, relacionamentos]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Árvore Genealógica</h1>
              <p className="text-sm text-gray-500">Família Limeira Souza</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              
              {searchTerm && pessoasFiltradas.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                  {pessoasFiltradas.map((pessoa) => (
                    <button
                      key={pessoa.id}
                      onClick={() => handleSearchSelect(pessoa)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-900">{pessoa.nome_completo}</p>
                      {pessoa.local_nascimento && (
                        <p className="text-xs text-gray-500 mt-1">📍 {pessoa.local_nascimento}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              title="Voltar para a árvore"
            >
              <HomeIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/login')}
              title="Painel Administrativo"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Family Tree + Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar de Estatísticas */}
        <div 
          className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-lg overflow-y-auto ${
            sidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          {sidebarOpen && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Informações Gerais</h2>
                <p className="text-sm text-gray-500">Estatísticas da família</p>
              </div>

              {/* Estatísticas Principais */}
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{stats.totalPessoas}</p>
                      <p className="text-sm text-blue-600">Total de membros</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{stats.pessoasVivas}</p>
                      <p className="text-sm text-green-600">Pessoas vivas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{stats.casados}</p>
                      <p className="text-sm text-purple-600">Pessoas casadas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🐾</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{stats.pets}</p>
                      <p className="text-sm text-amber-600">Pets da família</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-700">{stats.cidadesAtuais}</p>
                      <p className="text-sm text-cyan-600">Cidades atuais</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cidades de Nascimento */}
              {stats.cidadesNascimento.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Principais cidades de nascimento
                  </h3>
                  <div className="space-y-2">
                    {stats.cidadesNascimento.map(([cidade, count]) => (
                      <div key={cidade} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 font-medium">{cidade}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outras Estatísticas */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Outros dados</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Pessoas falecidas:</span>
                    <span className="font-semibold text-gray-900">{stats.pessoasFalecidas}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button para Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
          style={{ left: sidebarOpen ? '320px' : '0px' }}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Family Tree */}
        <main className="flex-1 relative overflow-hidden h-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando árvore genealógica...</p>
              </div>
            </div>
          ) : (
            <FamilyTree
              pessoas={pessoasVisiveis}
              relacionamentos={relacionamentos}
              onPersonClick={handlePersonClick}
              selectedPersonId={selectedPersonId}
              edgeFilters={edgeFilters}
            />
          )}
        </main>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm" style={{ left: sidebarOpen ? '344px' : '24px' }}>
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Legenda</h3>
        
        {/* Tipos de Linhas */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Tipos de Linhas:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={edgeFilters.conjugal}
                onChange={() => toggleFilter('conjugal')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div className="w-6 h-0.5 bg-emerald-500"></div>
              <span className="text-xs text-gray-700">Relacionamento conjugal</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={edgeFilters.filiacao_sangue}
                onChange={() => toggleFilter('filiacao_sangue')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div className="w-6 h-1 border-t-2 border-dashed border-emerald-500"></div>
              <span className="text-xs text-gray-700">Filiação (sangue)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={edgeFilters.filiacao_adotiva}
                onChange={() => toggleFilter('filiacao_adotiva')}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="w-6 h-1 border-t-2 border-dashed border-purple-600"></div>
              <span className="text-xs text-gray-700">Filiação (adotiva)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={edgeFilters.irmaos}
                onChange={() => toggleFilter('irmaos')}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <div className="w-6 h-1 border-t-2 border-dashed border-orange-500"></div>
              <span className="text-xs text-gray-700">Irmãos</span>
            </label>
          </div>
        </div>
        
        {/* Filtros de Pessoas */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Filtrar por tipo:</p>
          <div className="space-y-2">
            <button
              onClick={() => togglePersonFilter('vivos')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                personFilters.vivos 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-gray-100 border-2 border-transparent opacity-50'
              }`}
            >
              <div className="w-6 h-6 rounded-md border-2 border-blue-500 bg-white"></div>
              <span className="text-xs text-gray-700 font-medium">Pessoa viva</span>
            </button>
            
            <button
              onClick={() => togglePersonFilter('falecidos')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                personFilters.falecidos 
                  ? 'bg-purple-50 border-2 border-purple-500' 
                  : 'bg-gray-100 border-2 border-transparent opacity-50'
              }`}
            >
              <div className="w-6 h-6 rounded-md border-2 border-purple-500 bg-white"></div>
              <span className="text-xs text-gray-700 font-medium">Pessoa falecida</span>
            </button>
            
            <button
              onClick={() => togglePersonFilter('pets')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                personFilters.pets 
                  ? 'bg-yellow-50 border-2 border-yellow-500' 
                  : 'bg-gray-100 border-2 border-transparent opacity-50'
              }`}
            >
              <div className="w-6 h-6 rounded-md border-2 border-yellow-500 bg-white"></div>
              <span className="text-xs text-gray-700 font-medium">Pet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats - Remover o painel inferior já que teremos sidebar */}
    </div>
  );
}