# QA manual

> Última revisão: 2026-06-23
> Escopo: validação manual das rotas e contratos documentados.
> Status: canônico.

## Pré-condições

- Ambiente com Supabase configurado.
- Usuário membro autenticado.
- Usuário admin para rotas administrativas.
- Dados mínimos de pessoas, relacionamentos, vínculos, fatos históricos e notificações.

## Validação técnica local

Executar antes de merge:

```bash
git status --short
git diff --check
grep -R $'\xC3\|\xC2\|\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
```

Confirmar que as alterações documentais ficaram restritas aos documentos canônicos necessários.

## Rotas de árvore

### `/mapa-familiar`

- Abre a partir de `/`.
- Carrega pessoas e relacionamentos.
- Exibe pessoa de referência quando houver vínculo ou query `pessoa`.
- O seletor de visualização não deve exibir mojibake em `Família de X` ou `Sua view padrão`.
- O cabeçalho do painel desktop deve exibir ícone de olho sem borda e botão de recolher alinhado dentro do container na linha do título.
- Permite alternar filtros de parentes diretos.
- Permite alternar vivos, falecidos e pets.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem manter labels e contadores em uma linha, sem reticências.
- Abre perfil em `/pessoa/:id`.
- Mantém painel desktop sem cortar exportação.
- Mobile não deve abrir painéis persistentes por padrão.

### `/mapa-familiar-horizontal`

- Preserva query `pessoa` ao alternar visualização.
- Renderiza linha geracional horizontal.
- Mantém filtros aplicáveis e contadores coerentes.
- Replica no painel desktop os critérios visuais de seletor, cabeçalho, grupos e exportação validados em `/mapa-familiar`.

## Onboarding de membro

### `/meus-dados`

- Salva dados básicos.
- Respeita preferências de privacidade.
- Gera ou mantém insumos de Mini Bio/Curiosidades.
- Modo memorial depende de toggle explícito.

### `/meus-vinculos`

- Diferencia pessoas humanas e pets.
- Exibe badges de cadastrado/pré-cadastrado conforme vínculos reais.
- Não grava vínculo definitivo quando a regra exigir solicitação.
- Mantém textos de perfil fora do box de edição de vínculos.

### `/arquivos-historicos`

- Permite fato sem arquivo.
- Permite upload de imagem ou PDF.
- Relaciona fato/arquivo à pessoa ou relacionamento conforme fluxo.
- Registros devem aparecer na timeline do perfil quando implementado pelo serviço.

### `/preferencias`

- Deve ser acessível para pessoa viva.
- Deve ser pulada para pessoa marcada como falecida no fluxo de onboarding.

### `/revisao-dados`

- Resume informações antes de concluir.
- Não deve prometer alteração direta quando há solicitação pendente.

## Funcionalidades autônomas

### `/curiosidades`

- Cards e rankings carregam a partir dos dados reais.
- Dropdowns iniciam neutros quando dependem de seleção.
- Estatísticas de pets, falecidos, casais e cidades devem ser coerentes com os dados.

### `/forum`

- Lista tópicos.
- Busca/filtros não devem quebrar layout desktop.
- Criar, abrir e editar tópico deve respeitar rotas atuais.

### `/meus-favoritos`

- Busca/filtros devem ocupar largura adequada no desktop.
- Lista deve permanecer navegável em mobile.

### `/notificacoes`

- Dropdown e página não devem cortar ações.
- No desktop, o botão `Alertas` dos headers de páginas de membro deve abrir o dropdown em vez de redirecionar diretamente.
- O rodapé do dropdown deve exibir `Ver todas` e `Preferências` com larguras equivalentes e sem quebra de linha.
- Ajustes devem estar acessíveis por `/ajustar-notificacoes`.

### `/pessoa/:id`

- Exibe perfil da pessoa.
- Respeita query `voltar` quando fornecida.
- Não deve expor dados bloqueados por privacidade.

## Área administrativa

- `/admin/login` deve permanecer público.
- Demais rotas `/admin/*` devem exigir `ProtectedRoute`.
- Validar dashboard, pessoas, relacionamentos, importação, diagnóstico, integridade, atividades, notificações, dúvidas e solicitações de vínculos.

## Critérios de aceite

- Nenhum documento canônico cita rota inexistente.
- Nenhum documento marca como pendente uma funcionalidade implementada.
- Nenhum documento marca como implementada uma funcionalidade ausente do código.
- `docs/README.md` referencia apenas arquivos existentes.
- `docs/` não contém mojibake.
