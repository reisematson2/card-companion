import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1e3a8a',
        },
        headerTintColor: '#1e3a8a',
      }}
    >
      {/* Define screens with custom titles */}
      <Stack.Screen
        name="(tabs)/index" // Matches app/(tabs)/index.tsx
        options={{ title: 'Home', headerShown: false }}
      />
      <Stack.Screen
        name="decks" // Matches app/(tabs)/decks.tsx
        options={{ title: 'Decks' }}
      />
      <Stack.Screen
        name="stats" // Matches app/(tabs)/stats.tsx
        options={{ title: 'Statistics' }}
      />
    </Stack>
  );
}