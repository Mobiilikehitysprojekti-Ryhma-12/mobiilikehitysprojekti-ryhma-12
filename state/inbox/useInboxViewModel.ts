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
import type { LeadsRepository } from '@/services/leads/LeadsRepository';

export type InboxFilters = {
  /** Tekstihaku: etsitään otsikosta (title). */
  query: string;

  /** Status-filtteri. */
  status: LeadStatus | 'all';
};

export type InboxUiState =
  | { kind: 'loading'; filters: InboxFilters }
  | { kind: 'error'; filters: InboxFilters; message: string }
  | { kind: 'empty'; filters: InboxFilters; emptyKind: 'no_items' | 'no_results' }
  | { kind: 'ready'; filters: InboxFilters; items: Lead[] };

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

  const filteredItems = useMemo(() => applyFilters(rawItems, filters), [rawItems, filters]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const items = await repo.listLeads();
      setRawItems(items);
    } catch (error: unknown) {
      // Devissä halutaan nähdä mikä meni pieleen, mutta UI:lle näytetään ystävällinen viesti.
      console.error('Inbox: listLeads epäonnistui', error);

      const message = error instanceof Error ? error.message : 'Tuntematon virhe';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  // Alkulataus: haetaan lista kerran, jotta Inbox saa datan.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const uiState: InboxUiState = useMemo(() => {
    if (isLoading) return { kind: 'loading', filters };
    if (errorMessage) return { kind: 'error', filters, message: errorMessage };
    if (filteredItems.length === 0) {
      // Erotellaan kaksi erilaista tyhjätilaa demoa varten:
      // 1) Ei liidejä ollenkaan (backend/fake palautti tyhjän) -> "Ei liidejä"
      // 2) Liidejä on, mutta filtterit karsii kaiken -> "Ei tuloksia"
      const emptyKind: 'no_items' | 'no_results' = rawItems.length === 0 ? 'no_items' : 'no_results';
      return { kind: 'empty', filters, emptyKind };
    }
    return { kind: 'ready', filters, items: filteredItems };
  }, [errorMessage, filters, filteredItems, isLoading, rawItems.length]);

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
