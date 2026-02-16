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

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getDebugFlags, subscribeDebugFlags } from '@/services/debugFlags';

import { DebugLeadsRepository } from './DebugLeadsRepository';
import { FakeLeadsRepository } from './FakeLeadsRepository';
import type { LeadsRepository } from './LeadsRepository';
import { SupabaseLeadsRepository } from './SupabaseLeadsRepository';

// Oletus: Supabase on "oikea" datalähde. Fake pidetään vain debug-tarkoitukseen.
// Huom: ApiLeadsRepository-luokka on edelleen olemassa, jos haluatte myöhemmin myös HTTP-API-polun.

const RepoContext = createContext<LeadsRepository | null>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState(() => getDebugFlags());

  useEffect(() => {
    if (!__DEV__) return;
    // Miksi subscribe:
    // - Debug-tabissa voidaan vaihtaa Fake <-> Supabase ilman appin restarttia.
    return subscribeDebugFlags(setFlags);
  }, []);

  const repo = useMemo<LeadsRepository>(() => {
    // Miksi memo:
    // - Estetään uuden repo-instanssin luonti jokaisella renderillä.
    // - Repo voi sisältää myöhemmin esim. cachea.

    // Fake: nopea demo-data / kehitys.
    // Supabase: "oikea" data. RLS varmistaa, että käyttäjä näkee vain omat rivit.
    const baseRepo: LeadsRepository = __DEV__ && flags.useFakeLeadsRepo ? new FakeLeadsRepository() : new SupabaseLeadsRepository();

    // Debug wrapper mahdollistaa virhe/offline -tilojen demonstroinnin myös Supabase-repolla.
    return __DEV__ ? new DebugLeadsRepository(baseRepo) : baseRepo;
  }, [flags.useFakeLeadsRepo]);

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
