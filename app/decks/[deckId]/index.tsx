// DeckDetailScreen displays insights, matchups, and performance charts for a single deck
import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { Deck, getDecks, saveDeck } from '../../../utils/storage';
import { useFocusEffect } from 'expo-router';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from 'expo-router';
import { getNormalizedOpponentStats, summarizeDeckPerformance, getWinRate } from '../../../utils/normalize';
import { useTheme } from '../../../context/ThemeContext';

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const navigation = useNavigation();
  const { isDark } = useTheme();

  useEffect(() => {
    if (deck) {
      navigation.setOptions({ title: deck.name });
    }
  }, [deck]);

  useEffect(() => {
    if (!deckId) return;
    getDecks().then((decks) => {
      const found = decks.find((d) => d.id === deckId);
      if (found) {
        setDeck(found);
        // since getDecks() now migrates old decks, we can safely do:
        setMainCards(found.cards.main);
        setSideCards(found.cards.side);
      }
    });
  }, [deckId]);
  

  const handleDeleteMatch = async (matchId: string) => {
    if (!deck) return;
    const updatedMatches = (deck.matches || []).filter(m => m.id !== matchId);
    const updatedDeck = { ...deck, matches: updatedMatches };
    await saveDeck(updatedDeck);
    setDeck(updatedDeck);
  };

  if (!deck) {
    return (
      <View style={[styles.container, isDark && styles.darkBg]}>
        <Text style={[styles.title, isDark && styles.darkText]}>Deck not found.</Text>
      </View>
    );
  }

  const stats = summarizeDeckPerformance(deck.matches);

  const topMatchups = getNormalizedOpponentStats(deck.matches)
    .sort((a, b) => (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws))
    .slice(0, 5);

  const opponentChartData = getNormalizedOpponentStats(deck.matches)
    .map(({ name, wins, losses, draws }) => {
      const winRate = getWinRate(wins, losses, draws);
      return { name, matchWinRate: Math.round(winRate) };
    })
    .sort((a, b) => b.matchWinRate - a.matchWinRate);

  const matchData = (deck.matches || []).filter((m) => filter === 'all' ? true : m.result === filter);

  const wins = stats.wins;
  const losses = stats.losses;
  const draws = stats.draws;
  const total = stats.total;

  return (
    <FlatList
      ListHeaderComponent={(
        <View>
          <Text style={[styles.format, isDark && styles.darkText]}>{deck.format}</Text>
          <Link href={`/decks/${deck.id}/edit`}><Text style={styles.editLink}>✏️ Edit Deck</Text></Link>

          {/* Summary insight block */}
          <View style={[styles.insightBlock, isDark && styles.darkBlock]}>
            <Text style={styles.insightHeader}>Match Insights</Text>
            <Text style={styles.insightText}>Matches Played: {stats.total}</Text>
            <Text style={styles.insightText}>Win Rate: {stats.winRate}%</Text>
            <Text style={styles.insightText}>Last Played: {stats.lastPlayed}</Text>
            <Text style={styles.insightText}>Current Streak: {stats.currentStreak} Win(s)</Text>
            <Text style={styles.insightText}>Best Streak: {stats.bestWinStreak} Wins</Text>
            <Text style={styles.insightText}>Worst Streak: {stats.worstLossStreak} Losses</Text>
          </View>

          <Link href={`/decks/${deck.id}/new-match`}><Text style={styles.addMatch}>+ Add Match</Text></Link>

          {/* Pie chart for win/loss/draw */}
          {total > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Match Results Breakdown</Text>
              <PieChart
                data={[
                  { name: 'Wins', population: wins, color: '#10b981', legendFontColor: '#10b981', legendFontSize: 14 },
                  { name: 'Losses', population: losses, color: '#ef4444', legendFontColor: '#ef4444', legendFontSize: 14 },
                  { name: 'Draws', population: draws, color: '#fbbf24', legendFontColor: '#fbbf24', legendFontSize: 14 }
                ]}
                width={Dimensions.get('window').width - 40}
                height={180}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
            </View>
          )}

          {/* Most played opponent matchups */}
          <View style={[styles.opponentBlock, isDark && styles.darkBlock]}>
            <Text style={styles.insightHeader}>Most Played Matchups</Text>
            {topMatchups.map((m) => {
              const total = m.wins + m.losses + m.draws;
              const winRate = total ? ((m.wins / total) * 100).toFixed(1) : '0.0';
              return (
                <Text key={m.name} style={styles.insightText}>
                  {m.name}: {m.wins}W - {m.losses}L - {m.draws}D ({winRate}%)
                </Text>
              );
            })}
            <Link href={`/decks/${deck.id}/matchups`} asChild>
              <Pressable style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Matchups</Text>
              </Pressable>
            </Link>
          </View>

          {/* Bar chart for win rate per opponent */}
          {opponentChartData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Win Rate by Opponent Deck</Text>
              <View style={{ alignItems: 'center' }}>
                <BarChart
                  data={{
                    labels: opponentChartData.map((d) => d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name),
                    datasets: [{ data: opponentChartData.map((d) => d.matchWinRate) }]
                  }}
                  width={Dimensions.get('window').width - 40}
                  height={220}
                  fromZero
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: () => '#333'
                  }}
                  showValuesOnTopOfBars
                  style={{ borderRadius: 10 }}
                />
              </View>
            </View>
          )}

          {/* Match filter buttons */}
          <View style={styles.filterRow}>
            {['all', 'win', 'loss', 'draw'].map((type) => (
              <Pressable
                key={type}
                onPress={() => setFilter(type as any)}
                style={[styles.filterButton, filter === type && styles.activeFilterButton]}
              >
                <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
                  {type === 'all' ? 'All' : type === 'win' ? 'Wins' : type === 'loss' ? 'Losses' : 'Draws'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      data={matchData}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item }) => (
        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <Link href={`/decks/${deck.id}/edit-match/${item.id}`} asChild>
              <Pressable style={{ flex: 1 }}>
                <View>
                  <Text style={styles.result}>{item.result.toUpperCase()} ({item.gameWins}-{item.gameLosses})</Text>
                  <Text style={styles.opp}>vs {item.opponentDeck}</Text>
                  {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
                  <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
              </Pressable>
            </Link>
            <Pressable
              onPress={() => {
                Alert.alert('Delete Match', 'Are you sure you want to delete this match?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMatch(item.id) }
                ]);
              }}
            >
              <Text style={styles.delete}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No matches logged.</Text>}
      contentContainerStyle={[styles.container, isDark && styles.darkBg]}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    paddingBottom: 100,
  },
  darkBg: {
    backgroundColor: '#0f172a',
  },
  darkText: {
    color: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  format: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  editLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  insightBlock: {
    backgroundColor: '#1e2d45',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  darkBlock: {
    backgroundColor: '#1e293b',
  },
  insightHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5c443',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  addMatch: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  chartSection: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  opponentBlock: {
    backgroundColor: '#1b2a3a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  viewAllButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5c443',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#0e1a2b',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  activeFilterText: {
    color: 'white',
  },
  matchCard: {
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  delete: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
});
