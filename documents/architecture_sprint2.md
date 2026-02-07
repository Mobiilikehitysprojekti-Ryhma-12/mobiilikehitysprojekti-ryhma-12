# Arkkitehtuuri – Sprint 2 (lyhyesti)

- UI ei hae liidejä suoraan fetchillä, vaan `LeadsRepository`-rajapinnan kautta (DI: `RepoProvider`).
- Inboxin ViewModel (`state/inbox/useInboxViewModel.ts`) hoitaa suodatuksen ja UI-tilat (loading/error/empty/ready).
- Sprint 2:ssa lisätään lead-listan cache AsyncStorageen: `qf:leads:list` ja `qf:leads:lastSynced`.
- Offline UX näyttää bannerin (Cached mode + Last synced) ja estää refreshin offline-tilassa.
- Offline voidaan demota luotettavasti debug-lipuilla (`services/debugFlags.ts`), jotka persistoituvat AsyncStorageen.
- `DebugLeadsRepository` voi simuloida offline/error-tilat riippumatta datalähteestä.
