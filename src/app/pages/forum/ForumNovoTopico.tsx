import React, { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  BookOpen,
  Check,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  Search,
  Send,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { HEADER_ACTION_ICONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas } from '../../services/dataService';
import { criarTopicoForum, listarCategoriasForum, vincularPessoasAoTopico } from '../../services/forumService';
import { notifyForumTopicCreated } from '../../services/notificationTriggersService';
import { ForumCategoria, ForumTopicoTipo, Pessoa } from '../../types';

const DEFAULT_TOPIC_TYPE: ForumTopicoTipo = 'discussao';

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

function getCategoryIcon(categoria: ForumCategoria): LucideIcon {
  const key = normalizeSearch(`${categoria.slug} ${categoria.nome} ${categoria.icone || ''}`);

  if (key.includes('duvida') || key.includes('pergunta') || key.includes('question')) {
    return HelpCircle;
  }

  if (key.includes('memoria') || key.includes('historia') || key.includes('documento')) {
    return BookOpen;
  }

  if (key.includes('aviso') || key.includes('comunicado') || key.includes('anuncio')) {
    return Megaphone;
  }

  if (key.includes('ajuda') || key.includes('apoio') || key.includes('suporte')) {
    return LifeBuoy;
  }

  if (key.includes('familia') || key.includes('pessoa')) {
    return UsersRound;
  }

  return MessageCircle;
}

function extractMentionedPersonIds(conteudo: string, pessoas: Pessoa[]) {
  const normalizedContent = normalizeSearch(conteudo);

  if (!normalizedContent.includes('@')) return [];

  return pessoas
    .filter((pessoa) => {
      const mention = `@${normalizeSearch(pessoa.nome_completo)}`;
      return normalizedContent.includes(mention);
    })
    .map((pessoa) => pessoa.id);
}

export function ForumNovoTopico() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<ForumCategoria[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [selectedRelatedPersonIds, setSelectedRelatedPersonIds] = useState<string[]>([]);
  const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
  const [relatedPersonQuery, setRelatedPersonQuery] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [mentionCursorIndex, setMentionCursorIndex] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const relatedDropdownRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!relatedDropdownOpen) return undefined;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (!relatedDropdownRef.current?.contains(target)) {
        setRelatedDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [relatedDropdownOpen]);

  const selectedRelatedPeople = useMemo(
    () => pessoas.filter((pessoa) => selectedRelatedPersonIds.includes(pessoa.id)),
    [pessoas, selectedRelatedPersonIds]
  );

  const relatedSummary = useMemo(() => {
    if (selectedRelatedPersonIds.length === 0) return 'Nenhuma pessoa selecionada';
    if (selectedRelatedPersonIds.length === 1) return '1 pessoa selecionada';
    return `${selectedRelatedPersonIds.length} pessoas selecionadas`;
  }, [selectedRelatedPersonIds.length]);

  const filteredRelatedPeople = useMemo(() => {
    const query = normalizeSearch(relatedPersonQuery);

    if (!query) return pessoas;

    return pessoas.filter((pessoa) => normalizeSearch(pessoa.nome_completo).includes(query));
  }, [pessoas, relatedPersonQuery]);

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
    const mentionedPersonIds = extractMentionedPersonIds(conteudo, pessoas);
    const uniqueRelatedPersonIds = Array.from(
      new Set([...selectedRelatedPersonIds, ...mentionedPersonIds].filter(Boolean))
    );
    const topico = await criarTopicoForum({
      autor_id: user.id,
      categoria_id: categoriaId || null,
      titulo: titulo.trim(),
      slug: `${criarSlug(titulo) || 'topico'}-${Date.now()}`,
      conteudo: conteudo.trim(),
      tipo: DEFAULT_TOPIC_TYPE,
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
    }

    try {
      await notifyForumTopicCreated({
        topicId: topico.id,
        actorUserId: user.id,
        mentionedPessoaIds: mentionedPersonIds,
        relatedPessoaIds: selectedRelatedPersonIds,
      });
    } catch (error) {
      console.warn('[Notificações] O tópico foi publicado, mas as notificações de menção não foram concluídas:', error);
    } finally {
      setSalvando(false);
    }

    toast.success('Tópico publicado.');
    navigate(`/forum/topico/${topico.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Criar tópico"
        subtitle="Compartilhe uma pergunta, memória, documento ou pedido de ajuda."
        icon={MessageCircle}
        actions={[
          { label: 'Fórum', to: '/forum', icon: HEADER_ACTION_ICONS.ArrowLeft },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Novo tópico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={publicar} className="space-y-5">
              <div className="min-w-0 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="titulo">Título</label>
                <Input id="titulo" value={titulo} onChange={(event) => setTitulo(event.target.value)} />
              </div>

              <div className="min-w-0 space-y-3">
                <span className="block text-sm font-medium text-gray-700" id="categoria-label">
                  Categoria
                </span>
                <div
                  aria-labelledby="categoria-label"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                  role="group"
                >
                  {categorias.map((categoria) => {
                    const selected = categoriaId === categoria.id;
                    const Icon = getCategoryIcon(categoria);

                    return (
                      <button
                        key={categoria.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setCategoriaId(categoria.id)}
                        className={[
                          'flex min-h-28 min-w-0 flex-col items-center justify-between rounded-2xl border px-3 py-4 text-center text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                          selected
                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="mt-3 line-clamp-2 min-w-0 break-words font-medium leading-snug">
                          {categoria.nome}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pessoas-relacionadas">
                  Pessoas Relacionadas
                </label>
                <div className="relative min-w-0" ref={relatedDropdownRef}>
                  <button
                    id="pessoas-relacionadas"
                    type="button"
                    onClick={() => setRelatedDropdownOpen((current) => !current)}
                    className="flex h-10 w-full min-w-0 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-expanded={relatedDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <span className={`min-w-0 truncate ${selectedRelatedPersonIds.length ? 'text-gray-900' : 'text-gray-500'}`}>
                      {relatedSummary}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                  </button>

                  {relatedDropdownOpen && (
                    <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="border-b border-gray-100 p-2">
                        <label htmlFor="buscar-pessoas-relacionadas" className="sr-only">
                          Buscar pessoas relacionadas
                        </label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="buscar-pessoas-relacionadas"
                            value={relatedPersonQuery}
                            onChange={(event) => setRelatedPersonQuery(event.target.value)}
                            placeholder="Buscar pessoa..."
                            className="h-9 pl-9 text-sm"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1" role="listbox" aria-multiselectable="true">
                        {filteredRelatedPeople.length > 0 ? (
                          filteredRelatedPeople.map((pessoa) => {
                            const checked = selectedRelatedPersonIds.includes(pessoa.id);
                            return (
                              <button
                                key={pessoa.id}
                                type="button"
                                onClick={() => toggleRelatedPerson(pessoa.id)}
                                className="flex w-full min-w-0 items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                role="option"
                                aria-selected={checked}
                              >
                                <span
                                  className={[
                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                    checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white',
                                  ].join(' ')}
                                  aria-hidden="true"
                                >
                                  {checked && <Check className="h-3 w-3" />}
                                </span>
                                <span className="min-w-0 truncate">{pessoa.nome_completo}</span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="px-3 py-3 text-sm text-gray-500">Nenhuma pessoa encontrada.</p>
                        )}
                      </div>
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
                        className="max-w-full rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <span className="block truncate">{pessoa.nome_completo}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700" htmlFor="conteudo">Conteúdo</label>
                  <p className="text-xs text-gray-500">Digite @ para marcar alguém na publicação</p>
                </div>
                <div className="relative min-w-0">
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
                          <span className="break-words font-medium">{pessoa.nome_completo}</span>
                          {(pessoa.data_nascimento || pessoa.local_nascimento) && (
                            <span className="break-words text-xs text-gray-500">
                              {[pessoa.data_nascimento, pessoa.local_nascimento].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4 shrink-0" />
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
