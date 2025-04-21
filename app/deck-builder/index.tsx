import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { searchScryfallCards } from '../../utils/scryfall';
import { useTheme } from '../../context/ThemeContext';

export default function DeckBuilderScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deckCards, setDeckCards] = useState<{ [name: string]: { card: any; quantity: number } }>({});
  const { isDark } = useTheme();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const cards = await searchScryfallCards(query.trim());
    setResults(cards);
    setLoading(false);
  };

  const handleAddCard = (card: any) => {
    const key = card.name.toLowerCase();
    setDeckCards((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          card,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ title: 'Deck Builder' }} />

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Search for cards (e.g. Lightning Bolt)"
        placeholderTextColor={isDark ? '#ccc' : '#888'}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      {Object.keys(deckCards).length > 0 && (
        <View style={styles.deckSummary}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>📥 Deck In Progress</Text>
          <FlatList
            data={Object.values(deckCards)}
            keyExtractor={(item) => item.card.id}
            renderItem={({ item }) => (
              <View style={[styles.card, isDark && styles.cardDark]}>
                <Image source={{ uri: item.card.image_uris?.small }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={[styles.name, isDark && styles.nameDark]}>{item.card.name}</Text>
                  <Text style={[styles.set, isDark && styles.setDark]}>{item.card.set_name} — x{item.quantity}</Text>
                </View>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fbbf24" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleAddCard(item)} style={[styles.card, isDark && styles.cardDark]}>
              <Image source={{ uri: item.image_uris?.small }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, isDark && styles.nameDark]}>{item.name}</Text>
                <Text style={[styles.set, isDark && styles.setDark]}>{item.set_name}</Text>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1f2937',
    borderLeftColor: '#fbbf24',
    color: '#f3f4f6',
  },
  deckSummary: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  cardDark: {
    backgroundColor: '#1e293b',
  },
  image: {
    width: 60,
    height: 85,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  nameDark: {
    color: '#f8fafc',
  },
  set: {
    fontSize: 14,
    color: '#6b7280',
  },
  setDark: {
    color: '#cbd5e1',
  },
  textLight: {
    color: '#f8fafc',
  },
});
