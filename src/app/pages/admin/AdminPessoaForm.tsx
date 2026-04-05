import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { adicionarPessoa, atualizarPessoa, obterPessoaPorId, adicionarRelacionamento, obterTodasPessoas } from '../../services/dataService';
import { TipoEntidade, ArquivoHistorico, Pessoa, TipoRelacionamento, SubtipoRelacionamento } from '../../types';
import { ArrowLeft, Save, Plus, X, User, Search } from 'lucide-react';
import { FotoUpload } from '../../components/FotoUpload';
import { ColorPicker } from '../../components/ColorPicker';
import { ArquivosHistoricos } from '../../components/ArquivosHistoricos';
import { RelacionamentoManagerWrapper } from '../../components/RelacionamentoManagerWrapper';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { formatarTelefone } from '../../utils/telefone';
import { toast } from 'sonner';

// Interface para relacionamentos pendentes (antes de salvar)
interface RelacionamentoPendente {
  pessoa: Pessoa;
  tipo: TipoRelacionamento;
  subtipo: SubtipoRelacionamento;
}

export function AdminPessoaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    local_nascimento: '',
    data_falecimento: '',
    local_falecimento: '',
    local_atual: '',
    foto_principal_url: '',
    humano_ou_pet: 'Humano' as TipoEntidade,
    cor_bg_card: '',
    minibio: '',
    curiosidades: '',
    telefone: '',
    endereco: '',
    rede_social: '',
    arquivos_historicos: [] as ArquivoHistorico[]
  });

  const [initialData, setInitialData] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para adicionar relacionamentos durante criação
  const [relacionamentosPendentes, setRelacionamentosPendentes] = useState<RelacionamentoPendente[]>([]);
  const [showAddRelDialog, setShowAddRelDialog] = useState(false);
  const [todasPessoas, setTodasPessoas] = useState<Pessoa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoRelSelecionado, setTipoRelSelecionado] = useState<TipoRelacionamento>('pai');
  const [subtipoRelSelecionado, setSubtipoRelSelecionado] = useState<SubtipoRelacionamento>('sangue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar se a pessoa está falecida
  const isFalecido = !!(formData.data_falecimento || formData.local_falecimento);

  useEffect(() => {
    if (isEdit && id) {
      const loadPessoa = async () => {
        const pessoa = await obterPessoaPorId(id);
        if (pessoa) {
          const data = {
            nome_completo: pessoa.nome_completo,
            data_nascimento: pessoa.data_nascimento?.toString() || '',
            local_nascimento: pessoa.local_nascimento || '',
            data_falecimento: pessoa.data_falecimento?.toString() || '',
            local_falecimento: pessoa.local_falecimento || '',
            local_atual: pessoa.local_atual || '',
            foto_principal_url: pessoa.foto_principal_url || '',
            humano_ou_pet: pessoa.humano_ou_pet,
            cor_bg_card: pessoa.cor_bg_card || '',
            minibio: pessoa.minibio || '',
            curiosidades: pessoa.curiosidades || '',
            telefone: pessoa.telefone || '',
            endereco: pessoa.endereco || '',
            rede_social: pessoa.rede_social || '',
            arquivos_historicos: pessoa.arquivos_historicos || []
          };
          setFormData(data);
          setInitialData(JSON.stringify(data));
        }
      };
      loadPessoa();
    } else {
      setInitialData(JSON.stringify(formData));
      // Carregar todas pessoas para permitir adicionar relacionamentos durante criação
      loadTodasPessoas();
    }
  }, [isEdit, id]);

  const loadTodasPessoas = async () => {
    try {
      const pessoas = await obterTodasPessoas();
      setTodasPessoas(pessoas);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  // Verificar se há mudanças
  useEffect(() => {
    const currentData = JSON.stringify(formData);
    setHasChanges(currentData !== initialData || relacionamentosPendentes.length > 0);
  }, [formData, initialData, relacionamentosPendentes]);

  // Hook para detectar tentativa de sair sem salvar
  const { showPrompt, confirmNavigation, cancelNavigation } = useUnsavedChanges(hasChanges);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Remover arquivos_historicos do payload pois é uma tabela separada
      const { arquivos_historicos, ...pessoaDadosSemArquivos } = formData;
      
      const pessoaData = {
        ...pessoaDadosSemArquivos,
        data_nascimento: formData.data_nascimento || undefined,
        data_falecimento: formData.data_falecimento || undefined,
      };

      let pessoaCriada: Pessoa | undefined;

      if (isEdit && id) {
        pessoaCriada = await atualizarPessoa(id, pessoaData);
        if (pessoaCriada) {
          toast.success('Pessoa atualizada com sucesso!');
        } else {
          toast.error('Erro ao atualizar pessoa');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Criar nova pessoa
        pessoaCriada = await adicionarPessoa(pessoaData);
        
        if (pessoaCriada) {
          toast.success('Pessoa criada com sucesso!');
          
          // Se houver relacionamentos pendentes, criar agora
          if (relacionamentosPendentes.length > 0) {
            toast.info('Criando relacionamentos...');
            let relsCriados = 0;
            
            for (const relPendente of relacionamentosPendentes) {
              try {
                // Criar relacionamento direto
                await adicionarRelacionamento({
                  pessoa_origem_id: pessoaCriada.id,
                  pessoa_destino_id: relPendente.pessoa.id,
                  tipo_relacionamento: relPendente.tipo,
                  subtipo_relacionamento: relPendente.subtipo,
                });

                // Criar relacionamento inverso (bidirecional)
                let tipoInverso: TipoRelacionamento = relPendente.tipo;
                
                if (relPendente.tipo === 'pai' || relPendente.tipo === 'mae') {
                  tipoInverso = 'filho';
                } else if (relPendente.tipo === 'filho') {
                  tipoInverso = 'pai'; // Assumir pai por padrão
                }
                // Para cônjuge e irmão, o tipo inverso é o mesmo

                await adicionarRelacionamento({
                  pessoa_origem_id: relPendente.pessoa.id,
                  pessoa_destino_id: pessoaCriada.id,
                  tipo_relacionamento: tipoInverso,
                  subtipo_relacionamento: relPendente.subtipo,
                });
                
                relsCriados++;
              } catch (error) {
                console.error('Erro ao criar relacionamento:', error);
              }
            }
            
            toast.success(`${relsCriados} relacionamento(s) criado(s)!`);
          }
        } else {
          toast.error('Erro ao criar pessoa. Verifique os dados e tente novamente.');
          setIsSubmitting(false);
          return;
        }
      }

      // Resetar detecção de mudanças antes de navegar
      setHasChanges(false);
      navigate('/admin/pessoas');
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | ArquivoHistorico[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatarTelefone(value);
    handleChange('telefone', formatted);
  };

  const handleAdicionarRelacionamentoPendente = (pessoa: Pessoa) => {
    // Verificar se já existe
    const jaExiste = relacionamentosPendentes.some(r => r.pessoa.id === pessoa.id);
    if (jaExiste) {
      toast.warning('Esta pessoa já está na lista de relacionamentos');
      return;
    }

    setRelacionamentosPendentes(prev => [...prev, {
      pessoa,
      tipo: tipoRelSelecionado,
      subtipo: subtipoRelSelecionado,
    }]);

    setShowAddRelDialog(false);
    setSearchTerm('');
    toast.success(`${pessoa.nome_completo} adicionado(a) à lista`);
  };

  const handleRemoverRelacionamentoPendente = (pessoaId: string) => {
    setRelacionamentosPendentes(prev => prev.filter(r => r.pessoa.id !== pessoaId));
  };

  const getTipoLabel = (tipo: TipoRelacionamento) => {
    const labels = {
      pai: 'Pai',
      mae: 'Mãe',
      conjuge: 'Cônjuge',
      filho: 'Filho(a)',
      irmao: 'Irmão(ã)',
    };
    return labels[tipo] || tipo;
  };

  const pessoasFiltradas = todasPessoas.filter(p => {
    // Excluir pessoas já na lista pendente
    const jaNaLista = relacionamentosPendentes.some(r => r.pessoa.id === p.id);
    if (jaNaLista) return false;

    // Filtrar por busca
    if (searchTerm) {
      return p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pessoas')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-xl text-gray-900">
              {isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}
            </h1>
          </div>
          
          <Button form="pessoa-form" type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form id="pessoa-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Foto Principal - PRIMEIRO */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <FotoUpload
                value={formData.foto_principal_url}
                onChange={(url) => handleChange('foto_principal_url', url)}
              />
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => handleChange('nome_completo', e.target.value)}
                  required
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.humano_ou_pet}
                    onChange={(e) => handleChange('humano_ou_pet', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="Humano">Humano</option>
                    <option value="Pet">Pet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Card (opcional)
                  </label>
                  <ColorPicker
                    value={formData.cor_bg_card}
                    onChange={(color) => handleChange('cor_bg_card', color)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datas e Locais */}
          <Card>
            <CardHeader>
              <CardTitle>Datas e Locais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <Input
                    type="text"
                    value={formData.data_nascimento}
                    onChange={(e) => handleChange('data_nascimento', e.target.value)}
                    placeholder="Ex: 1990 ou 15/03/1990"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local de Nascimento
                  </label>
                  <Input
                    type="text"
                    value={formData.local_nascimento}
                    onChange={(e) => handleChange('local_nascimento', e.target.value)}
                    placeholder="Ex: São Paulo/SP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Falecimento
                  </label>
                  <Input
                    type="text"
                    value={formData.data_falecimento}
                    onChange={(e) => handleChange('data_falecimento', e.target.value)}
                    placeholder="Ex: 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local de Falecimento
                  </label>
                  <Input
                    type="text"
                    value={formData.local_falecimento}
                    onChange={(e) => handleChange('local_falecimento', e.target.value)}
                    placeholder="Ex: Rio de Janeiro/RJ"
                  />
                </div>

                {!isFalecido && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local Atual (residência)
                    </label>
                    <Input
                      type="text"
                      value={formData.local_atual}
                      onChange={(e) => handleChange('local_atual', e.target.value)}
                      placeholder="Ex: Belo Horizonte/MG"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Biografia */}
          <Card>
            <CardHeader>
              <CardTitle>Biografia e Curiosidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mini Biografia
                </label>
                <textarea
                  value={formData.minibio}
                  onChange={(e) => handleChange('minibio', e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Breve biografia da pessoa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curiosidades
                </label>
                <textarea
                  value={formData.curiosidades}
                  onChange={(e) => handleChange('curiosidades', e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Fatos interessantes, hobbies, conquistas..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato - Não exibir se pessoa falecida */}
          {!isFalecido && (
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rede Social / Site
                    </label>
                    <Input
                      type="url"
                      value={formData.rede_social}
                      onChange={(e) => handleChange('rede_social', e.target.value)}
                      placeholder="https://instagram.com/usuario"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <Input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Arquivos Históricos */}
          <ArquivosHistoricos
            arquivos={formData.arquivos_historicos}
            onChange={(arquivos) => handleChange('arquivos_historicos', arquivos)}
          />

          {/* Relacionamentos Pendentes - Para NOVA pessoa */}
          {!isEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Relacionamentos Familiares (opcional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Defina os relacionamentos que serão criados automaticamente após salvar a pessoa.
                </p>

                {/* Seção de Pais - CAMPOS SEPARADOS */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">👨‍👩‍👦 Filiação (Pais)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campo Pai */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pai
                      </label>
                      <div className="space-y-2">
                        {/* Mostrar pai selecionado */}
                        {relacionamentosPendentes.find(r => r.tipo === 'pai') ? (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            {relacionamentosPendentes.find(r => r.tipo === 'pai')?.pessoa.foto_principal_url ? (
                              <img 
                                src={relacionamentosPendentes.find(r => r.tipo === 'pai')?.pessoa.foto_principal_url} 
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="flex-1 text-sm font-medium">
                              {relacionamentosPendentes.find(r => r.tipo === 'pai')?.pessoa.nome_completo}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const pai = relacionamentosPendentes.find(r => r.tipo === 'pai');
                                if (pai) handleRemoverRelacionamentoPendente(pai.pessoa.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTipoRelSelecionado('pai');
                              setSubtipoRelSelecionado('sangue');
                              setShowAddRelDialog(true);
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Selecionar Pai
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Campo Mãe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mãe
                      </label>
                      <div className="space-y-2">
                        {/* Mostrar mãe selecionada */}
                        {relacionamentosPendentes.find(r => r.tipo === 'mae') ? (
                          <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg border border-pink-200">
                            {relacionamentosPendentes.find(r => r.tipo === 'mae')?.pessoa.foto_principal_url ? (
                              <img 
                                src={relacionamentosPendentes.find(r => r.tipo === 'mae')?.pessoa.foto_principal_url} 
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="flex-1 text-sm font-medium">
                              {relacionamentosPendentes.find(r => r.tipo === 'mae')?.pessoa.nome_completo}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const mae = relacionamentosPendentes.find(r => r.tipo === 'mae');
                                if (mae) handleRemoverRelacionamentoPendente(mae.pessoa.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTipoRelSelecionado('mae');
                              setSubtipoRelSelecionado('sangue');
                              setShowAddRelDialog(true);
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Selecionar Mãe
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção de Outros Relacionamentos */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">💍 Outros Relacionamentos</h3>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => {
                        setTipoRelSelecionado('conjuge');
                        setSubtipoRelSelecionado('casamento');
                        setShowAddRelDialog(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de outros relacionamentos (exceto pai/mae) */}
                  {relacionamentosPendentes.filter(r => r.tipo !== 'pai' && r.tipo !== 'mae').length > 0 && (
                    <div className="space-y-2">
                      {relacionamentosPendentes
                        .filter(r => r.tipo !== 'pai' && r.tipo !== 'mae')
                        .map((rel) => (
                          <div 
                            key={rel.pessoa.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            {rel.pessoa.foto_principal_url ? (
                              <img 
                                src={rel.pessoa.foto_principal_url} 
                                alt={rel.pessoa.nome_completo}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{rel.pessoa.nome_completo}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {getTipoLabel(rel.tipo)} • {rel.subtipo}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverRelacionamentoPendente(rel.pessoa.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="w-5 h-5\" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Diálogo de adicionar relacionamento */}
                {showAddRelDialog && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">
                        Selecionar {getTipoLabel(tipoRelSelecionado)}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRelDialog(false);
                          setSearchTerm('');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tipo e Subtipo - APENAS para outros relacionamentos (não pai/mãe) */}
                    {tipoRelSelecionado !== 'pai' && tipoRelSelecionado !== 'mae' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo
                          </label>
                          <select
                            value={tipoRelSelecionado}
                            onChange={(e) => setTipoRelSelecionado(e.target.value as TipoRelacionamento)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="conjuge">Cônjuge</option>
                            <option value="filho">Filho(a)</option>
                            <option value="irmao">Irmão(ã)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtipo
                          </label>
                          <select
                            value={subtipoRelSelecionado}
                            onChange={(e) => setSubtipoRelSelecionado(e.target.value as SubtipoRelacionamento)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          >
                            {(tipoRelSelecionado === 'conjuge') ? (
                              <>
                                <option value="casamento">Casamento</option>
                                <option value="uniao">União Estável</option>
                                <option value="separado">Separado</option>
                              </>
                            ) : (
                              <>
                                <option value="sangue">Sangue</option>
                                <option value="adotivo">Adotivo</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Para pai/mãe, mostrar apenas o subtipo */}
                    {(tipoRelSelecionado === 'pai' || tipoRelSelecionado === 'mae') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Filiação
                        </label>
                        <select
                          value={subtipoRelSelecionado}
                          onChange={(e) => setSubtipoRelSelecionado(e.target.value as SubtipoRelacionamento)}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="sangue">Biológico</option>
                          <option value="adotivo">Adotivo</option>
                        </select>
                      </div>
                    )}

                    {/* Busca de pessoa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar Pessoa
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Digite o nome..."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Lista de pessoas */}
                    {searchTerm && (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
                        {pessoasFiltradas.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Nenhuma pessoa encontrada
                          </div>
                        ) : (
                          <div className="divide-y">
                            {pessoasFiltradas.map(pessoa => (
                              <button
                                key={pessoa.id}
                                type="button"
                                onClick={() => handleAdicionarRelacionamentoPendente(pessoa)}
                                className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                              >
                                {pessoa.foto_principal_url ? (
                                  <img 
                                    src={pessoa.foto_principal_url} 
                                    alt={pessoa.nome_completo}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{pessoa.nome_completo}</p>
                                  {pessoa.data_nascimento && (
                                    <p className="text-xs text-gray-500">{pessoa.data_nascimento}</p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Relacionamentos - Apenas para edição */}
          {isEdit && id && (
            <RelacionamentoManagerWrapper
              pessoaId={id}
              pessoaNome={formData.nome_completo}
              onChange={() => {
                // Opcional: atualizar página ou recarregar dados
                console.log('Relacionamento atualizado');
              }}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/pessoas')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Pessoa
            </Button>
          </div>
        </form>
      </main>

      {/* Unsaved Changes Dialog */}
      <ConfirmDialog
        open={showPrompt}
        onOpenChange={(open) => !open && cancelNavigation()}
        title="Alterações não salvas"
        description="Você fez alterações que não foram salvas. Deseja realmente sair sem salvar?"
        confirmText="Sair sem salvar"
        cancelText="Continuar editando"
        onConfirm={confirmNavigation}
        variant="warning"
      />
    </div>
  );
}