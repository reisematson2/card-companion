import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const fakeDecks = [
  { id: '1', name: 'Izzet Control', matches: 20, winRate: 70 },
  { id: '2', name: 'Mono Red Aggro', matches: 15, winRate: 53 },
  { id: '3', name: 'Golgari Midrange', matches: 10, winRate: 40 },
];

const fakeMatches = [
  { id: 'm1', result: 'win', opponent: 'Dimir Control', date: '2025-04-18' },
  { id: 'm2', result: 'loss', opponent: 'Azorius Tempo', date: '2025-04-17' },
  { id: 'm3', result: 'win', opponent: 'Mono Green', date: '2025-04-16' },
];

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>📊 Overall Stats</Text>

      <View style={styles.chartWrapper}>
        <PieChart
          data={[
            { name: 'Wins', population: 25, color: '#10b981', legendFontColor: '#10b981', legendFontSize: 14 },
            { name: 'Losses', population: 15, color: '#ef4444', legendFontColor: '#ef4444', legendFontSize: 14 },
            { name: 'Draws', population: 2, color: '#fbbf24', legendFontColor: '#fbbf24', legendFontSize: 14 },
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
      {fakeDecks.map((deck) => (
        <View key={deck.id} style={styles.deckCard}>
          <Text style={styles.deckTitle}>{deck.name}</Text>
          <Text style={styles.deckStats}>Matches: {deck.matches} | Win Rate: {deck.winRate}%</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>🕒 Recent Matches</Text>
      {fakeMatches.map((match) => (
        <View key={match.id} style={styles.matchItem}>
          <Text style={styles.result}>{match.result.toUpperCase()}</Text>
          <Text style={styles.opp}>vs {match.opponent}</Text>
          <Text style={styles.date}>{match.date}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>⭐ Highlights</Text>
      <View style={styles.highlightBox}>
        <Text style={styles.highlight}>🔥 Best performing deck: Izzet Control (70% WR)</Text>
        <Text style={styles.highlight}>🧊 Toughest opponent: Golgari Midrange (30% WR)</Text>
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
