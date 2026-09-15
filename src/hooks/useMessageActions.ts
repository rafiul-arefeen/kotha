import { useRouter } from 'expo-router';

import { useComposer, type OutgoingMessage } from '@/state/ComposerContext';
import { useHistory } from '@/state/HistoryContext';
import { useSpeech } from '@/state/SpeechContext';

/**
 * Speaking or displaying a message is what "sends" it, so both record it in
 * the local phrase history.
 */
export function useMessageActions() {
  const router = useRouter();
  const { speak } = useSpeech();
  const { record } = useHistory();
  const { setMessage } = useComposer();

  const remember = (message: OutgoingMessage) =>
    record({ text: message.text, register: message.register, origin: message.origin, inputs: message.inputs });

  return {
    /** Speak without leaving the current screen. */
    speakMessage: (message: OutgoingMessage) => {
      if (!message.text.trim()) return;
      remember(message);
      void speak(message.text);
    },
    /** Open the large display screen, optionally speaking straight away. */
    displayMessage: (message: OutgoingMessage, options: { autoSpeak?: boolean } = {}) => {
      if (!message.text.trim()) return;
      remember(message);
      setMessage(message);
      router.push('/message');
      if (options.autoSpeak) setTimeout(() => void speak(message.text), 150);
    },
  };
}
