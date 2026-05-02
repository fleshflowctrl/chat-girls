-- Apply in Supabase: SQL Editor → New query → paste → Run
-- Or: supabase db push (with Supabase CLI linked to this project)

create table if not exists public.companion_profiles (
  id text primary key,
  name text not null,
  age int not null check (age >= 18 and age <= 120),
  height_label text not null,
  image_url text not null,
  tags text[] not null default '{}'::text[],
  mood_label text not null,
  is_online boolean not null default false,
  is_premium boolean not null default false,
  is_vip boolean not null default false,
  is_hot boolean not null default false,
  is_new boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists companion_profiles_sort_idx on public.companion_profiles (sort_order, name);

alter table public.companion_profiles enable row level security;

drop policy if exists "Anyone can read companion_profiles" on public.companion_profiles;
create policy "Anyone can read companion_profiles"
  on public.companion_profiles
  for select
  to anon, authenticated
  using (true);

-- Seed (matches app mock catalog; safe to re-run after truncate)
insert into public.companion_profiles
  (id, name, age, height_label, image_url, tags, mood_label, is_online, is_premium, is_vip, is_hot, is_new, sort_order)
values
  ('1', 'Sofia Laurent', 24, '172 cm', 'https://randomuser.me/api/portraits/women/65.jpg', array['Flirty','Romantic','Online','Teasing','VIP']::text[], 'Sweet tease', true, true, true, true, false, 1),
  ('2', 'Maya Chen', 26, '165 cm', 'https://randomuser.me/api/portraits/women/44.jpg', array['Caring','Romantic','Playful','New']::text[], 'Soft & warm', true, false, false, false, true, 2),
  ('3', 'Elena Voss', 28, '178 cm', 'https://randomuser.me/api/portraits/women/68.jpg', array['Wild','Flirty','Caring','VIP','Online']::text[], 'Electric energy', true, true, true, true, false, 3),
  ('4', 'Aria Bloom', 22, '160 cm', 'https://randomuser.me/api/portraits/women/17.jpg', array['Playful','Flirty','Teasing','New','Online']::text[], 'Bubbly spark', true, false, false, true, true, 4),
  ('5', 'Noor El-Sayed', 25, '168 cm', 'https://randomuser.me/api/portraits/women/33.jpg', array['Caring','Romantic','Flirty','VIP']::text[], 'Deep listener', false, true, true, false, false, 5),
  ('6', 'Isla Hart', 27, '170 cm', 'https://randomuser.me/api/portraits/women/89.jpg', array['Wild','Teasing','Playful','Online']::text[], 'Late-night muse', true, true, false, true, false, 6),
  ('7', 'Victoria Kane', 29, '175 cm', 'https://randomuser.me/api/portraits/women/12.jpg', array['Romantic','Caring','Flirty','VIP']::text[], 'Slow burn', false, true, true, false, false, 7),
  ('8', 'Luna Reyes', 23, '163 cm', 'https://randomuser.me/api/portraits/women/50.jpg', array['Flirty','Wild','Romantic','Online','Hot']::text[], 'Spicy confidante', true, false, false, true, false, 8),
  ('9', 'Clara Weiss', 26, '169 cm', 'https://randomuser.me/api/portraits/women/76.jpg', array['Romantic','Caring','Flirty','New']::text[], 'Velvet voice', true, false, false, false, true, 9),
  ('10', 'Jade Monroe', 24, '173 cm', 'https://randomuser.me/api/portraits/women/21.jpg', array['Teasing','Flirty','Wild','VIP','Online']::text[], 'Wink & whisper', true, true, true, true, false, 10),
  ('11', 'Freya Lindholm', 30, '176 cm', 'https://randomuser.me/api/portraits/women/90.jpg', array['Caring','Romantic','Teasing','VIP']::text[], 'Nordic calm', false, true, true, false, false, 11),
  ('12', 'Nina Okonkwo', 25, '166 cm', 'https://randomuser.me/api/portraits/women/37.jpg', array['Playful','Wild','Romantic','Online','New']::text[], 'Laugh-out-loud', true, false, false, false, true, 12),
  ('13', 'Camille Duarte', 27, '171 cm', 'https://randomuser.me/api/portraits/women/54.jpg', array['Romantic','Flirty','Playful','VIP','Hot']::text[], 'Parisian edge', false, true, true, true, false, 13),
  ('14', 'Riley Brooks', 22, '164 cm', 'https://randomuser.me/api/portraits/women/8.jpg', array['Flirty','Playful','Teasing','Online']::text[], 'Sunshine flirt', true, false, false, false, false, 14)
on conflict (id) do update set
  name = excluded.name,
  age = excluded.age,
  height_label = excluded.height_label,
  image_url = excluded.image_url,
  tags = excluded.tags,
  mood_label = excluded.mood_label,
  is_online = excluded.is_online,
  is_premium = excluded.is_premium,
  is_vip = excluded.is_vip,
  is_hot = excluded.is_hot,
  is_new = excluded.is_new,
  sort_order = excluded.sort_order;
