/**
 * useInboxViewModel
 *
 * ViewModel-tyylinen hook Inbox-näkymälle.
 *
 * Miksi ViewModel-hook:
 * - Ruudusta (screen) tulee ohut: se vain renderöi UI-statea ja kutsuu actioneita.
 * - Datahaku ja suodatuslogiikka ei leviä komponentteihin.
 * - Repository voidaan injektoida (Fake/API) ilman UI-muutoksia.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Lead, LeadStatus } from '@/models/Lead';
import { getDebugFlags, subscribeDebugFlags } from '@/services/debugFlags';
import { loadCachedLeads, saveCachedLeads } from '@/services/leads/leadsCache';
import type { LeadsRepository } from '@/services/leads/LeadsRepository';

export type InboxFilters = {
  /** Tekstihaku: etsitään otsikosta (title). */
  query: string;

  /** Status-filtteri. */
  status: LeadStatus | 'all';
};

export type InboxUiState =
  | {
      kind: 'loading';
      filters: InboxFilters;
      isOffline: boolean;
      dataSource: 'cache' | 'network';
      lastSynced?: string | null;
    }
  | {
      kind: 'error';
      filters: InboxFilters;
      isOffline: boolean;
      dataSource: 'cache' | 'network';
      lastSynced?: string | null;
      message: string;
    }
  | {
      kind: 'empty';
      filters: InboxFilters;
      isOffline: boolean;
      dataSource: 'cache' | 'network';
      lastSynced?: string | null;
      emptyKind: 'no_items' | 'no_results';
    }
  | {
      kind: 'ready';
      filters: InboxFilters;
      isOffline: boolean;
      dataSource: 'cache' | 'network';
      lastSynced?: string | null;
      items: Lead[];
    };

/**
 * Suodattaa listan annetulla hakutekstillä ja statuksella.
 *
 * Huom: toteutus on tarkoituksella puhdas (pure function), jotta se on helppo testata.
 */
function applyFilters(items: Lead[], filters: InboxFilters): Lead[] {
  const query = filters.query.trim().toLowerCase();

  return items
    .filter((lead) => (filters.status === 'all' ? true : lead.status === filters.status))
    .filter((lead) => (query ? lead.title.toLowerCase().includes(query) : true));
}

export function useInboxViewModel(repo: LeadsRepository) {
  const [filters, setFilters] = useState<InboxFilters>({ query: '', status: 'all' });

  const [rawItems, setRawItems] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [hasHydratedCache, setHasHydratedCache] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'cache' | 'network'>('network');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(__DEV__ ? getDebugFlags().simulateOffline : false);

  const filteredItems = useMemo(() => applyFilters(rawItems, filters), [rawItems, filters]);

  // Päivitä offline-tila debug-flageista (demo: simulateOffline ON => offline vaikka laite olisi online)
  useEffect(() => {
    if (!__DEV__) return;
    return subscribeDebugFlags((f) => setIsOffline(Boolean(f.simulateOffline)));
  }, []);

  const refreshNetwork = useCallback(
    async ({ showLoading }: { showLoading: boolean }) => {
      if (isOffline) {
        return;
      }

      if (showLoading) setIsLoading(true);
      setErrorMessage(null);

      try {
        const items = await repo.listLeads();
        setRawItems(items);
        setDataSource('network');

        const synced = await saveCachedLeads(items);
        setLastSynced(synced);
      } catch (error: unknown) {
        // Devissä halutaan nähdä mikä meni pieleen, mutta UI:lle näytetään ystävällinen viesti.
        console.error('Inbox: listLeads epäonnistui', error);

        const message = error instanceof Error ? error.message : 'Tuntematon virhe';
        setErrorMessage(message);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [isOffline, repo]
  );

  const refresh = useCallback(async () => {
    // Pull-to-refresh: jos cache on jo näytetty, älä flashaa koko ruutua loadingiksi.
    const showLoading = !hasHydratedCache;
    await refreshNetwork({ showLoading });
  }, [hasHydratedCache, refreshNetwork]);

  // Alkulataus:
  // 1) Hydratoi cache (jos löytyy) -> ruutu ei "flashaa" tyhjäksi.
  // 2) Jos online, tee sen jälkeen verkko-refresh taustalla.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await loadCachedLeads();
      if (cancelled) return;

      if (cached.items) {
        setRawItems(cached.items);
        setLastSynced(cached.lastSynced);
        setDataSource('cache');
        setIsLoading(false);
      }

      setHasHydratedCache(true);

      // Jos cache puuttui, pidetään loading päällä kunnes verkko vastaa.
      await refreshNetwork({ showLoading: !cached.items });
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNetwork]);

  const uiState: InboxUiState = useMemo(() => {
    const base = { filters, isOffline, dataSource, lastSynced };

    if (isLoading) return { kind: 'loading', ...base };
    if (errorMessage) return { kind: 'error', ...base, message: errorMessage };
    if (filteredItems.length === 0) {
      // Erotellaan kaksi erilaista tyhjätilaa demoa varten:
      // 1) Ei liidejä ollenkaan (backend/fake palautti tyhjän) -> "Ei liidejä"
      // 2) Liidejä on, mutta filtterit karsii kaiken -> "Ei tuloksia"
      const emptyKind: 'no_items' | 'no_results' = rawItems.length === 0 ? 'no_items' : 'no_results';
      return { kind: 'empty', ...base, emptyKind };
    }
    return { kind: 'ready', ...base, items: filteredItems };
  }, [dataSource, errorMessage, filters, filteredItems, isLoading, isOffline, lastSynced, rawItems.length]);

  return {
    // UI renderöi tämän perusteella: loading/error/empty/ready.
    state: uiState,

    // UI tarvitsee myös filttereiden arvot kenttiin.
    filters,

    /**
     * Päivittää hakutermin.
     * Huom: tässä ei tehdä uutta API-kutsua, koska suodatus on client-side.
     */
    setQuery: (query: string) => setFilters((prev) => ({ ...prev, query })),

    /**
     * Päivittää statusfiltterin.
     * Huom: sama logiikka kuin hakutermissä.
     */
    setStatus: (status: InboxFilters['status']) => setFilters((prev) => ({ ...prev, status })),

    refresh,
  };
}
