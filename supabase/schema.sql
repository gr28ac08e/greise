-- ============================================================
-- GREISE — Base de données des lecteurs (Supabase / PostgreSQL)
--
-- Mise en service (10 minutes) :
--   1. Créez un projet gratuit sur https://supabase.com
--   2. Ouvrez « SQL Editor » et exécutez tout ce fichier
--   3. Dans « Project Settings → API », copiez l'URL du projet
--      et la clé « anon public »
--   4. Collez-les dans src/lib/backend.ts, puis redéployez
--
-- Sécurité : Row Level Security activée. Lecture publique des
-- commentaires ; écriture réservée aux comptes connectés ;
-- suppression réservée à l'auteur du commentaire.
-- ============================================================

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default 'Lecteur',
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists comments_article_slug_idx
  on public.comments (article_slug, created_at desc);

create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, type)
);

alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;

-- Commentaires : lecture publique, écriture et suppression par l'auteur
drop policy if exists "commentaires lecture publique" on public.comments;
create policy "commentaires lecture publique"
  on public.comments for select using (true);

drop policy if exists "commentaires publication connecte" on public.comments;
create policy "commentaires publication connecte"
  on public.comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "commentaires suppression par auteur" on public.comments;
create policy "commentaires suppression par auteur"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Réactions : lecture publique, ajout et retrait par l'auteur
drop policy if exists "reactions lecture publique" on public.comment_reactions;
create policy "reactions lecture publique"
  on public.comment_reactions for select using (true);

drop policy if exists "reactions ajout connecte" on public.comment_reactions;
create policy "reactions ajout connecte"
  on public.comment_reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "reactions retrait par auteur" on public.comment_reactions;
create policy "reactions retrait par auteur"
  on public.comment_reactions for delete
  using (auth.uid() = user_id);
