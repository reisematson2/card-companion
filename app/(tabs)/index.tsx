import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.logo}>📘</Text>
        <Text style={styles.title}>Card Companion</Text>
        <Text style={styles.tagline}>Track your decks. Master your matchups.</Text>

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
  container: {
    padding: 30,
    alignItems: 'center',
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
  tagline: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
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
