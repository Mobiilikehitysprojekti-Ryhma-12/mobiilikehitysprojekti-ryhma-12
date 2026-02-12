/**
 * Card — Kortti-komponentti
 * 
 * Tarkoitus:
 * - Näyttää sisältöä kortissa (välineistöllä, reunuksilla, täyttöillä)
 * - Yhtenäinen tyyli kaikkialla sovelluksessa
 * - Tukee teemoitusta
 * 
 * Käyttö:
 * - <Card><Text>Sisältö</Text></Card>
 * - <Card style={customStyle}>Sisältö</Card>
 */

import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface CardProps extends ViewProps {}

/**
 * Card komponentti
 * Palauttaa View-komponentin, joka näyttää korttin (background + reunus)
 */
export function Card({ style, ...rest }: CardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor, borderColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
    borderWidth: 1,
  },
});
