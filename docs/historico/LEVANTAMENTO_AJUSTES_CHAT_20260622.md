# Levantamento de ajustes realizados no chat — 2026-06-22

## Levantamento consolidado — ciclo funcional 2026-06-22

### Commits confirmados no branch `feature/questionario-ia-vinculos-pets`

| Frente | Commit | Status | Resultado funcional |
|---|---:|---|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Build e push confirmados | Dropdown `Família de [Nome]`, contagem de `Cadastrados`, tour revisado e layout compacto desktop para árvore pequena. |
| Prompt 7A — questionário e geração de perfil | `4a1a995` | Build e push confirmados | Questionário persistido refinado; hash de geração só após geração concluída; contexto de IA sanitizado. |
| Prompt 7B — vínculos, pets e cônjuges | `c9a8f27` | Build e push confirmados | Pets separados de filhos; cônjuge ativo único no estado local; badges e solicitações pendentes preservados. |
| Prompt 7C — fatos e arquivos históricos | `6185b6d` | Build e push confirmados | Fatos sem arquivo integrados a `arquivos_historicos` e à timeline do perfil; migration para anexo opcional. |
| Prompt 7D — UX final de onboarding | `de4f60f` | Build e push confirmados | Questionário reduzido a 8 etapas, headers sem ações no onboarding, textos IA até 500 caracteres, títulos fora de containers e ajustes de rótulos. |

### Hotfix incorporado ao ciclo

- `MeusDados.tsx`: correção do `ReferenceError: MapPin is not defined` com import explícito de `MapPin` em `lucide-react`.
- O build posterior passou, indicando que o erro de runtime foi removido no estado final aplicado.

### Frentes consolidadas neste ciclo

1. **Mapa familiar desktop**
   - Dropdown do painel passa a priorizar a pessoa vinculada/visualizada e exibir `Família de [Nome]`.
   - Contagem de `Cadastrados` usa `user_person_links` como fonte conceitual.
   - Tour separa IA/datas importantes de favoritos.
   - Layout compacto para árvore pequena vertical desktop.

2. **Questionário de perfil e IA**
   - A pergunta inicial passa a ser `Qual é o seu estilo?`.
   - `Nostálgico` volta a ser apenas um tom; não define pessoa falecida.
   - O modo memorial depende do toggle `Você está escrevendo o perfil de uma pessoa falecida?`.
   - Removidas etapas 9 e 10.
   - Última etapa não exibe `Avançar`; fechamento ocorre por `Confirmar meus dados`.
   - Mini Bio e Curiosidades passam a aceitar até 500 caracteres.
   - IA deve gerar cerca de 400–450 caracteres por campo, sem iniciar necessariamente com o nome da pessoa.
   - IA pode considerar campos estruturados seguros: idade aproximada, nascimento/falecimento, profissão, vínculos e fatos históricos, sem dados sensíveis ou URLs/storage.

3. **Meus Vínculos**
   - Pets permanecem em grupo próprio, não em `Filhos`.
   - Pet criado manualmente usa `humano_ou_pet: 'Pet'`.
   - Estado local mantém no máximo um cônjuge ativo.
   - Removidos botões redundantes em estado vazio dos grupos.
   - `Sobre mim` e `Familiares de [Nome]` foram deslocados para fora dos cards, com hierarquia visual maior.
   - `Salvar textos` foi removido; textos são salvos no avanço da etapa.
   - Rótulo feminino de irmã passa a ser `Irmã` quando houver indicação de gênero feminino.

4. **Fatos e Arquivos Históricos**
   - Registro histórico pode existir com ou sem anexo.
   - Registro sem anexo é `Fato`/`Memória`; registro com imagem/PDF continua como `Arquivo`.
   - Timeline do perfil integra ambos.
   - `ano` ordena cronologicamente; sem `ano` fica ao final.
   - Storage continua opcional e só é acionado quando há upload real.

5. **Headers do onboarding**
   - Nas páginas `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` e `/revisao-dados`, o header não exibe ações à direita.
   - Mantém apenas ícone, título e subtítulo do lado esquerdo.

### Fora do escopo e preservado

- Scripts mobile de mapa familiar.
- `index.html`.
- Documentação mobile 3x3 como contrato já consolidado.
- Alterações adicionais de schema fora das migrations já aplicadas para questionário e fatos sem arquivo.

## Checklist pós-merge/deploy recomendado

1. Abrir `/meus-dados` e validar que não há erro `MapPin is not defined`.
2. Validar questionário com pessoa viva: qualquer estilo gera textos no presente/primeira pessoa.
3. Validar questionário com toggle de pessoa falecida: qualquer estilo gera textos no passado/terceira pessoa.
4. Confirmar que Mini Bio e Curiosidades aceitam até 500 caracteres.
5. Abrir `/meus-vinculos` e confirmar ausência do botão `Salvar textos`.
6. Validar salvamento dos textos ao avançar em `/meus-vinculos`.
7. Validar grupos vazios sem botão inferior duplicado.
8. Validar `Irmã` para pessoa feminina em irmãos.
9. Criar fato histórico sem arquivo e confirmar exibição em `/revisao-dados` e na timeline do perfil.
10. Criar arquivo histórico com PDF/imagem e confirmar exibição como `Arquivo`.
11. Validar `/mapa-familiar` com árvore pequena e com árvore complexa.
12. Rodar `git diff --check`, `npm run build` e QA manual das rotas de onboarding.
