/**
 * useUserLocation-hook
 * 
 * Hallinnoi käyttäjän sijaintitietojen hakemisen ja luvan pyytämisen.
 * 
 * Toiminnallisuus:
 * - Pyytää sijaintiluvan automaattisesti kun hook mountataan
 * - Hakee käyttäjän nykyisen GPS-sijainnin (Balanced accuracy)
 * - Palauttaa tilan: sijainti, lupa-status ja lataustieto
 * 
 * Käyttö:
 * ```tsx
 * const { userLocation, locationPermission, isLoading } = useUserLocation();
 * ```
 */

import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface UseUserLocationResult {
  userLocation: Location.LocationObject | null;
  locationPermission: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const requestLocationPermission = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Pyydä sijaintilupa
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (!isSubscribed) return;
        
        setLocationPermission(status);

        // Jos lupa myönnetty, hae sijainti
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          if (isSubscribed) {
            setUserLocation(location);
          }
        }
      } catch (err) {
        if (isSubscribed) {
          setError('Sijainnin hakeminen epäonnistui');
          console.error('Sijainnin hakeminen epäonnistui:', err);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    requestLocationPermission();

    return () => {
      isSubscribed = false;
    };
  }, []);

  return {
    userLocation,
    locationPermission,
    isLoading,
    error,
  };
}
