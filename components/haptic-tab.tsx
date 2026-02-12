/**
 * HapticTab — Tab-painike haptisella palautteella
 * 
 * Tarkoitus:
 * - Lisää haptisen palautteen tab-painikkeeseen
 * - Käytetään Expo Routerin Tabs-komponentin tabBarButton-propissa
 * 
 * Käyttö:
 * - <Tabs screenOptions={{ tabBarButton: HapticTab }}>
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Haptic feedback on iOS
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
