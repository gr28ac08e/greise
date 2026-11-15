-- GREISE : durcissement de la base (contraintes, limite de débit, cohérence des réponses).
alter table public.comments
  add constraint comments_slug_format check (article_slug ~ '^[a-z0-9-]{1,200}$'),
  add constraint comments_author_len check (char_length(author_name) between 1 and 40);
alter table public.article_reactions
  add constraint article_reactions_slug_format check (article_slug ~ '^[a-z0-9-]{1,200}$');

create or replace function public.guard_comment() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if (select count(*) from public.comments c where c.user_id = new.user_id and c.created_at > now() - interval '10 minutes') >= 8 then
    raise exception 'Trop de commentaires en peu de temps. Réessayez dans quelques minutes.';
  end if;
  if new.parent_id is not null and not exists (
    select 1 from public.comments p where p.id = new.parent_id and p.article_slug = new.article_slug and p.parent_id is null
  ) then
    raise exception 'Réponse invalide.';
  end if;
  new.content := btrim(new.content);
  return new;
end $$;
revoke execute on function public.guard_comment() from public, anon, authenticated;

drop trigger if exists comments_guard on public.comments;
create trigger comments_guard before insert on public.comments for each row execute function public.guard_comment();
