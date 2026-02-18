import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Lead } from '@/models/Lead';

export const LEADS_LIST_KEY = 'qf:leads:list';
export const LEADS_LAST_SYNCED_KEY = 'qf:leads:lastSynced';

export async function loadCachedLeads(): Promise<{ items: Lead[] | null; lastSynced: string | null }> {
  try {
    const [rawItems, rawLastSynced] = await Promise.all([
      AsyncStorage.getItem(LEADS_LIST_KEY),
      AsyncStorage.getItem(LEADS_LAST_SYNCED_KEY),
    ]);

    const items = rawItems ? (JSON.parse(rawItems) as Lead[]) : null;
    const lastSynced = rawLastSynced ?? null;

    if (!Array.isArray(items)) {
      return { items: null, lastSynced: null };
    }

    return { items, lastSynced };
  } catch {
    return { items: null, lastSynced: null };
  }
}

export async function saveCachedLeads(items: Lead[]): Promise<string> {
  const lastSynced = new Date().toISOString();

  try {
    await Promise.all([
      AsyncStorage.setItem(LEADS_LIST_KEY, JSON.stringify(items)),
      AsyncStorage.setItem(LEADS_LAST_SYNCED_KEY, lastSynced),
    ]);
  } catch {
    // Cache is best-effort; ignore storage errors.
  }

  return lastSynced;
}

export async function clearLeadsCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys().catch(() => [] as string[]);
  const leadKeys = keys.filter((k) => k.startsWith('qf:lead:'));
  await AsyncStorage.multiRemove([LEADS_LIST_KEY, LEADS_LAST_SYNCED_KEY, ...leadKeys]).catch(() => undefined);
}

/**
 * Poistaa yhden liidin cached-listasta.
 *
 * Miksi tämä tarvitaan:
 * - Kun liidi piilotetaan/poistetaan, käyttäjä odottaa että se katoaa UI:sta heti.
 * - Inbox voi näyttää cache-dataa (offline / välimuisti), joten listaa pitää päivittää myös cacheen.
 */
export async function removeLeadFromCachedList(leadId: string): Promise<void> {
  try {
    const rawItems = await AsyncStorage.getItem(LEADS_LIST_KEY);
    if (!rawItems) return;

    const parsed = JSON.parse(rawItems) as unknown;
    if (!Array.isArray(parsed)) return;

    const next = (parsed as Lead[]).filter((l) => l?.id !== leadId);
    await AsyncStorage.setItem(LEADS_LIST_KEY, JSON.stringify(next));
  } catch {
    // Best-effort: jos cache päivitys epäonnistuu, ei kaadeta UI:ta.
  }
}

/**
 * Lisää tai päivittää liidin cached-listaan.
 *
 * Miksi:
 * - Kun liidi palautetaan (unhide), käyttäjä odottaa että se näkyy heti Inboxissa.
 * - Inbox voi käyttää cachea (offline / välimuisti), joten listaan pitää tehdä upsert.
 */
export async function upsertLeadInCachedList(lead: Lead): Promise<void> {
  try {
    const rawItems = await AsyncStorage.getItem(LEADS_LIST_KEY);
    const parsed = rawItems ? (JSON.parse(rawItems) as unknown) : null;
    const items = Array.isArray(parsed) ? (parsed as Lead[]) : [];

    const next = [lead, ...items.filter((l) => l?.id !== lead.id)];
    await AsyncStorage.setItem(LEADS_LIST_KEY, JSON.stringify(next));
  } catch {
    // Best-effort.
  }
}
