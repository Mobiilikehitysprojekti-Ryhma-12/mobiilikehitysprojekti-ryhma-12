/**
 * services/auth/AuthProvider.tsx
 *
 * Auth-tila koko sovellukselle Contextin kautta.
 *
 * Mitä tämä tarjoaa:
 * - `session`: Supabase-session (tai null)
 * - `user`: helppo alias `session?.user`
 * - `signIn(email, password)`: sähköposti + salasana -kirjautuminen
 * - `signOut()`: uloskirjautuminen ja session siivous
 *
 * Miksi Context?
 * - Screenit voivat lukea session missä tahansa ilman prop-drillingiä.
 * - Route guard voidaan tehdä keskitetysti RootLayoutissa.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabaseEnvStatus, supabase } from '@/services/supabaseClient';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const env = getSupabaseEnvStatus();

      // Jos env puuttuu, ei voida alustaa authia. Näytetään virhe Login-ruudussa.
      if (!supabase) {
        if (!isMounted) return;
        setSession(null);
        setErrorMessage(
          !env.hasUrl || !env.hasAnonKey
            ? 'Supabase-ympäristömuuttujat puuttuvat (.env).'
            : 'Supabase-client ei ole käytettävissä.'
        );
        setIsLoading(false);
        return;
      }

      try {
        // Haetaan persistoidusta storagesta edellinen sessio (jos olemassa).
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!isMounted) return;
        setSession(data.session);
        setErrorMessage(null);
      } catch (e) {
        console.error('[Auth] getSession epäonnistui', e);
        if (!isMounted) return;
        setSession(null);
        setErrorMessage('Session lukeminen epäonnistui.');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Kuunnellaan auth-tilan muutoksia (kirjautuminen/uloskirjautuminen/refresh).
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setErrorMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase ei ole konfiguroitu. Lisää EXPO_PUBLIC_* env-arvot.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Supabase palauttaa usein englanninkielisen virheen.
        // Pidetään demo mielessä: näytetään selkeä teksti ilman teknisiä yksityiskohtia.
        setErrorMessage(error.message || 'Kirjautuminen epäonnistui.');
        return;
      }

      // Session päivittyy onAuthStateChange-listenerin kautta.
      setErrorMessage(null);
    } catch (e) {
      console.error('[Auth] signIn epäonnistui', e);
      setErrorMessage('Kirjautuminen epäonnistui.');
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string): Promise<{ needsEmailConfirmation: boolean }> {
    setErrorMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase ei ole konfiguroitu. Lisää EXPO_PUBLIC_* env-arvot.');
      return { needsEmailConfirmation: false };
    }

    setIsLoading(true);
    try {
      // Miksi signUp täällä (eikä suoraan UI:ssa):
      // - Pidetään auth-logiikka yhdessä paikassa.
      // - UI saa vain selkeän "onnistuiko"-tiedon ja mahdollisen virhetekstin.
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMessage(error.message || 'Tilin luonti epäonnistui.');
        return { needsEmailConfirmation: false };
      }

      // Jos Supabase vaatii email-varmistuksen, session voi olla null.
      // Demoa varten palautetaan tieto UI:lle, jotta se voi ohjeistaa käyttäjää.
      const needsEmailConfirmation = !data.session;
      return { needsEmailConfirmation };
    } catch (e) {
      console.error('[Auth] signUp epäonnistui', e);
      setErrorMessage('Tilin luonti epäonnistui.');
      return { needsEmailConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setErrorMessage(null);

    if (!supabase) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    try {
      // Supabase hoitaa tokenien mitätöinnin + storage cleanupin.
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Varmistetaan demo-vaatimus: restart ei kirjaa sisään automaattisesti.
      // Tämä on “varmistuskerros” (signOut yleensä siivoaa jo storageKeyn).
      await AsyncStorage.removeItem('quoteflow-auth');

      setSession(null);
    } catch (e) {
      console.error('[Auth] signOut epäonnistui', e);
      setErrorMessage('Uloskirjautuminen epäonnistui.');
    } finally {
      setIsLoading(false);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      errorMessage,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, errorMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth
 *
 * Käyttö:
 * - `const { session, user, signIn, signOut } = useAuth()`
 *
 * Heittää virheen jos sitä käytetään ilman AuthProvideria.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
