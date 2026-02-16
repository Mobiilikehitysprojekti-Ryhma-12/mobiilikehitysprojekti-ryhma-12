/**
 * ThemedView — Teemoitettu näkymä-komponentti
 * 
 * Tarkoitus:
 * - Tarjoaa teemaa noudattavat containeri-elementit (light/dark mode)
 * - Käytetään näkymän taustavärinä
 * 
 * Käyttö:
 * - <ThemedView style={styles.container}>Sisältö</ThemedView>
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

export interface ThemedViewProps extends ViewProps {}

/**
 * ThemedView komponentti
 * Palauttaa View-komponentin, joka käyttää teemaa taustalle
 */
export function ThemedView({ style, ...rest }: ThemedViewProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View {...rest} style={[{ backgroundColor }, style]} />
  );
}
