-- À exécuter une fois dans Supabase : Dashboard > SQL Editor > New query

-- 1) Likes par jour/étape (un événement par clic, pas de compteur à mettre à jour)
create table if not exists likes (
  id bigint generated always as identity primary key,
  day_n integer not null,
  created_at timestamptz not null default now()
);

alter table likes enable row level security;

create policy "anon can read likes"
  on likes for select
  to anon
  using (true);

create policy "anon can add a like"
  on likes for insert
  to anon
  with check (true);

-- 2) Livre d'or : commentaires en attente de validation
create table if not exists comments (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

-- le public ne voit QUE les commentaires déjà approuvés
create policy "anon can read approved comments"
  on comments for select
  to anon
  using (approved = true);

-- le public peut poster, mais jamais en marquant lui-même approved = true
create policy "anon can submit a comment"
  on comments for insert
  to anon
  with check (approved = false);
