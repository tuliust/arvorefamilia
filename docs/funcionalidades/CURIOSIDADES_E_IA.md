# Curiosidades e IA - modal, conexão familiar e perguntas assistidas

> Última revisão: 2026-06-15
> Local canônico: `docs/funcionalidades/CURIOSIDADES_E_IA.md`
> Tipo: documentação funcional e técnica das abas de Curiosidades, conexão familiar e IA na Home.
> Status: atualizado para registrar que a geração assistida de Mini Bio e Curiosidades permanece na Etapa 1 `/meus-dados` do novo fluxo em 5 etapas.

## 1. Função deste documento

Este documento descreve a experiência de exploração familiar acessada pela Home autenticada, especialmente o modal **Curiosidades** e suas abas de descoberta.

Use este arquivo para manter:

- estrutura do modal **Curiosidades**;
- abas informativas e exploratórias;
- aba **Qual a minha conexão com alguém?**;
- aba **Pergunte à IA**;
- regras de contexto genealógico enviado à IA;
- perguntas permitidas e bloqueadas;
- respostas determinísticas/fallbacks;
- privacidade, segurança e anti-regressões.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| views da árvore | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| componentes gerais | `docs/GUIA_COMPONENTES.md` |
| UX e layout geral | `docs/GUIA_UX_LAYOUT.md` |
| geração assistida de Mini Bio e Curiosidades em `/meus-dados` | `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| deploy de `/api/ai` | `docs/operacao/DEPLOYMENT.md` ou guia operacional vigente |
| pendências futuras | `docs/PLANO_PROXIMOS_PASSOS.md` |
| dados, RLS e migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |

---

## 2. Escopo funcional

O escopo atual cobre:

- curiosidades calculadas a partir das pessoas e relacionamentos carregados pela Home;
- exploração de cidades, datas, nomes, gerações e padrões familiares;
- descoberta de conexão entre duas pessoas;
- perguntas assistidas por IA sobre o conjunto familiar carregado;
- respostas determinísticas para perguntas recorrentes quando o dado pode ser calculado localmente;
- regras para evitar exposição de IDs, dados técnicos e inferências sensíveis.

Status atual:

```txt
IA/Curiosidades está validada no escopo funcional atual.
`DOC-009`, `DOC-011` e `DOC-012` não são pendências abertas.
Novas melhorias devem ser registradas como manutenção ou requisito específico,
não como pendência aberta herdada de QA inicial.
```

Fora do escopo atual:

- gravar novas informações a partir da IA;
- aprovar ou rejeitar solicitações;
- alterar relacionamentos;
- inferir dados privados sem cadastro explícito;
- treinar modelo com dados da família;
- usar IA para moderação automática;
- criar biografias inventadas.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Modal principal de Curiosidades | `src/app/pages/home/HomeCuriositiesDialog.tsx` |
| Utilitários de curiosidades | `src/app/pages/home/homeCuriositiesUtils.ts` |
| Aba de conexão familiar | `src/app/pages/home/ConnectionDiscoveryPanel.tsx` |
| Card visual de resultado/caminho | `src/app/pages/home/DiscoverResultCard.tsx` |
| Informações de contato/contexto visual | `src/app/pages/home/ContactInfo.tsx` |
| Painel de perguntas à IA | `src/app/pages/home/AiQuestionPanel.tsx` |
| Contexto estruturado para IA | `src/app/pages/home/homeAiContext.ts` |
| Display textual de parentesco | `src/app/utils/relationshipDegreeDisplay.ts` |
| Endpoint serverless de IA | `api/ai.ts` |
| Tipos de pessoas/relacionamentos | `src/app/types/index.ts` |
| Serviço de dados da Home | `src/app/pages/Home.tsx` e services relacionados |

---

## 4. Acesso e acionamento

A experiência fica dentro da Home autenticada, usada pelas views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regras:

- visitante não autenticado não deve acessar Curiosidades;
- a abertura do modal parte do `HomeHeader` ou ação equivalente da Home;
- o modal usa dados já carregados pela Home;
- falha parcial da IA não deve impedir uso das demais abas;
- a experiência não deve exigir permissões administrativas;
- dados ocultos por privacidade não devem ser expostos por microcopy, tooltip ou resposta de IA.

---

### 4.1 Rotas e documentação vigentes

A experiência de **Curiosidades** pertence ao shell autenticado da árvore e deve considerar apenas as views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Não tratar como rotas ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

A rota `/minha-arvore/editar` continua vigente, mas é fluxo de edição do membro e não é ponto de entrada do modal de Curiosidades.

Regras:

- a pessoa central usada pela IA deve acompanhar a pessoa carregada no shell da árvore;
- a alternância vertical/horizontal não deve alterar o contexto familiar enviado à IA;
- aliases históricos como “minha árvore” e “genealogia” podem existir apenas como linguagem do usuário, não como rotas de navegação;
- respostas da IA não devem sugerir acessar rotas removidas.

## 5. Estrutura do modal

O modal **Curiosidades** pode reunir abas como:

```txt
Você Sabia?
Descubra mais sobre...
Pergunte à IA
Qual a minha conexão com alguém?
```

Regras de UX:

- abas devem ter rótulos curtos;
- conteúdo deve rolar internamente quando necessário;
- tooltip, dropdown e popover devem permanecer dentro de camadas visuais acima do modal;
- tooltips de cidade não devem provocar tremor, resize ou salto de scroll;
- cards devem preservar quebra segura de nomes longos;
- no mobile, botões e abas devem continuar tocáveis.

---

## 6. Curiosidades calculadas

A camada de curiosidades pode exibir informações como:

- pessoas por cidade de nascimento;
- pessoas por cidade de residência;
- datas familiares relevantes;
- nomes recorrentes;
- pessoas mais antigas;
- distribuição por gerações;
- eventos e memórias;
- padrões simples extraídos de relacionamentos.

Regras:

- cálculos devem usar dados carregados e tipados;
- dados ausentes devem gerar estado vazio, não erro;
- textos devem evitar IDs técnicos;
- cidade deve ser exibida em linguagem humana;
- quando houver país/UF, preservar formatação consistente;
- não inferir informação que não esteja cadastrada ou calculável.

---

## 7. Tooltips de cidades

Em blocos como **Onde moram** e **Onde nasceram**, os tooltips devem:

- listar pessoas relacionadas à cidade;
- ficar visualmente estáveis;
- não alterar altura do modal ao abrir;
- usar largura máxima compatível com viewport;
- permitir scroll interno se houver muitos nomes;
- manter `z-index` suficiente para aparecer acima do conteúdo.

Regra técnica atual:

```txt
Tooltip fixo ou portalizado é preferível a tooltip que participa do fluxo do modal.
```

Anti-regressões:

- não posicionar tooltip de forma que corte nomes;
- não deixar tooltip gerar overflow horizontal global;
- não usar tooltip para expor dados privados;
- não depender de `title` nativo quando o conteúdo exige lista estruturada.

---

## 8. Aba "Qual a minha conexão com alguém?"

A aba permite comparar duas pessoas e obter:

- título principal da relação;
- subtítulo narrativo;
- caminho familiar;
- cards das pessoas envolvidas;
- explicação em linguagem humana.

Arquivo principal:

```txt
src/app/pages/home/ConnectionDiscoveryPanel.tsx
```

Utilitário textual principal:

```txt
src/app/utils/relationshipDegreeDisplay.ts
```

Regras:

- a pessoa central deve ser tratada como referência quando aplicável;
- relações pai/mãe devem usar gênero parental quando inferível pelo relacionamento;
- primos devem receber narrativa complementar sobre os pais;
- tio/sobrinho deve explicar o vínculo intermediário;
- cônjuge de parente deve ser descrito sem inventar consanguinidade;
- pet deve ser tratado como pet/tutela, não como filho humano;
- se não houver caminho sustentado pelo grafo, informar ausência de relação calculável.

Exemplos de narrativas esperadas:

```txt
O pai de Eike, Absalon Jr, é irmão de Márcio, pai de Tulius.
Athanase é irmão de Condilênia, mãe de Tulius.
Tulius Souza é tutor de Populos.
```

Regras visuais:

- nomes longos nos cards devem quebrar linha;
- evitar `...` prematuro quando houver espaço suficiente;
- frase principal deve ser distinta do subtítulo;
- não repetir subtítulo genérico se ele apenas repetir o título.

---

## 9. Aba "Pergunte à IA"

A aba permite perguntas em linguagem natural sobre a família.

Arquivos principais:

```txt
src/app/pages/home/AiQuestionPanel.tsx
src/app/pages/home/homeAiContext.ts
api/ai.ts
```

Fluxo conceitual:

```txt
Usuário pergunta
-> AiQuestionPanel coleta pergunta
-> homeAiContext monta contexto estruturado
-> api/ai.ts processa com regras de sistema
-> resposta retorna para o painel
```

### 9.1 Geração de Mini Bio e Curiosidades

A geração assistida de **Mini Bio** e **Curiosidades** pertence à Etapa 1 do onboarding, na página `/meus-dados`, e não ao modal **Curiosidades** da Home.

O documento canônico dessa funcionalidade é:

```txt
docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md
```

Relação entre os dois escopos:

| Escopo | Documento | Onde acontece |
|---|---|---|
| Curiosidades exploratórias, conexão familiar e perguntas sobre a árvore carregada | `CURIOSIDADES_E_IA.md` | Home autenticada / modal Curiosidades |
| Geração de textos para campos editáveis `minibio` e `curiosidades` | `MINI_BIO_CURIOSIDADES_IA.md` | `/meus-dados`, seção **Sobre Mim** |

Pontos de integração:

- os dois fluxos podem usar o endpoint serverless `POST /api/ai`;
- nenhum fluxo expõe `OPENAI_API_KEY` no frontend;
- o modal da Home deve responder perguntas sobre a árvore carregada;
- `/meus-dados` deve gerar textos curtos para preenchimento de formulário;
- a geração de Mini Bio e Curiosidades não publica nem salva automaticamente;
- o modo **Nostálgico/Memorial** da Mini Bio deve ser documentado apenas em `MINI_BIO_CURIOSIDADES_IA.md`.

Anti-regressão documental:

- não duplicar neste arquivo o fluxo completo de 10 etapas de `/meus-dados`;
- não documentar aqui payloads antigos baseados em `destination: "minibio"` ou `destination: "curiosidades"` como contrato vigente;
- se o contrato de `/api/ai` mudar, revisar este arquivo e `MINI_BIO_CURIOSIDADES_IA.md` no mesmo lote.

## 10. Contexto estruturado da IA

`homeAiContext.ts` deve preparar o contexto com dados como:

- pessoa central;
- lista de pessoas relevantes;
- datas de nascimento e falecimento;
- cidades de nascimento e residência;
- relacionamentos parentais e conjugais;
- pais por pessoa;
- filhos por pessoa;
- irmãos por pais compartilhados;
- bisavós paternos/maternos quando calculáveis;
- pessoas por cidade;
- pessoas mais antigas;
- cidades recorrentes;
- resumo da linha genealógica.

Regras:

- não enviar dados desnecessários;
- não enviar secrets;
- não enviar service role;
- não enviar IDs técnicos para exibição final;
- contexto deve orientar a IA a usar linguagem familiar;
- relações calculadas devem ter preferência sobre inferência livre do modelo.

---

### 10.1 Dados usados pela árvore, perfis e vínculos

O contexto da IA deve permanecer alinhado aos mesmos dados usados pelas views oficiais da árvore e pelos perfis:

- `pessoas` carregadas no shell autenticado;
- `relacionamentos` parentais e conjugais explícitos;
- vínculos `user_person_links`, quando usados para identificar a pessoa vinculada ao usuário;
- campos de nascimento, falecimento, local de nascimento e residência;
- `manual_generation`, quando disponível para leitura genealógica;
- relacionamentos conjugais múltiplos, sem escolher apenas um cônjuge como verdade única;
- pets identificados por `humano_ou_pet === 'Pet'`.

Regras de consistência:

- se uma pessoa tem múltiplos cônjuges, a IA deve descrever o vínculo como múltiplos relacionamentos, sem apagar ou substituir cônjuge anterior;
- cônjuge de parente deve ser explicado como vínculo por casamento/união, não como consanguinidade;
- datas ausentes devem ser apresentadas como desconhecidas, não inventadas;
- não expor IDs técnicos, salvo em diagnóstico administrativo explícito.

## 11. Perguntas que a IA deve responder

A IA pode responder perguntas como:

```txt
Quem são meus bisavós paternos?
Quem são meus avós maternos?
Quantas pessoas nasceram em Recife?
Quem nasceu em Porto Alegre?
Quem são os irmãos de Márcio Ailton?
Quais são as pessoas mais antigas da família?
Quais cidades aparecem mais vezes como local de nascimento?
Monte um resumo da linha genealógica de Tulius.
Qual é o caminho familiar entre Tulius e Eike?
Quem são os descendentes de determinada pessoa?
Quais informações parecem estar faltando nos cadastros?
```

Critérios:

- responder apenas com dados presentes ou calculáveis;
- citar nomes em bullets quando houver lista;
- incluir ano/idade quando a pergunta pedir antiguidade;
- separar grupos por cidade quando a pergunta for sobre cidades;
- usar `você`, `seu` e `sua` quando a pergunta for da perspectiva da pessoa central;
- indicar incerteza quando o dado não estiver completo.

---

## 12. Perguntas que a IA não deve responder

A IA não deve responder, inferir ou especular sobre:

- condição financeira;
- saúde não cadastrada;
- orientação sexual;
- aparência física;
- caráter, culpa ou acusação;
- causa da morte sem dado cadastrado;
- conflitos familiares privados;
- dados de contato ocultos por privacidade;
- endereços ou telefones não autorizados;
- informações de pessoas vivas que não estejam liberadas no contexto;
- exclusão, edição ou aprovação de dados;
- biografias inventadas.

Resposta esperada nesses casos:

```txt
Não há dados cadastrados suficientes para responder isso com segurança.
```

ou

```txt
Essa pergunta envolve inferência sensível. Posso ajudar com informações genealógicas cadastradas, como parentesco, datas, cidades e conexões familiares.
```

---

## 13. Fallbacks determinísticos

Para perguntas recorrentes, o sistema pode responder com blocos calculados antes ou junto da IA.

Casos prioritários:

| Pergunta | Fonte preferencial |
|---|---|
| Bisavós paternos | pais do pai + pais desses pais |
| Pessoas nascidas em cidade | índice por cidade de nascimento |
| Irmãos de pessoa | pais compartilhados |
| Pessoas mais antigas | ordenação por data de nascimento |
| Cidades recorrentes | agrupamento por cidade |
| Resumo genealógico | pessoa central + gerações + origem familiar |
| Caminho entre pessoas | grafo de relacionamentos |

Regras:

- fallback determinístico deve vencer resposta genérica do modelo quando houver dado suficiente;
- não expor IDs ou estrutura interna;
- não inventar nomes para completar lacunas;
- quando houver homônimos, usar nome completo e contexto de data/cidade quando disponível.

---

## 14. Formato das respostas

Preferir:

- resposta direta;
- bullets curtos;
- nomes completos quando necessário;
- data/ano quando relevante;
- explicação breve do caminho familiar;
- sem encerramentos genéricos.

Evitar:

```txt
Se precisar de mais alguma coisa...
Com base nas informações fornecidas...
Não tenho acesso ao banco de dados...
ID: 123e4567...
```

Exemplo desejado:

```txt
Os bisavós paternos de Tulius são:

