import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Bell, CalendarDays, LogOut, Star, UserCircle2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { buildMemberTreeSummary } from '../services/memberTreeService';
import { Pessoa, Relacionamento } from '../types';
import { toast } from 'sonner';

function PeopleList({ title, items }: { title: string; items: Pessoa[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/pessoa/${item.id}`}
              className="block rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
            >
              <p className="font-semibold text-gray-900 text-sm">{item.nome_completo}</p>
              {item.local_nascimento && <p className="text-xs text-gray-500 mt-1">{item.local_nascimento}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MinhaArvore() {
  const { user, signOut } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const [pessoasData, relacionamentosData] = await Promise.all([
        obterTodasPessoas(),
        obterTodosRelacionamentos(),
      ]);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
      setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
      setLoading(false);
    };

    carregar();
  }, []);

  const pessoaBase = useMemo(() => {
    if (pessoas.length === 0) return undefined;
    const email = user?.email?.toLowerCase() ?? '';
    return pessoas.find((pessoa) => {
      const rede = String(pessoa.rede_social ?? '').toLowerCase();
      const telefone = String(pessoa.telefone ?? '').toLowerCase();
      return email && (rede.includes(email) || telefone.includes(email));
    }) ?? pessoas[0];
  }, [pessoas, user]);

  const resumo = useMemo(() => buildMemberTreeSummary(pessoaBase?.id, pessoas, relacionamentos), [pessoaBase, pessoas, relacionamentos]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Sessão encerrada.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Árvore</h1>
            <p className="text-sm text-gray-500">Área inicial do membro autenticado</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" />
                Árvore geral
              </button>
            </Link>
            <Link to="/calendario-familiar">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <CalendarDays className="w-4 h-4" />
                Calendário
              </button>
            </Link>
            <Link to="/meus-favoritos">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Star className="w-4 h-4" />
                Favoritos
              </button>
            </Link>
            <Link to="/notificacoes">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Bell className="w-4 h-4" />
                Notificações
              </button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)] gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <UserCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conta autenticada</p>
                <h2 className="text-2xl font-bold text-gray-900">{user?.user_metadata?.nome_exibicao || user?.email || 'Membro da família'}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Esta área será a base para a futura visualização personalizada da árvore, com foco no usuário logado.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Pessoas</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{pessoas.length}</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">Pais</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{resumo.pais.length}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Irmãos</p>
                <p className="text-2xl font-bold text-amber-900 mt-2">{resumo.irmaos.length}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="text-xs uppercase tracking-wide text-purple-700 font-semibold">Filhos</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">{resumo.filhos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pessoa base da sessão</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Carregando dados...</p>
            ) : resumo.pessoaBase ? (
              <div className="space-y-3">
                <p className="text-xl font-bold text-gray-900">{resumo.pessoaBase.nome_completo}</p>
                {resumo.pessoaBase.local_nascimento && <p className="text-sm text-gray-500">{resumo.pessoaBase.local_nascimento}</p>}
                <Link
                  to={`/pessoa/${resumo.pessoaBase.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  Abrir perfil dessa pessoa
                </Link>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Observação: nesta fase inicial, a associação ainda usa uma heurística temporária. O próximo passo é ligar o usuário autenticado ao vínculo real na tabela `user_person_links`.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma pessoa base encontrada ainda.</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <PeopleList title="Pais" items={resumo.pais} />
          <PeopleList title="Irmãos" items={resumo.irmaos} />
          <PeopleList title="Cônjuges" items={resumo.conjuges} />
          <PeopleList title="Filhos" items={resumo.filhos} />
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Próximos passos desta área</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="rounded-xl border border-gray-200 p-4">Vincular o usuário autenticado a uma pessoa real na tabela <code>user_person_links</code>.</div>
            <div className="rounded-xl border border-gray-200 p-4">Filtrar a árvore por família direta, ramo materno e ramo paterno.</div>
            <div className="rounded-xl border border-gray-200 p-4">Transformar esta área em ponto de entrada para favoritos, notificações, eventos e calendário pessoal.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
