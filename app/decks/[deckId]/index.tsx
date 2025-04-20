import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { Deck, getDecks, saveDeck } from '../../../utils/storage';
import { useFocusEffect } from 'expo-router';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from 'expo-router';

export default function DeckDetailScreen() {

  const { deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');

  const navigation = useNavigation();

  useEffect(() => {
    if (deck) {
      navigation.setOptions({ title: deck.name });
    }
  }, [deck]);

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
    setDeck(updatedDeck);
  };

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Deck not found.</Text>
      </View>
    );
  }

  const getMatchStats = () => {
    const total = (deck.matches ?? []).length;
    const wins = (deck.matches ?? []).filter((m) => m.result === 'win').length;
    const losses = (deck.matches ?? []).filter((m) => m.result === 'loss').length;
    const draws = (deck.matches ?? []).filter((m) => m.result === 'draw').length;

    const winRate = total === 0 ? 0 : (wins / total) * 100;

    const sorted = [...(deck.matches ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastPlayed = sorted[0]?.date ? new Date(sorted[0].date).toLocaleDateString() : 'N/A';

    let currentStreak = 0;
    let bestWinStreak = 0;
    let worstLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (const match of sorted) {
      if (match.result === 'win') {
        tempWinStreak++;
        tempLossStreak = 0;
      } else if (match.result === 'loss') {
        tempLossStreak++;
        tempWinStreak = 0;
      } else {
        tempWinStreak = 0;
        tempLossStreak = 0;
      }

      bestWinStreak = Math.max(bestWinStreak, tempWinStreak);
      worstLossStreak = Math.max(worstLossStreak, tempLossStreak);
    }

    for (const match of sorted) {
      if (match.result === 'win') currentStreak++;
      else break;
    }

    return {
      total,
      wins,
      losses,
      draws,
      winRate: winRate.toFixed(1),
      lastPlayed,
      currentStreak,
      bestWinStreak,
      worstLossStreak,
    };
  };

  const getTopOpponentStats = () => {
    const opponentStats = new Map<string, { wins: number; losses: number; draws: number }>();

    (deck.matches ?? []).forEach((match) => {
      const name = match.opponentDeck?.trim() || 'Unknown';
      if (!opponentStats.has(name)) {
        opponentStats.set(name, { wins: 0, losses: 0, draws: 0 });
      }
      const stat = opponentStats.get(name)!;
      if (match.result === 'win') stat.wins++;
      else if (match.result === 'loss') stat.losses++;
      else if (match.result === 'draw') stat.draws++;
    });

    const sorted = Array.from(opponentStats.entries()).sort(
      (a, b) => b[1].wins + b[1].losses + b[1].draws - (a[1].wins + a[1].losses + a[1].draws)
    );

    return sorted.slice(0, 5); // top 5 only
  };

  const topMatchups = getTopOpponentStats();


  const stats = getMatchStats();


  const wins = deck.matches?.filter((m) => m.result === 'win').length || 0;
  const losses = deck.matches?.filter((m) => m.result === 'loss').length || 0;
  const draws = deck.matches?.filter((m) => m.result === 'draw').length || 0;
  const total = wins + losses + draws;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 'N/A';
  const totalMatches = deck.matches?.length || 0;
  const matchWins = deck.matches?.filter((m) => m.result === 'win').length || 0;
  const matchWinRate = totalMatches > 0 ? (matchWins / totalMatches) * 100 : 0;


  const opponentStats = new Map<string, { wins: number; losses: number; draws: number }>();
  (deck.matches || []).forEach((match) => {
    const name = match.opponentDeck || 'Unknown';
    if (!opponentStats.has(name)) {
      opponentStats.set(name, { wins: 0, losses: 0, draws: 0 });
    }
    const stat = opponentStats.get(name)!;
    if (match.result === 'win') stat.wins++;
    else if (match.result === 'loss') stat.losses++;
    else stat.draws++;
  });

  const opponentChartData = Array.from(opponentStats.entries()).map(([name, { wins, losses, draws }]) => {
    const total = wins + losses + draws;
    const matchWinRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    return { name, matchWinRate };
  }).sort((a, b) => b.matchWinRate - a.matchWinRate);

  const matchData = (deck.matches || []).filter((m) => filter === 'all' ? true : m.result === filter);

  return (
    <FlatList

      ListHeaderComponent={(
        <View>
          <Text style={styles.format}>{deck.format}</Text>
          <Link href={`/decks/${deck.id}/edit`}><Text style={styles.editLink}>✏️ Edit Deck</Text></Link>
          <View style={styles.insightBlock}>
            <Text style={styles.insightHeader}>Match Insights</Text>
            <Text style={styles.insightText}>Matches Played: {stats.total}</Text>
            <Text style={styles.insightText}>Win Rate: {stats.winRate}%</Text>
            <Text style={styles.insightText}>Last Played: {stats.lastPlayed}</Text>
            <Text style={styles.insightText}>Current Streak: {stats.currentStreak} Win(s)</Text>
            <Text style={styles.insightText}>Best Streak: {stats.bestWinStreak} Wins</Text>
            <Text style={styles.insightText}>Worst Streak: {stats.worstLossStreak} Losses</Text>
          </View>

          <Link href={`/decks/${deck.id}/new-match`}><Text style={styles.addMatch}>+ Add Match</Text></Link>

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

          <View style={styles.opponentBlock}>
            <Text style={styles.insightHeader}>Most Played Matchups</Text>
            {topMatchups.map(([name, stats]) => {
              const total = stats.wins + stats.losses + stats.draws;
              const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';
              return (
                <Text key={name} style={styles.insightText}>
                  {name}: {stats.wins}W - {stats.losses}L - {stats.draws}D ({winRate}%)
                </Text>
              );
            })}
            <Link href={`/decks/${deck.id}/matchups`} asChild>
              <Pressable style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Matchups</Text>
              </Pressable>
            </Link>
          </View>


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
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f3f4f6', paddingBottom: 100 },
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
    borderLeftColor: '#3b82f6'
  },
  result: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  opp: { color: '#333', marginBottom: 4 },
  notes: { color: '#555', fontStyle: 'italic', marginBottom: 4 },
  date: { color: '#999', fontSize: 12 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  delete: { color: '#ef4444', fontWeight: 'bold', fontSize: 18, paddingLeft: 10 },
  editLink: { color: '#3b82f6', fontWeight: 'bold', marginBottom: 10 },
  empty: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 20 },
  chartSection: { marginVertical: 20, paddingHorizontal: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
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
  insightBlock: {
    backgroundColor: '#1e2d45',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
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
  
});
