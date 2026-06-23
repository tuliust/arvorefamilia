# Decisões arquiteturais

> Última revisão: 2026-06-22

## ADR-012 — Mapa mobile protegido por scripts específicos

### Decisão

Não alterar scripts mobile ou `index.html` em frentes não relacionadas ao mapa mobile.

### Motivo

O mapa mobile depende de múltiplos scripts de correção visual/comportamental. Alterações indiretas geram alto risco de regressão.

## ADR-013 — Toolbar mobile sem exportação fixa

### Decisão

Exportação não deve ser tratada como item fixo de toolbar mobile sem revisão específica.

## ADR-014 — IA sem inferência sensível

### Decisão

A IA não deve inferir nem expor dados sensíveis.

### Dados proibidos no contexto

- telefone;
- endereço;
- WhatsApp;
- redes sociais;
- permissões privadas;
- URLs;
- storage paths;
- tokens;
- base64;
- chaves;
- causa de morte não informada;
- saúde, religião, orientação sexual, finanças ou conflitos familiares não informados.

## ADR-015 — Fatos históricos usam `arquivos_historicos`

### Decisão

Não criar tabela nova para fatos históricos neste ciclo. Usar `arquivos_historicos` com arquivo opcional.

### Motivo

Menor escopo, integração imediata com tela existente, revisão e timeline.

### Consequência

`url`, `storage_bucket`, `storage_path` e `mime_type` podem ser nulos.

## ADR-016 — Memorial separado do tom textual

### Decisão

`Nostálgico` é apenas tom. Pessoa falecida/memorial é controlada por toggle próprio.

### Motivo

Usuário pode querer tom nostálgico para pessoa viva ou tom elegante/formal para pessoa falecida.

## ADR-017 — Mini Bio e Curiosidades com 500 caracteres

### Decisão

Aumentar limite de 300 para 500 caracteres.

### Diretriz de geração

A IA deve mirar aproximadamente 400–450 caracteres por campo quando houver insumo suficiente.

## ADR-018 — Headers sem ações no onboarding

### Decisão

Ocultar ações no header das páginas de onboarding.

### Rotas

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

## ADR-019 — Pets como grupo funcional próprio

### Decisão

Pets são perfis do tipo `humano_ou_pet: 'Pet'` e aparecem em grupo próprio.

### Consequência

Não são filhos humanos e não entram na contagem/UX de Filhos.

## ADR-020 — Alterações de vínculo por solicitação pendente

### Decisão

Usuários membros não criam diretamente relacionamentos definitivos no fluxo de onboarding. O fluxo gera `relationship_change_requests`.

## ADR-021 — Títulos principais fora de containers operacionais

### Decisão

Blocos como `Sobre mim` e `Familiares de X` ficam fora dos cards/containers operacionais.

### Motivo

Melhor hierarquia visual, menor sensação de card dentro de card e UX mais limpa.

## ADR-022 — Build Vite não substitui typecheck

### Decisão

Tratar `npm run build` como necessário, mas não suficiente.

### Motivo

O erro `MapPin is not defined` mostrou que runtime errors podem passar pelo build.

### Recomendação

Adicionar `npx tsc --noEmit` ao fluxo de validação.
