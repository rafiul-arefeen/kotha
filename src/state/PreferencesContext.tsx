import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from '@/storage/preferences';
import type { Preferences } from '@/types';

interface PreferencesValue {
  preferences: Preferences;
  ready: boolean;
  updatePreferences: (patch: Partial<Preferences>) => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPreferences().then((stored) => {
      if (!alive) return;
      setPreferences(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void savePreferences(preferences);
  }, [preferences, ready]);

  const updatePreferences = (patch: Partial<Preferences>) => setPreferences((prev) => ({ ...prev, ...patch }));

  return <PreferencesContext value={{ preferences, ready, updatePreferences }}>{children}</PreferencesContext>;
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
