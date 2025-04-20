import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getDecks } from '../../../utils/storage';
import { getNormalizedOpponentStats, getWinRate } from '../../../utils/normalize';

export default function MatchupsScreen() {
  const { deckId } = useLocalSearchParams();
  const [matchups, setMatchups] = useState([]);
  const [deckName, setDeckName] = useState('');

  useEffect(() => {
    const loadMatchups = async () => {
      const decks = await getDecks();
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;
      setDeckName(deck.name);

      const opponentStats = getNormalizedOpponentStats(deck.matches);
      const sorted = opponentStats.sort((a, b) => (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws));
      setMatchups(sorted);
    };
    loadMatchups();
  }, [deckId]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Matchups - ${deckName}` }} />
      <Text style={styles.header}>All Opponent Matchups</Text>

      {matchups.length === 0 ? (
        <Text style={styles.empty}>No matchups available.</Text>
      ) : (
        <FlatList
          data={matchups}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => {
            const total = item.wins + item.losses + item.draws;
            const winRate = getWinRate(item.wins, item.losses, item.draws);
            return (
              <View style={styles.matchupCard}>
                <Text style={styles.opponent}>{item.name}</Text>
                <Text style={styles.stats}>{item.wins}W - {item.losses}L - {item.draws}D</Text>
                <Text style={styles.rate}>{winRate.toFixed(1)}% Win Rate</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },
  matchupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  opponent: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  stats: {
    fontSize: 14,
    color: '#374151',
  },
  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
});
