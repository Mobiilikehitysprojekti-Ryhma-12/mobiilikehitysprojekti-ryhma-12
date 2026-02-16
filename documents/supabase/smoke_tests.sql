-- documents/supabase/smoke_tests.sql
--
-- Sprint 4 (EPIC 13): Smoke testit RLS:lle.
--
-- Tarkoitus: nämä testit voi ajaa Supabase Dashboardin SQL Editorissa.
-- Ne ovat demo-proof: näytätte query-historysta että RLS toimii.
--
-- HUOM: "request.jwt.claim.*" set_config toimii Postgresissa RLS-tilanteiden simulointiin.
-- Jos ympäristö ei tue tätä, demotkaa käytännössä:
-- - anon keyllä tehty insert (web/REST)
-- - appissa kirjautuneena listaus

-- Luo testikäyttäjät Supabase Authiin (Dashboard) ja kopioi heidän UUID:t tähän:
-- Vaihda nämä oikeisiin arvoihin ennen ajoa.
--
-- esimerkki:
--   user1_sub = '11111111-1111-1111-1111-111111111111'
--   user2_sub = '22222222-2222-2222-2222-222222222222'

-- 0) Tarkista että taulut on olemassa
select 'profiles rows' as label, count(*) from public.profiles;
select 'leads rows' as label, count(*) from public.leads;


-- 1) ANON: insert onnistuu
-- Simuloidaan anonyymi rooli.
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);

-- Valitse jokin olemassaoleva profiles.id (muuten FK estää insertin)
-- Tämä hakee ensimmäisen profiilin id:n testiin.
with p as (
  select id from public.profiles order by created_at asc limit 1
)
insert into public.leads (business_id, title, description, status)
select p.id, 'Anon liidi (smoke)', 'Lisätty anonyymina', 'new'
from p
returning id, business_id, title, status, created_at;


-- 2) AUTHENTICATED: user1 näkee vain omat
-- Vaihda user1 UUID
-- select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

-- Esimerkki: jos haluat testata kahdella käyttäjällä, tee kaksi eri inserttiä adminina tai anonyymina.
-- Alla olevat SELECTit todentaa RLS:n.

-- User1: listaa omat
-- (vaihda UUID)
-- select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
-- select id, business_id, title, status from public.leads order by created_at desc;

-- User2: vaihtaa sub toiseen -> ei näe user1:n rivejä
-- select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
-- select id, business_id, title, status from public.leads order by created_at desc;


-- 3) AUTHENTICATED: update onnistuu vain omille riveille
-- (vaihda UUID ja leadId)
-- select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
-- update public.leads set status = 'quoted' where id = '<LEAD_UUID>' returning id, business_id, status;
