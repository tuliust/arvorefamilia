# ARVOREFAMILIA — Ideias organizadas para implementação

Data do registro: 05/05/2026

Este documento reúne funcionalidades desejadas, ideias de produto e possibilidades futuras para o projeto **Árvore Família**. Algumas funcionalidades já podem ter sido implementadas parcial ou totalmente; outras ainda serão avaliadas, refinadas, priorizadas ou descartadas.

Este arquivo não representa um escopo fechado de implementação. Ele funciona como backlog estratégico e referência de evolução do produto.

---

## 1. Núcleo da árvore genealógica

### 1.1 Árvore geral

- visualizar a árvore completa da família;
- navegar entre ramos;
- ampliar, reduzir e arrastar;
- abrir perfil de qualquer pessoa;
- buscar pessoas diretamente na árvore.

### 1.2 Árvore personalizada do usuário

- ao logar, abrir a árvore a partir da própria pessoa;
- visualizar:
  - pais;
  - avós;
  - bisavós;
  - irmãos;
  - tios;
  - primos;
  - filhos;
  - sobrinhos;
- alternar entre:
  - minha árvore;
  - árvore geral.

### 1.3 Árvore focada em uma pessoa

- selecionar qualquer pessoa e centralizar a árvore nela;
- mostrar:
  - ancestrais;
  - descendentes;
  - irmãos e colaterais.

### 1.4 Famílias dentro da família

- separar por núcleos;
- exibir:
  - ramo paterno;
  - ramo materno;
  - descendentes de um casal;
  - ramo por avós fundadores.

---

## 2. Perfis das pessoas

### 2.1 Perfil detalhado

Cada perfil pode conter:

- nome completo;
- apelido;
- nome pelo qual é conhecido;
- data de nascimento;
- cidade de nascimento;
- cidade atual;
- sobrenomes;
- mini biografia;
- grau de parentesco;
- telefone;
- WhatsApp;
- fotos;
- documentos históricos.

### 2.2 Conexões familiares no perfil

Mostrar:

- pais;
- avós;
- irmãos;
- cônjuge;
- filhos;
- tios;
- primos próximos.

### 2.3 Perfil memorial

Para pessoas falecidas:

- foto;
- mini biografia;
- datas importantes;
- lembranças;
- mensagens da família.

### 2.4 Acontecimentos marcantes do nascimento

Em cada perfil, mostrar:

- fatos importantes do dia do nascimento;
- fatos importantes do ano do nascimento;
- contexto histórico, cultural e social da época.

---

## 3. Parentesco inteligente

### 3.1 Cálculo automático de parentesco

O sistema deve identificar:

- pai / mãe;
- filho / filha;
- irmão / irmã;
- avô / avó;
- bisavô / bisavó;
- tio / tia;
- sobrinho / sobrinha;
- primo / prima;
- graus mais distantes.

### 3.2 Perguntas suportadas

- qual é a minha relação com a pessoa X?
- ele é meu primo?
- primo de qual grau?
- quantos tios eu tenho?
- quantos primos eu tenho?
- qual é o caminho familiar entre mim e essa pessoa?
- quais são meus parentes de sangue?

### 3.3 Modo descobrir parentes

Permitir consultas como:

- quem são meus primos de primeiro grau?
- quem são meus tios-avós?
- quais parentes são do lado materno?
- quais nasceram na mesma cidade que eu?

---

## 4. Busca, filtros e exploração

### 4.1 Busca geral

Buscar por:

- nome;
- apelido;
- sobrenome;
- cidade;
- mês de nascimento;
- signo;
- geração;
- ramo familiar.

### 4.2 Filtros por geração

- Geração Alpha;
- Geração Z;
- Geração Y / Millennials;
- Geração X;
- Baby Boomer.

### 4.3 Busca por sobrenome

Mostrar:

- todos os sobrenomes cadastrados;
- quantas pessoas têm cada sobrenome;
- pessoas ligadas a cada sobrenome;
- origem dos ramos.

### 4.4 Filtros por escopo familiar

- família direta;
- ramo materno;
- ramo paterno;
- árvore inteira;
- pessoas favoritas.

---

## 5. Calendário e datas importantes

### 5.1 Calendário visual familiar

Criar um componente mensal com:

- nome do mês;
- setas para avançar e voltar;
- dias em formato de grade;
- aniversariantes em cada data;
- datas de falecimento.

