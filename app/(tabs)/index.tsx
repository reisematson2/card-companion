import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function WelcomeScreen() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, isDark && styles.screenDark]}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={styles.logo}>📘</Text>
        <Text style={[styles.title, isDark && styles.titleDark]}>Card Companion</Text>
        <Text style={[styles.tagline, isDark && styles.taglineDark]}>Track your decks. Master your matchups.</Text>

        <Pressable style={styles.button} onPress={() => router.replace('/decks')}>
          <Text style={styles.buttonText}>View My Decks</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
  },
  screenDark: {
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 30,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  titleDark: {
    color: '#f8fafc',
  },
  tagline: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
  },
  taglineDark: {
    color: '#cbd5e1',
  },
  button: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
});