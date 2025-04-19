// app/(tabs)/decks.tsx

import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, FlatList } from 'react-native';
import { Deck, getDecks } from '../../utils/storage';
import { useNavigation } from '@react-navigation/native';


export default function DeckListScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      getDecks().then(setDecks);
    }, [])
  );

  const renderDeck = ({ item }: { item: Deck }) => {
    const total = item.matches?.length ?? 0;
    const wins = item.matches?.filter(m => m.result === 'win').length ?? 0;
    const winRate = total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : 'N/A';

    return (
      <Link href={`/decks/${item.id}`} asChild>
        <Pressable style={styles.deckCard}>
          <View>
            <Text style={styles.deckName}>{item.name}</Text>
            <Text style={styles.deckFormat}>{item.format}</Text>
            <Text style={styles.deckStats}>
              {total} matches • Win Rate: {winRate}
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={decks}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Your Decks</Text>
            {decks.length === 0 && (
              <Text style={styles.empty}>
                No decks found. Tap "+ Add Deck" to begin.
              </Text>
            )}
          </View>
        }
        renderItem={renderDeck}
      />

      <Link href="/decks/new" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </Link>
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
    paddingBottom: 100, // extra bottom padding for FAB
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fbbf24',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    lineHeight: 32,
  },
});
