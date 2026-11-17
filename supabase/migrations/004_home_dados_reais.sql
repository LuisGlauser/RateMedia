-- RateMedia · Home com dados reais
-- Execute no SQL Editor do Supabase DEPOIS de schema.sql e das migrations 002 e 003
-- (usa media.publish_status, criada em 002_telas_busca_perfil_admin.sql).
-- É idempotente: pode ser executado novamente sem efeitos colaterais.

-- ---------------------------------------------------------------------------
-- 1) Novas colunas em library_entries
--    created_at   -> base do cálculo de engajamento semanal
--    is_favorite  -> botão de coração do Spotlight
--    rating_*     -> notas por aspecto (0–5) que alimentam as barras do Spotlight
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'library_entries' and column_name = 'created_at'
  ) then
    alter table library_entries add column created_at timestamptz not null default now();
    -- Histórico aproximado: antes desta migration só existia updated_at.
    update library_entries set created_at = updated_at;
  end if;
end $$;

alter table library_entries
  add column if not exists is_favorite boolean not null default false,
  add column if not exists rating_art numeric(2,1) check (rating_art between 0 and 5),
  add column if not exists rating_sound numeric(2,1) check (rating_sound between 0 and 5),
  add column if not exists rating_story numeric(2,1) check (rating_story between 0 and 5);

create index if not exists library_entries_media_idx on library_entries(media_id);
create index if not exists library_entries_created_idx on library_entries(created_at desc);

-- ---------------------------------------------------------------------------
-- 2) Interações sociais
--    Uma avaliação é uma linha de library_entries (obras) OU de campaign_reviews
--    (campanhas); por isso curtidas e comentários têm duas FKs opcionais.
-- ---------------------------------------------------------------------------
create table if not exists review_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  entry_id uuid references library_entries(id) on delete cascade,
  campaign_review_id uuid references campaign_reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((entry_id is not null)::int + (campaign_review_id is not null)::int = 1),
  unique (user_id, entry_id),
  unique (user_id, campaign_review_id)
);
create index if not exists review_likes_entry_idx on review_likes(entry_id);
create index if not exists review_likes_campaign_idx on review_likes(campaign_review_id);

create table if not exists review_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  entry_id uuid references library_entries(id) on delete cascade,
  campaign_review_id uuid references campaign_reviews(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  check ((entry_id is not null)::int + (campaign_review_id is not null)::int = 1)
);
create index if not exists review_comments_entry_idx on review_comments(entry_id);
create index if not exists review_comments_campaign_idx on review_comments(campaign_review_id);

create table if not exists list_likes (
  list_id uuid not null references lists(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followed_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index if not exists follows_followed_idx on follows(followed_id);

-- ---------------------------------------------------------------------------
-- 3) Row Level Security
-- ---------------------------------------------------------------------------
alter table review_likes enable row level security;
alter table review_comments enable row level security;
alter table list_likes enable row level security;
alter table follows enable row level security;

drop policy if exists "rlikes_read" on review_likes;
create policy "rlikes_read" on review_likes for select using (true);
drop policy if exists "rlikes_insert_own" on review_likes;
create policy "rlikes_insert_own" on review_likes for insert with check (auth.uid() = user_id);
drop policy if exists "rlikes_delete_own" on review_likes;
create policy "rlikes_delete_own" on review_likes for delete using (auth.uid() = user_id);

drop policy if exists "rcomments_read" on review_comments;
create policy "rcomments_read" on review_comments for select using (true);
drop policy if exists "rcomments_insert_own" on review_comments;
create policy "rcomments_insert_own" on review_comments for insert with check (auth.uid() = user_id);
-- Moderação: o autor ou um administrador pode remover o comentário.
drop policy if exists "rcomments_delete_own_or_admin" on review_comments;
create policy "rcomments_delete_own_or_admin" on review_comments for delete
  using (auth.uid() = user_id or is_admin());

drop policy if exists "llikes_read" on list_likes;
create policy "llikes_read" on list_likes for select using (true);
drop policy if exists "llikes_insert_own" on list_likes;
create policy "llikes_insert_own" on list_likes for insert with check (auth.uid() = user_id);
drop policy if exists "llikes_delete_own" on list_likes;
create policy "llikes_delete_own" on list_likes for delete using (auth.uid() = user_id);

drop policy if exists "follows_read" on follows;
create policy "follows_read" on follows for select using (true);
drop policy if exists "follows_insert_own" on follows;
create policy "follows_insert_own" on follows for insert with check (auth.uid() = follower_id);
drop policy if exists "follows_delete_own" on follows;
create policy "follows_delete_own" on follows for delete using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- 4) Funções da Home (somente leitura, dados públicos agregados)
--    SECURITY DEFINER para agregar entre usuários sem depender da RLS do chamador;
--    elas só devolvem campos já públicos (as políticas de leitura são "using (true)").
-- ---------------------------------------------------------------------------

