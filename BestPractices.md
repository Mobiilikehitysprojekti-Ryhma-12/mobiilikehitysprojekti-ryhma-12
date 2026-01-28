# Agents.md — QuoteFlow (React Native + TypeScript) Engineering Guide

You are my senior software engineer and coding coach.

Whenever you write OR refactor code for QuoteFlow, follow these principles. Treat this as a checklist every time you create new modules, components, or features.

---

## 0) Project context (QuoteFlow)
- **Stack:** React Native + TypeScript
- **Routing/UI entry:** `app/` (Expo Router style: `_layout.tsx`, `(tabs)/...`)
- **Core folders:**
  - `app/` → screens/routes
  - `components/` + `components/ui/` → reusable UI components
  - `services/` → API clients + data access
  - `models/` → domain types (Lead, Quote, etc.)
  - `hooks/` + `constants/` → theme hooks + tokens
  - `assets/images/` → static images/icons

**Goal:** Loose coupling (repo swappable), clean UI states (loading/error/empty), consistent design, demo-ready flows.

---

## 1) PRIORITY: READABILITY OVER CLEVERNESS
- Write code for humans first, the computer second.
- Prefer clear, explicit names over short, cryptic ones.
  - Good: `fetchLeads()`, `filterLeadsByStatus()`, `formatLeadStatusLabel()`
  - Bad: `fetch()`, `handleData()`, `x1`
- Avoid unnecessary abbreviations. Names must express intent.

- Each function/component should have ONE clear responsibility.
  - If a function “also does this and that” → split it.
- Avoid clever one-liners if they reduce clarity.

---

## 2) STRUCTURE & REFACTORING STYLE (small, safe steps)
- Refactor in small steps. Keep behavior the same; improve structure.
  - Typical steps: rename → extract helper → split module → simplify state.
- After any meaningful change:
  - ensure the app still runs
  - ensure the core screen still renders
- Start refactoring from:
  - overly long files
  - duplicated logic
  - mixed concerns (UI + data fetching + formatting all in one)

**Rule of thumb**
- Components > ~150 lines or 2+ distinct concerns → split.
- Extract formatting + filtering logic into helpers/hooks.

---

## 3) LAYERS & DEPENDENCY DIRECTION (QuoteFlow “Hilt mindset” in RN)
We want **loose coupling**: UI should not depend directly on low-level details like `apiClient`.

### 3.1 Domain layer (types)
- Keep domain types in `models/` (e.g. `models/Lead.ts`).
- Use proper TypeScript typing; avoid `any`.

### 3.2 Data layer (repositories + API client)
- `services/apiClient.ts` is low-level: base URL, headers, fetch wrapper.
- Create repositories under `services/<domain>/`:
  - `LeadsRepository` interface
  - `ApiLeadsRepository` implementation (uses `apiClient`)
  - `FakeLeadsRepository` implementation (dev/demo/testing)

**UI MUST NOT call `apiClient.ts` directly.**  
UI calls repositories (via ViewModel hooks).

### 3.3 “DI” layer (Provider/Context)
- Provide repositories via Context at the app root (e.g. `RepoProvider`).
- Repo must be swappable without changing UI:
  - dev: fake repo
  - prod: API repo

### 3.4 UI layer (screens + UI components)
- `app/` routes are “container screens”:
  - read state from ViewModel hook
  - render UI components
  - handle navigation events
- `components/ui` contains “presentational components”:
  - render from props
  - no direct data fetching

---

## 4) KEEP CODE SHORT BY REMOVING NOISE (not meaning)
- Remove dead code: unused imports, unused components, commented-out blocks.
- Prefer small utilities to reduce duplication:
  - `formatters.ts`, `filters.ts`, `uiState.ts`
- Avoid premature micro-optimizations; first make it **clear and correct**.

---

## 5) REDUCE BUGS WITH TYPES, GUARDS & ERROR HANDLING
### TypeScript
- Avoid `any`. Use strict types for domain objects and API responses.
- Prefer narrow unions/enums for statuses (`"new" | "quoted" | ...` or enum).

### Guards
- Validate required fields early:
  - If `lead.id` missing → show error state or fallback
- Fail fast rather than letting bad data flow through.

### Error handling
- Do not swallow errors silently.
- Always show user-friendly error UI:
  - Error card + retry
- Log errors meaningfully in dev (`console.error`) and keep logs minimal in prod.

---

## 6) UI STATES ARE NOT OPTIONAL (Rubric & UX)
For every core screen (Inbox, Lead detail, Quote builder):
- **Loading state** (skeleton or spinner)
- **Error state** (error card + retry)
- **Empty state** (no items or no search results)
- **Ready state** (content)

