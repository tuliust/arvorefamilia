# Mini Bio e Curiosidades com IA

> Última revisão: 2026-06-15
> Local canônico: `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`
> Tipo: documentação funcional e técnica da geração assistida de Mini Bio e Curiosidades em `/meus-dados`.
> Status: funcionalidade implementada.

## 1. Função deste documento

Este documento descreve a funcionalidade de geração assistida por IA para os campos **Mini Bio** e **Curiosidades** da página `/meus-dados`.

Use este arquivo para manter:

- escopo funcional da experiência;
- fluxo do modal em etapas;
- regras de geração textual;
- contrato entre frontend e endpoint `/api/ai`;
- limites de caracteres;
- comportamento de edição e regeneração;
- regras de privacidade, segurança e anti-invenção;
- critérios de QA e anti-regressão.

Não use este documento para detalhar:

| Tema | Documento sugerido |
|---|---|
| Modal de Curiosidades da Home | `docs/funcionalidades/CURIOSIDADES_E_IA.md` |
| Views da árvore familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Componentes gerais | `docs/GUIA_COMPONENTES.md` |
| UX e layout geral | `docs/GUIA_UX_LAYOUT.md` |
| Deploy e variáveis de ambiente | `docs/operacao/DEPLOYMENT.md` |
| Migrations e RLS | `docs/operacao/MIGRATIONS_SUPABASE.md` |

---

## 2. Escopo funcional

A funcionalidade permite que o usuário gere automaticamente textos curtos para os campos opcionais:

- **Mini Bio**;
- **Curiosidades**.

A geração é feita por meio de um assistente visual em etapas, acionado pelo botão de IA existente na seção **Mini Bio e Curiosidades** da página `/meus-dados`.

O objetivo é reduzir o bloqueio do usuário ao escrever sobre si mesmo, oferecendo escolhas guiadas por tom, características, vínculos familiares, trabalho, mudanças de cidade, momentos marcantes, hobbies, marcas pessoais e informações livres.

Ao final do fluxo, a IA gera os dois textos ao mesmo tempo e os insere nos campos da página. O usuário ainda pode editar manualmente antes de salvar os dados pelo fluxo normal da página.

Fora do escopo:

- publicar automaticamente os textos;
- salvar automaticamente no banco após a geração;
- gerar apenas um dos campos;
- gerar texto em terceira pessoa;
- permitir sugestão de familiares;
- alterar dados da árvore familiar;
- criar novas tabelas ou rotas;
- treinar modelo com dados da família.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Página de dados do membro e modal de IA | `src/app/pages/MeusDados.tsx` |
| Endpoint serverless de IA | `api/ai.ts` |
| Tipos gerais de pessoas e formulários | `src/app/types/index.ts` |

A implementação prioriza alterações em:

```txt
src/app/pages/MeusDados.tsx
api/ai.ts
```

---

## 4. Acesso e acionamento

A funcionalidade fica disponível na página autenticada:

```txt
/meus-dados
```

Na seção **Mini Bio e Curiosidades**, o usuário encontra os campos editáveis e um botão de IA.

O botão deve manter descrição acessível:

```txt
Receber ajuda da IA para escrever Mini Bio e Curiosidades
```

Ao clicar, o sistema abre o modal **Ajuda para escrever sobre você**.

---

## 5. Campos da página

Os campos permanecem editáveis manualmente:

- `form.minibio`;
- `form.curiosidades`.

Cada campo deve respeitar:

```tsx
maxLength={300}
```

E exibir contador no formato:

```txt
0/300
184/300
300/300
```

Placeholders recomendados:

**Mini Bio**

```txt
Escreva uma breve apresentação sobre você em até 300 caracteres.
```

**Curiosidades**

```txt
Compartilhe fatos, gostos, lembranças ou detalhes curiosos sobre sua vida em até 300 caracteres.
```

Regras:

- o usuário pode editar os textos depois da geração;
- a geração por IA não salva automaticamente no banco;
- o salvamento continua dependendo do fluxo normal de `/meus-dados`;
- ao regenerar, os novos textos substituem os valores atuais nos campos.

---

## 6. Modal em etapas

O modal não exibe todos os containers ao mesmo tempo. A experiência é dividida em telas sucessivas.

Título:

```txt
Ajuda para escrever sobre você
```

Descrição:

