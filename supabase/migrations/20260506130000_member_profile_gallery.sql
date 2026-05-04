-- Extra profile photos for member_profiles (same idea as companion gallery strip).

alter table public.member_profiles
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;