### 5.2 Exibição nas datas

Mostrar:

- aniversariantes do dia;
- idade que fará;
- pessoas falecidas naquele dia;
- há quantos meses ou anos a pessoa faleceu.

### 5.3 Variações úteis

- aniversariantes do mês;
- datas de memória;
- próximos aniversários;
- calendário anual.

### 5.4 Eventos da família

Agenda interna com:

- encontros;
- aniversários;
- reuniões;
- homenagens;
- encontros anuais.

---

## 6. Integração com Google Agenda

### Objetivo

Permitir que o usuário adicione aniversários da árvore ao próprio calendário.

### Possibilidades

- adicionar todos os aniversários;
- adicionar aniversários de pessoas específicas;
- adicionar aniversários de grupos:
  - família direta;
  - primos;
  - tios;
  - favoritos;
- criar evento recorrente anual;
- incluir:
  - nome da pessoa;
  - data de nascimento;
  - grau de parentesco;
  - link para o perfil.

### Caminhos técnicos

- exportação `.ics`;
- integração com Google Calendar API.

---

## 7. IA e assistente inteligente

### 7.1 Assistente estilo ChatGPT

Criar um assistente para responder perguntas sobre a árvore.

### Exemplos de perguntas

- quantas pessoas nasceram em março?
- quais são os aniversários de março?
- quantas pessoas são de aquário?
- quem é a pessoa mais velha?
- em quais cidades mais nasceram pessoas?
- quais sobrenomes existem na árvore?
- qual é minha relação com a pessoa X?
- quantos primos eu tenho?

### 7.2 Tipos de resposta

- estatísticas;
- parentesco;
- curiosidades;
- filtros por data, cidade, sobrenome e gênero;
- resumos sobre uma pessoa;
- resumos sobre um ramo da família;
- comparações entre membros.

### 7.3 Requisitos

- base estruturada;
- vínculos familiares bem definidos;
- datas padronizadas;
- cidades e sobrenomes organizados;
- cálculo automático de parentesco.

---

## 8. Curiosidades, insights e estatísticas

### 8.1 Área de curiosidades automáticas

Exemplos:

- família com mais pessoas nascidas em março;
- sobrenome mais frequente;
- cidade mais recorrente;
- pessoa mais velha;
- pessoa mais nova;
- quantidade de primos, tios, netos;
- distribuição por décadas de nascimento.

### 8.2 Cards “Você sabia?”

Exemplos:

- março é o mês com mais aniversários;
- o sobrenome X aparece em 18 pessoas;
- a cidade mais frequente é Curitiba;
- há 5 pessoas da Geração Z;
- Fulano e Beltrano nasceram no mesmo dia.

### 8.3 Painel de estatísticas

Mostrar:

- total de pessoas cadastradas;
- pessoas vivas e falecidas;
- número de gerações;
- cidades mais frequentes;
- sobrenomes mais comuns;
- mês com mais aniversários;
- pessoa mais velha e mais nova.

---

## 9. Comunicação e interação

### 9.1 WhatsApp entre pessoas cadastradas

No perfil da pessoa:

- botão “Enviar mensagem no WhatsApp”.

Possibilidades:

- abrir conversa direto;
- mensagem automática inicial;
- exibir só com consentimento;
- configurações de privacidade.

### 9.2 Mural / fórum da família

Estrutura:

- mural principal;
- tópicos por assunto;
- comentários;
- respostas em sequência;
- curtidas ou reações;
- avisos importantes.

Temas possíveis:

- histórias antigas;
- encontros;
- aniversariantes;
- fotos antigas;
- sobrenomes;
- busca por antepassados.

Recursos extras:

- anexar fotos;
- marcar pessoas;
- destacar tópicos;
- moderação;
- notificação de resposta.

---

## 10. Fotos, mídia e acervo

### 10.1 Álbuns de fotos por ramo

Exemplos:

- lado materno;
- lado paterno;
- décadas;
- casamentos;
- encontros;
- infância.

### 10.2 Recursos

- marcar pessoas nas fotos;
- separar por evento;
- separar por época.

### 10.3 Documentos históricos

Guardar e organizar:

- certidões;
- cartas;
- recortes de jornal;
- receitas antigas;
- documentos de imigração;
- diplomas;
- anotações manuscritas.

