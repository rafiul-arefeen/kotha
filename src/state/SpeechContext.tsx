import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { getTTSService, type TTSStatus } from '@/services/tts';

import { usePreferences } from './PreferencesContext';
import { useToast } from './ToastContext';

interface SpeechValue {
  speaking: boolean;
  status: TTSStatus | null;
  /** Returns false when speech was not attempted (disabled / no voice). */
  speak: (text: string) => Promise<boolean>;
  stop: () => Promise<void>;
  refreshStatus: () => void;
}

const SpeechContext = createContext<SpeechValue | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const toast = useToast();
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState<TTSStatus | null>(null);
  const token = useRef(0);

  const refreshStatus = () => {
    getTTSService()
      .getStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  };

  useEffect(() => {
    let alive = true;
    getTTSService()
      .getStatus()
      .then((s) => alive && setStatus(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const speak = async (text: string) => {
    const clean = text.trim();
    if (!clean) return false;
    if (!preferences.ttsEnabled) {
      toast.show('🔇 কণ্ঠ বন্ধ আছে — লেখাটি দেখান');
      return false;
    }
    if (status?.banglaVoice === 'missing') {
      toast.show('এই ফোনে বাংলা ভয়েস নেই — লেখাটি দেখান (সেটিংস দেখুন)', 'warn');
      return false;
    }
    const current = ++token.current;
    setSpeaking(true);
    await getTTSService().speak(clean, {
      rate: preferences.speechRate,
      onStart: () => current === token.current && setSpeaking(true),
      onDone: () => current === token.current && setSpeaking(false),
      onError: (error) => {
        console.warn('[tts]', error);
        if (current === token.current) setSpeaking(false);
        toast.show('কণ্ঠ চালানো যায়নি — লেখাটি দেখান', 'warn');
      },
    });
    if (status?.banglaVoice !== 'available') refreshStatus();
    return true;
  };

  const stop = async () => {
    token.current += 1;
    setSpeaking(false);
    await getTTSService().stop();
  };

  return <SpeechContext value={{ speaking, status, speak, stop, refreshStatus }}>{children}</SpeechContext>;
}

export function useSpeech(): SpeechValue {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeech must be used inside SpeechProvider');
  return ctx;
}
