import fs from 'node:fs';

const file = 'src/app/pages/CalendarioFamiliar.tsx';

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
 * 1) Helpers locais de texto.
 * Mantém familyDates.ts intacto para não afetar Google Agenda ou outros consumidores.
 */
content = replaceOrFail(
  content,
  `function agruparPorDia(eventos: EventoCalendarioFamiliar[]) {
  const mapa = new Map<number, EventoCalendarioFamiliar[]>();

  for (const evento of eventos) {
    const lista = mapa.get(evento.dia) ?? [];
    lista.push(evento);
    mapa.set(evento.dia, lista);
  }

  return mapa;
}`,
  `function agruparPorDia(eventos: EventoCalendarioFamiliar[]) {
  const mapa = new Map<number, EventoCalendarioFamiliar[]>();

  for (const evento of eventos) {
    const lista = mapa.get(evento.dia) ?? [];
    lista.push(evento);
    mapa.set(evento.dia, lista);
  }

  return mapa;
}

function formatEventCount(count: number) {
  return count === 1 ? '1 evento' : \`\${count} eventos\`;
}

function getFirstDisplayName(nome: string) {
  return nome.trim().split(/\\s+/)[0] || nome;
}

function formatCalendarEventTitle(evento: EventoCalendarioFamiliar) {
  if (evento.category === 'aniversarios' || evento.tipo === 'aniversario') {
    return \`Aniversário de \${getFirstDisplayName(evento.nome)}\`;
  }

  return evento.titulo;
}

function formatCalendarEventDescription(evento: EventoCalendarioFamiliar) {
  if (evento.category !== 'aniversarios' && evento.tipo !== 'aniversario') {
    return evento.descricao;
  }

  const match = evento.descricao.match(/^(\\d+)\\s+anos?/);
  if (!match) return evento.descricao;

  return \`Faz \${match[1]} anos\`;
}`,
  'CalendarioFamiliar.tsx helpers locais de texto'
);

/**
 * 2) Remove área superior de categorias.
 */
content = replaceOrFail(
  content,
  `
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-gray-900">Categorias</h2>
            <p className="text-sm text-gray-500">Clique para ativar ou ocultar categorias do calendário.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CALENDAR_CATEGORY_KEYS.map((category) => {
              const colors = CALENDAR_CATEGORY_COLORS[category];
              const active = activeCategories[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:shadow-sm"
                  style={{
                    backgroundColor: active ? colors.background : '#FFFFFF',
                    borderColor: active ? colors.border : '#E5E7EB',
                    color: active ? colors.text : '#6B7280',
                    opacity: active ? 1 : 0.62,
                  }}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span>{colors.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: active ? '#FFFFFFAA' : '#F3F4F6',
                      color: active ? colors.text : '#6B7280',
                    }}
                  >
                    {categoryCounts[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
`,
  `
`,
  'CalendarioFamiliar.tsx seção superior de categorias'
);

/**
 * 3) Ajusta contador de eventos no dia.
 */
content = replaceOrFail(
  content,
  `<span className="text-[10px] font-semibold text-gray-500">{eventosDia.length} item(ns)</span>`,
  `<span className="text-[10px] font-semibold text-gray-500">{formatEventCount(eventosDia.length)}</span>`,
  'CalendarioFamiliar.tsx contador do dia'
);

content = replaceOrFail(
  content,
  `+{eventosDia.length - 3} item(ns)`,
  `+{formatEventCount(eventosDia.length - 3)}`,
  'CalendarioFamiliar.tsx contador excedente'
);

/**
 * 4) Ajusta título e descrição dos cards do calendário.
 */
content = replaceOrFail(
  content,
  `<span>{evento.titulo}</span>`,
  `<span>{formatCalendarEventTitle(evento)}</span>`,
  'CalendarioFamiliar.tsx título curto do evento'
);

content = replaceOrFail(
  content,
  `<p>{evento.descricao}</p>`,
  `<p>{formatCalendarEventDescription(evento)}</p>`,
  'CalendarioFamiliar.tsx descrição curta do evento'
);

/**
 * 5) Transforma Resumo do mês em filtros laterais.
 */
content = replaceOrFail(
  content,
  `<h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do mês</h3>`,
  `<h3 className="text-lg font-bold text-gray-900 mb-1">Categorias</h3>
              <p className="mb-4 text-sm text-gray-500">Clique para ativar ou ocultar categorias do calendário.</p>`,
  'CalendarioFamiliar.tsx título lateral de categorias'
);

content = replaceOrFail(
  content,
  `const count = eventosDoMes.filter((evento) => getCalendarCategory(evento) === category).length;`,
  `const count = eventos.filter((evento) => evento.mes === dataAtual.getMonth() && getCalendarCategory(evento) === category).length;
                  const active = activeCategories[category];`,
  'CalendarioFamiliar.tsx contagem lateral por categoria'
);

content = replaceOrFail(
  content,
  `<div
                      key={category}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >`,
  `<button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-pressed={active}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:shadow-sm"
                      style={{
                        backgroundColor: active ? colors.background : '#FFFFFF',
                        borderColor: active ? colors.border : '#E5E7EB',
                        color: active ? colors.text : '#6B7280',
                        opacity: active ? 1 : 0.62,
                      }}
                    >`,
  'CalendarioFamiliar.tsx card lateral vira botão'
);

content = replaceOrFail(
  content,
  `</div>
                  );
                })}`,
  `</button>
                  );
                })}`,
  'CalendarioFamiliar.tsx fechamento do botão lateral'
);

/**
 * 6) Ajusta descrição dos aniversariantes na lista inferior,
 * preservando nome completo.
 */
content = replaceOrFail(
  content,
  `{evento.descricao}
                      </span>`,
  `{formatCalendarEventDescription(evento)}
                      </span>`,
  'CalendarioFamiliar.tsx descrição dos aniversariantes'
);

write(file, content);

console.log('Ajustes do calendário familiar aplicados com sucesso.');
