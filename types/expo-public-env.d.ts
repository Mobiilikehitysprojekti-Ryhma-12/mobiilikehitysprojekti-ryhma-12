// types/expo-public-env.d.ts
//
// Tyyppimäärittelyt Expo "public" env-muuttujille.
// Käytetään `process.env.EXPO_PUBLIC_*` -muotoa, jotta TS ei valita.

declare const process: {
  env: {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_CUSTOMER_URL?: string;
    EXPO_PUBLIC_BUSINESS_NAME?: string;
    EXPO_PUBLIC_BUSINESS_PHONE?: string;
    EXPO_PUBLIC_BUSINESS_EMAIL?: string;
    [key: string]: string | undefined;
  };
};
