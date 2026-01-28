/**
 * RepoProvider (Context DI)
 *
 * Tämä on React Native -vastine "Hilt-ajattelulle":
 * - UI ei importtaa Api/Fake repoja suoraan.
 * - Repo-implementaatio voidaan vaihtaa yhdestä paikasta (demo vs oikea API).
 *
 * Käyttö:
 * - Kääri `RepoProvider` appin rootiin (app/_layout.tsx).
 * - Hae repo hookilla `useLeadsRepo()` ruuduissa / viewmodelissa.
 */

import React, { createContext, useContext, useMemo } from 'react';

import { ApiLeadsRepository } from './ApiLeadsRepository';
import { FakeLeadsRepository } from './FakeLeadsRepository';
import type { LeadsRepository } from './LeadsRepository';

// Dev-flag: pidä Fake päällä kunnes API on valmis.
// Vaihda `false`, kun /leads endpointit toimii.
const USE_FAKE_REPO = true;

const RepoContext = createContext<LeadsRepository | null>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo<LeadsRepository>(() => {
    // Miksi memo:
    // - Estetään uuden repo-instanssin luonti jokaisella renderillä.
    // - Repo voi sisältää myöhemmin esim. cachea.
    return USE_FAKE_REPO ? new FakeLeadsRepository() : new ApiLeadsRepository();
  }, []);

  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

/**
 * Palauttaa nykyisen LeadsRepositoryn.
 *
 * Heitetään virhe, jos Provider puuttuu: tämä tekee konfiguraatiovirheen näkyväksi heti.
 */
export function useLeadsRepo(): LeadsRepository {
  const repo = useContext(RepoContext);
  if (!repo) {
    throw new Error('useLeadsRepo: RepoProvider puuttuu. Kääri se app/_layout.tsx:n juureen.');
  }
  return repo;
}
