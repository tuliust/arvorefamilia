alter table public.admin_notification_configurations
  add column if not exists variable_settings jsonb not null default '{}'::jsonb;

comment on column public.admin_notification_configurations.variable_settings is
  'Configurações administrativas por variável de template, como valor de link, origem e formato de data.';
