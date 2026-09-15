import type { ReactNode } from 'react';

import { ComposerProvider } from './ComposerContext';
import { HistoryProvider } from './HistoryContext';
import { PreferencesProvider } from './PreferencesContext';
import { SpeechProvider } from './SpeechContext';
import { ToastProvider } from './ToastContext';
import { VocabularyProvider } from './VocabularyContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <ToastProvider>
        <VocabularyProvider>
          <HistoryProvider>
            <SpeechProvider>
              <ComposerProvider>{children}</ComposerProvider>
            </SpeechProvider>
          </HistoryProvider>
        </VocabularyProvider>
      </ToastProvider>
    </PreferencesProvider>
  );
}
