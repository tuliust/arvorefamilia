# Atribuições e licenças

> Última revisão: 2026-06-14  
> Local recomendado: `docs/ATTRIBUTIONS.md`  
> Tipo: atribuições de terceiros e referências de licença.  
> Status: documento complementar para auditoria de dependências, componentes, ícones, imagens e conteúdo familiar.

---

## 1. Objetivo

Este arquivo registra atribuições de bibliotecas, componentes, ícones, imagens, fotos e materiais externos usados no projeto **Árvore Família** quando houver obrigação ou recomendação de crédito.

Este documento é complementar e não substitui:

```txt
package.json
package-lock.json
LICENSE
README.md
docs/README.md
```

Regras:

- `package.json` é a referência técnica das dependências instaladas;
- a licença efetiva de cada dependência deve ser conferida no pacote instalado antes de redistribuição comercial, publicação ampla ou auditoria jurídica;
- nenhuma atribuição deve incluir secrets, tokens, chaves de API, URLs assinadas ou dados pessoais.

---

## 2. shadcn/ui

Este projeto inclui ou pode incluir componentes derivados/adaptados de **shadcn/ui**.

- Site: `https://ui.shadcn.com/`
- Licença de referência: MIT, conforme repositório oficial do projeto.

Regras:

- componentes copiados ou adaptados devem preservar compatibilidade com a licença original;
- alterações locais de estilo, composição ou nomenclatura não removem a necessidade de respeitar a licença de origem;
- se um componente for substituído por implementação própria, manter atribuição apenas enquanto houver derivação relevante.

---

## 3. Radix UI

Componentes de UI podem usar primitives do **Radix UI**, conforme dependências declaradas no projeto.

Regras:

- conferir a licença no pacote instalado antes de redistribuição ou auditoria;
- atribuições específicas só são necessárias se exigidas pela licença aplicável;
- wrappers locais devem manter compatibilidade com a licença da dependência.

---

## 4. lucide-react e ícones

O projeto usa **lucide-react** para ícones de interface e árvore.

Exemplos de uso funcional:

```txt
User
PawPrint
Star
Cross
Calendar
Heart
Search
Settings
```

Contrato visual atual da árvore:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa humana sem foto | ícone `User` |
| Pet sem foto | ícone `PawPrint` |

Regras:

- não há fallback visual obrigatório por gênero nos cards atuais;
- não incorporar SVG externo de avatar homem/mulher/pet sem verificar origem, licença e atribuição;
- se ícones forem importados de biblioteca declarada em `package.json`, confirmar a licença no pacote correspondente;
- se algum SVG externo for copiado para o código, registrar autor, URL, licença e arquivo de destino neste documento.

---

## 5. React Flow / xyflow

O projeto ainda pode conter stack legado relacionado a React Flow/xyflow, mesmo que as views oficiais atuais da árvore usem HTML/CSS/SVG próprios.

Regras:

- enquanto houver dependência instalada ou código derivado, manter auditoria de licença via `package.json`;
- a presença de React Flow no projeto não significa que `/genealogia` ou `/visao-completa` sejam views ativas;
- eventual remoção de React Flow/Dagre deve ser tratada em frente técnica própria.

---

## 6. Dependências npm

As dependências do projeto estão declaradas em:

```txt
package.json
package-lock.json
```

Principais bibliotecas ou grupos de bibliotecas usados pelo projeto incluem, entre outras:

```txt
React
Vite
TypeScript
Tailwind CSS
Supabase JS
React Router
React Flow / xyflow
lucide-react
html2canvas
jsPDF
Radix UI
react-easy-crop
```

Regras:

- confirmar licenças no pacote instalado antes de distribuição comercial ou auditoria jurídica;
- não copiar textos longos de licenças para este documento se já houver arquivo oficial no pacote;
- manter `package.json` e lockfile como referência técnica;
- atualizar este documento se uma biblioteca exigir crédito explícito em UI, README ou documentação pública.

---

## 7. Unsplash e imagens externas

Este projeto pode incluir fotos oriundas do **Unsplash** ou de bancos de imagem externos.

- Site: `https://unsplash.com`
- Licença de referência: consultar a página oficial do serviço e a foto específica.

Regras:

- registrar autor, URL da foto e licença quando uma imagem específica for incorporada ao produto final;
- evitar usar imagens externas sem confirmar licença;
- se a imagem for substituída por upload próprio da família ou asset autoral, remover atribuição específica desnecessária;
- não usar imagem externa em perfil, árvore ou demonstração pública sem autorização/licença compatível.

Modelo de registro para imagem específica:

```txt
Arquivo:
Fonte:
Autor:
URL:
Licença:
Data de consulta:
Uso no projeto:
```

---

## 8. Conteúdo familiar e uploads

Fotos, documentos, arquivos históricos, nomes, datas, relatos e dados pessoais adicionados ao sistema são conteúdo da própria família, dos usuários ou do acervo familiar.

Regras:

- não reutilizar fora do projeto sem autorização;
- não usar como material de demonstração pública sem consentimento;
- preservar privacidade de pessoas vivas;
- não incluir dados sensíveis em documentação pública, issues, commits ou exemplos;
- não usar arquivos reais em screenshots de documentação pública sem anonimização;
- uploads familiares não são assets livres para redistribuição.

---

## 9. IA e conteúdo gerado

O projeto pode usar IA em funcionalidades como curiosidades, perguntas assistidas ou geração explícita de insights.

Regras:

- conteúdo gerado por IA deve ser tratado como auxiliar, revisável e dependente do contexto fornecido;
- não usar IA para inventar biografias, datas, relacionamentos ou fatos familiares;
- não enviar secrets, service role, tokens ou dados desnecessários para prompts;
- se algum conteúdo gerado for publicado como texto final permanente, revisar autoria, privacidade e adequação antes de exposição pública.

---

## 10. Google, Supabase, Resend e serviços externos

O projeto pode integrar serviços externos como:

```txt
Supabase
Google Maps/Places
Google Calendar/OAuth
Resend
OpenAI/serverless IA
```

Regras:

- termos de uso, marcas e requisitos de atribuição devem ser revisados no serviço correspondente;
- chaves, tokens e client secrets não devem constar neste documento;
- requisitos de OAuth/Google Agenda ficam documentados operacionalmente em `docs/operacao/OAUTH_GOOGLE.md`;
- este arquivo registra atribuição/licença, não configuração operacional.

---

## 11. Manutenção

Atualizar este arquivo quando:

- nova biblioteca com exigência de atribuição for adicionada;
- imagem externa for incorporada ao repositório;
- asset externo for usado em página pública;
- SVG externo for copiado para o código;
- ícone ou pacote visual novo substituir `lucide-react`;
- houver mudança de licença relevante;
- o projeto passar por auditoria de licenças;
- o projeto passar a distribuir material publicamente fora do ambiente familiar privado.

Checklist antes de publicar ou redistribuir:

```bash
git status --short
npm run build
git diff --check
```

Também conferir manualmente:

```txt
package.json
package-lock.json
docs/ATTRIBUTIONS.md
README.md
```

---

## 12. Não registrar aqui

Não inserir neste arquivo:

- secrets;
- tokens;
- chaves de API;
- service role;
- URLs assinadas;
- dados pessoais;
- dumps;
- prints com dados reais;
- textos longos de licenças copiadas sem necessidade;
- decisões funcionais de produto;
- troubleshooting operacional.

Para operação, usar:

```txt
docs/operacao/
```

Para decisões funcionais, usar:

```txt
docs/funcionalidades/
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```
