import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Deck, getDecks, saveDeck } from '../../../../utils/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';


export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState<Deck | null>(null);

  useFocusEffect(
    useCallback(() => {
      getDecks().then((decks) => {
        const found = decks.find((d) => d.id === deckId);
        setDeck(found || null);
      });
    }, [deckId])
  );

  const handleDeleteMatch = async (matchId: string) => {
    if (!deck) return;

    const updatedMatches = (deck.matches || []).filter(m => m.id !== matchId);
    const updatedDeck = { ...deck, matches: updatedMatches };

    await saveDeck(updatedDeck);
    setDeck(updatedDeck); // update local state immediately
  };

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Deck not found.</Text>
      </View>
    );
  }

  const wins = deck.matches?.filter((m) => m.result === 'win').length || 0;
  const losses = deck.matches?.filter((m) => m.result === 'loss').length || 0;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deck.name}</Text>
      <Text style={styles.format}>{deck.format}</Text>

      <Link href={`/decks/${deck.id}/edit`}>
        <Text style={styles.editLink}>✏️ Edit Deck</Text>
      </Link>


      <Text style={styles.stats}>
        Matches: {total} | Wins: {wins} | Losses: {losses} | Win Rate: {winRate}%
      </Text>

      <Link href={`/decks/${deck.id}/new-match`}>
        <Text style={styles.addMatch}>+ Add Match</Text>
      </Link>

      <FlatList
        data={deck.matches || []}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Link href={`/decks/${deck.id}/edit-match/${item.id}`} asChild>
                <Pressable style={{ flex: 1 }}>
                  <View>
                    <Text style={styles.result}>
                      {item.result.toUpperCase()} ({item.gameWins}-{item.gameLosses})
                    </Text>
                    <Text style={styles.opp}>vs {item.opponentDeck}</Text>
                    {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                </Pressable>
              </Link>

              <Pressable
                onPress={() => {
                  Alert.alert(
                    'Delete Match',
                    'Are you sure you want to delete this match?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDeleteMatch(item.id),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.delete}>🗑️</Text>
              </Pressable>
            </View>
          </View>

        )}

        ListEmptyComponent={<Text style={styles.empty}>No matches logged.</Text>}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  format: { fontSize: 16, color: '#666', marginBottom: 10 },
  stats: { marginBottom: 10, fontSize: 14 },
  addMatch: { color: '#3b82f6', fontWeight: 'bold', marginBottom: 10 },
  matchCard: {
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', // Optional: accent bar
  },
  
  result: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  
  opp: {
    color: '#333',
    marginBottom: 4,
  },
  
  notes: {
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  
  date: {
    color: '#999',
    fontSize: 12,
  },
  
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  delete: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 10,
  },
});
