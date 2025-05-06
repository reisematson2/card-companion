// MatchupsScreen displays aggregated statistics for opponents of a selected deck
import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getDecks } from '../../../utils/storage';
import { getNormalizedOpponentStats, getWinRate } from '../../../utils/normalize';
import { useTheme } from '../../../context/ThemeContext';

export default function MatchupsScreen() {
  // Retrieve the deckId from the route params
  const { deckId } = useLocalSearchParams();

  // Access theme context
  const { isDark } = useTheme();

  // Local state to store matchup stats and the deck name
  const [matchups, setMatchups] = useState([]);
  const [deckName, setDeckName] = useState('');

  // Load deck data and calculate matchup statistics on mount
  useEffect(() => {
    const loadMatchups = async () => {
      const decks = await getDecks();
      const deck = decks.find((d) => d.id === deckId); // Find the current deck by ID
      if (!deck) return;
      setDeckName(deck.name); // Set deck name for header

      // Normalize and sort opponent stats by number of matches played
      const opponentStats = getNormalizedOpponentStats(deck.matches);
      const sorted = opponentStats.sort((a, b) => (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws));
      setMatchups(sorted);
    };
    loadMatchups();
  }, [deckId, setDeckName, setMatchups]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Update the screen title dynamically based on deck name */}
      <Stack.Screen options={{ title: `Matchups - ${deckName}` }} />

      <Text style={[styles.header, isDark && styles.headerDark]}>All Opponent Matchups</Text>

      {/* Display a message if no matchups exist */}
      {matchups.length === 0 ? (
        <Text style={[styles.empty, isDark && styles.emptyDark]}>No matchups available.</Text>
      ) : (
        <FlatList
          data={matchups} // Render all normalized opponent matchups
          keyExtractor={(item) => item.name} // Use opponent name as key
          renderItem={({ item }) => {
            const winRate = getWinRate(item.wins, item.losses, item.draws); // Calculate win rate
            return (
              <View style={[styles.matchupCard, isDark && styles.matchupCardDark]}>
                <Text style={[styles.opponent, isDark && styles.textDark]}>{item.name}</Text>
                <Text style={[styles.stats, isDark && styles.textDark]}>{item.wins}W - {item.losses}L - {item.draws}D</Text>
                <Text style={[styles.rate, isDark && styles.rateDark]}>{winRate.toFixed(1)}% Win Rate</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// Styles for layout and visual appearance
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  headerDark: {
    color: '#f3f4f6',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },
  emptyDark: {
    color: '#ccc',
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
  matchupCardDark: {
    backgroundColor: '#1e293b',
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
  textDark: {
    color: '#e5e7eb',
  },
  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
  rateDark: {
    color: '#93c5fd',
  },
});
