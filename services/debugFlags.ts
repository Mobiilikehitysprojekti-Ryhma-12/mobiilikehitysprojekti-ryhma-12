import AsyncStorage from '@react-native-async-storage/async-storage';

export type DebugFlags = {
  simulateError: boolean;
  simulateOffline: boolean;

  /**
   * Käytä FakeLeadsRepositoryä (demo/dev) Supabasen sijaan.
   *
   * Miksi tämä flagi:
   * - Oletus halutaan Supabaseen ("oikea data"), mutta debugissa on hyödyllistä palata fake-dataan.
   * - Vaihto tehdään RepoProviderissa ilman UI-muutoksia varsinaisissa ruuduissa.
   */
  useFakeLeadsRepo: boolean;
};

const STORAGE_KEY = 'quoteFlow:debugFlags';

const DEFAULT_FLAGS: DebugFlags = {
  simulateError: false,
  simulateOffline: false,
  useFakeLeadsRepo: false,
};

let flags: DebugFlags = { ...DEFAULT_FLAGS };
const listeners = new Set<(f: DebugFlags) => void>();

export function getDebugFlags(): DebugFlags {
  return flags;
}

export function subscribeDebugFlags(listener: (f: DebugFlags) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener(flags);
}

export async function initDebugFlags() {
  if (!__DEV__) return;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) flags = { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
  } catch {
    flags = { ...DEFAULT_FLAGS };
  }

  emit();
}

export async function setDebugFlags(partial: Partial<DebugFlags>) {
  if (!__DEV__) return;

  flags = { ...flags, ...partial };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore storage errors in dev
  }

  emit();
}

export async function resetDebugFlags() {
  await setDebugFlags({ ...DEFAULT_FLAGS });
}
