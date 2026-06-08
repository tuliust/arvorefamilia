# Atribuições e licenças

> Última revisão: 2026-06-08  
> Local recomendado: `docs/ATTRIBUTIONS.md`  
> Tipo: atribuições de terceiros e referências de licença.

---

## 1. Objetivo

Este arquivo registra atribuições de bibliotecas, componentes, imagens e materiais externos usados no projeto **Árvore Família** quando houver obrigação ou recomendação de crédito.

Não substituir:

```txt
package.json
LICENSE
README.md
```

Este documento é complementar.

---

## 2. shadcn/ui

Este projeto inclui componentes derivados de **shadcn/ui**.

- Site: `https://ui.shadcn.com/`
- Licença: MIT
- Licença de referência: `https://github.com/shadcn-ui/ui/blob/main/LICENSE.md`

Observação:

- componentes copiados/adaptados devem preservar compatibilidade com a licença MIT;
- alterações locais de estilo ou composição não removem a necessidade de respeitar a licença original.

---

## 3. Unsplash

Este projeto pode incluir fotos oriundas do **Unsplash**.

- Site: `https://unsplash.com`
- Licença: `https://unsplash.com/license`

Regras:

- preferir registrar autor e URL da foto quando a imagem específica for incorporada ao produto final;
- evitar usar imagens externas sem confirmar licença;
- se a foto for substituída por upload próprio da família, remover atribuição específica desnecessária.

---

## 4. Dependências npm

As dependências do projeto estão declaradas em:

```txt
package.json
```

Principais bibliotecas de UI/funcionalidade incluem, entre outras:

```txt
React
Vite
TypeScript
Tailwind CSS
Supabase JS
React Router
React Flow
lucide-react
html2canvas
jsPDF
Radix UI
```

A licença de cada dependência deve ser confirmada no pacote correspondente antes de redistribuição comercial, publicação pública ampla ou auditoria jurídica.

---

## 5. Conteúdo familiar e uploads

Fotos, documentos, arquivos históricos e dados pessoais adicionados ao sistema são conteúdo da própria família/usuários ou do acervo familiar.

Regras:

- não reutilizar fora do projeto sem autorização;
- não usar como material de demonstração pública sem consentimento;
- preservar privacidade de pessoas vivas;
- não incluir dados sensíveis em documentação pública, issues ou commits.

---

## 6. Manutenção

Atualizar este arquivo quando:

- nova biblioteca com exigência de atribuição for adicionada;
- imagens de terceiros forem incorporadas ao repositório;
- assets externos forem usados em páginas públicas;
- houver mudança de licença relevante;
- o projeto passar por auditoria de licenças.

Não inserir secrets, tokens, chaves de API, URLs assinadas ou dados pessoais neste arquivo.
