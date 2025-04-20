import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Deck, getDecks } from '../../../utils/storage';
import { Stack } from 'expo-router';

export default function MatchupInsightsScreen() {
  const { deckId } = useLocalSearchParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const load = async () => {
      const decks = await getDecks();
      const found = decks.find((d) => d.id === deckId);
      if (found) setDeck(found);
    };
    load();
  }, [deckId]);

  const getOpponentStats = () => {
    if (!deck) return [];

    const statsMap = new Map<string, { wins: number; losses: number; draws: number }>();
    deck.matches.forEach((match) => {
      const name = match.opponentDeck?.trim() || 'Unknown';
      if (!statsMap.has(name)) {
        statsMap.set(name, { wins: 0, losses: 0, draws: 0 });
      }
      const entry = statsMap.get(name)!;
      if (match.result === 'win') entry.wins++;
      else if (match.result === 'loss') entry.losses++;
      else if (match.result === 'draw') entry.draws++;
    });

    return Array.from(statsMap.entries()).sort(
      (a, b) => b[1].wins + b[1].losses + b[1].draws - (a[1].wins + a[1].losses + a[1].draws)
    );
  };

  const matchups = getOpponentStats();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'New Match' }} />
      <Text style={styles.header}>All Opponent Matchups</Text>
      <FlatList
        data={matchups}
        keyExtractor={([name]) => name}
        renderItem={({ item: [name, stats] }) => {
          const total = stats.wins + stats.losses + stats.draws;
          const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';
          return (
            <View style={styles.row}>
              <Text style={styles.opponent}>{name}</Text>
              <Text style={styles.stats}>
                {stats.wins}W - {stats.losses}L - {stats.draws}D ({winRate}%)
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No matches recorded yet.</Text>}
      />
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1a2b',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f5c443',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomColor: '#1e2d45',
    borderBottomWidth: 1,
  },
  opponent: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  stats: {
    fontSize: 14,
    color: '#d4e0f0',
  },
  empty: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 20,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#f5c443',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
