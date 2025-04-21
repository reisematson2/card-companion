import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { getDecks, saveDeck } from '../../../utils/storage';
import { useTheme } from '../../../context/ThemeContext';
import { diffDeckVersions } from '../../../utils/compareVersions';

export default function VersionHistoryScreen() {
  const { deckId } = useLocalSearchParams();
  const [versions, setVersions] = useState([]);
  const [deck, setDeck] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchVersions = async () => {
      const decks = await getDecks();
      const found = decks.find((d) => d.id === deckId);
      if (found) {
        setDeck(found);
        setVersions((found.versions || []).slice().reverse());
      }
    };
    fetchVersions();
  }, [deckId]);

  const handleRevert = async (versionId) => {
    const decks = await getDecks();
    const index = decks.findIndex((d) => d.id === deckId);
    if (index === -1) return;
    const version = decks[index].versions.find((v) => v.id === versionId);
    if (!version) return;
    decks[index].cards = version.cards;
    await saveDeck(decks[index]);
    Alert.alert('Reverted', 'Deck has been reverted to this version.');
    router.back();
  };

  const renderDiff = (version, index) => {
    const previous = index < versions.length - 1 ? versions[index + 1].cards : {};
    
    const { added, removed } = diffDeckVersions(previous, version.cards);

    return (
      <View style={styles.diffContainer}>
        {added.length > 0 && (
          <View style={styles.diffGroup}>
            <Text style={styles.diffHeader}>🟩 Added</Text>
            {added.map(({ card, quantity }) => (
              <Text key={card.id} style={styles.addedText}>+{quantity}x {card.name}</Text>
            ))}
          </View>
        )}
        {removed.length > 0 && (
          <View style={styles.diffGroup}>
            <Text style={styles.diffHeader}>🟥 Removed</Text>
            {removed.map(({ card, quantity }) => (
              <Text key={card.id} style={styles.removedText}>-{quantity}x {card.name}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.versionCard, isDark && styles.versionCardDark]}>
            <Text style={[styles.timestamp, isDark && styles.timestampDark]}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            {renderDiff(item, index)}
            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, { backgroundColor: '#10b981' }]} onPress={() => handleRevert(item.id)}>
                <Text style={styles.buttonText}>↩ Revert</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.empty, isDark && styles.emptyDark]}>No versions saved yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  containerDark: { backgroundColor: '#0f172a' },
  versionCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  versionCardDark: { backgroundColor: '#1f2937' },
  timestamp: { fontSize: 14, color: '#1e293b', marginBottom: 8 },
  timestampDark: { color: '#f8fafc' },
  diffContainer: { marginBottom: 10 },
  diffGroup: { marginBottom: 6 },
  diffHeader: { fontWeight: 'bold', marginBottom: 4, color: '#6b7280' },
  addedText: { color: '#059669', fontSize: 14, marginLeft: 6 },
  removedText: { color: '#dc2626', fontSize: 14, marginLeft: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  emptyDark: { color: '#cbd5e1' },
});
