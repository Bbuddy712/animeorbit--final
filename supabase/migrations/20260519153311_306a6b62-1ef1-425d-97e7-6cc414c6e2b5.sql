
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mal_id integer not null,
  title text not null,
  image_url text,
  score numeric,
  created_at timestamptz not null default now(),
  unique(user_id, mal_id)
);
alter table public.favorites enable row level security;
create policy "Users view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users delete own favorites" on public.favorites for delete using (auth.uid() = user_id);
create index favorites_user_idx on public.favorites(user_id, created_at desc);

-- Watchlist statuses
create type public.watch_status as enum ('plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped');

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mal_id integer not null,
  title text not null,
  image_url text,
  total_episodes integer,
  episodes_watched integer not null default 0,
  status public.watch_status not null default 'plan_to_watch',
  score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, mal_id)
);
alter table public.watchlist enable row level security;
create policy "Users view own watchlist" on public.watchlist for select using (auth.uid() = user_id);
create policy "Users insert own watchlist" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "Users update own watchlist" on public.watchlist for update using (auth.uid() = user_id);
create policy "Users delete own watchlist" on public.watchlist for delete using (auth.uid() = user_id);
create index watchlist_user_idx on public.watchlist(user_id, status, updated_at desc);

-- Recently viewed
create table public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mal_id integer not null,
  title text not null,
  image_url text,
  viewed_at timestamptz not null default now(),
  unique(user_id, mal_id)
);
alter table public.recently_viewed enable row level security;
create policy "Users view own recent" on public.recently_viewed for select using (auth.uid() = user_id);
create policy "Users insert own recent" on public.recently_viewed for insert with check (auth.uid() = user_id);
create policy "Users update own recent" on public.recently_viewed for update using (auth.uid() = user_id);
create policy "Users delete own recent" on public.recently_viewed for delete using (auth.uid() = user_id);
create index recently_viewed_user_idx on public.recently_viewed(user_id, viewed_at desc);
