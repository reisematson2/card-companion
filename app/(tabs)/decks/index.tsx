import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getDecks, Deck } from '../../../utils/storage';

export default function DeckListScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDecks().then(setDecks);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Decks</Text>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/decks/${item.id}`} asChild>
            <Pressable style={styles.deckCard}>
              <Text style={styles.deckName}>{item.name}</Text>
              <Text style={styles.deckFormat}>{item.format}</Text>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No decks found. Create one below!</Text>
        }
        ListFooterComponent={
          <Link href="/(tabs)/decks/new" asChild>
            <Pressable style={styles.newDeckButton}>
              <Text style={styles.newDeckText}>+ Create New Deck</Text>
            </Pressable>
          </Link>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  deckCard: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  deckName: { fontSize: 18, fontWeight: 'bold' },
  deckFormat: { color: '#666' },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  newDeckButton: {
    padding: 15,
    marginTop: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  newDeckText: { color: 'white', fontWeight: 'bold' },
});
