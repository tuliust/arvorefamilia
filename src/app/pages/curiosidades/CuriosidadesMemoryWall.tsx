import { useEffect, useState } from 'react';
import { Heart, MessageSquareHeart, Send } from 'lucide-react';

import {
  createMemoryWallPost,
  listMemoryWallPosts,
  type MemoryWallPost,
  type MemoryWallVisibility,
} from '../../services/memoryWallService';
import { curiositySectionCardClassName } from './curiosidadesUtils';

const VISIBILITY_OPTIONS: Array<{ value: MemoryWallVisibility; label: string }> = [
  { value: 'family', label: 'Todos da família' },
  { value: 'close_relatives', label: 'Parentes próximos' },
  { value: 'private', label: 'Privado' },
];

function getVisibilityLabel(value: MemoryWallVisibility) {
  return VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Todos da família';
}

function formatMemoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('pt-BR');
}

export function CuriosidadesMemoryWall() {
  const [author, setAuthor] = useState('');
  const [memory, setMemory] = useState('');
  const [visibility, setVisibility] = useState<MemoryWallVisibility>('family');
  const [items, setItems] = useState<MemoryWallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);
    setError(null);

    try {
      const post = await createMemoryWallPost({
        author_name: author,
        body: cleanMemory,
        visibility,
      });

      setItems((current) => [post, ...current]);
      setMemory('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível publicar a lembrança.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <MessageSquareHeart className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Mural da família</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Responda: qual é a sua lembrança favorita da família?
      </p>

      <div className="mt-5 space-y-3">
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />

        <textarea
          value={memory}
          onChange={(event) => setMemory(event.target.value)}
          placeholder="Escreva uma lembrança da família..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as MemoryWallVisibility)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-52"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={submitMemory}
            disabled={!memory.trim() || submitting}
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

      <div className="mt-5 space-y-3">
        {loading && (
          <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            Nenhuma lembrança publicada ainda.
          </div>
        )}

        {!loading && items.map((item) => (
          <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="break-words text-sm leading-6 text-gray-800">"{item.body}"</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-gray-700">- {item.author_name}</span>
              <span>· {formatMemoryDate(item.created_at)}</span>
              <span>· {getVisibilityLabel(item.visibility)}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-semibold text-gray-600">
                <Heart className="h-3.5 w-3.5" />
                lembrança
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
