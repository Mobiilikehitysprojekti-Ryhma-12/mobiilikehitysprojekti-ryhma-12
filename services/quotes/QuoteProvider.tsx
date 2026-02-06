/**
 * QuoteProvider (Context DI)
 *
 * Tarjoaa QuotesRepository-implementaation koko sovellukselle.
 * Seuraaa samaa kaavaa kuin LeadsRepository / RepoProvider.
 *
 * Käyttö:
 * - Kääri `QuoteProvider` appin rootiin (app/_layout.tsx), SISÄLTÄ RepoProvider:iin.
 * - Hae repo hookilla `useQuotesRepo()` ruuduissa / viewmodelissa.
 *
 * Huom: QuoteProvider on sisäkkäin RepoProvider:issa, jotta sillä on pääsy LeadsRepository:hin.
 */

import React, { createContext, useContext, useMemo } from 'react';

import { useLeadsRepo } from '@/services/leads/RepoProvider';
import { ApiQuotesRepository } from './ApiQuotesRepository';
import { FakeQuotesRepository } from './FakeQuotesRepository';
import type { QuotesRepository } from './QuotesRepository';

/**
 * Dev-flag: Fake vs. oikea API
 *
 * true = Käytä FakeQuotesRepository (paikallinen demo)
 * false = Käytä ApiQuotesRepository (oikea backend)
 *
 * Vaihda tämä kun API on valmis.
 */
const USE_FAKE_QUOTE_REPO = true;

const QuoteRepoContext = createContext<QuotesRepository | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  // Hae LeadsRepository jotta voimme antaa sen FakeQuotesRepository:lle
  const leadsRepo = useLeadsRepo();

  const repo = useMemo<QuotesRepository>(() => {
    // Miksi memo:
    // - Estetään uuden repo-instanssin luonti jokaisella renderillä
    // - Repo voi sisältää myöhemmin cachea tai tilaa
    
    // FakeQuotesRepository tarvitsee LeadsRepositoryn päivittääkseen liidin statuksen
    const baseRepo = USE_FAKE_QUOTE_REPO 
      ? new FakeQuotesRepository(leadsRepo) 
      : new ApiQuotesRepository();
    
    return __DEV__ ? baseRepo : baseRepo; // Voidaan laajentaa debug-wrapperia varten myöhemmin
  }, [leadsRepo]);

  return (
    <QuoteRepoContext.Provider value={repo}>
      {children}
    </QuoteRepoContext.Provider>
  );
}

/**
 * Palauttaa nykyisen QuotesRepositoryn.
 *
 * Heitetään virhe, jos Provider puuttuu: tämä tekee konfiguraatiovirheen näkyväksi heti.
 */
export function useQuotesRepo(): QuotesRepository {
  const repo = useContext(QuoteRepoContext);
  if (!repo) {
    throw new Error('useQuotesRepo: QuoteProvider puuttuu. Kääri se app/_layout.tsx:n juureen.');
  }
  return repo;
}
