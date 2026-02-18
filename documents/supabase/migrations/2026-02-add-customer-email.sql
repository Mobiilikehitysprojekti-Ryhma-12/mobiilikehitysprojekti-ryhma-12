-- 2026-02-add-customer-email.sql
--
-- Migraatio: lisää asiakkaan sähköposti liideihin.
--
-- Miksi tämä on erillisessä tiedostossa:
-- - Kun kanta on jo olemassa, `schema.sql`-tiedoston uudelleenajo ei aina ole toivottavaa.
-- - Tarjousnäkymän “Vastaa sähköpostilla” tarvitsee `customer_email`-kentän.
--
-- Aja Supabase Dashboardissa: SQL Editor → New query → paste → Run.

alter table public.leads
  add column if not exists customer_email text null;
