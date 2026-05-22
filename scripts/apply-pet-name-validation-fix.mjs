import fs from 'node:fs';

const file = 'src/app/utils/personFields.ts';

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
 * Permite que pets tenham apenas um nome.
 * Pessoas humanas continuam exigindo nome e sobrenome.
 */
content = replaceOrFail(
  content,
  `export function hasFirstAndLastName(value: string) {
  const words = value.trim().split(/\\s+/).filter((part) => part.length >= 2);
  return words.length >= 2;
}`,
  `export function hasFirstAndLastName(value: string) {
  const words = value.trim().split(/\\s+/).filter((part) => part.length >= 2);
  return words.length >= 2;
}

export function hasValidPetName(value: string) {
  return value.trim().split(/\\s+/).some((part) => part.length >= 2);
}`,
  'personFields.ts helper hasValidPetName'
);

content = replaceOrFail(
  content,
  `  if (!hasFirstAndLastName(normalizedName)) {
    nextErrors.nome_completo = 'Informe pelo menos nome e sobrenome, com duas letras ou mais.';
  }`,
  `  const isPet = (form as Record<string, unknown>).humano_ou_pet === 'Pet';

  if (isPet) {
    if (!hasValidPetName(normalizedName)) {
      nextErrors.nome_completo = 'Informe o nome do pet com duas letras ou mais.';
    }
  } else if (!hasFirstAndLastName(normalizedName)) {
    nextErrors.nome_completo = 'Informe pelo menos nome e sobrenome, com duas letras ou mais.';
  }`,
  'personFields.ts validação de nome para pets'
);

write(file, content);

console.log('Validação de nome para pets ajustada com sucesso.');
