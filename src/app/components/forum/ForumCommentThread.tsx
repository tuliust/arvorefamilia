import { FormEvent, useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ForumComentario } from '../../types';

type ForumCommentThreadProps = {
  comentarios: ForumComentario[];
  currentUserId?: string;
  podeModerar?: boolean;
  enviando?: boolean;
  onSubmit: (conteudo: string) => void | Promise<void>;
  onDelete?: (comentario: ForumComentario) => void | Promise<void>;
  formatarAutor?: (autorId: string) => string;
  formatarData?: (data?: string) => string;
};

function autorPadrao(autorId: string, currentUserId?: string) {
  if (autorId === currentUserId) return 'Você';
  return `Familiar ${autorId.slice(0, 8)}`;
}

export function ForumCommentThread({
  comentarios,
  currentUserId,
  podeModerar = false,
  enviando = false,
  onSubmit,
  onDelete,
  formatarAutor,
  formatarData,
}: ForumCommentThreadProps) {
  const [conteudo, setConteudo] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texto = conteudo.trim();
    if (!texto) return;
    await onSubmit(texto);
    setConteudo('');
  }

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
        <MessageSquare className="h-4 w-4" />
        Comentários
      </h3>

      {comentarios.length === 0 ? (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Nenhum comentário ainda.</p>
      ) : (
        comentarios.map((comentario) => {
          const podeExcluir = podeModerar || comentario.autor_id === currentUserId;
          return (
            <div key={comentario.id} className="rounded-md bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-gray-700">
                      {formatarAutor?.(comentario.autor_id) ?? autorPadrao(comentario.autor_id, currentUserId)}
                    </p>
                    {formatarData && <span className="text-xs text-gray-400">{formatarData(comentario.created_at)}</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{comentario.conteudo}</p>
                </div>

                {podeExcluir && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(comentario)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Excluir comentário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Textarea
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          placeholder="Escrever comentário"
          className="min-h-16"
        />
        <Button type="submit" disabled={enviando || !conteudo.trim()} className="sm:self-start">
          Comentar
        </Button>
      </form>
    </div>
  );
}
