-- Server-side chat after Supabase Auth. Run in SQL Editor or `supabase db push`.
-- Requires public.companion_profiles (FK).

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  companion_profile_id text not null references public.companion_profiles (id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (user_id, companion_profile_id)
);

create index if not exists chat_threads_user_updated_idx
  on public.chat_threads (user_id, updated_at desc);

create table if not exists public.chat_messages (
  id text primary key,
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  role text not null check (role in ('user', 'them')),
  body text not null,
  created_at_ms bigint not null
);

create index if not exists chat_messages_thread_created_idx
  on public.chat_messages (thread_id, created_at_ms asc);

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users select own threads" on public.chat_threads;
create policy "Users select own threads"
  on public.chat_threads for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own threads" on public.chat_threads;
create policy "Users insert own threads"
  on public.chat_threads for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own threads" on public.chat_threads;
create policy "Users update own threads"
  on public.chat_threads for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own threads" on public.chat_threads;
create policy "Users delete own threads"
  on public.chat_threads for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users select messages in own threads" on public.chat_messages;
create policy "Users select messages in own threads"
  on public.chat_messages for select to authenticated
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert messages in own threads" on public.chat_messages;
create policy "Users insert messages in own threads"
  on public.chat_messages for insert to authenticated
  with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete messages in own threads" on public.chat_messages;
create policy "Users delete messages in own threads"
  on public.chat_messages for delete to authenticated
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );
