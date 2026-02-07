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
