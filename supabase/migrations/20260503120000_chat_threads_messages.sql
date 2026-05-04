-- Per-user chat threads: full message list stored as JSONB (one row per user + companion profile).

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  companion_profile_id text not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, companion_profile_id)
);

create index if not exists chat_threads_user_updated_idx
  on public.chat_threads (user_id, updated_at desc);

alter table public.chat_threads enable row level security;

drop policy if exists "Users select own chat_threads" on public.chat_threads;
create policy "Users select own chat_threads"
  on public.chat_threads
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own chat_threads" on public.chat_threads;
create policy "Users insert own chat_threads"
  on public.chat_threads
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own chat_threads" on public.chat_threads;
create policy "Users update own chat_threads"
  on public.chat_threads
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own chat_threads" on public.chat_threads;
create policy "Users delete own chat_threads"
  on public.chat_threads
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on table public.chat_threads to authenticated;
grant all on table public.chat_threads to service_role;

create or replace function public.chat_threads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chat_threads_set_updated_at on public.chat_threads;
create trigger chat_threads_set_updated_at
  before update on public.chat_threads
  for each row
  execute function public.chat_threads_set_updated_at();