```txt
Selecione características, lembranças e momentos importantes. A IA usa suas escolhas para sugerir uma Mini Bio e Curiosidades sobre sua vida.
```

Configuração visual sugerida:

```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-3xl">
```

A navegação deve incluir:

- botão **Voltar**;
- botão **Avançar**;
- botão **Gerar textos** na última etapa;
- indicador de progresso, como `Etapa 3 de 11`;
- loading durante a chamada de IA;
- mensagem de erro quando necessário.

Regras:

- na primeira etapa, **Voltar** pode ficar oculto ou desabilitado;
- nas etapas intermediárias, exibir **Voltar** e **Avançar**;
- na última etapa, substituir **Avançar** por **Gerar textos**;
- se a API falhar, o modal permanece aberto;
- se a API responder com sucesso, o modal fecha automaticamente.

---

## 7. Etapas do fluxo

O fluxo completo possui 11 etapas:

```txt
1. Tom do texto
2. Personalidade
3. Família e vínculos
4. Trabalho e trajetória
5. Lugares e mudanças de cidade
6. Momentos marcantes
7. Hobbies e paixões
8. Marcas pessoais e curiosidades
9. Outras características
10. Perguntas opcionais
11. Geração final
```

O usuário não precisa selecionar itens em todas as etapas.

Para habilitar a geração, basta existir ao menos uma fonte de informação:

- badge/card selecionado;
- campo livre preenchido;
- resposta opcional preenchida.

---

## 8. Visual das opções

As opções devem ser apresentadas como cards ou botões visuais, não apenas como lista simples de badges.

Cada opção pode conter:

- ícone;
- título curto;
- descrição curta quando fizer sentido.

Não adicionar biblioteca nova para isso. Usar preferencialmente ícones já disponíveis via `lucide-react`.

Ícones úteis:

```ts
Heart
Users
Briefcase
MapPin
Milestone
Sparkles
Music
Home
Plane
BookOpen
Star
Smile
Plus
ChevronLeft
ChevronRight
Wand2
Map
Camera
Coffee
Gift
Baby
GraduationCap
Utensils
Pencil
```

Estilo sugerido para opção selecionada:

```txt
border-blue-300 bg-blue-50 text-blue-800
```

Estilo sugerido para opção não selecionada:

```txt
border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50
```

Layout responsivo sugerido:

```txt
grid grid-cols-1 gap-3 sm:grid-cols-2
```

ou, para opções menores:

```txt
flex flex-wrap gap-2
```

---

## 9. Etapa: Tom do texto

Título:

```txt
Escolha o tom do texto
```

Subtítulo:

```txt
Como você quer que sua Mini Bio e suas Curiosidades soem?
```

Opções:

- Afetivo;
- Simples e direto;
- Divertido;
- Elegante;
- Nostálgico;
- Inspirador;
- Familiar;
- Emocional;
- Leve;
- Formal.

Apenas um tom pode ficar selecionado.

Valor padrão:

```ts
'afetivo'
```

A primeira pessoa é obrigatória e não deve ser uma opção configurável.

---

## 10. Etapa: Personalidade

Título:

```txt
Como você se descreveria?
```

Subtítulo:

```txt
Escolha características que combinam com você.
```

Opções:

- Calmo(a);
- Comunicativo(a);
- Reservado(a);
- Criativo(a);
- Curioso(a);
- Bem-humorado(a);
- Sensível;
- Determinado(a);
- Independente;
- Organizado(a);
- Espontâneo(a);
- Teimoso(a);
- Generoso(a);
- Cuidadoso(a);
- Sonhador(a);
- Observador(a);
- Acolhedor(a);
- Corajoso(a).

---

## 11. Etapa: Família e vínculos

Título:

```txt
Família e vínculos
```

Subtítulo:

```txt
Selecione o que representa sua relação com a família e com as pessoas importantes da sua vida.
```

Opções:

- Família em primeiro lugar;
- Gosta de reunir pessoas;
- Mantém tradições familiares;
- Valoriza histórias antigas;
- Tem forte ligação com os pais;
- Tem forte ligação com os avós;
- É próximo(a) dos irmãos;
- Ama ser pai/mãe;
- Ama ser tio/tia;
- Gosta de cuidar dos outros;
- É referência na família;
- Gosta de ouvir histórias da família;
- Gosta de contar histórias;
- Valoriza encontros de família;
- Guarda fotos e lembranças;
- Preserva memórias familiares.

---

## 12. Etapa: Trabalho e trajetória

