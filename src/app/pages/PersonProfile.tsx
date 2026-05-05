import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { obterPessoaPorId, obterRelacionamentosDaPessoa } from '../services/dataService';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import { alternarFavorito, conteudoEstaFavoritado } from '../services/userEngagementService';
import { Pessoa } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Star,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { PersonDataView } from '../components/person/PersonDataView';
import { PersonRelationshipsView } from '../components/person/PersonRelationshipsView';
import { useAuth } from '../contexts/AuthContext';
import { canEditPerson, getLinkedPessoaIdForUser, isMainAdmin } from '../services/permissionService';

type ProfileRelationships = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

const EMPTY_RELATIONSHIPS: ProfileRelationships = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  irmaos: [],
};

export function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pessoa, setPessoa] = useState<Pessoa | undefined>();
  const [relacionamentos, setRelacionamentos] = useState<ProfileRelationships>(EMPTY_RELATIONSHIPS);
  const [loading, setLoading] = useState(true);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [favoritado, setFavoritado] = useState(false);
  const [linkedPessoaId, setLinkedPessoaId] = useState<string | null>(null);
  const canEdit = useMemo(
    () => canEditPerson({ currentUser: user, pessoaId: id, linkedPessoaId }),
    [id, linkedPessoaId, user],
  );

  useEffect(() => {
    let mounted = true;

    async function loadPerson() {
      if (!id) return;

      setLoading(true);
      setPessoa(undefined);
      setRelacionamentos(EMPTY_RELATIONSHIPS);
      setRelationshipsLoading(false);
      const pessoaData = await obterPessoaPorId(id);

      if (!mounted) return;

      setPessoa(pessoaData);
      setFavoritado(conteudoEstaFavoritado('pessoa', id));
      setLoading(false);
    }

    loadPerson();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadPermissionContext() {
      if (!user) {
        setLinkedPessoaId(null);
        return;
      }

      const { data } = await getLinkedPessoaIdForUser(user.id);
      if (mounted) setLinkedPessoaId(data);
    }

    loadPermissionContext();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function loadRelationships() {
      if (!id || pessoa?.id !== id) return;

      setRelationshipsLoading(true);
      const rels = await obterRelacionamentosDaPessoa(id);

      if (!mounted) return;

      setRelacionamentos(rels);
      setRelationshipsLoading(false);
    }

    loadRelationships();

    return () => {
      mounted = false;
    };
  }, [id, pessoa]);

  if (!id) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pessoa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Pessoa não encontrada</p>
            <Button onClick={() => navigate('/')} className="w-full mt-4">
              Voltar para a árvore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    const resultado = alternarFavorito({
      tipo: 'pessoa',
      conteudoId: pessoa.id,
      titulo: pessoa.nome_completo,
    });

    setFavoritado(resultado.active);
    toast.success(resultado.active ? 'Pessoa adicionada aos favoritos' : 'Pessoa removida dos favoritos');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para árvore
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/meus-favoritos">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Favoritos
              </Button>
            </Link>
            <Link to="/notificacoes">
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Notificações
              </Button>
            </Link>
            <Button variant="outline" onClick={handleToggleFavorite}>
              <Star className={`w-4 h-4 mr-2 ${favoritado ? 'fill-current text-yellow-500' : ''}`} />
              {favoritado ? 'Salvo' : 'Salvar'}
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => navigate(isMainAdmin(user) ? `/admin/pessoas/${id}` : '/meus-dados')}
              >
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <PersonDataView pessoa={pessoa} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <PersonRelationshipsView relationships={relacionamentos} loading={relationshipsLoading} />
          </div>

          {/* Historical Files */}
          {pessoa.arquivos_historicos && pessoa.arquivos_historicos.length > 0 && (
            <div className="md:col-span-2">
              <ArquivosHistoricos 
                arquivos={pessoa.arquivos_historicos} 
                onChange={() => {}}
                readOnly={true}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate('/')} variant="outline">
            Ver na Árvore Genealógica
          </Button>
          <Link to="/calendario-familiar">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Abrir calendário familiar
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
