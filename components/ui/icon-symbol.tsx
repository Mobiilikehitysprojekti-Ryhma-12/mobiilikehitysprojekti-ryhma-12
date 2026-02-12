/**
 * IconSymbol — SF Symbols / Material Icons -yhteensopiva ikonikomponentti
 * 
 * Tarkoitus:
 * - Tarjoaa yhtenäisen ikonitoteutuksen tab-palkkiin ja muihin UI-elementteihin
 * - Tukee SF Symbols -nimiä iOS:lla ja Material Icons -tyyppisiä nimiä muilla alustoilla
 * 
 * Käyttö:
 * - <IconSymbol name="house.fill" size={28} color="#000" />
 * - <IconSymbol name="paperplane.fill" size={24} color="#666" />
 */

import { StyleSheet, Text } from 'react-native';

// SF Symbols to Unicode/Emoji mapping (yksinkertainen fallback)
const ICON_MAP: Record<string, string> = {
  'house.fill': '🏠',
  'paperplane.fill': '✈️',
  'plus': '+',
  'checkmark': '✓',
  'xmark': '✕',
};

export type IconSymbolName = keyof typeof ICON_MAP;

interface IconSymbolProps {
  name: IconSymbolName | string;
  size?: number;
  color?: string;
  style?: any;
}

export function IconSymbol({ name, size = 24, color = '#000', style }: IconSymbolProps) {
  const symbol = ICON_MAP[name] || '?';

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color,
        },
        style,
      ]}>
      {symbol}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: '600',
  },
});