Título:

```txt
Trabalho e trajetória
```

Subtítulo:

```txt
Conte um pouco sobre sua relação com o trabalho, profissão e conquistas.
```

Opções:

- Dedicado(a) ao trabalho;
- Empreendedor(a);
- Criativo(a) na profissão;
- Gosta de ensinar;
- Gosta de aprender;
- Tem espírito de liderança;
- Mudou de carreira;
- Trabalhou desde cedo;
- Construiu sua trajetória com esforço;
- Tem orgulho da profissão;
- É reconhecido(a) pelo que faz;
- Trabalhou em diferentes áreas;
- Valoriza independência financeira;
- Gosta de resolver problemas;
- Tem habilidade manual;
- Tem habilidade com pessoas;
- Tem habilidade com comunicação;
- Tem habilidade com números;
- Tem habilidade artística.

---

## 13. Etapa: Lugares e mudanças de cidade

Título:

```txt
Lugares que fazem parte da sua história
```

Subtítulo:

```txt
Marque experiências ligadas a cidades, viagens e mudanças de vida.
```

Opções:

- Nasceu em uma cidade e viveu em outra;
- Mudou de cidade;
- Mudou de estado;
- Morou fora do Brasil;
- Tem ligação forte com a cidade natal;
- Sente saudade de um lugar;
- Tem uma cidade que marcou sua vida;
- Gosta de viajar;
- Viveu uma fase importante em outra cidade;
- Começou de novo em outro lugar;
- Construiu família longe da cidade natal;
- Voltou para a cidade de origem;
- Tem raízes no interior;
- Tem raízes no litoral;
- Tem raízes em outro país;
- Valoriza suas origens.

---

## 14. Etapa: Momentos marcantes

Título:

```txt
Momentos marcantes
```

Subtítulo:

```txt
Selecione acontecimentos que ajudaram a formar quem você é.
```

Opções:

- Casamento;
- Nascimento dos filhos;
- Mudança de cidade;
- Primeira casa;
- Primeiro emprego;
- Formatura;
- Viagem marcante;
- Recomeço importante;
- Perda de alguém querido;
- Superação de uma fase difícil;
- Conquista profissional;
- Criação de um negócio;
- Encontro com alguém especial;
- Fase de muito aprendizado;
- Mudança de carreira;
- Aposentadoria;
- Uma decisão que mudou a vida;
- Um sonho realizado.

Temas sensíveis, como perda e superação, devem ser tratados com sobriedade. A IA não deve dramatizar nem inferir detalhes que não foram informados.

---

## 15. Etapa: Hobbies e paixões

Título:

```txt
Gostos, paixões e pequenos prazeres
```

Subtítulo:

```txt
Escolha interesses, hábitos e coisas que fazem parte do seu jeito de viver.
```

Opções:

- Cozinhar;
- Viajar;
- Música;
- Dançar;
- Ler;
- Filmes e séries;
- Futebol;
- Praia;
- Natureza;
- Animais;
- Fotografia;
- Jardinagem;
- Artesanato;
- Tecnologia;
- Festas de família;
- Comida caseira;
- Caminhadas;
- Conversar;
- Contar histórias;
- Receber pessoas em casa;
- Café;
- Religião ou espiritualidade;
- Cultura;
- Estudos.

---

## 16. Etapa: Marcas pessoais e curiosidades

Título:

```txt
Detalhes que tornam você único(a)
```

Subtítulo:

```txt
Pequenas manias, frases, gostos e costumes ajudam a deixar sua história mais viva.
```

Opções:

- Tem um apelido;
- Tem uma frase típica;
- Conta histórias repetidas;
- Tem uma receita famosa;
- Sempre tira fotos;
- Guarda objetos antigos;
- Tem uma música marcante;
- É conhecido(a) pelo humor;
- É conhecido(a) pela teimosia;
- É conhecido(a) pela generosidade;
- Gosta de aconselhar pessoas;
- Sempre organiza encontros;
- Tem uma mania engraçada;
- Tem um talento escondido;
- É pontual;
- Sempre se atrasa;
- Ama datas comemorativas;
- Tem um prato preferido;
- Tem um lugar preferido;
- Tem uma lembrança de infância marcante.

---

## 17. Etapa: Outras características

Título:

```txt
Outras características
```

Subtítulo:

```txt
Quer acrescentar algo que não apareceu nas opções?
```

