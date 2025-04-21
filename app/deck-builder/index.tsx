import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import uuid from 'react-native-uuid';
import { searchScryfallCards } from '../../utils/scryfall';
import { getDecks, saveDeck } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export default function DeckBuilderScreen() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { displayStyle } = useSettings();

  // Current deck in-progress state: { [cardName]: { card, quantity } }
  const [deckCards, setDeckCards] = useState<Record<string, { card: any; quantity: number }>>({});
  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Animated value for overlay entrance
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Load existing deck if editing
  useEffect(() => {
    if (deckId) {
      getDecks().then((decks) => {
        const found = decks.find((d) => d.id === deckId);
        if (found?.cards) setDeckCards(found.cards);
      });
    }
  }, [deckId]);

  // Animate overlay on expand/collapse
  useEffect(() => {
    Animated.timing(overlayAnim, {
      toValue: searchExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [searchExpanded]);

  // Perform search whenever query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(() => {
      searchScryfallCards(query).then(setResults);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  // Handlers
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
    // Keep keyboard up but dismiss overlay if desired
  };

  const handleRemoveCard = (key: string) => {
    setDeckCards((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSaveDeck = async () => {
    const decks = await getDecks();
    if (deckId) {
      // overwrite existing
      const idx = decks.findIndex((d) => d.id === deckId);
      if (idx !== -1) {
        decks[idx] = { ...decks[idx], cards: deckCards };
        await saveDeck(decks[idx]);
      }
    } else {
      // new deck
      const newDeck = {
        id: uuid.v4().toString(),
        name: 'New Deck',
        format: '',
        createdAt: new Date().toISOString(),
        matches: [],
        cards: deckCards,
      };
      await saveDeck(newDeck);
      router.replace(`/decks/${newDeck.id}`);
      return;
    }
    alert('Deck saved!');
  };

  // Renderers for two styles
  const renderDefaultCard = ({ item }: { item: { card: any; quantity: number } }) => (
    <View style={[styles.cardTile, isDark && styles.cardTileDark]}>
      <Text style={[styles.cardName, isDark && styles.textDark]}>
        {item.quantity}× {item.card.name}
      </Text>
      <Pressable onPress={() => handleRemoveCard(item.card.name.toLowerCase())}>
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );

  const renderListCard = ({ item }: { item: { card: any; quantity: number } }) => (
    <View style={[styles.cardRow, isDark && styles.cardRowDark]}>
      <Text style={[styles.cardName, isDark && styles.textDark]}>
        {item.quantity}× {item.card.name}
      </Text>
      <Pressable onPress={() => handleRemoveCard(item.card.name.toLowerCase())}>
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );

  // Overlay styles
  const overlayStyle = {
    opacity: overlayAnim,
    transform: [
      {
        scale: overlayAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: deckId ? 'Edit Deck' : 'New Deck' }} />

      {/* Search Bar (always at top) */}
      <View style={[styles.searchBarContainer, isDark && styles.searchBarDark]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.inputDark]}
          placeholder="Search cards..."
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setSearchExpanded(!!t.trim());
          }}
        />
        {searchExpanded && (
          <Pressable style={styles.collapseArrow} onPress={() => { setSearchExpanded(false); setQuery(''); Keyboard.dismiss(); }}>
            <Text style={styles.arrowText}>⌃</Text>
          </Pressable>
        )}
      </View>

      {/* Suggestions Overlay */}
      {searchExpanded && (
        <Animated.View style={[styles.overlay, overlayStyle, isDark && styles.overlayDark]}>
          <FlatList
            data={results}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <Pressable style={styles.suggestionItem} onPress={() => handleAddCard(item)}>
                <Text style={[styles.suggestionText, isDark && styles.textDark]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
            style={styles.suggestionsList}
          />
        </Animated.View>
      )}

      {/* Deck Cards */}
      <FlatList
        data={Object.values(deckCards)}
        keyExtractor={(entry) => entry.card.id}
        renderItem={displayStyle === 'list' ? renderListCard : renderDefaultCard}
        contentContainerStyle={styles.deckList}
        ListEmptyComponent={<Text style={[styles.emptyText, isDark && styles.textDark]}>No cards added</Text>}
      />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Pressable style={[styles.saveButton, isDark && styles.saveButtonDark]} onPress={handleSaveDeck}>
          <Text style={styles.saveText}>💾 Save Deck</Text>
        </Pressable>
        <Pressable style={[styles.clearButton, isDark && styles.clearButtonDark]} onPress={() => setDeckCards({})}>
          <Text style={styles.clearText}>🧹 Clear</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#0f172a' },

  searchBarContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: '#e5e7eb',
  },
  searchBarDark: { backgroundColor: '#1f2937' },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#f9fafb',
  },
  collapseArrow: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  arrowText: { fontSize: 18, color: '#6b7280' },

  overlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    maxHeight: 250,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  overlayDark: { backgroundColor: '#1f2937' },
  suggestionsList: { padding: 8 },
  suggestionItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  suggestionText: { fontSize: 16 },

  deckList: { padding: 16, paddingTop: 80 /* leave space for search bar */ },
  cardTile: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTileDark: { backgroundColor: '#374151' },
  cardRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardRowDark: { borderBottomColor: '#4b5563' },
  cardName: { fontSize: 16 },
  removeText: { color: '#ef4444', fontSize: 16 },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  saveButtonDark: { backgroundColor: '#059669' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  clearButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  clearButtonDark: { backgroundColor: '#d97706' },
  clearText: { color: '#1e293b', fontWeight: 'bold' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
