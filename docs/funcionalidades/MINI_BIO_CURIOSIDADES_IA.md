# Mini Bio e Curiosidades com IA

> Última revisão: 2026-06-16  
> Local canônico: `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`  
> Tipo: documentação funcional e técnica da geração assistida de Mini Bio e Curiosidades em `/meus-dados`.  
> Status: funcionalidade implementada e em refinamento contínuo de UX.

## 1. Função deste documento

Este documento descreve a funcionalidade de geração assistida por IA para os campos **Mini Bio** e **Curiosidades** da página `/meus-dados`.

Use este arquivo para manter:

- escopo funcional da experiência;
- fluxo do modal em etapas;
- regras de interface dos cards;
- modo padrão em primeira pessoa;
- modo nostálgico/memorial para pessoas falecidas;
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

A geração é feita por meio de um assistente visual em etapas, acionado pelo botão de IA existente na seção **Sobre Mim** da página `/meus-dados`.

O objetivo é reduzir o bloqueio do usuário ao escrever sobre sua própria história ou sobre a memória de uma pessoa falecida, oferecendo escolhas guiadas por tom, características, vínculos familiares, trabalho, lugares, momentos marcantes, hobbies, marcas pessoais e informações livres.

Ao final do fluxo, a IA gera os dois textos ao mesmo tempo e os insere nos campos da página. O usuário ainda pode editar manualmente antes de salvar os dados pelo fluxo normal da página.

Fora do escopo:

- publicar automaticamente os textos;
- salvar automaticamente no banco após a geração;
- gerar apenas um dos campos;
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
| Documentação funcional | `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Tipos gerais de pessoas e formulários | `src/app/types/index.ts` |

A implementação prioriza alterações em:

```txt
src/app/pages/MeusDados.tsx
api/ai.ts
docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md
```

---

## 4. Acesso e acionamento

A funcionalidade fica disponível na página autenticada:

```txt
/meus-dados
```

Na seção **Sobre Mim**, o usuário encontra os campos editáveis e um botão de IA.

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
- ao regenerar, os novos textos substituem os valores atuais nos campos;
- os campos continuam editáveis mesmo depois da geração automática.

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
- botão **Avançar** nas etapas intermediárias;
- botão **Gerar textos** na última etapa;
- indicador de progresso, como `Etapa 3 de 10`;
- loading durante a chamada de IA;
- mensagem de erro quando necessário.

Regras:

- na primeira etapa, **Voltar** pode ficar oculto ou desabilitado;
- nas etapas intermediárias, exibir **Voltar** e **Avançar**;
- na última etapa, substituir **Avançar** por **Gerar textos**;
- não existe etapa final separada de revisão;
- se a API falhar, o modal permanece aberto;
- se a API responder com sucesso, o modal fecha automaticamente e os campos são preenchidos.

---

## 7. Etapas do fluxo

O fluxo completo possui 10 etapas:

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
```

O usuário não precisa selecionar itens em todas as etapas.

Para habilitar a geração, basta existir ao menos uma fonte de informação:

- badge/card selecionado;
- campo livre preenchido;
- resposta opcional preenchida.

Na etapa 10, o botão de ação principal deve ser **Gerar textos**.

---

## 8. Visual das opções

As opções devem ser apresentadas como cards/botões selecionáveis.

### 8.1 Tom do texto

A etapa **Tom do texto** usa cards visuais com ícone, título e descrição curta.

Layout sugerido:

```txt
grid grid-cols-1 gap-3 sm:grid-cols-2
```

### 8.2 Etapas 2 a 8

As etapas abaixo usam cards compactos:

- Personalidade;
- Família e vínculos;
- Trabalho e trajetória;
- Lugares e mudanças de cidade;
- Momentos marcantes;
- Hobbies e paixões;
- Marcas pessoais e curiosidades.

Regras visuais:

- sem ícones dentro dos botões;
- ícone preservado apenas no cabeçalho da etapa;
- botões compactos;
- textos centralizados;
- textos com até 2 linhas visuais;
- grade de até 3 colunas no desktop;
- boa área de toque no mobile.

