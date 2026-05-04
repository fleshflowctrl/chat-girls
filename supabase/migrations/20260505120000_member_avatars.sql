-- Profile photo URL on member row + Storage bucket for uploads (public read, user-scoped write).

alter table public.member_profiles
  add column if not exists avatar_url text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-avatars',
  'member-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read member avatars" on storage.objects;
create policy "Public read member avatars"
  on storage.objects
  for select
  to public
  using (bucket_id = 'member-avatars');

drop policy if exists "Members insert own avatar object" on storage.objects;
create policy "Members insert own avatar object"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'member-avatars'
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );

drop policy if exists "Members update own avatar object" on storage.objects;
create policy "Members update own avatar object"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'member-avatars'
    and split_part(name, '/', 1) = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'member-avatars'
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );

drop policy if exists "Members delete own avatar object" on storage.objects;
create policy "Members delete own avatar object"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'member-avatars'
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );
