/**
 * Lead detail -ryhmän layout
 *
 * Tämä layout hallitsee reitit joissa on lead-konteksti:
 * - /lead/[id]       — liidin detailisivu
 * - /lead/[id]/quote — tarjouksen luominen samalla lead-kontekstilla
 *
 * Expo Router käyttää "group layout" -mallia, jossa nested Stack voi
 * jakaa saman parametrin ([id]) alakomponenttien kanssa.
 */

import { Stack } from 'expo-router';

export default function LeadLayout() {
  return (
    <Stack
      screenOptions={{
        // Perutaan jäykät headerit yksittäisille screeneille
        headerShown: false,
      }}
    >
      {/* Lead detail screen — näytetään lead-tiedot */}
      <Stack.Screen name="[id]" options={{ title: 'Liidin tiedot' }} />

      {/* Quote builder screen — modal-tyypin siirtymä */}
      <Stack.Screen
        name="[id]/quote"
        options={{
          // Halutessasi voit tehdä tästä modaali-tyypin siirtymän
          // presentation: 'modal',
          title: 'Luo tarjous',
        }}
      />
    </Stack>
  );
}