• Nome A — pai de ...
• Nome B — mãe de ...
• Nome C — pai de ...
• Nome D — mãe de ...
```

---

## 15. Privacidade e segurança

Regras obrigatórias:

- não enviar ou exibir secrets;
- não expor service role;
- não exibir UUIDs;
- não usar IA para alterar dados;
- não exibir contato privado;
- não revelar dados marcados como ocultos;
- não gerar conteúdo sensível por inferência;
- não salvar prompt/resposta em banco sem decisão explícita;
- não usar dados familiares para treinamento externo;
- não apresentar resposta da IA como fonte oficial se houver dúvida.

Quando a resposta for incerta:

```txt
Não encontrei dados cadastrados suficientes para afirmar isso.
```

---

## 16. Operação e deploy

Documentação operacional: `docs/operacao/DEPLOYMENT.md`.

Pontos de deploy:

- `api/ai.ts` deve rodar como serverless/backend;
- `OPENAI_API_KEY` deve ficar no provedor de deploy;
- `OPENAI_API_KEY` não deve usar prefixo `VITE_`;
- `vercel.json` deve preservar `/api/(.*)` antes do fallback para `index.html`;
- logs devem evitar prompt completo se houver dados familiares sensíveis;
- erro de IA deve ser tratado no frontend.

---

## 17. QA mínimo

Validar após alteração em Curiosidades/IA:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Testes manuais:

- abrir modal Curiosidades;
- alternar abas;
- abrir tooltip de cidade com muitos nomes;
- buscar conexão entre duas pessoas próximas;
- buscar conexão entre pessoas sem caminho claro;
- validar relação com pet;
- perguntar sobre bisavós paternos;
- perguntar sobre nascidos em Recife;
- perguntar sobre irmãos de Márcio;
- perguntar sobre pessoas mais antigas;
- perguntar sobre cidades recorrentes;
- perguntar algo sensível e validar recusa;
- desligar/revogar chave de IA em ambiente controlado e validar erro amigável.

Comandos técnicos:

```bash
npm run build
git diff --check
```

Quando houver teste automatizado disponível:

```bash
npm test
```

---

## 18. Sincronização com a baseline atual da árvore

Checklist de manutenção:

- [ ] Curiosidades não referencia `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.
- [ ] Perguntas sobre “mapa”, “árvore”, “genealogia” ou “visão horizontal” direcionam conceitualmente para `/mapa-familiar` e `/mapa-familiar-horizontal`.
- [ ] O contexto de IA considera múltiplos cônjuges quando existirem relacionamentos explícitos.
- [ ] Pets usam regra semântica de pessoa pet.
- [ ] Respostas não sugerem alteração de dados sem fluxo de edição/admin.
- [ ] Dados privados de contato continuam dependentes de privacidade e permissão.


## 19. Anti-regressões

Não fazer:

- expor IDs técnicos na resposta;
- classificar pets como filhos humanos;
- inventar parentesco;
- remover fallback determinístico sem substituir por cálculo equivalente;
- deixar tooltip de cidade tremer ou deslocar o modal;
- usar IA para salvar dados;
- enviar chave de IA para o frontend;
- permitir que erro de IA quebre Curiosidades;
- reintroduzir respostas genéricas longas;
- responder pergunta sensível por especulação;
- usar dados ocultos por privacidade;
- registrar prompt completo em log público;
- criar migration para ajuste textual/visual do modal.

---

## 20. Documentos relacionados

### Navegação para pessoas na árvore

Quando uma ação de IA/Curiosidades troca a pessoa central, ela preserva a view atual entre `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa`. Se abrir `/pessoa/:id`, o fluxo usa `?voltar=` para retornar com segurança à rota e query originais.

```txt
docs/README.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/operacao/DEPLOYMENT.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```
