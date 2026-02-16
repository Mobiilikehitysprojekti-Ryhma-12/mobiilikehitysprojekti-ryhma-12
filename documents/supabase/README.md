# Supabase (Sprint 4) — leads + RLS + smoke testit

Tämä kansio sisältää **todistusaineiston** siitä, mitä Supabaseen on tehty Sprintissä 4 (EPIC 13 + EPIC 15).

## Tiedostot

- `schema.sql` — `profiles` + `leads` taulut, trigger uuden käyttäjän profiilin luontiin
- `rls.sql` — RLS päälle + policyt (anon insert, authenticated own select/update)
- `smoke_tests.sql` — SQL Editorissa ajettavat smoke testit (demo-proof)

## Ajaminen (Supabase Dashboard)

1. Supabase Dashboard → **SQL Editor**
2. Aja ensin `schema.sql`
3. Aja sitten `rls.sql`
4. Aja lopuksi `smoke_tests.sql`

## Demo (mitä näytetään)

- **Anon insert onnistuu**: voidaan tehdä INSERT rivi `public.leads`-tauluun ilman kirjautumista.
- **Authenticated own select/update**: kirjautunut käyttäjä näkee/päivittää vain rivit, joissa `business_id = auth.uid()`.

Huom: Tämä toteutus on kurssidemoa varten. Anon-insertin spam-riski on tiedostettu (P1-kovennus olisi esim. Edge Function + rate limit/captcha).
