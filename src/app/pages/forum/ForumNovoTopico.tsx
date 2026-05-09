import React, { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AppLink as Link } from '../../components/AppLink';
import { ArrowLeft, Check, ChevronDown, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas } from '../../services/dataService';
import { criarTopicoForum, listarCategoriasForum, vincularPessoasAoTopico } from '../../services/forumService';
import { ForumCategoria, ForumTopicoTipo, Pessoa } from '../../types';

const TIPO_OPTIONS: Array<{ value: ForumTopicoTipo; label: string }> = [
  { value: 'pergunta', label: 'Pergunta' },
  { value: 'discussao', label: 'Discussão' },
  { value: 'aviso', label: 'Aviso' },
  { value: 'memoria', label: 'Memória' },
  { value: 'ajuda', label: 'Ajuda' },
];

function criarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function ForumNovoTopico() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<ForumCategoria[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tipo, setTipo] = useState<ForumTopicoTipo>('discussao');
  const [conteudo, setConteudo] = useState('');
  const [selectedRelatedPersonIds, setSelectedRelatedPersonIds] = useState<string[]>([]);
  const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [mentionCursorIndex, setMentionCursorIndex] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let mounted = true;
    const pessoaIdParam = searchParams.get('pessoaId') ?? '';

    async function carregar() {
      const [categoriasData, pessoasData] = await Promise.all([
        listarCategoriasForum(),
        obterTodasPessoas(),
      ]);

      if (!mounted) return;
      setCategorias(categoriasData);
      setPessoas(pessoasData);
      setCategoriaId(categoriasData[0]?.id ?? '');
      if (pessoaIdParam && pessoasData.some((pessoa) => pessoa.id === pessoaIdParam)) {
        setSelectedRelatedPersonIds([pessoaIdParam]);
      }
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const selectedRelatedPeople = useMemo(
    () => pessoas.filter((pessoa) => selectedRelatedPersonIds.includes(pessoa.id)),
    [pessoas, selectedRelatedPersonIds]
  );

  const relatedSummary = useMemo(() => {
    if (selectedRelatedPersonIds.length === 0) return 'Nenhuma pessoa selecionada';
    if (selectedRelatedPersonIds.length === 1) return '1 pessoa selecionada';
    return `${selectedRelatedPersonIds.length} pessoas selecionadas`;
  }, [selectedRelatedPersonIds.length]);

  const filteredMentionPeople = useMemo(() => {
    const query = normalizeSearch(mentionQuery);
    return pessoas
      .filter((pessoa) => {
        if (!query) return true;
        return normalizeSearch(pessoa.nome_completo).includes(query);
      })
      .slice(0, 8);
  }, [pessoas, mentionQuery]);

  function toggleRelatedPerson(personId: string) {
    setSelectedRelatedPersonIds((current) =>
      current.includes(personId)
        ? current.filter((id) => id !== personId)
        : [...current, personId]
    );
  }

  function addRelatedPerson(personId: string) {
    setSelectedRelatedPersonIds((current) =>
      current.includes(personId) ? current : [...current, personId]
    );
  }

  function detectMention(text: string, cursorPosition: number) {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/(^|\s)@([\p{L}\p{N}_-]*)$/u);

    if (!match) {
      setMentionOpen(false);
      setMentionQuery('');
      setMentionStartIndex(null);
      setMentionCursorIndex(null);
      return;
    }

    const query = match[2] || '';
    const startIndex = cursorPosition - query.length - 1;

    setMentionOpen(true);
    setMentionQuery(query);
    setMentionStartIndex(startIndex);
    setMentionCursorIndex(cursorPosition);
    setSelectedMentionIndex(0);
  }

  function handleConteudoChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextText = event.target.value;
    const cursorPosition = event.target.selectionStart ?? nextText.length;
    setConteudo(nextText);
    detectMention(nextText, cursorPosition);
  }

  function insertMention(pessoa: Pessoa) {
    if (mentionStartIndex === null || mentionCursorIndex === null) return;

    const before = conteudo.slice(0, mentionStartIndex);
    const after = conteudo.slice(mentionCursorIndex);
    const mentionText = `@${pessoa.nome_completo}`;
    const nextText = `${before}${mentionText} ${after}`;
    const nextCursor = before.length + mentionText.length + 1;

    setConteudo(nextText);
    setMentionOpen(false);
    setMentionQuery('');
    setMentionStartIndex(null);
    setMentionCursorIndex(null);
    addRelatedPerson(pessoa.id);

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleConteudoKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!mentionOpen || filteredMentionPeople.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedMentionIndex((current) => (current + 1) % filteredMentionPeople.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedMentionIndex((current) =>
        current === 0 ? filteredMentionPeople.length - 1 : current - 1
      );
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      insertMention(filteredMentionPeople[selectedMentionIndex]);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setMentionOpen(false);
    }
  }

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast.error('Entre para criar um tópico.');
      return;
    }

    if (!titulo.trim() || !conteudo.trim()) {
      toast.error('Informe título e conteúdo.');
      return;
    }

    setSalvando(true);
    const uniqueRelatedPersonIds = Array.from(new Set(selectedRelatedPersonIds.filter(Boolean)));
    const topico = await criarTopicoForum({
      autor_id: user.id,
      categoria_id: categoriaId || null,
      titulo: titulo.trim(),
      slug: `${criarSlug(titulo) || 'topico'}-${Date.now()}`,
      conteudo: conteudo.trim(),
      tipo,
      pessoa_relacionada_id: uniqueRelatedPersonIds[0] || null,
    });

    if (!topico) {
      setSalvando(false);
      toast.error('Não foi possível publicar o tópico.');
      return;
    }

    try {
      await vincularPessoasAoTopico(topico.id, uniqueRelatedPersonIds);
    } catch {
      toast.warning('O tópico foi publicado, mas não foi possível vincular todas as pessoas relacionadas.');
    } finally {
      setSalvando(false);
    }

    toast.success('Tópico publicado.');
    navigate(`/forum/topico/${topico.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criar tópico</h1>
            <p className="text-sm text-gray-500">Compartilhe uma pergunta, memória, documento ou pedido de ajuda.</p>
          </div>
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Fórum
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo tópico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={publicar} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="titulo">Título</label>
                <Input id="titulo" value={titulo} onChange={(event) => setTitulo(event.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    value={categoriaId}
                    onChange={(event) => setCategoriaId(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="tipo">Tipo</label>
                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(event) => setTipo(event.target.value as ForumTopicoTipo)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {TIPO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pessoas-relacionadas">
                  Pessoas Relacionadas
                </label>
                <div className="relative">
                  <button
                    id="pessoas-relacionadas"
                    type="button"
                    onClick={() => setRelatedDropdownOpen((current) => !current)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <span className={selectedRelatedPersonIds.length ? 'text-gray-900' : 'text-gray-500'}>
                      {relatedSummary}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {relatedDropdownOpen && (
                    <div className="absolute left-0 right-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                      {pessoas.map((pessoa) => {
                        const checked = selectedRelatedPersonIds.includes(pessoa.id);
                        return (
                          <button
                            key={pessoa.id}
                            type="button"
                            onClick={() => toggleRelatedPerson(pessoa.id)}
                            className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span
                              className={[
                                'flex h-4 w-4 items-center justify-center rounded border',
                                checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white',
                              ].join(' ')}
                              aria-hidden="true"
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </span>
                            <span className="min-w-0 truncate">{pessoa.nome_completo}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selectedRelatedPeople.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedRelatedPeople.map((pessoa) => (
                      <button
                        key={pessoa.id}
                        type="button"
                        onClick={() => toggleRelatedPerson(pessoa.id)}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        {pessoa.nome_completo}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="conteudo">Conteúdo</label>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    id="conteudo"
                    value={conteudo}
                    onChange={handleConteudoChange}
                    onKeyDown={handleConteudoKeyDown}
                    className="min-h-[160px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  />

                  {mentionOpen && filteredMentionPeople.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {filteredMentionPeople.map((pessoa, index) => (
                        <button
                          key={pessoa.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            insertMention(pessoa);
                          }}
                          className={[
                            'flex w-full flex-col px-3 py-2 text-left text-sm',
                            index === selectedMentionIndex ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          <span className="font-medium">{pessoa.nome_completo}</span>
                          {(pessoa.data_nascimento || pessoa.local_nascimento) && (
                            <span className="text-xs text-gray-500">
                              {[pessoa.data_nascimento, pessoa.local_nascimento].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={salvando}>
                  <Send className="w-4 h-4 mr-2" />
                  {salvando ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
