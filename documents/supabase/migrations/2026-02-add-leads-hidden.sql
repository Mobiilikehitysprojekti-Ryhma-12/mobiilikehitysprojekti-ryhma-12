-- 2026-02-add-leads-hidden.sql
--
-- Tarkoitus:
-- - Lisää soft delete -tuki liideille.
-- - UI voi piilottaa tarjouspyynnön Inboxista ilman pysyvää poistoa.

alter table public.leads
  add column if not exists is_hidden boolean not null default false;

create index if not exists leads_business_hidden_idx
  on public.leads (business_id, is_hidden);
