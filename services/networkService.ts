import NetInfo from '@react-native-community/netinfo';

/**
 * Network service - online/offline detection
 * Käyttää NetInfo-kirjastoa luotettavaan verkkotilan tunnistukseen
 */
export class NetworkService {
  /**
   * Tarkista onko laite online-tilassa
   */
  static async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }

  /**
   * Kuuntele verkkotilan muutoksia
   * @param callback - Funktio joka kutsutaan kun tila muuttuu
   * @returns Unsubscribe-funktio
   */
  static subscribe(callback: (isOnline: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      callback(isOnline);
    });

    return unsubscribe;
  }
}