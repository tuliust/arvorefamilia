import fs from 'node:fs';

const files = [
  'src/app/components/layout/MemberPageHeader.tsx',
  'src/app/components/person/WhatsAppContactButton.tsx',
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
 * 1) MemberPageHeader.tsx
 * Evita quebra dos botões do header em duas linhas.
 * Mantém o layout responsivo com rolagem horizontal controlada quando não houver espaço.
 */
{
  const path = 'src/app/components/layout/MemberPageHeader.tsx';
  let content = read(path);

  const headerActionBase =
    'inline-flex items-center justify-center gap-2 rounded-xl';

  content = content.replaceAll(
    headerActionBase,
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl'
  );

  content = replaceOrFail(
    content,
    '<span>{action.label}</span>',
    '<span className="whitespace-nowrap">{action.label}</span>',
    'MemberPageHeader.tsx label dos botões'
  );

  content = replaceOrFail(
    content,
    'className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end"',
    'className="flex w-full min-w-0 flex-row flex-nowrap gap-2 overflow-x-auto pb-1 sm:w-auto sm:max-w-[60vw] sm:justify-end sm:pb-0 lg:max-w-none"',
    'MemberPageHeader.tsx container de ações'
  );

  write(path, content);
}

/**
 * 2) WhatsAppContactButton.tsx
 * Aproxima o botão de WhatsApp do padrão visual dos botões do header/reader.
 * Mantém responsividade, sem forçar quebra de texto.
 */
{
  const path = 'src/app/components/person/WhatsAppContactButton.tsx';
  let content = read(path);

  content = replaceOrFail(
    content,
    "className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full gap-2 sm:w-auto', className)}",
    "className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full shrink-0 gap-2 whitespace-nowrap rounded-xl shadow-sm sm:w-auto', className)}",
    'WhatsAppContactButton.tsx classe do botão'
  );

  content = replaceOrFail(
    content,
    '<span>Entrar em contato por WhatsApp</span>',
    '<span className="whitespace-nowrap">Entrar em contato por WhatsApp</span>',
    'WhatsAppContactButton.tsx label'
  );

  write(path, content);
}

console.log('Ajustes de header e WhatsApp aplicados com sucesso.');
