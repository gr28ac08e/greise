-- GREISE — réactions d'articles et profils lecteurs
-- À exécuter une seule fois dans Supabase > SQL Editor.
create table if not exists public.article_reactions (
  article_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('love','approve','surprise','sad')),
  created_at timestamptz not null default now(),
  primary key (article_slug, user_id)
);
create index if not exists article_reactions_slug_idx on public.article_reactions(article_slug);
alter table public.article_reactions enable row level security;
drop policy if exists "reactions articles lecture publique" on public.article_reactions;
create policy "reactions articles lecture publique" on public.article_reactions for select using (true);
drop policy if exists "reactions articles ajout par auteur" on public.article_reactions;
create policy "reactions articles ajout par auteur" on public.article_reactions for insert with check (auth.uid() = user_id);
drop policy if exists "reactions articles modification par auteur" on public.article_reactions;
create policy "reactions articles modification par auteur" on public.article_reactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reactions articles retrait par auteur" on public.article_reactions;
create policy "reactions articles retrait par auteur" on public.article_reactions for delete using (auth.uid() = user_id);

create table if not exists public.reader_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Lecteur' check (char_length(display_name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 240),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reader_profiles enable row level security;
drop policy if exists "profils lecteurs lecture publique" on public.reader_profiles;
create policy "profils lecteurs lecture publique" on public.reader_profiles for select using (true);
drop policy if exists "profil lecteur insertion personnelle" on public.reader_profiles;
create policy "profil lecteur insertion personnelle" on public.reader_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "profil lecteur modification personnelle" on public.reader_profiles;
create policy "profil lecteur modification personnelle" on public.reader_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_reader_profile()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.reader_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(coalesce(new.email,'lecteur'), '@', 1))
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name, updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_reader_profile on auth.users;
create trigger on_auth_user_created_reader_profile
after insert on auth.users
for each row execute procedure public.handle_new_reader_profile();

insert into public.reader_profiles (user_id, display_name)
select id, coalesce(nullif(raw_user_meta_data->>'display_name',''), split_part(coalesce(email,'lecteur'), '@', 1))
from auth.users
on conflict (user_id) do nothing;
