import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getDecks, Deck, Match } from '../../utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const router = useRouter();

  const fetchDeckData = useCallback(() => {
    getDecks().then((allDecks) => {
      setDecks(allDecks);
      const allMatches = allDecks.flatMap((deck) =>
        (deck.matches || []).map((match): Match & { deckName: string } => ({
          ...match,
          deckName: deck.name,
        }))
      );
      
      setMatches(allMatches);
    });
  }, []);

  useEffect(fetchDeckData, []);
  useFocusEffect(fetchDeckData);

  const total = matches.length;
  const wins = matches.filter((m) => m.result === 'win').length;
  const losses = matches.filter((m) => m.result === 'loss').length;
  const draws = matches.filter((m) => m.result === 'draw').length;

  const filteredMatches = matches.filter((m) => (filter === 'all' ? true : m.result === filter));

  const bestDeck = decks.reduce<null | { name: string; winRate: number }>((top, deck) => {
    const ms = deck.matches || [];
    const wr = ms.length > 0 ? ms.filter((m) => m.result === 'win').length / ms.length : 0;
    if (!top || wr * 100 > top.winRate) {
      return { name: deck.name, winRate: wr * 100 };
    }
    return top;
  }, null);

  const opponentStats = new Map<string, { wins: number; total: number }>();
  matches.forEach((m) => {
    const name = m.opponentDeck || 'Unknown';
    if (!opponentStats.has(name)) {
      opponentStats.set(name, { wins: 0, total: 0 });
    }
    const stat = opponentStats.get(name)!;
    if (m.result === 'win') stat.wins++;
    stat.total++;
  });

  let worstOpponent = null;
  for (const [name, stat] of opponentStats.entries()) {
    if (stat.total >= 3) {
      const winRate = (stat.wins / stat.total) * 100;
      if (!worstOpponent || winRate < worstOpponent.winRate) {
        worstOpponent = { name, winRate };
      }
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>📊 Overall Stats</Text>

      <View style={styles.chartWrapper}>
        <PieChart
          data={[
            { name: 'Wins', population: wins, color: '#10b981', legendFontColor: '#10b981', legendFontSize: 14 },
            { name: 'Losses', population: losses, color: '#ef4444', legendFontColor: '#ef4444', legendFontSize: 14 },
            { name: 'Draws', population: draws, color: '#fbbf24', legendFontColor: '#fbbf24', legendFontSize: 14 },
          ]}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
        />
      </View>

      <Text style={styles.sectionTitle}>📂 Deck Performance</Text>
      {decks.map((deck) => {
        const m = deck.matches || [];
        const wr = m.length > 0 ? Math.round((m.filter((m) => m.result === 'win').length / m.length) * 100) : 0;
        return (
          <Pressable key={deck.id} style={styles.deckCard} onPress={() => router.push(`/decks/${deck.id}`)}>
            <Text style={styles.deckTitle}>{deck.name}</Text>
            <Text style={styles.deckStats}>Matches: {m.length} | Win Rate: {wr}%</Text>
          </Pressable>
        );
      })}

      <Text style={styles.sectionTitle}>🕒 Recent Matches</Text>
      <View style={styles.filterRow}>
        {['all', 'win', 'loss', 'draw'].map((type) => (
          <Pressable
            key={type}
            onPress={() => setFilter(type as any)}
            style={[styles.filterButton, filter === type && styles.activeFilterButton]}
          >
            <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredMatches
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((match, index) => (
          <View key={index} style={styles.matchItem}>
            <Text style={styles.result}>{match.result.toUpperCase()}</Text>
            <Text style={styles.opp}>vs {match.opponentDeck} ({match.deckName})</Text>
            <Text style={styles.date}>{new Date(match.date).toLocaleDateString()}</Text>
          </View>
        ))}

      <Text style={styles.sectionTitle}>⭐ Highlights</Text>
      <View style={styles.highlightBox}>
        {bestDeck && <Text style={styles.highlight}>🔥 Best performing deck: {bestDeck.name} ({bestDeck.winRate.toFixed(1)}% WR)</Text>}
        {worstOpponent && worstOpponent.name && (
          <Text style={styles.highlight}>🧊 Toughest opponent: {worstOpponent.name} ({worstOpponent.winRate.toFixed(1)}% WR)</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginTop: 20, marginBottom: 10 },
  chartWrapper: { alignItems: 'center', marginBottom: 20 },
  deckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  deckTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  deckStats: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  matchItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  result: { fontWeight: 'bold', color: '#3b82f6' },
  opp: { color: '#374151' },
  date: { color: '#9ca3af', fontSize: 12 },
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
  highlightBox: {
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  highlight: {
    color: '#1e3a8a',
    fontWeight: '600',
    marginBottom: 4,
  },
});
