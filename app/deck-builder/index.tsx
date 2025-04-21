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
  const { isDark } = useTheme();

  useEffect(() => {
    if (deckId) {
      getDecks().then((decks) => {
        const deck = decks.find((d) => d.id === deckId);
        if (deck && deck.cards) {
          const loadedCards: typeof deckCards = {};
          for (const card of deck.cards) {
            const key = card.name.toLowerCase();
            loadedCards[key] = {
              card: {
                id: card.id,
                name: card.name,
                image_uris: { small: card.image },
                set_name: card.set,
                type_line: card.type_line || '',
              },
              quantity: card.quantity,
            };
          }
          setDeckCards(loadedCards);
          setDeckName(deck.name);
        }
      });
    }
  }, [deckId]);

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

  const handleAdjustQuantity = (cardName: string, amount: number) => {
    const key = cardName.toLowerCase();
    setDeckCards((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      const newQty = existing.quantity + amount;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const groupByType = () => {
    const groups: { [type: string]: { card: any; quantity: number }[] } = {};
    for (const key in deckCards) {
      const entry = deckCards[key];
      const type = getPrimaryType(entry.card.type_line);
      if (!groups[type]) groups[type] = [];
      groups[type].push(entry);
    }
    return groups;
  };

  const getPrimaryType = (typeLine: string): string => {
    if (typeLine.includes('Creature')) return 'Creatures';
    if (typeLine.includes('Instant')) return 'Instants';
    if (typeLine.includes('Sorcery')) return 'Sorceries';
    if (typeLine.includes('Artifact')) return 'Artifacts';
    if (typeLine.includes('Enchantment')) return 'Enchantments';
    if (typeLine.includes('Planeswalker')) return 'Planeswalkers';
    if (typeLine.includes('Land')) return 'Lands';
    return 'Other';
  };

  const groupedCards = groupByType();

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSaveDeck = async () => {
    const deckArray = Object.values(deckCards).map((entry) => ({
      name: entry.card.name,
      quantity: entry.quantity,
      id: entry.card.id,
      image: entry.card.image_uris?.small,
      set: entry.card.set_name,
      type_line: entry.card.type_line,
    }));
    try {
      await AsyncStorage.setItem('deck_in_progress', JSON.stringify(deckArray));
      Alert.alert('Deck saved!', 'Your deck has been stored temporarily.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save deck.');
    }
  };

  const handleClearDeck = () => {
    Alert.alert('Clear Deck', 'Are you sure you want to remove all cards?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setDeckCards({}) },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: deckId ? 'Edit Deck' : 'Deck Builder' }} />

        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
          {deckId ? `📝 Editing ${deckName}` : '📥 Deck In Progress'}
        </Text>

        <ScrollView style={{ flex: 1 }}>
          {Object.entries(groupedCards).map(([type, cards]) => {
            const expanded = expandedSections[type] ?? true;
            return (
              <View key={type} style={{ marginBottom: 12 }}>
                <Pressable onPress={() => toggleSection(type)}>
                  <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                    {expanded ? '▼' : '▶'} {type} ({cards.length})
                  </Text>
                </Pressable>
                {expanded && cards.map(({ card, quantity }) => (
                  <View key={card.id} style={[styles.card, isDark && styles.cardDark]}>
                    <Image source={{ uri: card.image_uris?.small }} style={styles.image} />
                    <View style={styles.info}>
                      <Text style={[styles.name, isDark && styles.nameDark]}>{card.name}</Text>
                      <Text style={[styles.set, isDark && styles.setDark]}>{card.set_name}</Text>
                    </View>
                    <View style={styles.controls}>
                      <Pressable onPress={() => handleAdjustQuantity(card.name, -1)}>
                        <Text style={styles.controlBtn}>−</Text>
                      </Pressable>
                      <Text style={[styles.qtyText, isDark && styles.textLight]}>{quantity}</Text>
                      <Pressable onPress={() => handleAdjustQuantity(card.name, 1)}>
                        <Text style={styles.controlBtn}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.actionRow}>
          <Pressable style={styles.saveButton} onPress={handleSaveDeck}>
            <Text style={styles.saveText}>💾 Save</Text>
          </Pressable>
          <Pressable style={styles.clearButton} onPress={handleClearDeck}>
            <Text style={styles.clearText}>🗑️ Clear</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 10, backgroundColor: isDark ? '#1f2937' : '#fff' }}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Search for cards (e.g. Lightning Bolt)"
            placeholderTextColor={isDark ? '#ccc' : '#888'}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fbbf24" style={{ marginTop: 10 }} />
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
    </KeyboardAvoidingView>
  );
}

// ... (rest of the component code remains unchanged)

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
