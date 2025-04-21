import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { getDecks, saveDeck } from '../../../utils/storage';
import { useTheme } from '../../../context/ThemeContext';

export default function VersionHistoryScreen() {
  const { deckId } = useLocalSearchParams();
  const [versions, setVersions] = useState([]);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchVersions = async () => {
      const decks = await getDecks();
      const deck = decks.find((d) => d.id === deckId);
      if (deck?.versions) setVersions(deck.versions);
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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.versionCard, isDark && styles.versionCardDark]}>
            <Text style={[styles.timestamp, isDark && styles.timestampDark]}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            <Pressable style={styles.button} onPress={() => handleRevert(item.id)}>
              <Text style={styles.buttonText}>↩ Revert</Text>
            </Pressable>
            {/* Future: Add Compare button */}
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
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  versionCardDark: { backgroundColor: '#1f2937' },
  timestamp: { fontSize: 14, color: '#1e293b', marginBottom: 8 },
  timestampDark: { color: '#f8fafc' },
  button: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#6b7280' },
  emptyDark: { color: '#cbd5e1' },
});
