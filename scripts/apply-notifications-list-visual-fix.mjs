import fs from 'node:fs';

const file = 'src/app/pages/Notificacoes.tsx';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOrFail(content, from, to, label) {
  if (!content.includes(from)) {
    throw new Error(`Trecho não encontrado: ${label}`);
  }

  return content.replace(from, to);
}

if (!fs.existsSync(file)) {
  throw new Error(`Arquivo não encontrado: ${file}`);
}

let content = read(file);

/**
 * Melhora UX da lista de notificações sem alterar dados, Supabase ou rotas.
 * - Troca lista dividida por cards espaçados.
 * - Destaca notificações novas.
 * - Aumenta área visual e respirabilidade.
 * - Agrupa ações em área própria.
 */
content = replaceOrFail(
  content,
  `<CardContent>
            {error && (`,
  `<CardContent className="space-y-4">
            {error && (`,
  'Notificacoes.tsx CardContent da lista'
);

content = replaceOrFail(
  content,
  `<div className="divide-y divide-gray-100">
                {notificacoes.map((item) => (
                  <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                              item.lida ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700',
                            ].join(' ')}
                          >
                            {item.lida ? 'Lida' : 'Nova'}
                          </span>
                          <span className="break-all text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {item.tipo}
                          </span>
                        </div>
                        <h2 className="break-words text-sm font-bold text-gray-900">{item.titulo}</h2>
                        <p className="break-words text-sm leading-relaxed text-gray-600">{item.mensagem}</p>
                        <p className="break-words text-xs text-gray-400">{formatarData(item.created_at)}</p>
                        {item.link && (
                          <Link
                            to={item.link}
                            className="inline-flex items-center gap-1 break-all text-xs font-semibold text-blue-700 hover:underline"
                          >
                            Abrir conteúdo
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </Link>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-start">
                        {!item.lida && (
                          <button
                            type="button"
                            onClick={() => marcarComoLida(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Marcar como lida"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remover(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remover notificação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>`,
  `<div className="space-y-3">
                {notificacoes.map((item) => (
                  <article
                    key={item.id}
                    className={[
                      'rounded-2xl border p-4 shadow-sm transition hover:shadow-md sm:p-5',
                      item.lida ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/60',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                              item.lida ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white',
                            ].join(' ')}
                          >
                            {item.lida ? 'Lida' : 'Nova'}
                          </span>
                          <span className="break-all rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-100">
                            {item.tipo}
                          </span>
                          <span className="break-words text-xs text-gray-400">{formatarData(item.created_at)}</span>
                        </div>

                        <div className="space-y-2">
                          <h2 className="break-words text-base font-bold leading-snug text-gray-900">{item.titulo}</h2>
                          <p className="break-words text-sm leading-relaxed text-gray-600">{item.mensagem}</p>
                        </div>

                        {item.link && (
                          <Link
                            to={item.link}
                            className="inline-flex items-center gap-1.5 rounded-lg px-0 text-sm font-semibold text-blue-700 hover:underline"
                          >
                            Abrir conteúdo
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-row gap-2 border-t border-gray-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        {!item.lida && (
                          <button
                            type="button"
                            onClick={() => marcarComoLida(item.id)}
                            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                            aria-label="Marcar como lida"
                            title="Marcar como lida"
                          >
                            <CheckCheck className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">Lida</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remover(item.id)}
                          className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          aria-label="Remover notificação"
                          title="Remover notificação"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">Remover</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>`,
  'Notificacoes.tsx lista de notificações em cards'
);

write(file, content);

console.log('Lista de notificações ajustada com sucesso.');