Layout recomendado:

```txt
grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3
```

Classe-base sugerida para card compacto:

```txt
flex min-h-[56px] min-w-0 items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium leading-snug transition-colors
```

Limite visual de 2 linhas:

```txt
overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]
```

Estilo sugerido para opção selecionada:

```txt
border-blue-300 bg-blue-50 text-blue-800
```

Estilo sugerido para opção não selecionada:

```txt
border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:bg-blue-50/50
```

---

## 9. Etapa: Tom do texto

Título:

```txt
Escolha o tom do texto
```

Subtítulo padrão:

```txt
Como você quer que sua Mini Bio e suas Curiosidades soem? O tom Nostálgico cria uma homenagem em memória de quem já faleceu.
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

A opção **Nostálgico** ativa o modo memorial, documentado na seção 19.

---

## 10. Etapa: Personalidade

Título no modo padrão:

```txt
Você se definiria como uma pessoa...
```

Título no modo memorial:

```txt
Essa pessoa era lembrada como alguém...
```

Subtítulo no modo padrão:

```txt
Escolha características que combinam com você.
```

Subtítulo no modo memorial:

```txt
Escolha características que marcaram seu jeito de ser.
```

Opções no modo padrão:

- Calma;
- Comunicativa;
- Reservada;
- Criativa;
- Curiosa;
- Bem-humorada;
- Sensível;
- Determinada;
- Independente;
- Organizada;
- Espontânea;
- Teimosa;
- Generosa;
- Cuidadosa;
- Sonhadora;
- Observadora;
- Acolhedora;
- Corajosa.

No modo memorial, os mesmos conceitos são exibidos no passado, por exemplo:

- Era uma pessoa calma;
- Era comunicativa;
- Era criativa;
- Era generosa.

---

## 11. Etapa: Família e vínculos

Título no modo padrão:

```txt
Família e vínculos
```

Título no modo memorial:

```txt
Família e vínculos que marcaram sua vida
```

Subtítulo no modo padrão:

```txt
Selecione o que representa sua relação com a família e com as pessoas importantes da sua vida.
```

Subtítulo no modo memorial:

```txt
Selecione lembranças ligadas à família e às pessoas importantes em sua trajetória.
```

Opções no modo padrão:

- Família em primeiro lugar;
- Gosto de reunir pessoas;
- Mantenho tradições familiares;
- Valorizo histórias antigas;
- Tenho forte ligação com meus pais;
- Tenho forte ligação com meus avós;
- Tenho proximidade com meus irmãos;
- Amo ser mãe ou pai;
- Amo ser tia ou tio;
- Gosto de cuidar dos outros;
- Sou referência na família;
- Gosto de ouvir histórias da família;
- Gosto de contar histórias;
- Valorizo encontros de família;
- Guardo fotos e lembranças;
- Preservo memórias familiares.

No modo memorial, os mesmos conceitos são exibidos no passado, por exemplo:

- Gostava de reunir pessoas;
- Mantinha tradições familiares;
- Valorizava histórias antigas;
- Era referência na família;
- Guardava fotos e lembranças.

---

## 12. Etapa: Trabalho e trajetória

Título no modo padrão:

```txt
Trabalho e trajetória
```

Título no modo memorial:

```txt
Trabalho e trajetória de vida
```

Subtítulo no modo padrão:

```txt
Conte um pouco sobre sua relação com o trabalho, profissão e conquistas.
```

Subtítulo no modo memorial:

```txt
Selecione aspectos que fizeram parte de sua história profissional ou de suas conquistas.
```

Opções no modo padrão:

- Me dedico ao trabalho;
- Gosto de empreender;
- Me destaco pela criatividade;
- Gosto de ensinar;
- Gosto de aprender;
- Tenho espírito de liderança;
- Mudei de carreira;
- Trabalhei desde cedo;
- Construí minha trajetória com esforço;
- Tenho orgulho da minha profissão;
- Sou reconhecida pelo que faço;
- Trabalhei em diferentes áreas;
- Valorizo independência financeira;
- Gosto de resolver problemas;
- Tenho habilidade manual;
- Tenho facilidade com pessoas;
- Tenho habilidade com comunicação;
- Tenho facilidade com números;
- Tenho habilidade artística.

No modo memorial, os mesmos conceitos são exibidos no passado, por exemplo:

- Dedicou-se ao trabalho;
- Gostava de empreender;
- Destacava-se pela criatividade;
- Trabalhou desde cedo;
- Construiu sua trajetória com esforço.

---

## 13. Etapa: Lugares e mudanças de cidade

Título no modo padrão:

```txt
Lugares que fazem parte da sua história
```

Título no modo memorial:

```txt
Lugares que fizeram parte da sua história
```

Subtítulo no modo padrão:

```txt
Marque experiências ligadas a cidades, viagens e mudanças de vida.
```

Subtítulo no modo memorial:

```txt
Marque cidades, viagens e mudanças que fizeram parte de sua trajetória.
```

Opções no modo padrão:

- Nasci em uma cidade e vivi em outra;
- Mudei de cidade;
- Mudei de estado;
- Morei fora do Brasil;
- Tenho ligação forte com minha cidade natal;
- Sinto saudade de um lugar;
- Tenho uma cidade que marcou minha vida;
- Gosto de viajar;
- Vivi uma fase importante em outra cidade;
- Comecei de novo em outro lugar;
- Construí família longe da cidade natal;
- Voltei para minha cidade de origem;
- Tenho raízes no interior;
- Tenho raízes no litoral;
- Tenho raízes em outro país;
- Valorizo minhas origens.

No modo memorial, os mesmos conceitos são exibidos no passado, por exemplo:

- Nasceu em uma cidade e viveu em outra;
- Mudou de cidade;
- Morou fora do Brasil;
- Gostava de viajar;
- Valorizava suas origens.

---

## 14. Etapa: Momentos marcantes

Título no modo padrão:

```txt
Momentos marcantes
```

Título no modo memorial:

```txt
Momentos que marcaram sua história
```

Subtítulo no modo padrão:

```txt
Selecione acontecimentos que ajudaram a formar quem você é.
```

Subtítulo no modo memorial:

```txt
Selecione acontecimentos que fizeram parte de sua trajetória.
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

