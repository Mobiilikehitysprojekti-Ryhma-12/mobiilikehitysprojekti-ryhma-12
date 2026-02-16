/**
 * app/login.tsx
 *
 * Kirjautumisruutu (email + salasana).
 *
 * Vaatimukset:
 * - Kentät + nappi
 * - Validointi (tyhjät kentät / epäkelpo email)
 * - Loading-tila (napin disabled + "Ladataan…")
 * - Virheteksti (väärä salasana / puuttuvat envit)
 */

import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/services/auth/AuthProvider';

function isValidEmail(value: string) {
  // Kevyt validointi demoa varten (ei RFC-täydellinen).
  return value.includes('@') && value.includes('.');
}

export default function LoginScreen() {
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'icon');

  const { signIn, signUp, isLoading, errorMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (!email.trim() || !password) return false;
    if (!isValidEmail(email.trim())) return false;
    return true;
  }, [email, password, isLoading]);

  async function onSubmit() {
    setInfoMessage(null);
    const cleanEmail = email.trim();

    // Validointi: selkeät, UI:hin sidotut virheet.
    const nextEmailError = !cleanEmail
      ? 'Sähköposti on pakollinen.'
      : !isValidEmail(cleanEmail)
        ? 'Sähköposti ei ole kelvollinen.'
        : null;

    const nextPasswordError = !password ? 'Salasana on pakollinen.' : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    await signIn(cleanEmail, password);
  }

  async function onCreateAccount() {
    setInfoMessage(null);
    const cleanEmail = email.trim();

    // Sama validointi kuin kirjautumisessa -> vähemmän yllätyksiä.
    const nextEmailError = !cleanEmail
      ? 'Sähköposti on pakollinen.'
      : !isValidEmail(cleanEmail)
        ? 'Sähköposti ei ole kelvollinen.'
        : null;

    const nextPasswordError = !password ? 'Salasana on pakollinen.' : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    const result = await signUp(cleanEmail, password);

    // Huom: jos Supabase vaatii email-varmistuksen, kirjautuminen ei onnistu ennen vahvistusta.
    // Tämä viesti tekee tilanteen selkeäksi demossa.
    setInfoMessage(
      result.needsEmailConfirmation
        ? 'Tili luotu. Tarkista sähköposti ja vahvista tili, sitten kirjaudu sisään.'
        : 'Tili luotu. Voit nyt kirjautua sisään.'
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <ThemedText type="title">Kirjaudu</ThemedText>
          <ThemedText style={styles.subtitle}>Syötä sähköposti ja salasana.</ThemedText>
        </View>

        <Card style={styles.card}>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Sähköposti</ThemedText>
            <Input
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="esim. user@company.com"
              error={Boolean(emailError)}
            />
            {emailError ? <ThemedText style={[styles.errorText, { color: tint }]}>{emailError}</ThemedText> : null}
          </View>

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Salasana</ThemedText>
            <Input
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordError) setPasswordError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="••••••••"
              error={Boolean(passwordError)}
            />
            {passwordError ? (
              <ThemedText style={[styles.errorText, { color: tint }]}>{passwordError}</ThemedText>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Button title="Kirjaudu" onPress={onSubmit} disabled={!canSubmit} loading={isLoading} />
            <View style={styles.secondaryAction}>
              <Button title="Luo tili" onPress={onCreateAccount} disabled={!canSubmit} loading={isLoading} />
            </View>
          </View>

          {infoMessage ? (
            <View style={[styles.serverError, { borderColor: border }]}>
              <ThemedText>{infoMessage}</ThemedText>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={[styles.serverError, { borderColor: border }]}> 
              <ThemedText style={{ color: tint }}>{errorMessage}</ThemedText>
            </View>
          ) : null}
        </Card>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginTop: 10,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  subtitle: {
    opacity: 0.8,
  },
  card: {
    borderRadius: Radii.md,
    gap: Spacing.md,
  },
  field: {
    gap: 8,
  },
  errorText: {
    opacity: 0.95,
  },
  actions: {
    marginTop: 4,
  },
  secondaryAction: {
    marginTop: Spacing.sm,
  },
  serverError: {
    marginTop: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.sm,
    opacity: 0.9,
  },
});
