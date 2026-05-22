import fs from 'node:fs';

const files = [
  'src/app/pages/Home.tsx',
  'src/app/components/FamilyTree/MarriageNode.tsx',
  'src/app/components/FamilyTree/GenealogySpouseEdge.tsx',
];

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

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`Arquivo não encontrado: ${file}`);
  }
}

/**
 * 1) Home.tsx
 * Ajusta wrapper do dropdown para não cortar sombra/borda arredondada
 * e reforça o SelectTrigger sem alterar opções nem lógica.
 */
{
  const path = 'src/app/pages/Home.tsx';
  let content = read(path);

  content = replaceOrFail(
    content,
    "'min-w-0 shrink-0 flex-nowrap items-center justify-center gap-1.5 overflow-hidden sm:gap-2'",
    "'min-w-0 shrink-0 flex-nowrap items-center justify-center gap-1.5 overflow-visible sm:gap-2'",
    'Home.tsx wrapper do dropdown de views'
  );

  content = replaceOrFail(
    content,
    'className="h-9 w-[9.5rem] max-w-[48vw] min-w-[8.25rem] shrink-0 gap-1.5 border-blue-300 bg-blue-50 px-2.5 text-sm font-semibold text-blue-900 shadow-sm transition hover:border-blue-400 hover:bg-blue-100 focus:ring-2 focus:ring-blue-200 sm:min-w-[10.5rem] sm:px-3 lg:min-w-[13rem]"',
    'className="relative z-20 h-9 w-[9.5rem] max-w-[48vw] min-w-[8.25rem] shrink-0 gap-1.5 overflow-visible rounded-xl border-blue-300 bg-blue-50 px-2.5 text-sm font-semibold text-blue-900 shadow-md transition hover:border-blue-400 hover:bg-blue-100 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 sm:min-w-[10.5rem] sm:px-3 lg:min-w-[13rem]"',
    'Home.tsx SelectTrigger do dropdown de views'
  );

  write(path, content);
}

/**
 * 2) MarriageNode.tsx
 * Garante que o círculo do matrimônio se comporte como botão clicável no ReactFlow.
 */
{
  const path = 'src/app/components/FamilyTree/MarriageNode.tsx';
  let content = read(path);

  content = replaceOrFail(
    content,
    'className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-lg transition-colors hover:bg-orange-50"',
    'className="nodrag nopan relative z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 bg-white text-lg shadow-sm transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"',
    'MarriageNode.tsx classe do botão circular'
  );

  content = replaceOrFail(
    content,
    'onClick={handleClick}\n      title="Visualizar informações do matrimônio"',
    'onClick={handleClick}\n      onMouseDown={(event) => event.stopPropagation()}\n      onPointerDown={(event) => event.stopPropagation()}\n      title="Visualizar informações do matrimônio"',
    'MarriageNode.tsx eventos anti-pan/drag'
  );

  write(path, content);
}

/**
 * 3) GenealogySpouseEdge.tsx
 * Reforça área/camada clicável do anel renderizado sobre a edge conjugal.
 */
{
  const path = 'src/app/components/FamilyTree/GenealogySpouseEdge.tsx';
  let content = read(path);

  content = replaceOrFail(
    content,
    'className="nodrag nopan absolute flex h-8 w-8 items-center justify-center rounded-full border text-base shadow-sm"',
    'className="nodrag nopan absolute z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border text-base shadow-md pointer-events-auto transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"',
    'GenealogySpouseEdge.tsx classe do anel'
  );

  content = replaceOrFail(
    content,
    'onMouseDown={(event) => event.stopPropagation()}\n          aria-label="Visualizar relacionamento conjugal"',
    'onMouseDown={(event) => event.stopPropagation()}\n          onPointerDown={(event) => event.stopPropagation()}\n          title="Visualizar relacionamento conjugal"\n          aria-label="Visualizar relacionamento conjugal"',
    'GenealogySpouseEdge.tsx eventos anti-pan/drag'
  );

  write(path, content);
}

console.log('Ajustes aplicados com sucesso.');