No modo memorial, os mesmos conceitos são enviados à IA no passado, por exemplo:

- Viveu um casamento;
- Conquistou a primeira casa;
- Fez uma viagem marcante;
- Aposentou-se;
- Realizou um sonho.

Temas sensíveis devem ser tratados com sobriedade.

---

## 15. Etapa: Hobbies e paixões

Título no modo padrão:

```txt
Gostos, paixões e pequenos prazeres
```

Título no modo memorial:

```txt
Gostos, paixões e pequenos prazeres que marcaram sua vida
```

Subtítulo no modo padrão:

```txt
Escolha interesses, hábitos e coisas que fazem parte do seu jeito de viver.
```

Subtítulo no modo memorial:

```txt
Escolha interesses e hábitos que faziam parte de seu jeito de viver.
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

No modo memorial, os mesmos conceitos são exibidos ou enviados no passado, por exemplo:

- Gostava de cozinhar;
- Gostava de viajar;
- Gostava de música;
- Gostava de receber pessoas em casa.

---

## 16. Etapa: Marcas pessoais e curiosidades

Título no modo padrão:

```txt
O que faz você uma pessoa única?
```

Título no modo memorial:

```txt
O que fazia essa pessoa ser única?
```

Subtítulo no modo padrão:

```txt
Pequenas manias, frases, gostos e costumes ajudam a deixar sua história mais viva.
```

Subtítulo no modo memorial:

```txt
Escolha marcas pessoais, gostos e lembranças que ajudam a preservar sua memória.
```

Opções no modo padrão:

- Tenho um apelido;
- Tenho uma frase típica;
- Costumo repetir histórias;
- Tenho uma receita famosa;
- Estou sempre tirando fotos;
- Guardo objetos antigos;
- Tenho uma música marcante;
- Me conhecem pelo meu humor;
- Me conhecem pela minha teimosia;
- Me conhecem pela minha generosidade;
- Gosto de aconselhar pessoas;
- Costumo organizar encontros;
- Tenho uma mania engraçada;
- Tenho um talento escondido;
- Costumo ser pontual;
- Costumo me atrasar;
- Amo datas comemorativas;
- Tenho um prato preferido;
- Tenho um lugar preferido;
- Tenho uma lembrança de infância marcante.

No modo memorial, os mesmos conceitos são exibidos ou enviados no passado, por exemplo:

- Tinha um apelido;
- Costumava repetir histórias;
- Era lembrada pelo humor;
- Costumava ser pontual;
- Amava datas comemorativas.

---

## 17. Etapa: Outras características

Título no modo padrão:

```txt
Outras características
```

Subtítulo no modo padrão:

```txt
Quer acrescentar algo que não apareceu nas opções?
```

Placeholder no modo padrão:

```txt
Ex: gosto de fazer pão aos domingos, sou conhecido por contar histórias antigas, morei em três cidades...
```

Título no modo memorial:

```txt
Outras lembranças sobre essa pessoa
```

Subtítulo no modo memorial:

```txt
Quer acrescentar algo que ajude a contar sua história?
```

Placeholder no modo memorial:

```txt
Ex: adorava cozinhar aos domingos, era conhecido pelo bom humor, morou em três cidades, gostava de reunir a família...
```

O conteúdo digitado é enviado para a API como `customTraits`.

---

## 18. Etapa: Perguntas opcionais

Título:

```txt
Perguntas opcionais
```

Subtítulo no modo padrão:

```txt
As respostas ajudam a IA a deixar o texto menos genérico. Você pode deixar em branco.
```

Subtítulo no modo memorial:

```txt
As respostas ajudam a IA a criar uma homenagem mais fiel à memória da pessoa. Você pode deixar em branco.
```

As perguntas são geradas localmente no frontend, sem chamada de IA.

Função responsável:

```ts
function buildAiProfileQuestions(
  selectedBadges: AiBadge[],
  customTraits: string,
  memorialMode: boolean,
): AiGeneratedQuestion[]
```

A função deve retornar sempre 3 perguntas.

### Perguntas do modo padrão

Exemplos:

- Qual lembrança de família você guarda com mais carinho?
- Qual cidade, mudança ou lugar marcou mais sua vida?
- O que mais marcou sua trajetória profissional ou seu jeito de trabalhar?
- Existe alguma comida, frase, mania ou costume pelo qual as pessoas lembram de você?
- Que momento da sua trajetória ajudou a formar quem você é?
- O que você gostaria que sua família soubesse sobre sua história?

### Perguntas do modo memorial

Exemplos:

- Que lembrança de família essa pessoa deixou?
- Qual cidade, mudança ou lugar marcou sua trajetória?
- O que mais marcou sua vida profissional ou seu jeito de trabalhar?
- Existe alguma comida, frase, mania ou costume pelo qual essa pessoa era lembrada?
- Que momento importante ajudou a formar sua história?
- O que você gostaria que a família lembrasse sobre essa pessoa?

---

## 19. Modo nostálgico para pessoas falecidas

O tom **Nostálgico** ativa o modo memorial.

Esse modo é pensado para perfis de pessoas já falecidas ou para textos de homenagem familiar.

### 19.1 Comportamento no frontend

Quando `aiTone === 'nostalgico'`, o frontend deve derivar:

```ts
const aiIsMemorialMode = aiTone === 'nostalgico';
```

Esse boolean controla:

- títulos das etapas;
- subtítulos das etapas;
- labels exibidos nos cards;
- perguntas opcionais;
- placeholder do campo livre;
- payload enviado à API.

O payload deve incluir:

```ts
memorialMode: aiIsMemorialMode
```

E o contexto deve incluir, quando disponível:

```ts
context: {
  nome,
  profissao,
  local_nascimento,
  local_atual,
  data_nascimento,
  data_falecimento,
  falecido,
  minibio_atual,
  curiosidades_atuais,
}
```

As badges enviadas à API devem usar o texto adaptado ao modo memorial. Exemplo:

```txt
Gosto de viajar -> Gostava de viajar
Me dedico ao trabalho -> Dedicou-se ao trabalho
Tenho um apelido -> Tinha um apelido
```

### 19.2 Comportamento na API

No endpoint `api/ai.ts`, o modo memorial deve ser detectado por:

```ts
const isMemorialMode = memorialMode === true || tone === 'nostalgico';
```

Quando `isMemorialMode` for `false`, a API mantém a regra padrão:

- texto em primeira pessoa;
- tempo presente ou compatível com a experiência pessoal;
- Mini Bio e Curiosidades com até 300 caracteres cada.

Quando `isMemorialMode` for `true`, a API deve gerar:

- texto em terceira pessoa;
- verbos no passado;
- tom saudosista, afetivo e respeitoso;
- conteúdo adequado para pessoa falecida;
- uso do nome da pessoa quando disponível.

Exemplo de estrutura permitida:

```txt
Absalon nasceu em Recife e foi uma pessoa apaixonada por viagens, família e boas histórias. Adorava reunir pessoas, valorizava suas origens e deixou lembranças afetivas.
```

Regras obrigatórias:

- não usar primeira pessoa no modo memorial;
- não escrever como se a pessoa ainda estivesse viva;
- não inventar datas, cidades, profissões, viagens ou fatos;
- se não houver data de nascimento, não escrever `xxxx` nem inventar ano;
- não mencionar morte diretamente se não for necessário;
- evitar linguagem fúnebre pesada;
- preferir memória afetiva e saudosista;
- manter limite de 300 caracteres por campo.

---

## 20. Payload para `/api/ai`

O frontend envia payload estruturado:

```ts
{
  purpose: 'profile_text',
  tone: aiTone,
  memorialMode: aiIsMemorialMode,
  selectedBadges: aiSelectedBadgeItems.map((badge) =>
    getAiBadgeDisplayLabel(badge, aiIsMemorialMode)
  ),
  customTraits: aiCustomTraits.trim(),
  answers: answeredQuestions,
  context: {
    nome: String(form.nome_completo ?? ''),
    profissao: String(form.profissao ?? ''),
    local_nascimento: String(form.local_nascimento ?? ''),
    local_atual: String(form.local_atual ?? ''),
    data_nascimento: String(form.data_nascimento ?? ''),
    data_falecimento: String(form.data_falecimento ?? ''),
    falecido: form.falecido === true,
    minibio_atual: String(form.minibio ?? ''),
    curiosidades_atuais: String(form.curiosidades ?? ''),
  },
}
```

Validação mínima:

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

## 21. Resposta esperada da API

Para `purpose === 'profile_text'`, a API deve retornar JSON estruturado:

```json
{
  "minibio": "texto com até 300 caracteres",
  "curiosidades": "texto com até 300 caracteres"
}
```

Não retornar markdown.

Não retornar texto solto.

Não retornar dentro de `answer` para este fluxo.

O backend também deve aplicar limite de 300 caracteres por segurança:

```ts
return res.status(200).json({
  minibio: limitText(parsed.minibio),
  curiosidades: limitText(parsed.curiosidades),
});
```

Se o parse falhar, retornar erro claro:

```txt
Não foi possível interpretar os textos gerados.
```

---

## 22. Regras de geração textual

### 22.1 Modo padrão

Para todos os tons exceto `nostalgico`:

- gerar sempre em primeira pessoa;
- não usar terceira pessoa;
- manter até 300 caracteres por campo;
- não mencionar IA;
- não inventar fatos;
- não inventar datas, cidades, profissões, conquistas, parentescos ou eventos;
- usar apenas informações informadas no formulário, badges, respostas opcionais e campo livre;
- manter tom humano, simples e familiar;
- evitar linguagem exagerada;
- evitar frases genéricas demais.

Exemplo permitido:

```txt
Sou uma pessoa ligada à família, às minhas origens e às histórias que carrego comigo. Gosto de preservar memórias, valorizar os encontros e lembrar dos caminhos que fizeram parte da minha trajetória.
```

Exemplo proibido no modo padrão:

```txt
João é lembrado por sua família como uma pessoa generosa.
```

### 22.2 Modo memorial

Para `tone === 'nostalgico'` ou `memorialMode === true`:

- gerar sempre em terceira pessoa;
- usar verbos no passado;
- manter até 300 caracteres por campo;
- não mencionar IA;
- não inventar fatos;
- usar o nome da pessoa quando disponível;
- não usar `eu`, `me`, `meu`, `minha`;
- não escrever como se a pessoa ainda estivesse viva;
- manter tom saudosista, afetivo e respeitoso;
- não dramatizar perdas;
- não inventar causa de morte ou circunstâncias sensíveis.

Exemplo permitido:

```txt
Absalon foi uma pessoa ligada à família, às viagens e às boas histórias. Gostava de reunir pessoas, valorizava suas origens e deixou lembranças afetivas entre todos que conviveram com ele.
```

Exemplo proibido no modo memorial:

```txt
Sou uma pessoa que valoriza minha família e gosto de viajar.
```

---

## 23. Segurança e privacidade

Regras obrigatórias:

- não expor `OPENAI_API_KEY`;
- não enviar secrets ao frontend;
- não salvar textos automaticamente;
- não treinar modelo;
- não expor IDs técnicos;
- não inventar informações familiares;
- não inferir dados sensíveis;
- não alterar vínculos familiares;
- não alterar dados fora dos campos `minibio` e `curiosidades`;
- não inferir saúde, religião, orientação sexual, condição financeira, conflitos familiares ou causa de morte;
- temas sensíveis devem ser tratados com sobriedade.

---

## 24. Comportamento de abertura e reabertura

Ao abrir o modal:

- limpar `aiError`;
- iniciar pela etapa `0` quando o botão de IA for acionado;
- manter últimas escolhas da sessão se já existirem;
- permitir alteração das escolhas;
- não limpar obrigatoriamente tudo a cada abertura.

Ao gerar novamente:

- os novos textos substituem os valores atuais de `form.minibio` e `form.curiosidades`;
- o usuário pode editar manualmente depois;
- o salvamento continua dependendo do fluxo normal da página.

---

## 25. Estados de erro e loading

Durante geração:

- desabilitar botões principais;
- mostrar loading no botão:

```txt
Gerando...
```

Se falhar:

- manter o modal aberto;
- exibir `aiError`;
- não alterar os campos.

Mensagem padrão:

```txt
Não foi possível gerar os textos agora. Tente novamente em instantes.
```

Se faltar informação:

```txt
Selecione ao menos uma opção ou responda uma pergunta para gerar o texto.
```

---

## 26. Responsividade

Conferir especialmente:

- 320px;
- 375px;
- 390px;
- 430px;
- tablet;
- desktop.

No mobile:

- cards devem caber em uma coluna;
- botões Voltar/Avançar/Gerar devem continuar tocáveis;
- modal deve ter scroll interno;
- textos não devem estourar largura;
- ícones não devem esmagar labels;
- os cards compactos das etapas 2 a 8 devem continuar legíveis.

---

## 27. Anti-regressões

Não fazer:

- criar página nova;
- criar modal separado sem necessidade;
- adicionar biblioteca nova;
- criar novo endpoint;
- alterar banco de dados;
- alterar autenticação;
- alterar dados da árvore;
- alterar componentes da Home;
- implementar familiares sugerindo melhorias;
- implementar publicação;
- gerar apenas um dos campos;
- voltar a usar seletor `Mini Bio` ou `Curiosidades`, porque os dois textos são gerados juntos;
- exigir botão **Aplicar texto**;
- reintroduzir etapa 11 de geração final;
- reintroduzir ícones dentro dos cards das etapas 2 a 8;
- voltar a usar cards grandes nas etapas 6, 7 e 8.

---

## 28. Validação técnica

Após implementar alterações relacionadas a esta funcionalidade, rodar:

```bash
npm run build
git diff --check
```

Se existir suite relevante e estiver estável, rodar também:

```bash
npm run test
```

---

## 29. Validação manual

Testar modo padrão:

1. abrir `/meus-dados`;
2. localizar seção **Sobre Mim**;
3. confirmar que Mini Bio e Curiosidades têm limite de 300 caracteres;
4. confirmar contadores;
5. clicar no botão de IA;
6. selecionar um tom que não seja Nostálgico;
7. avançar pelas etapas;
8. confirmar cards compactos nas etapas 2 a 8;
9. selecionar cards em diferentes categorias;
10. responder uma ou mais perguntas opcionais;
11. clicar em **Gerar textos** na etapa 10;
12. confirmar que o modal fecha após sucesso;
13. confirmar que Mini Bio e Curiosidades são preenchidas em primeira pessoa;
14. confirmar que cada campo tem até 300 caracteres;
15. editar manualmente os campos;
16. reabrir o modal e regenerar.

Testar modo memorial:

1. abrir o assistente de IA;
2. selecionar tom **Nostálgico**;
3. avançar pelas etapas;
4. confirmar que títulos e labels mudam para passado/memória;
5. confirmar cards compactos nas etapas 2 a 8;
6. confirmar que perguntas opcionais são adequadas para pessoa falecida;
7. gerar textos;
8. confirmar que Mini Bio e Curiosidades vêm em terceira pessoa e no passado;
9. confirmar que cada campo tem até 300 caracteres;
10. selecionar outro tom;
11. confirmar que volta a gerar em primeira pessoa.

Testar estados de erro:

- tentar gerar sem badges, sem campo livre e sem respostas;
- simular erro da API;
- confirmar que os campos não são alterados em caso de erro.

---

## 30. Resultado esperado

A área **Sobre Mim** de `/meus-dados` oferece uma experiência guiada de memória pessoal com IA.

No modo padrão, o usuário não precisa escrever do zero. Ele escolhe tom, seleciona cards compactos, adiciona características livres, responde perguntas opcionais e recebe dois textos curtos, humanos e editáveis em primeira pessoa.

No modo **Nostálgico**, o assistente se adapta para homenagens de pessoas falecidas, com títulos, cards, perguntas e geração textual no passado, em terceira pessoa e com tom saudosista.

A experiência deve ser:

- visual;
- leve;
- responsiva;
- em etapas;
- com cards compactos nas etapas 2 a 8;
- limitada a 300 caracteres por campo;
- segura;
- sem salvamento automático;
- integrada ao fluxo atual da página.


---

## 31. Sincronização documental

Este documento é o contrato canônico da geração assistida de Mini Bio e Curiosidades em `/meus-dados`.

Relações com outros documentos:

| Documento | Relação | Regra de manutenção |
|---|---|---|
| `docs/funcionalidades/CURIOSIDADES_E_IA.md` | Modal de Curiosidades da Home e perguntas sobre a árvore carregada. | Deve apenas apontar para este arquivo quando citar geração de Mini Bio/Curiosidades. |
| `docs/GUIA_COMPONENTES.md` | Responsabilidades de `MeusDados`. | Deve citar o assistente, mas não duplicar todas as etapas. |
| `docs/GUIA_UX_LAYOUT.md` | Padrões visuais e responsivos. | Deve registrar cards compactos e modo memorial em alto nível. |
| `docs/QA_MANUAL.md` | Roteiro de teste. | Deve conter checklist de modo padrão e modo memorial. |
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | Contratos que não podem voltar atrás. | Deve impedir regressão de primeira/terceira pessoa, limite de 300 caracteres e cards compactos. |

Pontos que devem permanecer sincronizados com o código:

- número de etapas do modal;
- labels de tom;
- comportamento do tom **Nostálgico**;
- regras de primeira pessoa no modo padrão;
- regras de terceira pessoa e passado no modo memorial;
- limite de 300 caracteres por campo;
- payload enviado para `/api/ai`;
- tratamento de erro, loading e fechamento automático do modal.
