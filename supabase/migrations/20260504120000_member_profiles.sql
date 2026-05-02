-- One row per auth user: editable member profile (private to that user via RLS).

create table if not exists public.member_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  tagline text not null default '',
  bio text not null default '',
  age text not null default '',
  region text not null default '',
  interests text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_profiles_updated_at_idx on public.member_profiles (updated_at desc);

alter table public.member_profiles enable row level security;

drop policy if exists "Users select own member_profiles" on public.member_profiles;
create policy "Users select own member_profiles"
  on public.member_profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users insert own member_profiles" on public.member_profiles;
create policy "Users insert own member_profiles"
  on public.member_profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users update own member_profiles" on public.member_profiles;
create policy "Users update own member_profiles"
  on public.member_profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

grant select, insert, update on table public.member_profiles to authenticated;
grant all on table public.member_profiles to service_role;

create or replace function public.member_profiles_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
  before update on public.member_profiles
  for each row
  execute function public.member_profiles_set_updated_at();

-- New signups get a row automatically (real account in auth + profile shell in public).
create or replace function public.handle_new_member_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_member_profile on auth.users;
create trigger on_auth_user_created_member_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_member_profile();
