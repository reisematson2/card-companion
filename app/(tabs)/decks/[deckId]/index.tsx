import { useLocalSearchParams, Link, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import { Deck, getDecks, saveDeck } from '../../../../utils/storage';
import { PieChart, BarChart } from 'react-native-chart-kit';

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');

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

  const wins = deck.matches?.filter((m) => m.result === 'win').length || 0;
  const losses = deck.matches?.filter((m) => m.result === 'loss').length || 0;
  const draws = deck.matches?.filter((m) => m.result === 'draw').length || 0;
  const total = wins + losses + draws;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 'N/A';

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

  const opponentChartData = Array.from(opponentStats.entries())
    .map(([name, { wins, losses, draws }]) => {
      const total = wins + losses + draws;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { name, winRate };
    })
    .sort((a, b) => b.winRate - a.winRate);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{deck.name}</Text>
          <Text style={styles.format}>{deck.format}</Text>
        </View>
        <Link href={`/decks/${deck.id}/edit`}>
          <Text style={styles.editLink}>✏️</Text>
        </Link>
      </View>

      <Text style={styles.stats}>Matches: {total} | Wins: {wins} | Losses: {losses} | Draws: {draws} | Win Rate: {winRate}%</Text>
      <Link href={`/decks/${deck.id}/new-match`}><Text style={styles.addMatch}>+ Add Match</Text></Link>

      {total > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Match Results Breakdown</Text>
          <PieChart
            data={[{ name: 'Wins', population: wins, color: '#10b981', legendFontColor: '#10b981', legendFontSize: 14 }, { name: 'Losses', population: losses, color: '#ef4444', legendFontColor: '#ef4444', legendFontSize: 14 }, { name: 'Draws', population: draws, color: '#fbbf24', legendFontColor: '#fbbf24', legendFontSize: 14 }]}
            width={Dimensions.get('window').width - 40}
            height={180}
            chartConfig={{ backgroundColor: 'transparent', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>
      )}

      {opponentChartData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Win Rate by Opponent Deck</Text>
          <BarChart
            data={{ labels: opponentChartData.map((d) => d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name), datasets: [{ data: opponentChartData.map((d) => d.winRate) }] }}
            width={Dimensions.get('window').width - 40}
            height={220}
            fromZero
            chartConfig={{ backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', decimalPlaces: 0, color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, labelColor: () => '#333' }}
            showValuesOnTopOfBars
            style={{ borderRadius: 10 }}
          />
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

      {(deck.matches || []).filter((m) => filter === 'all' || m.result === filter).map((item) => (
        <View key={item.id} style={styles.matchCard}>
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
            <Pressable onPress={() => {
              Alert.alert('Delete Match', 'Are you sure you want to delete this match?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMatch(item.id) },
              ]);
            }}>
              <Text style={styles.delete}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {(deck.matches || []).length === 0 && (
        <Text style={styles.empty}>No matches logged.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  format: { fontSize: 16, color: '#6b7280', marginBottom: 10 },
  stats: { marginBottom: 10, fontSize: 14, color: '#374151' },
  addMatch: { color: '#2563eb', fontWeight: 'bold', marginBottom: 10 },
  editLink: { fontSize: 22, color: '#2563eb', fontWeight: 'bold' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchCard: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  result: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#1f2937' },
  opp: { color: '#374151', marginBottom: 4 },
  notes: { color: '#4b5563', fontStyle: 'italic', marginBottom: 4 },
  date: { color: '#9ca3af', fontSize: 12 },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  delete: { color: '#ef4444', fontWeight: 'bold', fontSize: 18, paddingLeft: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 20 },
  chartSection: { marginVertical: 20, paddingHorizontal: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e5e7eb', borderRadius: 20 },
  activeFilterButton: { backgroundColor: '#3b82f6' },
  filterText: { fontWeight: 'bold', color: '#374151' },
  activeFilterText: { color: 'white' },
});
