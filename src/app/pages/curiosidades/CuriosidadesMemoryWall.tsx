import { useState } from 'react';
import { Heart, MessageSquareHeart, Send } from 'lucide-react';
import { curiositySectionCardClassName } from './curiosidadesUtils';

type MemoryItem = {
  id: string;
  author: string;
  text: string;
  visibility: string;
  createdAt: string;
};

export function CuriosidadesMemoryWall() {
  const [author, setAuthor] = useState('');
  const [memory, setMemory] = useState('');
  const [visibility, setVisibility] = useState('Todos da família');
  const [items, setItems] = useState<MemoryItem[]>([]);

  const submitMemory = () => {
    const cleanMemory = memory.trim();
    if (!cleanMemory) return;

    setItems((current) => [
      {
        id: crypto.randomUUID(),
        author: author.trim() || 'Familiar',
        text: cleanMemory,
        visibility,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      },
      ...current,
    ]);

    setMemory('');
  };

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <MessageSquareHeart className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Mural da família</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Responda: qual sua lembrança favorita da família? Nesta versão, as respostas ficam apenas na sessão local.
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
            onChange={(event) => setVisibility(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-52"
          >
            <option>Todos da família</option>
            <option>Parentes próximos</option>
            <option>Privado</option>
          </select>

          <button
            type="button"
            onClick={submitMemory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Publicar lembrança
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            Nenhuma lembrança adicionada nesta sessão. A persistência definitiva pode ser conectada depois ao acervo ou ao fórum.
          </div>
        )}

        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm leading-6 text-gray-800">“{item.text}”</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-gray-700">— {item.author}</span>
              <span>· {item.createdAt}</span>
              <span>· {item.visibility}</span>
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