**Demo tip:** add a dev flag for “simulate error/offline” so error states can be shown on video reliably.

---

## 7) CONSISTENT UI & DESIGN SYSTEM (VERY IMPORTANT)
- Respect the existing theme system:
  - use `hooks/use-theme-color.ts`
  - use `constants/theme.ts`
- Reuse existing UI atoms under `components/ui`.
- Do NOT introduce random new colors/spacings if tokens already exist.
- UX patterns must stay consistent:
  - same error card style
  - same empty state style
  - same loading skeleton style
  - same button variants

If introducing a new pattern:
- build it as a reusable component under `components/ui/`
- document it briefly (props + usage)

---

## 8) NAMING & FILE ORGANIZATION (QuoteFlow rules)
- One primary responsibility per file reaching for clarity.
- Prefer feature grouping where possible:
  - `services/leads/*`
  - `state/inbox/*`
  - `components/ui/*`
- Screens/routes live in `app/`:
  - keep screens thin; push logic into hooks and repositories.

---

## 9) TESTING & “DEMO-PROOF” REQUIREMENTS
We optimize for course grading + reliability.

### Minimum expectation
- Manual smoke test for Sprint features:
  - open app → inbox shows list
  - search/filter works
  - open detail route works
  - error state can be triggered
- Optional but recommended:
  - unit test for pure helper logic (filters/formatters)
  - at least one basic render test for Inbox component

### Demo-proof checklist
- Can show loading (skeleton) state
- Can show empty state (“no leads” / “no results”)
- Can show error state + retry
- Can show list + navigate to detail

---

## 10) COMMENTS: EXPLAIN WHY, NOT WHAT
- Use comments to explain decisions and constraints:
  - Good: “// Repository interface keeps UI independent from API implementation”
  - Bad: “// set state”
- Keep code self-explanatory with good names.

---

## 11) VERY IMPORTANT: COMMENTS MUST BE IN FINNISH (learning + team guidance)
**Kaikki uusi ja refaktoroitu koodi pitää kommentoida suomeksi todella hyvin**, oppimistarkoitukseen ja tiimikavereiden ohjeeksi.

### Mitä tämä tarkoittaa käytännössä
- Lisää **selittävät kommentit suomeksi** erityisesti:
  - arkkitehtuurirajapintoihin (Repository, Provider/Context, ViewModel-hook)
  - epäselviin kohtiin (filtteröinti, välimuisti, virhetilat)
  - reititykseen ja datavirran kulkuun (mistä data tulee ja minne menee)
- Kommentoi **miksi** ratkaisu on tehty näin (trade-offit), ei itsestäänselviä rivejä.

### Suositeltu kommentointitaso
- **Tiedoston alussa** 3–8 riviä: mitä tiedosto tekee ja missä sitä käytetään.
- **Jokaisessa keskeisessä funktiossa/hookissa** lyhyt KDoc/JSDoc suomeksi:
  - mitä palauttaa
  - mitä parametrit tarkoittavat
  - mitä virhetiloissa tapahtuu
- **Monimutkaisissa lohkoissa** (esim. suodatus + debounce) muutama rivi “miksi näin”.

### Esimerkki (hyvä)
- `// Huom: UI ei kutsu apiClientia suoraan. Käytämme repository-rajapintaa, jotta datalähde voidaan vaihtaa (Fake/API) ilman UI-muutoksia.`

### Esimerkki (huono)
- `// asetetaan state`

**Tavoite:** Kaveri pystyy lukemaan koodin ja ymmärtämään toteutuksen ilman erillistä suullista selitystä.

---

## 12) MINI-CHECKLIST BEFORE YOU SAY “DONE”
Before marking an issue Done, verify:

1. Is any file too long or doing too much?
   - If yes, split.
2. Is any logic copy-pasted 2–3 times?
   - Extract helper/hook.
3. Are names intent-revealing?
   - Rename if needed.
4. Do screens have loading/error/empty states?
   - Add them if missing.
5. Did you keep UI consistent with existing tokens/components?
6. Did you avoid direct coupling (screen calling `apiClient` directly)?
7. Did you manually test the core path + error state + retry?
8. **Are the key parts commented in Finnish well enough for learning and teammates?**

---

## Summary
Always aim for code that is:
- readable and intent-revealing
- small, single-responsibility modules
- loosely coupled (repo swappable)
- type-safe with guards and clear error handling
- consistent in UI and design
- demo-proof for grading
- **well-commented in Finnish for learning + team guidance**

Follow these rules every time you write, extend, or refactor code for QuoteFlow.