### 10.4 Associação de documentos

- vincular documentos a pessoas específicas;
- permitir consulta por perfil ou por tema.

---

## 11. História, memória e contexto

### 11.1 Linha do tempo da família

Página cronológica com:

- nascimentos;
- casamentos;
- falecimentos;
- mudanças de cidade ou país;
- formaturas;
- profissões marcantes;
- fotos por época.

### 11.2 Modo história

Uma navegação mais editorial, como um mini museu digital.

Pode contar:

- origem da família;
- mudanças de cidade;
- gerações;
- momentos marcantes;
- fotos e documentos.

### 11.3 Página de homenagens

Uma área especial para pessoas falecidas com:

- foto;
- mini biografia;
- mensagens;
- datas importantes;
- lembranças.

---

## 12. Geografia da família

### 12.1 Mapa da família

Mostrar:

- cidade de nascimento;
- cidade onde viveu;
- cidade atual;
- países ligados à história da família;
- fluxos migratórios.

### 12.2 Perguntas possíveis

- de onde vieram os antepassados?
- onde a família mais se concentrou?
- quais países fazem parte da história da família?

---

## 13. Colaboração e contribuições

### Sistema de contribuições da família

Permitir que parentes:

- sugiram correção de nome;
- enviem foto;
- adicionem data;
- contem uma história;
- indiquem um documento.

### Regra recomendada

- tudo passa por moderação antes de publicar.

---

## 14. Notificações e lembretes

### Notificações possíveis

- aniversário amanhã;
- aniversário hoje;
- data de memória nesta semana;
- novo tópico no mural;
- nova foto adicionada;
- nova informação sobre um parente;
- eventos próximos.

---

## 15. Comparações e explorações avançadas

### Comparador de perfis

Comparar duas pessoas por:

- grau de parentesco;
- diferença de idade;
- cidades em comum;
- sobrenomes em comum;
- ramo familiar;
- eventos parecidos.

---

## 16. Privacidade e controle de acesso

### Regras possíveis

- perfil público ou restrito;
- telefone oculto;
- WhatsApp visível só para parentes logados;
- datas sensíveis ocultas;
- falecimento exibido ou não;
- fotos privadas ou públicas.

---

## 17. Página inicial dinâmica

### A home pode mostrar

- aniversariantes de hoje;
- lembranças do dia;
- fatos históricos da família;
- novo tópico no mural;
- curiosidade automática;
- próximos eventos.

---

# Organização por prioridade

## MVP

- árvore geral;
- perfis detalhados;
- parentesco básico;
- busca por nome/sobrenome;
- calendário visual;
- datas de falecimento;
- escopo por família direta / ramo materno / ramo paterno;
- curiosidades básicas;
- integração inicial com favoritos e notificações.

## Fase 2

- Google Agenda;
- IA para perguntas;
- mural/fórum;
- WhatsApp;
- geração automática de insights;
- linha do tempo;
- mapa da família;
- álbuns e documentos.

## Fase 3

- assistente avançado de parentesco;
- comparador de perfis;
- contribuições moderadas;
- página de homenagens;
- modo história;
- regras finas de privacidade;
- home dinâmica avançada.

---

# Estrutura resumida do produto

## Módulo 1 — Estrutura familiar

- árvore;
- perfis;
- parentesco;
- gerações;
- ramos.

## Módulo 2 — Datas e agenda

- calendário;
- aniversários;
- memória;
- eventos;
- Google Agenda.

## Módulo 3 — Inteligência

- IA;
- curiosidades;
- estatísticas;
- busca avançada;
- comparações.

## Módulo 4 — Interação

- WhatsApp;
- mural;
- notificações;
- contribuições.

## Módulo 5 — Memória e acervo

- fotos;
- documentos;
- homenagens;
- linha do tempo;
- modo história;
- mapa da família.

---

# Observações de produto

- Algumas ideias dependem de normalização forte do banco, principalmente parentesco, datas, cidades e sobrenomes.
- O assistente de IA deve ser tratado como camada de consulta sobre dados estruturados, não como substituto da lógica determinística de parentesco.
- Funcionalidades com dados pessoais, WhatsApp, telefone, fotos e datas sensíveis devem ser implementadas junto com regras de privacidade e consentimento.
- Recomenda-se separar cada grande módulo em issues ou etapas independentes antes da implementação.
