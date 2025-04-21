// ... (rest of the component imports)
import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { searchScryfallCards } from '../../utils/scryfall';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDecks } from '../../utils/storage';

export default function DeckBuilderScreen() {
  const { deckId } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deckCards, setDeckCards] = useState<{ [name: string]: { card: any; quantity: number } }>({});
  const [deckName, setDeckName] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [type: string]: boolean }>({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { isDark } = useTheme();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchExpanded(true);
    setLoading(true);
    const cards = await searchScryfallCards(query.trim());
    setResults(cards);
    setLoading(false);
  };

  const handleCollapseSearch = () => {
    setSearchExpanded(false);
    setQuery('');
    setResults([]);
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Deck header and grouped cards omitted for brevity */}

        {searchExpanded && (
          <Pressable onPress={handleCollapseSearch} style={styles.collapseArrow}>
            <View style={[styles.collapseIcon, isDark && styles.collapseIconDark]}>
              <Text style={[styles.collapseIconText, isDark && styles.collapseIconTextDark]}>⌄</Text>
            </View>
          </Pressable>
        )}

        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            searchExpanded ? styles.inputExpanded : styles.inputCollapsed,
          ]}
          placeholder="Search for cards (e.g. Lightning Bolt)"
          placeholderTextColor={isDark ? '#ccc' : '#888'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {searchExpanded && (
          loading ? (
            <ActivityIndicator size="large" color="#fbbf24" style={{ marginTop: 10 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleAddCard(item)}
                  style={[styles.card, isDark && styles.cardDark]}
                >
                  <Image source={{ uri: item.image_uris?.small }} style={styles.image} />
                  <View style={styles.info}>
                    <Text style={[styles.name, isDark && styles.nameDark]}>{item.name}</Text>
                    <Text style={[styles.set, isDark && styles.setDark]}>{item.set_name}</Text>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={styles.searchResults}
            />
          )
        )}
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    paddingBottom: 80, // extra space for pinned search
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#1e3a8a',
  },
  textLight: {
    color: '#f8fafc',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  image: {
    width: 48,
    height: 67,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  nameDark: {
    color: '#f8fafc',
  },
  set: {
    fontSize: 13,
    color: '#64748b',
  },
  setDark: {
    color: '#94a3b8',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    fontSize: 20,
    color: '#3b82f6',
    paddingHorizontal: 10,
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 10,
  },
  inputDark: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderColor: '#334155',
  },
  inputCollapsed: {
    bottom: 20,
  },
  inputExpanded: {
    bottom: '50%',
  },
  collapseArrow: {
    position: 'absolute',
    bottom: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 101,
  },
  collapseIcon: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    padding: 6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  collapseIconDark: {
    backgroundColor: '#334155',
  },
  collapseIconText: {
    fontSize: 18,
    color: '#1e293b',
  },
  collapseIconTextDark: {
    color: '#f8fafc',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 60,
  },
  saveButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchResults: {
    maxHeight: '50%',
    marginTop: 4,
    marginHorizontal: 16,
    zIndex: 99,
  },
});