A etapa contém um campo livre `Textarea`.

Placeholder:

```txt
Ex: gosto de fazer pão aos domingos, sou conhecido por contar histórias antigas, morei em três cidades...
```

O conteúdo é enviado para a IA como `customTraits`.

Pode incluir:

- características;
- lembranças;
- hobbies;
- frases;
- manias;
- fatos pessoais;
- detalhes de família;
- detalhes de trabalho;
- mudanças de cidade;
- momentos marcantes.

---

## 18. Etapa: Perguntas opcionais

Título:

```txt
Perguntas opcionais
```

Subtítulo:

```txt
As respostas ajudam a IA a deixar o texto menos genérico. Você pode deixar em branco.
```

As perguntas são geradas localmente no frontend, sem chamar a IA apenas para isso.

Função sugerida:

```ts
function buildAiProfileQuestions(
  selectedBadges: AiBadge[],
  customTraits: string
): AiGeneratedQuestion[]
```

A função deve retornar sempre 3 perguntas.

Prioridade:

1. se houver badge de família, perguntar sobre lembrança ou vínculo familiar;
2. se houver badge de lugares/mudanças, perguntar sobre cidade, origem ou mudança marcante;
3. se houver badge de trabalho, perguntar sobre trajetória profissional;
4. se houver badge de hobbies/marcas, perguntar sobre curiosidade, mania, receita, apelido ou gosto;
5. se houver badge de momentos, perguntar sobre fase importante ou aprendizado;
6. usar fallback genérico quando faltar contexto.

Exemplos:

```txt
Qual lembrança de família você guarda com mais carinho?
Qual cidade, mudança ou lugar marcou mais sua vida?
Existe alguma comida, frase, mania ou costume pelo qual as pessoas lembram de você?
Que momento da sua trajetória ajudou a formar quem você é?
O que você gostaria que sua família soubesse sobre sua história?
```

Cada pergunta deve ter um `Textarea` curto.

As respostas são opcionais.

---

## 19. Etapa: Geração final

Título:

```txt
Tudo pronto para gerar seus textos
```

Subtítulo:

```txt
A IA vai criar uma Mini Bio e Curiosidades em primeira pessoa, com até 300 caracteres cada.
```

Exibir resumo:

- tom escolhido;
- quantidade de opções selecionadas;
- se há características adicionais;
- quantidade de perguntas respondidas.

Botão principal:

```txt
Gerar textos
```

Ao clicar:

1. validar se há ao menos uma fonte de informação;
2. chamar `POST /api/ai`;
3. receber `minibio` e `curiosidades`;
4. limitar cada texto a 300 caracteres no frontend;
5. inserir os textos nos campos;
6. fechar o modal automaticamente.

Se ocorrer erro:

- manter o modal aberto;
- exibir mensagem clara;
- não alterar os campos.

---

## 20. Estados principais no frontend

Tipos locais sugeridos:

```ts
type AiTone =
  | 'afetivo'
  | 'simples'
  | 'divertido'
  | 'elegante'
  | 'nostalgico'
  | 'inspirador'
  | 'familiar'
  | 'emocional'
  | 'leve'
  | 'formal';

type AiBadgeCategory =
  | 'personalidade'
  | 'familia'
  | 'trabalho'
  | 'lugares'
  | 'momentos'
  | 'hobbies'
  | 'marcas';

type AiBadge = {
  id: string;
  label: string;
  category: AiBadgeCategory;
  icon?: React.ComponentType<{ className?: string }>;
};

type AiGeneratedQuestion = {
  id: string;
  question: string;
  answer: string;
};
```

Estados principais:

```ts
const [aiDialogOpen, setAiDialogOpen] = useState(false);
const [aiStep, setAiStep] = useState(0);
const [aiTone, setAiTone] = useState<AiTone>('afetivo');
const [aiSelectedBadges, setAiSelectedBadges] = useState<string[]>([]);
const [aiCustomTraits, setAiCustomTraits] = useState('');
const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<AiGeneratedQuestion[]>([]);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState<string | null>(null);
```

Estados antigos substituídos ou removidos pelo novo fluxo:

```ts
aiDestination
aiKeywords
aiSuggestion
```

Como a IA gera os dois campos simultaneamente, não há seletor de destino.

---

## 21. Payload para `/api/ai`

Payload enviado pelo frontend:

