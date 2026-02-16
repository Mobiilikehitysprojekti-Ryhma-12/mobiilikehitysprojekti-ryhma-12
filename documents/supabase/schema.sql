-- documents/supabase/schema.sql
--
-- Sprint 4 (EPIC 13): Supabase schema liideille.
--
-- Tavoite:
-- - 1 yrittäjä = 1 "business" (business_id = auth.users.id)
-- - Liidit (leads) kuuluvat yhdelle business_id:lle
-- - UI:n domain-malli mapitetaan erikseen (snake_case -> camelCase)
--
-- Huom:
-- - Käytämme profiles-taulua FK-kohteena, jotta anon-insert ei voi kohdistua olemattomaan business_id:hen.

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- UUSI KÄYTTÄJÄ -> PROFIILI
-- Miksi trigger?
-- - Vähentää manuaalista säätöä: kun käyttäjä luodaan Authiin, profiili syntyy automaattisesti.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- LEADS
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  description text null,

  status text not null default 'new'
    check (status in ('new','quoted','accepted','rejected')),

  customer_name text null,
  customer_phone text null,

  address text null,
  lat double precision null,
  lng double precision null,

  created_at timestamptz not null default now()
);

create index if not exists leads_business_id_idx on public.leads (business_id);
create index if not exists leads_business_created_idx on public.leads (business_id, created_at desc);

alter table public.leads enable row level security;
