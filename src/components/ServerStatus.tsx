import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { getLLMStatus } from '@/services/llm';
import { radius } from '@/theme';

type Health =
  | { state: 'checking' }
  | { state: 'ok'; provider: string; model: string; configured: boolean }
  | { state: 'unreachable' };

async function fetchHealth(apiUrl: string): Promise<Health> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${apiUrl}/v1/health`, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) return { state: 'unreachable' };
    const data = await response.json();
    return {
      state: 'ok',
      provider: String(data?.provider ?? ''),
      model: String(data?.model ?? ''),
      configured: !!data?.configured,
    };
  } catch {
    return { state: 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

/** Honest status of sentence generation: mock, or the server and its model. */
export function ServerStatus() {
  const { c } = useTheme();
  const llm = getLLMStatus();
  const [health, setHealth] = useState<Health>({ state: 'checking' });
  const [attempt, setAttempt] = useState(0);
  const remote = llm.active === 'remote';

  useEffect(() => {
    if (!remote) return;
    let alive = true;
    fetchHealth(llm.apiUrl).then((result) => alive && setHealth(result));
    return () => {
      alive = false;
    };
  }, [remote, llm.apiUrl, attempt]);

  let text: string;
  let warn = false;
  if (llm.misconfigured) {
    warn = true;
    text = '⚠️ রিমোট AI চাওয়া হয়েছে কিন্তু সার্ভারের ঠিকানা পাওয়া যায়নি। তাই নমুনা AI চলছে।';
  } else if (!remote) {
    text = 'নমুনা AI (mock) চলছে — ফোনের ভেতরেই নিয়ম মেনে বাক্য বানায়। কোনো API যুক্ত নেই, ইন্টারনেট লাগে না।';
  } else if (health.state === 'checking') {
    text = `সার্ভার যাচাই হচ্ছে… (${llm.apiUrl})`;
  } else if (health.state === 'unreachable') {
    warn = true;
    text = `⚠️ সার্ভারে পৌঁছানো যাচ্ছে না (${llm.apiUrl})। ল্যাপটপে "npx expo start" চালু আছে এবং ফোন একই Wi-Fi-তে আছে কিনা দেখুন। ততক্ষণ অফলাইন বাক্য দেখাবে।`;
  } else if (!health.configured) {
    warn = true;
    text = '⚠️ ল্যাপটপের সার্ভার চলছে, কিন্তু .env.local-এ GEMINI_API_KEY নেই। ততক্ষণ অফলাইন বাক্য দেখাবে।';
  } else {
    text = `✓ ${health.provider === 'gemini' ? 'Gemini' : health.provider} (${health.model}) দিয়ে বাক্য তৈরি হচ্ছে।\nল্যাপটপ সার্ভার: ${llm.apiUrl}\nসংযোগ না পেলে আগের বা অফলাইন বাক্য দেখাবে।`;
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.info, { backgroundColor: c.surface, borderColor: warn ? c.warnBorder : c.lineSoft }]}>
        <Txt size={14} weight={600} color={warn ? c.warnFg : c.muted}>
          {text}
        </Txt>
      </View>
      {remote && !llm.misconfigured ? (
        <ActionButton
          icon="⟲"
          label="সংযোগ আবার যাচাই"
          sublabel="CHECK SERVER"
          onPress={() => {
            setHealth({ state: 'checking' });
            setAttempt((n) => n + 1);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  info: { borderWidth: 1.5, borderRadius: radius.md, padding: 12 },
});
