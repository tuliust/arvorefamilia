import { FormEvent, useEffect, useState } from 'react';
import { Save, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ForumCategoria, ForumTopico, ForumTopicoTipo, Pessoa } from '../../types';

export type ForumTopicFormValues = {
  titulo: string;
  categoria_id: string | null;
  tipo: ForumTopicoTipo;
  conteudo: string;
  pessoa_relacionada_id: string | null;
};

type ForumTopicFormProps = {
  categorias: ForumCategoria[];
  pessoas?: Pessoa[];
  topico?: ForumTopico | null;
  submitLabel?: string;
  salvando?: boolean;
  onSubmit: (values: ForumTopicFormValues) => void | Promise<void>;
};

const TIPO_OPTIONS: Array<{ value: ForumTopicoTipo; label: string }> = [
  { value: 'pergunta', label: 'Pergunta' },
  { value: 'discussao', label: 'Discussão' },
  { value: 'aviso', label: 'Aviso' },
  { value: 'memoria', label: 'Memória' },
  { value: 'ajuda', label: 'Ajuda' },
];

export function ForumTopicForm({
  categorias,
  pessoas = [],
  topico,
  submitLabel,
  salvando = false,
  onSubmit,
}: ForumTopicFormProps) {
  const [titulo, setTitulo] = useState(topico?.titulo ?? '');
  const [categoriaId, setCategoriaId] = useState(topico?.categoria_id ?? categorias[0]?.id ?? '');
  const [tipo, setTipo] = useState<ForumTopicoTipo>(topico?.tipo ?? 'discussao');
  const [conteudo, setConteudo] = useState(topico?.conteudo ?? '');
  const [pessoaRelacionadaId, setPessoaRelacionadaId] = useState(topico?.pessoa_relacionada_id ?? '');

  useEffect(() => {
    if (topico) return;
    setCategoriaId((current) => current || categorias[0]?.id || '');
  }, [categorias, topico]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      titulo: titulo.trim(),
      categoria_id: categoriaId || null,
      tipo,
      conteudo: conteudo.trim(),
      pessoa_relacionada_id: pessoaRelacionadaId || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="forum-titulo">Título</Label>
        <Input
          id="forum-titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="forum-categoria">Categoria</Label>
          <select
            id="forum-categoria"
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Sem categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forum-tipo">Tipo</Label>
          <select
            id="forum-tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as ForumTopicoTipo)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {TIPO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forum-pessoa">Pessoa relacionada</Label>
        <select
          id="forum-pessoa"
          value={pessoaRelacionadaId}
          onChange={(event) => setPessoaRelacionadaId(event.target.value)}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Nenhuma pessoa relacionada</option>
          {pessoas.map((pessoa) => (
            <option key={pessoa.id} value={pessoa.id}>
              {pessoa.nome_completo}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forum-conteudo">Conteúdo</Label>
        <Textarea
          id="forum-conteudo"
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          className="min-h-48"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={salvando}>
          {topico ? <Save className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
          {salvando ? 'Salvando...' : submitLabel ?? (topico ? 'Salvar alterações' : 'Publicar')}
        </Button>
      </div>
    </form>
  );
}
