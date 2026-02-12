/**
 * useThemeColor — Teemavärien hook
 * 
 * Tarkoitus:
 * - Tarjoaa teemavarit (light/dark mode)
 * - Käytetään värien soveltamiseen eri komponenteissa
 * 
 * Käyttö:
 * - const color = useThemeColor({}, 'text');
 * - const bgColor = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
 */

import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
