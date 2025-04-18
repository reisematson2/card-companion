import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Deck, getDecks } from '../../../utils/storage';

export default function DeckListScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDecks().then(setDecks);
    }, [])
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logoPlaceholder}>📘 Card Companion</Text>
        <Text style={styles.title}>Your Decks</Text>

        <Link href="/app/decks/new">
          <Text style={styles.addButton}>+ Add Deck</Text>
        </Link>

        {decks.length === 0 && <Text style={styles.empty}>No decks found. Tap "+ Add Deck" to begin.</Text>}

        {decks.map((deck) => (
          <Link href={`/decks/${deck.id}`} key={deck.id} asChild>
            <Pressable style={styles.deckCard}>
              <View>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.deckFormat}>{deck.format}</Text>
                <Text style={styles.deckStats}>{deck.matches?.length || 0} matches logged</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  logoPlaceholder: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  addButton: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
  },
  deckCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  deckFormat: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deckStats: {
    fontSize: 12,
    color: '#9ca3af',
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 10,
  },
});
