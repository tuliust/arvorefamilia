-- Regra de consistencia: relacao conjugal com pessoa falecida fica inativa.

create or replace function public.normalize_spouse_relationship_active_status()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  has_inactive_reason boolean := false;
begin
  if new.tipo_relacionamento = 'conjuge' then
    select exists (
      select 1
      from public.pessoas p
      where p.id in (new.pessoa_origem_id, new.pessoa_destino_id)
        and (
          coalesce(p.falecido, false) = true
          or p.data_falecimento is not null
          or nullif(trim(coalesce(p.local_falecimento, '')), '') is not null
        )
    )
    into has_inactive_reason;

    if has_inactive_reason then
      new.ativo := false;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_normalize_spouse_relationship_active_status on public.relacionamentos;

create trigger trg_normalize_spouse_relationship_active_status
before insert or update on public.relacionamentos
for each row
execute function public.normalize_spouse_relationship_active_status();

update public.relacionamentos r
set ativo = false
where r.tipo_relacionamento = 'conjuge'
  and r.ativo is distinct from false
  and exists (
    select 1
    from public.pessoas p
    where p.id in (r.pessoa_origem_id, r.pessoa_destino_id)
      and (
        coalesce(p.falecido, false) = true
        or p.data_falecimento is not null
        or nullif(trim(coalesce(p.local_falecimento, '')), '') is not null
      )
  );

notify pgrst, 'reload schema';
