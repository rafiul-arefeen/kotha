import {
  BalooDa2_400Regular,
  BalooDa2_500Medium,
  BalooDa2_600SemiBold,
  BalooDa2_700Bold,
  BalooDa2_800ExtraBold,
} from '@expo-google-fonts/baloo-da-2';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme } from '@/hooks/useTheme';
import { AppProvider } from '@/state/AppProvider';
import { useHistory } from '@/state/HistoryContext';
import { usePreferences } from '@/state/PreferencesContext';
import { useVocabulary } from '@/state/VocabularyContext';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonts are bundled with the app (no network needed). Baloo Da 2 covers
  // Bangla script; Nunito is used for small English labels, as in the mockup.
  const [fontsLoaded, fontError] = useFonts({
    BalooDa2_400Regular,
    BalooDa2_500Medium,
    BalooDa2_600SemiBold,
    BalooDa2_700Bold,
    BalooDa2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  return (
    <AppProvider>
      <RootNavigator fontsReady={fontsLoaded || !!fontError} />
    </AppProvider>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { ready, preferences } = usePreferences();
  const vocabulary = useVocabulary();
  const history = useHistory();
  const { c } = useTheme();
  const loaded = fontsReady && ready && vocabulary.ready && history.ready;

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.canvas },
          animation: 'fade_from_bottom',
        }}>
        <Stack.Protected guard={!preferences.onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={preferences.onboarded}>
          <Stack.Screen name="index" />
          <Stack.Screen name="generate" />
          <Stack.Screen name="message" options={{ animation: 'fade' }} />
          <Stack.Screen name="history" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="vocabulary" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