-- Obras em alta: engajamento = novos registros na biblioteca + curtidas + comentários
-- nos últimos 7 dias. A variação compara com os 7 dias anteriores.
-- Só obras publicadas entram (rascunhos e "em revisão" do painel admin ficam de fora).
-- "% positivo" de cada aspecto = notas >= 3.5 (7/10) sobre o total de notas daquele aspecto.
create or replace function get_trending_media(p_limit int default 12)
returns table (
  id uuid,
  type media_type,
  title text,
  synopsis text,
  cover_url text,
  release_year int,
  total_units int,
  avg_rating numeric,
  ratings_count bigint,
  art_pct numeric,
  sound_pct numeric,
  story_pct numeric,
  engagement bigint,
  engagement_delta_pct numeric
)
language sql stable security definer set search_path = public as $$
  with events as (
    select e.media_id, e.created_at as ts from library_entries e
    union all
    select e.media_id, l.created_at from review_likes l join library_entries e on e.id = l.entry_id
    union all
    select e.media_id, c.created_at from review_comments c join library_entries e on e.id = c.entry_id
  ),
  agg as (
    select ev.media_id,
      count(*) filter (where ev.ts >= now() - interval '7 days') as cur,
      count(*) filter (where ev.ts >= now() - interval '14 days' and ev.ts < now() - interval '7 days') as prev
    from events ev
    group by ev.media_id
  ),
  stats as (
    select e.media_id,
      round(avg(e.rating), 1) as avg_rating,
      count(e.rating) as ratings_count,
      round(100.0 * count(*) filter (where e.rating_art >= 3.5) / nullif(count(e.rating_art), 0)) as art_pct,
      round(100.0 * count(*) filter (where e.rating_sound >= 3.5) / nullif(count(e.rating_sound), 0)) as sound_pct,
      round(100.0 * count(*) filter (where e.rating_story >= 3.5) / nullif(count(e.rating_story), 0)) as story_pct
    from library_entries e
    group by e.media_id
  )
  select m.id, m.type, m.title, m.synopsis, m.cover_url, m.release_year, m.total_units,
    s.avg_rating,
    coalesce(s.ratings_count, 0),
    s.art_pct, s.sound_pct, s.story_pct,
    coalesce(a.cur, 0),
    case when coalesce(a.prev, 0) > 0 then round(100.0 * (a.cur - a.prev) / a.prev) end
  from media m
  left join agg a on a.media_id = m.id
  left join stats s on s.media_id = m.id
  where m.publish_status = 'published'
  order by coalesce(a.cur, 0) desc, coalesce(s.ratings_count, 0) desc, m.created_at desc
  limit greatest(p_limit, 1)
$$;

