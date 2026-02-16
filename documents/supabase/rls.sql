-- documents/supabase/rls.sql
--
-- Sprint 4 (EPIC 13): RLS policyt liideille.
--
-- Speksi:
-- - anon: INSERT allowed
-- - authenticated: SELECT/UPDATE only where business_id = auth.uid()
--
-- Huom:
-- - Tämä on kurssidemoa varten. Anon-insert on tietoinen tradeoff.

-- PROFILES: authenticated saa lukea vain oman profiilin
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
on public.profiles
for select
to authenticated
using (id = auth.uid());


-- LEADS: anon insert sallittu
drop policy if exists "leads: anon insert" on public.leads;
create policy "leads: anon insert"
on public.leads
for insert
to anon
with check (business_id is not null);

-- LEADS: authenticated näkee vain omat
drop policy if exists "leads: read own" on public.leads;
create policy "leads: read own"
on public.leads
for select
to authenticated
using (business_id = auth.uid());

-- LEADS: authenticated saa päivittää vain omat (ja business_id ei saa muuttua)
drop policy if exists "leads: update own" on public.leads;
create policy "leads: update own"
on public.leads
for update
to authenticated
using (business_id = auth.uid())
with check (business_id = auth.uid());
