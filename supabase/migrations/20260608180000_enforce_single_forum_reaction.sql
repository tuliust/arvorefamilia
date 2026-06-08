-- =====================================================
-- FORUM: UMA REACAO POR USUARIO E ALVO
-- =====================================================
-- Mantem apenas a reacao mais recente quando houver duplicidade
-- e garante unicidade por user_id + alvo_tipo + alvo_id.
-- =====================================================

WITH ranked_reactions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, alvo_tipo, alvo_id
      ORDER BY created_at DESC, id DESC
    ) AS reaction_rank
  FROM public.forum_reacoes
)
DELETE FROM public.forum_reacoes fr
USING ranked_reactions rr
WHERE fr.id = rr.id
  AND rr.reaction_rank > 1;

ALTER TABLE public.forum_reacoes
  DROP CONSTRAINT IF EXISTS forum_reacoes_user_id_alvo_tipo_alvo_id_tipo_key;

ALTER TABLE public.forum_reacoes
  DROP CONSTRAINT IF EXISTS forum_reacoes_user_id_alvo_tipo_alvo_id_key;

ALTER TABLE public.forum_reacoes
  ADD CONSTRAINT forum_reacoes_user_id_alvo_tipo_alvo_id_key
  UNIQUE (user_id, alvo_tipo, alvo_id);