-- Feed de avaliações com texto (obras e campanhas), mais recentes primeiro.
-- p_media_id restringe o feed a uma obra.
create or replace function get_latest_reviews(
  p_limit int default 6,
  p_offset int default 0,
  p_media_id uuid default null
)
returns table (
  kind text,
  ref_id uuid,
  created_at timestamptz,
  rating numeric,
  body text,
  has_spoilers boolean,
  user_id uuid,
  username text,
  avatar_url text,
  target_id uuid,
  target_title text,
  target_type text,
  target_cover text,
  user_status text,
  context text,
  likes_count bigint,
  comments_count bigint
)
language sql stable security definer set search_path = public as $$
  with feed as (
    select 'media'::text as kind, e.id as ref_id, e.updated_at as created_at, e.rating,
      e.review as body, e.has_spoilers, e.user_id,
      m.id as target_id, m.title as target_title, m.type::text as target_type, m.cover_url as target_cover,
      e.status::text as user_status, null::text as context
    from library_entries e
    join media m on m.id = e.media_id
    where e.review is not null and btrim(e.review) <> ''
      and m.publish_status = 'published'
      and (p_media_id is null or e.media_id = p_media_id)
    union all
    select 'campaign'::text, r.id, r.created_at, r.rating,
      r.comment, false, r.user_id,
      c.id, c.title, 'rpg'::text, c.cover_url,
      null::text, c.system
    from campaign_reviews r
    join campaigns c on c.id = r.campaign_id
    where r.comment is not null and btrim(r.comment) <> ''
      and p_media_id is null
  )
  select f.kind, f.ref_id, f.created_at, f.rating, f.body, f.has_spoilers,
    f.user_id, p.username, p.avatar_url,
    f.target_id, f.target_title, f.target_type, f.target_cover,
    f.user_status, f.context,
    (select count(*) from review_likes l
      where (f.kind = 'media' and l.entry_id = f.ref_id)
         or (f.kind = 'campaign' and l.campaign_review_id = f.ref_id)),
    (select count(*) from review_comments k
      where (f.kind = 'media' and k.entry_id = f.ref_id)
         or (f.kind = 'campaign' and k.campaign_review_id = f.ref_id))
  from feed f
  join profiles p on p.id = f.user_id
  order by f.created_at desc
  offset greatest(p_offset, 0)
  limit greatest(p_limit, 1)
$$;

-- Curadores: quem mais publicou críticas nos últimos 30 dias (obras + campanhas),
-- somando campanhas mestradas.
create or replace function get_top_curators(p_limit int default 3)
returns table (
  id uuid,
  username text,
  avatar_url text,
  reviews_30d bigint,
  campaigns_count bigint,
  followers_count bigint
)
language sql stable security definer set search_path = public as $$
  select t.id, t.username, t.avatar_url, t.reviews_30d, t.campaigns_count, t.followers_count
  from (
    select p.id, p.username, p.avatar_url,
      (
        (select count(*) from library_entries e
          where e.user_id = p.id and e.review is not null and btrim(e.review) <> ''
            and e.updated_at >= now() - interval '30 days')
        +
        (select count(*) from campaign_reviews r
          where r.user_id = p.id and r.comment is not null and btrim(r.comment) <> ''
            and r.created_at >= now() - interval '30 days')
      ) as reviews_30d,
      (select count(*) from campaigns c where c.author_id = p.id) as campaigns_count,
      (select count(*) from follows f where f.followed_id = p.id) as followers_count
    from profiles p
  ) t
  where t.reviews_30d + t.campaigns_count > 0
  order by t.reviews_30d + t.campaigns_count desc, t.followers_count desc, t.username
  limit greatest(p_limit, 1)
$$;

-- Listas públicas em destaque: mais curtidas primeiro.
-- avg_rating = média das notas médias das obras da lista.
create or replace function get_featured_lists(p_limit int default 3, p_offset int default 0)
returns table (
  id uuid,
  title text,
  owner_username text,
  items_count bigint,
  likes_count bigint,
  avg_rating numeric,
  dominant_type text
)
language sql stable security definer set search_path = public as $$
  with media_avg as (
    select e.media_id, avg(e.rating) as avg_rating
    from library_entries e
    where e.rating is not null
    group by e.media_id
  ),
  item_stats as (
    select li.list_id,
      count(*) as items_count,
      case when count(distinct m.type) = 1 then min(m.type::text) else 'mixed' end as dominant_type,
      round(avg(ma.avg_rating), 1) as avg_rating
    from list_items li
    join media m on m.id = li.media_id
    left join media_avg ma on ma.media_id = li.media_id
    where m.publish_status = 'published'
    group by li.list_id
  ),
  like_stats as (
    select ll.list_id, count(*) as n from list_likes ll group by ll.list_id
  )
  select l.id, l.title, p.username, s.items_count, coalesce(k.n, 0), s.avg_rating, s.dominant_type
  from lists l
  join profiles p on p.id = l.user_id
  join item_stats s on s.list_id = l.id
  left join like_stats k on k.list_id = l.id
  where l.is_public
  order by coalesce(k.n, 0) desc, s.items_count desc, l.created_at desc
  offset greatest(p_offset, 0)
  limit greatest(p_limit, 1)
$$;

grant execute on function get_trending_media(int) to anon, authenticated;
grant execute on function get_latest_reviews(int, int, uuid) to anon, authenticated;
grant execute on function get_top_curators(int) to anon, authenticated;
grant execute on function get_featured_lists(int, int) to anon, authenticated;