```ts
{
  purpose: 'profile_text',
  tone: aiTone,
  selectedBadges: selectedBadgeLabels,
  customTraits: aiCustomTraits.trim(),
  answers: answeredQuestions,
  context: {
    nome: String(form.nome_completo ?? ''),
    profissao: String(form.profissao ?? ''),
    local_nascimento: String(form.local_nascimento ?? ''),
    local_atual: String(form.local_atual ?? ''),
    data_nascimento: String(form.data_nascimento ?? ''),
    minibio_atual: String(form.minibio ?? ''),
    curiosidades_atuais: String(form.curiosidades ?? ''),
  },
}
```

`answeredQuestions` deve conter apenas respostas preenchidas:

```ts
const answeredQuestions = aiGeneratedQuestions
  .filter((item) => item.answer.trim())
  .map((item) => ({
    question: item.question,
    answer: item.answer.trim(),
  }));
```

---

## 22. Contrato de resposta da API

Para `purpose === 'profile_text'`, a API deve retornar:

```json
{
  "minibio": "texto em primeira pessoa com até 300 caracteres",
  "curiosidades": "texto em primeira pessoa com até 300 caracteres"
}
```

Regras:

- não retornar markdown;
- não retornar texto solto;
- não retornar apenas `answer` no novo fluxo;
- validar que os dois campos são strings;
- aplicar limite de 300 caracteres também no backend.

---

## 23. Validação no endpoint

O endpoint `api/ai.ts` deve validar se há informação suficiente.

Validação esperada:

```ts
const hasBadges = Array.isArray(selectedBadges) && selectedBadges.length > 0;
const hasCustomTraits = typeof customTraits === 'string' && customTraits.trim().length > 0;
const hasAnswers = Array.isArray(answers) && answers.some((item) => item?.answer?.trim());

if (!hasBadges && !hasCustomTraits && !hasAnswers) {
  return res.status(400).json({
    error: 'Selecione ao menos uma opção ou responda uma pergunta para gerar o texto.',
  });
}
```

---

## 24. Prompt interno da API

No bloco `purpose === 'profile_text'`, o prompt deve exigir:

```txt
Você deve gerar dois textos curtos para um perfil familiar.

Retorne exclusivamente JSON válido, sem markdown, no formato:
{
  "minibio": "...",
  "curiosidades": "..."
}

Regras:
- Escreva sempre em primeira pessoa.
- Não use terceira pessoa.
- Cada campo deve ter no máximo 300 caracteres.
- Não invente fatos.
- Use apenas as informações fornecidas em contexto, badges, características adicionais e respostas.
- Não mencione IA.
- Não use linguagem exagerada.
- Não exponha dados técnicos.
- Não inferir saúde, religião, orientação sexual, condição financeira, conflitos familiares, causa de morte ou informações sensíveis não informadas explicitamente.
- Se houver temas sensíveis, trate com sobriedade.
- A Mini Bio deve apresentar quem sou, minhas origens, valores, trajetória ou relação com a família.
- Curiosidades deve trazer gostos, marcas pessoais, lembranças, hábitos ou detalhes leves sobre minha vida.
```

Após receber a resposta do modelo:

- fazer `JSON.parse`;
- validar `minibio` e `curiosidades`;
- limitar cada campo a 300 caracteres;
- retornar JSON estruturado.

---

## 25. Helper de limite de texto

Frontend e backend devem aplicar limite de segurança.

Helper sugerido:

```ts
function limitText(value: string, maxLength = 300) {
  return String(value ?? '').trim().slice(0, maxLength);
}
```

Uso no frontend:

```ts
const minibio = limitText(payload?.minibio ?? '');
const curiosidades = limitText(payload?.curiosidades ?? '');

updateTextField('minibio', minibio);
updateTextField('curiosidades', curiosidades);
```

Se algum campo voltar vazio ou inválido, exibir erro e não alterar os campos.

---

## 26. Regras de segurança e privacidade

A funcionalidade deve preservar:

- `OPENAI_API_KEY` apenas no backend;
- nenhum secret no frontend;
- nenhum salvamento automático após geração;
- nenhuma criação de tabela;
- nenhuma alteração de vínculo familiar;
- nenhuma inferência de parentesco;
- nenhuma exposição de IDs técnicos;
- nenhuma invenção de informações pessoais;
- nenhuma inferência de dados sensíveis;
- nenhum treinamento de modelo com dados da família.

Dados sensíveis não devem ser inferidos, incluindo:

