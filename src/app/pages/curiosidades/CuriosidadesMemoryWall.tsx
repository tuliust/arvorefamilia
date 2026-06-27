import { useEffect, useMemo, useState } from 'react';
import { MessageSquareHeart, Send, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';

import { useAuth } from '../../contexts/AuthContext';
import {
  createMemoryWallPost,
  deleteMemoryWallPost,
  listMemoryWallPosts,
  type MemoryWallPost,
} from '../../services/memoryWallService';
import { curiositySectionCardClassName } from './curiosidadesUtils';

const MEMORY_MAX_LENGTH = 200;

function formatMemoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('pt-BR');
}

function getLoggedUserDisplayName(user: ReturnType<typeof useAuth>['user']) {
  const metadata = user?.user_metadata ?? {};
  const name = String(
    metadata.nome_exibicao ||
    metadata.name ||
    metadata.full_name ||
    user?.email ||
    'Familiar'
  ).trim();

  return name || 'Familiar';
}

type CuriosidadesMemoryWallProps = {
  className?: string;
};

export function CuriosidadesMemoryWall({ className = '' }: CuriosidadesMemoryWallProps) {
  const { user } = useAuth();
  const authorName = useMemo(() => getLoggedUserDisplayName(user), [user]);
  const [memory, setMemory] = useState('');
  const [items, setItems] = useState<MemoryWallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryWallPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMemoryWall() {
      setLoading(true);
      setError(null);

      try {
        const posts = await listMemoryWallPosts();
        if (!cancelled) setItems(posts);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o mural.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMemoryWall();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitMemory = async () => {
    const cleanMemory = memory.trim();
    if (!cleanMemory || submitting) return;

    if (cleanMemory.length > MEMORY_MAX_LENGTH) {
      setError(`A lembrança deve ter no máximo ${MEMORY_MAX_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const post = await createMemoryWallPost({
        author_name: authorName,
        body: cleanMemory,
        visibility: 'family',
      });

      setItems((current) => [post, ...current]);
      setMemory('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível publicar a lembrança.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteMemory = (item: MemoryWallPost) => {
    if (deletingId) return;
    setMemoryToDelete(item);
  };

  const confirmDeleteMemory = async () => {
    if (!memoryToDelete || deletingId) return;

    const item = memoryToDelete;
    setDeletingId(item.id);
    setError(null);

    try {
      await deleteMemoryWallPost(item.id);
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setMemoryToDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel apagar a lembranca.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <div className="flex items-center gap-3">
        <MessageSquareHeart className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Mural da família</h2>
      </div>

      <h3 className="mt-4 text-base font-bold leading-6 text-gray-950">
        Qual sua lembrança favorita da família?
      </h3>

      <div className="mt-4 space-y-3">
        <textarea
          value={memory}
          onChange={(event) => setMemory(event.target.value.slice(0, MEMORY_MAX_LENGTH))}
          placeholder="Escreva uma lembrança da família..."
          rows={4}
          maxLength={MEMORY_MAX_LENGTH}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-gray-500">
            {memory.length}/{MEMORY_MAX_LENGTH} caracteres
          </p>
          <button
            type="button"
            onClick={submitMemory}
            disabled={!memory.trim() || submitting || memory.trim().length > MEMORY_MAX_LENGTH}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Publicando...' : 'Publicar lembrança'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 max-h-[18rem] space-y-3 overflow-y-auto pr-1">
        {loading && (
          <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            Nenhuma lembrança publicada ainda.
          </div>
        )}

        {!loading && items.map((item) => {
          const canDelete = Boolean(user?.id && item.user_id === user.id);

          return (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm leading-6 text-gray-800">&quot;{item.body}&quot;</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="font-bold text-gray-700">- {item.author_name}</span>
                    <span>· {formatMemoryDate(item.created_at)}</span>
                  </div>
                </div>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => requestDeleteMemory(item)}
                    disabled={deletingId === item.id}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Apagar lembrança"
                    title="Apagar lembrança"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(memoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingId) setMemoryToDelete(null);
        }}
        title="Apagar lembranca"
        description="Deseja apagar esta lembranca? Esta acao nao pode ser desfeita."
        confirmText="Apagar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteMemory}
        variant="danger"
        loading={Boolean(deletingId)}
      />
    </section>
  );
}
