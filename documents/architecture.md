# QuoteFlow arkkitehtuuri

Tämä dokumentti kuvaa projektin **MVVM + Repository + Provider/Context** -rakenteen.
Tavoitteena on pitää UI ohuehkona, logiikka testattavana ja datalähde vaihdettavana (Fake/API/Supabase) ilman näkymämuutoksia.

## 1) Kerrosjako (selkeä vastuunjako)

### 1. UI-kerros (View)
- **Sijainti:** `app/`, `components/ui/`
- **Vastuu:** renderöi näkymätilat (`loading`, `error`, `empty`, `ready`) ja välittää käyttäjän tapahtumat eteenpäin.
- **Ei tee:** suoria API-kutsuja tai datan hakulogiiikkaa.

### 2. State/ViewModel-kerros
- **Sijainti:** `state/` (esim. `state/inbox/useInboxViewModel.ts`)
- **Vastuu:**
  - omistaa näkymän tilan (filtterit, lataus, virheet, data)
  - muodostaa UI:lle yhden yhtenäisen `state`-olion
  - suorittaa client-side suodatuksen
  - käynnistää `refresh`-toiminnot
- **Riippuvuudet:** käyttää repository-rajapintoja, ei matalan tason verkkokoodia.

### 3. Domain-kerros (mallit)
- **Sijainti:** `models/`
- **Vastuu:** tyyppimäärittelyt ja domain-käsitteet (esim. `Lead`, `Quote`).

### 4. Data-kerros (Repository + API/cache)
- **Sijainti:** `services/leads/`, `services/quotes/`, `services/apiClient.ts`
- **Vastuu:**
  - kapseloi datalähteet
  - tarjoaa yhtenäisen rajapinnan ViewModelille (`LeadsRepository`, `QuotesRepository`)
  - toteuttaa cache-first-käyttäytymisen ja virhetilanteiden fallbackin
- **Implementaatiot:** `Fake*Repository`, `Api*Repository`, `Supabase*Repository`, `Debug*Repository`.

### 5. DI-kerros (Provider/Context)
- **Sijainti:** `services/leads/RepoProvider.tsx`, `services/quotes/QuoteProvider.tsx`
- **Vastuu:** injektoi oikean repositoryn ympäristön/debug-lippujen mukaan.
- **Hyöty:** UI + ViewModel eivät tiedä, tuleeko data fakesta, REST-API:sta vai Supabasesta.

---

## 2) Datavirta (ylätasolla)

```mermaid
flowchart TD
  A[Käyttäjä UI:ssa] --> B[Screen / UI-komponentti]
  B --> C[ViewModel-hook state/*]
  C --> D[Repository-rajapinta]
  D --> E1[ApiRepository]
  D --> E2[FakeRepository]
  D --> E3[SupabaseRepository]
  E1 --> F[apiClient / verkkokutsu]
  E1 --> G[Cache (AsyncStorage)]
  E2 --> G
  E3 --> H[Supabase]
  F --> C
  G --> C
  H --> C
  C --> B
```

**Tulkinta:**
- UI keskustelee vain ViewModelin kanssa.
- ViewModel keskustelee vain repository-rajapinnan kanssa.
- Repository päättää, haetaanko data verkosta, cachesta vai muusta lähteestä.

---

## 3) State-hallinta (miksi tämä on järkevä)

Esimerkki: `useInboxViewModel`
- Yksi keskitetty `uiState`-unioni (`loading | error | empty | ready`) tekee renderöinnistä yksiselitteistä.
- Filtterit (`query`, `status`) pidetään samassa hookissa, joten listan suodatus ja UI pysyvät synkassa.
- Alkulataus hydratoi ensin cachen ja tekee sitten verkko-refreshin, mikä vähentää tyhjän ruudun välähdyksiä.
- Offline- ja virhetilat ovat eksplisiittisiä, mikä tekee demosta ja testauksesta ennustettavaa.

---

## 4) Cache- ja verkkostrategia

`ApiLeadsRepository` käyttää cache-first-mallia:
1. Tarkista verkkotila (`NetworkService`).
2. Palauta cache heti, jos löytyy.
3. Jos online, päivitä taustalla tuore data.
4. Jos offline eikä cachea ole, palauta virhe.
5. Virhetilanteessa yritä fallback cachen kautta.

Tämä tasapainottaa:
- **Nopeus:** käyttäjä näkee dataa heti cachesta.
- **Kestävyys:** sovellus toimii myös heikolla yhteydellä.
- **Selkeys:** käyttäytyminen on deterministinen ja dokumentoitu.

---

## 5) Suunnittelun periaatteet (tiivistetty)

- **Loose coupling:** UI ei kutsu `apiClient`-tasoa suoraan.
- **Testattavuus:** ViewModelin suodatus ja tilasiirtymät ovat helposti todennettavissa.
- **Vaihdettavuus:** repository voidaan vaihtaa ilman UI-refaktorointia.
- **Demo-valmius:** loading/error/empty/ready-tilat ovat ensimmäisen luokan ominaisuuksia.
