alter table public.pessoas
add column if not exists complemento text;

comment on column public.pessoas.complemento is
'Complemento manual do endereço, como apartamento, bloco, torre, casa ou referência interna.';