/**
 * ErrorCard — Virhekortti-komponentti
 * 
 * Tarkoitus:
 * - Näyttää virheilmoitus käyttäjälle
 * - Tarjoaa uudelleen yritä -painikkeen
 * - Yhtenäinen virhetilan esitys
 * 
 * Käyttö:
 * - <ErrorCard error="Lataus epäonnistui" onRetry={() => {}} />
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { Button } from './Button';
import { Card } from './Card';

export interface ErrorCardProps {
  error: string;
  onRetry: () => void;
  retryLabel?: string;
}

/**
 * ErrorCard komponentti
 * Näyttää virheen ja uudelleen yritä -painikkeen
 */
export function ErrorCard({
  error,
  onRetry,
  retryLabel = 'Yritä uudesstaan',
}: ErrorCardProps) {
  return (
    <Card style={styles.card}>
      <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
      <Button title={retryLabel} onPress={onRetry} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 14,
  },
});
