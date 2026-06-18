alter table public.user_favorites
  drop constraint if exists user_favorites_entity_type_check;

alter table public.user_favorites
  add constraint user_favorites_entity_type_check
  check (
    entity_type in (
      'person',
      'historical_file',
      'relationship',
      'forum_topic',
      'family_event',
      'person_event',
      'page',
      'timeline_item',
      'curiosity_discovery',
      'story'
    )
  );
