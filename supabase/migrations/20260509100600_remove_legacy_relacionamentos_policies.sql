-- =====================================================
-- REMOVE LEGACY RELACIONAMENTOS POLICIES
-- Data: 2026-05-09
-- Objetivo: remover policies antigas permissivas de public.relacionamentos.
-- =====================================================

drop policy if exists "Permitir leitura pública de relacionamentos" on public.relacionamentos;
drop policy if exists "Permitir inserção de relacionamentos via service role" on public.relacionamentos;
drop policy if exists "Permitir atualização de relacionamentos via service role" on public.relacionamentos;
drop policy if exists "Permitir deleção de relacionamentos via service role" on public.relacionamentos;
