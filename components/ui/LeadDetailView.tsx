// components/ui/LeadDetailView.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Lead } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * LeadDetailView (presentational)
 *
 * Tarkoitus:
 * - Näyttää liidin peruskentät (nimi/palvelu/status/osoite/aika/kuvaus)
 *   UI-tyylillä, joka vastaa listauksen ilmettä (kortti + status-badge).
 * - Ei hae dataa itse -> saa Lead-propin parentilta (screen / viewmodel).
 *
 * Miksi näin:
 * - Erottaa vastuut: reitti/hook hoitaa datavirran ja virhe-/lataustilat,
 *   tämä komponentti vain renderöi. Helpottaa testattavuutta ja uudelleenkäyttöä.
 */
export function LeadDetailView({ lead }: { lead: Lead }) {
    const borderColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
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
});