- saúde;
- religião;
- orientação sexual;
- condição financeira;
- conflitos familiares;
- causa de morte;
- traumas;
- diagnósticos;
- relações afetivas não informadas.

---

## 27. Estados de erro e loading

Durante a geração:

- desabilitar botões principais;
- exibir loading no botão:

```txt
Gerando...
```

Erro padrão:

```txt
Não foi possível gerar os textos agora. Tente novamente em instantes.
```

Erro por falta de informação:

```txt
Selecione ao menos uma opção ou responda uma pergunta para gerar o texto.
```

Em erro:

- manter modal aberto;
- preservar escolhas do usuário;
- não alterar Mini Bio nem Curiosidades.

---

## 28. Reabertura e regeneração

Ao abrir o modal:

- limpar `aiError`;
- permitir alterar escolhas;
- manter últimas escolhas da sessão se já existirem;
- não limpar obrigatoriamente tudo a cada abertura.

Ao gerar novamente:

- novos textos substituem `form.minibio` e `form.curiosidades`;
- usuário pode editar manualmente depois;
- salvamento continua sendo responsabilidade do fluxo normal da página.

---

## 29. Responsividade

A experiência deve ser validada em:

- 320px;
- 375px;
- 390px;
- 430px;
- tablet;
- desktop.

No mobile:

- cards devem caber em uma coluna;
- botões devem continuar tocáveis;
- modal deve ter scroll interno;
- textos não devem estourar largura;
- ícones não devem esmagar labels;
- footer do modal deve continuar utilizável.

---

## 30. Anti-regressões

Não fazer:

- criar nova rota;
- criar novo endpoint;
- criar nova tabela;
- alterar autenticação;
- alterar dados da árvore;
- alterar componentes da Home;
- alterar o modal de Curiosidades da Home;
- adicionar biblioteca nova;
- salvar textos automaticamente;
- exigir botão “Aplicar texto”;
- gerar apenas Mini Bio ou apenas Curiosidades;
- permitir terceira pessoa;
- manter seletor antigo `Mini Bio | Curiosidades` dentro do modal;
- deixar texto passar de 300 caracteres;
- publicar conteúdo automaticamente.

---

## 31. Validação técnica

Após alterações, validar:

```bash
npm run build
git diff --check
```

Se a suíte estiver estável:

```bash
npm run test
```

Validações registradas na implementação:

- `npm run build` passou;
- `npm test` passou com 3 arquivos e 36 testes;
- `git diff --check` passou, com aviso normal de LF/CRLF no Windows;
- `api/ai.ts` validado com transformação em memória via esbuild;
- dev server respondeu 200 em `http://127.0.0.1:5173/`.

---

## 32. Validação manual

Checklist:

1. abrir `/meus-dados`;
2. localizar seção **Mini Bio e Curiosidades**;
3. conferir limite de 300 caracteres nos dois campos;
4. conferir contadores;
5. clicar no botão de IA;
6. confirmar abertura do modal;
7. confirmar fluxo em etapas;
8. avançar e voltar;
9. escolher tom;
10. selecionar cards em diferentes categorias;
11. adicionar características livres;
12. responder perguntas opcionais;
13. chegar à etapa final;
14. clicar em **Gerar textos**;
15. confirmar loading;
16. confirmar fechamento automático no sucesso;
17. confirmar preenchimento dos dois campos;
18. confirmar limite de 300 caracteres;
19. editar manualmente os campos;
20. reabrir modal;
21. regenerar textos;
22. confirmar substituição dos textos anteriores;
23. confirmar que nada foi salvo no banco antes do salvamento normal;
24. testar estado vazio;
25. testar erro da API;
26. testar mobile.

---

## 33. Resultado esperado

A área **Mini Bio e Curiosidades** de `/meus-dados` passa a oferecer uma experiência guiada de memória pessoal com IA.

O usuário deixa de depender de um campo vazio para escrever sobre si. Ele escolhe tom, seleciona cards visuais com ícones, adiciona características livres, responde perguntas opcionais e recebe dois textos curtos, humanos, editáveis e em primeira pessoa.

A experiência final deve ser:

- visual;
- leve;
- responsiva;
- dividida em etapas;
- sempre em primeira pessoa;
- limitada a 300 caracteres por campo;
- integrada ao endpoint `/api/ai`;
- sem salvamento automático;
- segura contra invenção de dados pessoais.
