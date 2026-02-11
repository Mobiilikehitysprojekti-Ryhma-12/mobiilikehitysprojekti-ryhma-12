/**
 * useQuoteDraft -hook
 *
 * Tarkoitus:
 * - Hallinnoi tarjouksen luonnoksen tallennusta AsyncStorageen
 * - Lataa luonnoksen komponentin latautuessa
 * - Autotallentaa muutokset debouncella (1000ms)
 * - Tarjoaa metodit luonnoksen tyhjentämiseen
 *
 * Miksi erillinen hook:
 * - Erottaa AsyncStorage-logiikan UI-komponenteista
 * - Helpottaa testattavuutta
 * - Voidaan uudelleenkäyttää muissa lomakkeissa
 */

import type { QuoteFormData } from '@/models/Quote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

interface UseQuoteDraftOptions {
  leadId: string;
  initialFormData: QuoteFormData;
}

interface UseQuoteDraftReturn {
  formData: QuoteFormData;
  setFormData: (data: QuoteFormData) => void;
  savedStatus: 'idle' | 'saving' | 'saved';
  autoSave: (data: QuoteFormData) => void;
  clearDraft: () => Promise<void>;
  removeDraft: () => Promise<void>;
}

export function useQuoteDraft({
  leadId,
  initialFormData,
}: UseQuoteDraftOptions): UseQuoteDraftReturn {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftKeyRef = useRef<string>(`quoteDraft:${leadId}`);

  /**
   * Lataa luonnos AsyncStoragesta komponentin latautuessa.
   */
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftKey = draftKeyRef.current;
        const savedDraft = await AsyncStorage.getItem(draftKey);

        if (savedDraft) {
          const draftData = JSON.parse(savedDraft) as QuoteFormData;
          setFormData(draftData);
        }
      } catch (error) {
        console.error('useQuoteDraft: luonnoksen lataaminen epäonnistui', error);
      }
    };

    loadDraft();
  }, [leadId]);

  /**
   * Puhdistaa autosave-timeout kun hook unmountataan.
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Autotallentaa lomakkeen sisällön AsyncStorageen (debounce 1000ms).
   */
  const autoSave = (data: QuoteFormData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setSavedStatus('saving');

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const draftKey = draftKeyRef.current;
        await AsyncStorage.setItem(draftKey, JSON.stringify(data));
        setSavedStatus('saved');

        setTimeout(() => {
          setSavedStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('useQuoteDraft: automaattinen tallennus epäonnistui', error);
        setSavedStatus('idle');
      }
    }, 1000);
  };

  /**
   * Tyhjentää tallennetun luonnoksen ja resetoi lomakkeen alkuperäiseen tilaan.
   */
  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(draftKeyRef.current);
      setFormData(initialFormData);
      setSavedStatus('idle');
    } catch (error) {
      console.error('useQuoteDraft: luonnoksen tyhjentäminen epäonnistui', error);
    }
  };

  /**
   * Poistaa luonnoksen AsyncStoragesta (käytetään onnistuneen lähetyksen jälkeen).
   */
  const removeDraft = async () => {
    try {
      await AsyncStorage.removeItem(draftKeyRef.current);
    } catch (error) {
      console.error('useQuoteDraft: luonnoksen poistaminen epäonnistui', error);
    }
  };

  return {
    formData,
    setFormData,
    savedStatus,
    autoSave,
    clearDraft,
    removeDraft,
  };
}
