import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Deck, getDecks } from '../../../../utils/storage';

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    getDecks().then((decks) => {
      const found = decks.find((d) => d.id === deckId);
      setDeck(found || null);
    });
  }, [deckId]);

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

      <Text style={styles.stats}>
        Matches: {total} | Wins: {wins} | Losses: {losses} | Win Rate: {winRate}%
      </Text>

      <Link href={`/decks/${deck.id}/new-match`}>
        <Text style={styles.addMatch}>+ Add Match</Text>
      </Link>

      <FlatList
        data={deck.matches || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.result}>{item.result.toUpperCase()}</Text>
            <Text style={styles.opp}>vs {item.opponentDeck}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
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
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 8,
  },
  result: { fontWeight: 'bold', fontSize: 16 },
  opp: { color: '#444' },
  date: { color: '#888', fontSize: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 20 },
});
