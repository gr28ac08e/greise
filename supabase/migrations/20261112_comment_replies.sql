-- GREISE : réponses aux commentaires.
-- À exécuter une seule fois dans Supabase > SQL Editor (bouton Run). Sans danger si relancé.
alter table public.comments
  add column if not exists parent_id uuid references public.comments (id) on delete cascade;

create index if not exists comments_parent_idx on public.comments (parent_id);
