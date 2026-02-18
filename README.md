Advanced mobile [video]([https://expo.dev](https://youtu.be/WhM9XFqxKnc))


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Sprint 1 demo (QuoteFlow)

This repo contains a first demo version with:

- **Inbox** (tab `app/(tabs)/index.tsx`) showing a list of leads
- **Search + status filter** (client-side)
- **UI states**: loading (skeleton), empty (no items / no results), error (retry)
- **Lead detail** route: `app/lead/[id].tsx`

### Demo checklist

1. Open app → Inbox shows skeleton → list appears
2. Type in search or change status → list filters → empty state appears when no matches
3. Tap an item → opens lead detail

### Share/QR: jaa asiakaslinkki (Settings → /share)

Appissa on P0-demoa varten ruutu, jossa yrittäjä voi jakaa asiakaslinkin helposti:

- Reitti: `app/share.tsx`
- Avaa: **Asetukset**-tab → **Jaa yrityksen linkki (QR)**
- Näyttää: linkki + QR-koodi + yrityksen nimi/puhelin/sähköposti
- “Jaa linkki” avaa natiivin share-sheetin (iOS/Android)
- “Jaa QR kuvana (PNG)” generoi PNG:n ja avaa share-sheetin (iOS/Android)
- “Tallenna QR (PNG)” tallentaa QR-kuvan galleriaan (iOS/Android)

### Tarjous: asiakkaan yhteystiedot + vastaa sähköpostilla

Tarjousnäkymässä (`/lead/[id]/quote`) näytetään asiakkaan yhteystiedot ja P0-toiminnot:

- “Vastaa sähköpostilla” (avaa laitteen sähköpostisovelluksen `mailto:`-linkillä, valmiilla aiheella + viestipohjalla)
- “Soita” (tel:)

Huom:
- Jos laitteessa ei ole käytettävää sähköpostisovellusta, appi näyttää virheilmoituksen.
- Supabase-datan kanssa tarvitset `customer_email` sarakkeen `public.leads`-tauluun (katso [documents/supabase/schema.sql](documents/supabase/schema.sql)).

### Data source (Fake vs API)

We use a Repository interface + Context “DI” (Hilt mindset in RN): UI never calls the low-level api client directly.

- Switch repository in `services/leads/RepoProvider.tsx` (`USE_FAKE_REPO`)
   - `true` = `FakeLeadsRepository` (demo data, reliable for videos)
   - `false` = `ApiLeadsRepository` (expects `/leads` endpoints)

### Error state demo (optional)

To force an error state for video/demo, set `SIMULATE_ERROR = true` in `services/apiClient.ts` and use API repo (`USE_FAKE_REPO = false`).

## Epic 1: Supabase Auth (Login / Logout)

This app includes a minimal email+password authentication flow using Supabase.

### 1) Configure environment variables

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

   (On Windows you can just create `.env` manually and copy the same keys.)

2. Fill in your Supabase values:

   - `EXPO_PUBLIC_SUPABASE_URL` (Project Settings → API → Project URL)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API → Project API keys → anon public)

3. (Optional, demo) Fill in Share/QR values:

   - `EXPO_PUBLIC_CUSTOMER_URL` (asiakkaalle jaettava web-linkki)
   - `EXPO_PUBLIC_BUSINESS_NAME`
   - `EXPO_PUBLIC_BUSINESS_PHONE`
   - `EXPO_PUBLIC_BUSINESS_EMAIL`

4. Restart Expo after changing env vars:

   ```bash
   npx expo start -c
   ```

### 2) Create a test user in Supabase

In Supabase Dashboard:
- Authentication → Users → **Add user**
- Set email + password

### 3) Test the flow

- If you are **not** logged in, the app redirects to `/login`.
- With correct credentials, you are redirected to the tabs.
- In the **Asetukset** tab you can see the logged-in user email/id and press **Kirjaudu ulos**.

Notes:
- Session is persisted on device storage (AsyncStorage). Logout clears it so a restart will not auto-login.
- If env vars are missing, the app still starts but Login shows an error message.

## Architecture (Repository + Context DI)

High-level folder map:

- `app/` – screens and routing (Expo Router)
- `components/ui/` – reusable presentational UI building blocks
- `models/` – domain models (e.g. `Lead`, `LeadStatus`)
- `services/` – data access (api client + repositories)
- `state/` – ViewModel hooks (e.g. inbox UI state + filters)
- `hooks/`, `constants/` – theme hooks + tokens

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
