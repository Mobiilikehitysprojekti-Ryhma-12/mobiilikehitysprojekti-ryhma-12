// components/ui/LeadDetailView.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Lead } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';
import type { Quote } from '@/models/Quote';
import { useQuotesRepo } from '@/services/quotes/QuoteProvider';

/**
 * LeadDetailView (presentational)
 *
 * Tarkoitus:
 * - Näyttää liidin peruskentät (nimi/palvelu/status/osoite/aika/kuvaus)
 *   UI-tyylillä, joka vastaa listauksen ilmettä (kortti + status-badge).
 * - Tarjoaa "Luo tarjous" -painikkeen siirtymiseen Quote Builder -näkymään.
 * - Tarjoaa "Tarkista tarjouksen status" -painikkeen tarjouksen tarkistukseen.
 * - Ei hae dataa itse -> saa Lead-propin parentilta (screen / viewmodel).
 *
 * Miksi näin:
 * - Erottaa vastuut: reitti/hook hoitaa datavirran ja virhe-/lataustilat,
 *   tämä komponentti vain renderöi. Helpottaa testattavuutta ja uudelleenkäyttöä.
 */
export function LeadDetailView({ lead }: { lead: Lead }) {
    const router = useRouter();
    const quotesRepo = useQuotesRepo();
    const borderColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const errorColor = useThemeColor({}, 'tabIconDefault'); // reddish for error

    // Tarjouksen tarkistus -state
    const [checkQuoteLoading, setCheckQuoteLoading] = useState(false);
    const [checkQuoteError, setCheckQuoteError] = useState<string | null>(null);
    const [foundQuote, setFoundQuote] = useState<Quote | null>(null);

    const handleCreateQuote = () => {
        // Navigoidaan Quote Builder -näkymään samasta lead-parametrista
        // Välitetään lead-nimi query parametrina jotta sitä voidaan näyttää otsikossa
        router.push({
            pathname: `/lead/[id]/quote` as const,
            params: { id: lead.id, leadTitle: lead.title },
        });
    };

    const handleCheckQuote = async () => {
        setCheckQuoteLoading(true);
        setCheckQuoteError(null);
        setFoundQuote(null);

        try {
            const quote = await quotesRepo.getQuoteByLeadId(lead.id);

            if (!quote) {
                setCheckQuoteError('Tarjousta ei löytynyt tälle liidille. Luo tarjous painamalla "Luo tarjous".');
            } else {
                // Näytetään haettu tarjous
                setFoundQuote(quote);
                setCheckQuoteError(null);
            }
        } catch (error) {
            setCheckQuoteError('Virhe tarjouksen hakemisessa. Yritä uudelleen.');
            console.error('Error checking quote:', error);
        } finally {
            setCheckQuoteLoading(false);
        }
    };

    return (
        <ThemedView style={styles.screen}>
            {/* Kortti: linjassa listakomponentin kanssa (ohut reunus, pehmeä radius) */}
            <Card style={[styles.card, { borderColor }]}>
                <View style={styles.top}>
                    <ThemedText type="title" numberOfLines={2} style={{ flex: 1 }}>
                        {lead.title}
                    </ThemedText>

                    {/* Status-badge: sama visuaalinen kieli kuin listassa */}
                    <View style={[styles.badge, { borderColor: tintColor }]}>
                        <ThemedText style={{ color: tintColor }}>
                            {leadStatusLabel(lead.status)}
                        </ThemedText>
                    </View>
                </View>

                {/* Meta: aika, palvelu */}
                <ThemedText style={styles.meta}>
                    {lead.service ? `${lead.service} • ` : ''}
                    {lead.createdAt}
                </ThemedText>

                {/* Perustiedot: asiakas, osoite */}
                {lead.customerName ? (
                    <ThemedText>Asiakas: {lead.customerName}</ThemedText>
                ) : null}
                {lead.address ? <ThemedText>Osoite: {lead.address}</ThemedText> : null}

                {/* Kuvaus erikseen luettavuuden vuoksi */}
                {lead.description ? (
                    <ThemedText style={styles.description}>{lead.description}</ThemedText>
                ) : null}
            </Card>

            {/* Toimintopainikkeet */}
            <Card style={styles.actionCard}>
                <Button
                    title="Luo tarjous"
                    onPress={handleCreateQuote}
                />
                <View style={styles.checkQuoteContainer}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title={
                                checkQuoteLoading
                                    ? ''
                                    : foundQuote
                                    ? 'Piilota tiedot'
                                    : 'Tarkista tarjouksen status'
                            }
                            onPress={foundQuote ? () => setFoundQuote(null) : handleCheckQuote}
                            disabled={checkQuoteLoading}
                        />
                    </View>
                    {checkQuoteLoading && (
                        <ActivityIndicator
                            size="small"
                            color={tintColor}
                            style={styles.loadingIndicator}
                        />
                    )}
                </View>

                {/* Virheviesti */}
                {checkQuoteError && (
                    <View style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
                        <ThemedText style={{ color: '#c62828' }}>
                            {checkQuoteError}
                        </ThemedText>
                    </View>
                )}

                {/* Tarjouksen tiedot jos löytyi */}
                {foundQuote && (
                    <Card style={[styles.quoteCard, { borderColor }]}>
                        <ThemedText type="subtitle" style={styles.quoteTitle}>
                            Tarjouksen tiedot
                        </ThemedText>

                        <View style={styles.quoteField}>
                            <ThemedText style={styles.quoteLabel}>Kuvaus:</ThemedText>
                            <ThemedText>{foundQuote.description}</ThemedText>
                        </View>

                        <View style={styles.quoteField}>
                            <ThemedText style={styles.quoteLabel}>Hinta:</ThemedText>
                            <ThemedText>
                                {foundQuote.price} {foundQuote.currency}
                            </ThemedText>
                        </View>

                        {foundQuote.estimatedStartDate && (
                            <View style={styles.quoteField}>
                                <ThemedText style={styles.quoteLabel}>
                                    Arvioitu aloituspäivä:
                                </ThemedText>
                                <ThemedText>{foundQuote.estimatedStartDate}</ThemedText>
                            </View>
                        )}

                        {foundQuote.quoteValidityDays && (
                            <View style={styles.quoteField}>
                                <ThemedText style={styles.quoteLabel}>
                                    Tarjouksen voimassaolo:
                                </ThemedText>
                                <ThemedText>{foundQuote.quoteValidityDays} päivää</ThemedText>
                            </View>
                        )}

                        {foundQuote.notes && (
                            <View style={styles.quoteField}>
                                <ThemedText style={styles.quoteLabel}>Muistiinpanot:</ThemedText>
                                <ThemedText>{foundQuote.notes}</ThemedText>
                            </View>
                        )}

                        <View style={styles.quoteField}>
                            <ThemedText style={styles.quoteLabel}>Luotu:</ThemedText>
                            <ThemedText>{foundQuote.createdAt}</ThemedText>
                        </View>
                    </Card>
                )}
            </Card>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 16,
        gap: 10,
    },
    card: {
        padding: 14,
        borderWidth: 1,
        gap: 10,
    },
    actionCard: {
        padding: 14,
        gap: 10,
        marginTop: 8,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    meta: {
        opacity: 0.75,
    },
    description: {
        marginTop: 6,
    },
    checkQuoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonWrapper: {
        flex: 1,
    },
    loadingIndicator: {
        position: 'absolute',
        alignSelf: 'center',
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginTop: 4,
    },
    quoteCard: {
        padding: 14,
        borderWidth: 1,
        gap: 10,
        marginTop: 4,
    },
    quoteTitle: {
        marginBottom: 8,
    },
    quoteField: {
        gap: 4,
    },
    quoteLabel: {
        fontWeight: '600',
        opacity: 0.8,
    },
});