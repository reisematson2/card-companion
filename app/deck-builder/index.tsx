import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ title: deckId ? 'Edit Deck' : 'Deck Builder' }} />

      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
        {deckId ? `📝 Editing ${deckName}` : '📥 Deck In Progress'}
      </Text>

      <ScrollView style={{ flex: 1 }}>
        {Object.entries(groupedCards).map(([type, cards]) => (
          <View key={type} style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>{type} ({cards.length})</Text>
            {cards.map(({ card, quantity }) => (
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
        ))}
      </ScrollView>

      <View style={styles.actionRow}>
        <Pressable style={styles.saveButton} onPress={handleSaveDeck}>
          <Text style={styles.saveText}>💾 Save</Text>
        </Pressable>
        <Pressable style={styles.clearButton} onPress={handleClearDeck}>
          <Text style={styles.clearText}>🗑️ Clear</Text>
        </Pressable>
      </View>

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Search for cards (e.g. Lightning Bolt)"
        placeholderTextColor={isDark ? '#ccc' : '#888'}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  controlBtn: {
    fontSize: 22,
    paddingHorizontal: 8,
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  clearText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textLight: {
    color: '#f8fafc',
  },
});
