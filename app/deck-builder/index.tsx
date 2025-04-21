// app/deck-builder/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { getDecks, saveDeck, Deck } from '../../utils/storage';
import uuid from 'react-native-uuid';
import { searchScryfallCards } from '../../utils/scryfall';

type DeckCardEntry = {
  card: any;
  quantity: number;
};

// GRID CALC
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const H_PADDING = 8;
const TILE_MARGIN = 6;
const TILE_WIDTH =
  (SCREEN_WIDTH - H_PADDING * 2 - TILE_MARGIN * 2 * NUM_COLUMNS) /
  NUM_COLUMNS;

export default function DeckBuilderScreen() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const { isDark } = useTheme();
  const { displayStyle } = useSettings();

  const [deck, setDeck] = useState<Deck | null>(null);
  // split state for mainboard and sideboard
  const [mainCards, setMainCards] = useState<Record<string, DeckCardEntry>>({});
  const [sideCards, setSideCards] = useState<Record<string, DeckCardEntry>>({});

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // load existing deck
  useEffect(() => {
    if (!deckId) return;
    getDecks().then((decks) => {
      const found = decks.find((d) => d.id === deckId);
      if (found) {
        setDeck(found);
        // preload main & side
        setMainCards(found.cards?.main || {});
        setSideCards(found.cards?.side || {});
      }
    });
  }, [deckId]);

  // animate overlay
  useEffect(() => {
    Animated.timing(overlayAnim, {
      toValue: searchExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [searchExpanded]);

  // debounced search
  useEffect(() => {
    if (!searchExpanded) return;
    const kt = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
      } else {
        const cards = await searchScryfallCards(query);
        setResults(cards.slice(0, 10));
      }
    }, 300);
    return () => clearTimeout(kt);
  }, [query, searchExpanded]);

  // add to mainboard by default
  const handleAddCard = (card: any) => {
    Keyboard.dismiss();
    setMainCards(prev => {
      const key = card.name.toLowerCase();
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          card,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
    setQuery(''); setResults([]); setSearchExpanded(false);
  };

  // remove or decrement
  const handleRemoveCard = (key: string, board: 'main' | 'side') => {
    const setter = board === 'main' ? setMainCards : setSideCards;
    const src = board === 'main' ? mainCards : sideCards;
    const entry = src[key];
    if (!entry) return;
    if (entry.quantity > 1) {
      setter(prev => ({ ...prev, [key]: { card: entry.card, quantity: entry.quantity - 1 } }));
    } else {
      setter(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // move between boards
  const handleMoveCard = (key: string, from: 'main' | 'side') => {
    const src = from === 'main' ? mainCards : sideCards;
    const dstSetter = from === 'main' ? setSideCards : setMainCards;
    const srcSetter = from === 'main' ? setMainCards : setSideCards;
    const entry = src[key];
    if (!entry) return;
    // remove from source entirely
    srcSetter(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    // add to destination
    dstSetter(prev => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          card: entry.card,
          quantity: existing ? existing.quantity + entry.quantity : entry.quantity,
        },
      };
    });
  };

  // save deck and version
  const handleSaveDeck = async () => {
    if (!deck) return;
    const updated: Deck = {
      ...deck,
      cards: { main: mainCards, side: sideCards },
      versions: [
        ...(deck.versions || []),
        {
          id: uuid.v4().toString(),
          timestamp: new Date().toISOString(),
          cards: { main: mainCards, side: sideCards },
        },
      ],
    };
    await saveDeck(updated);
    Alert.alert('Saved', 'Deck saved with new version');
    router.back();
  };

  // render card entries based on displayStyle
  const renderEntry = (entry: DeckCardEntry, board: 'main' | 'side') =>
    displayStyle === 'list' ? (
      <ListCardItem
        key={entry.card.id + board}
        entry={entry}
        isDark={isDark}
        board={board}
        onRemove={() => handleRemoveCard(entry.card.name.toLowerCase(), board)}
        onMove={() => handleMoveCard(entry.card.name.toLowerCase(), board)}
      />
    ) : (
      <DefaultCardItem
        key={entry.card.id + board}
        entry={entry}
        isDark={isDark}
        board={board}
        onRemove={() => handleRemoveCard(entry.card.name.toLowerCase(), board)}
        onMove={() => handleMoveCard(entry.card.name.toLowerCase(), board)}
      />
    );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ title: deck?.name || 'Deck Builder' }} />

      {/* Search */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search cards..."
            placeholderTextColor={isDark ? '#888' : '#aaa'}
            value={query}
            onChangeText={t => { setQuery(t); setSearchExpanded(true); }}
          />
        </View>
        {searchExpanded && (
          <Animated.View
            pointerEvents="auto"
            style={[
              styles.overlay,
              {
                opacity: overlayAnim,
                transform: [{ scale: overlayAnim.interpolate({ inputRange:[0,1], outputRange:[0.95,1] }) }],
              },
            ]}
          >
            <Pressable style={styles.collapseArrow} onPress={() => setSearchExpanded(false)}>
              <Text style={styles.collapseArrowText}>⌄</Text>
            </Pressable>
            <FlatList
              data={results}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.resultItem, isDark && styles.resultItemDark]}
                  onPress={() => handleAddCard(item)}
                >
                  <Image
                    source={{ uri: item.image_uris?.small || item.card_faces?.[0]?.image_uris?.small || '' }}
                    style={styles.resultThumb}
                  />
                  <Text style={[styles.resultText, isDark && styles.resultTextDark]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
              style={styles.resultsList}
            />
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Deck Contents */}
      <Text style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>Mainboard</Text>
      <FlatList
        data={Object.values(mainCards)}
        keyExtractor={e => e.card.id + 'main'}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => renderEntry(item, 'main')}
        contentContainerStyle={styles.deckGrid}
      />

      <Text style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>Sideboard</Text>
      <FlatList
        data={Object.values(sideCards)}
        keyExtractor={e => e.card.id + 'side'}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => renderEntry(item, 'side')}
        contentContainerStyle={styles.deckGrid}
      />

      {/* Actions */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.clearButton} onPress={() => { setMainCards({}); setSideCards({}); }}>
          <Text style={styles.buttonText}>🧹 Clear All</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSaveDeck}>
          <Text style={styles.buttonText}>💾 Save</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Default tile with remove/move buttons
function DefaultCardItem({
  entry,
  isDark,
  board,
  onRemove,
  onMove,
}: {
  entry: DeckCardEntry;
  isDark: boolean;
  board: 'main' | 'side';
  onRemove: () => void;
  onMove: () => void;
}) {
  const thumb =
    entry.card.image_uris?.small ||
    entry.card.card_faces?.[0]?.image_uris?.small ||
    '';

  return (
    <View style={[styles.gridTile, isDark && styles.gridTileDark]}>
      <Image source={{ uri: thumb }} style={styles.gridImage} />
      <View style={[styles.gridOverlay, isDark && styles.gridOverlayDark]}>
        <Text style={[styles.gridName, isDark && styles.gridNameDark]} numberOfLines={1}>
          {entry.card.name}
        </Text>
        <Text style={[styles.gridQtyText, { marginRight: 8 }]}>{entry.quantity}</Text>
      </View>
      {/* Move & Remove Controls */}
      <View style={styles.tileControls}>
        <Pressable onPress={onMove} style={styles.controlBtn}>
          <Text style={styles.controlText}>{board === 'main' ? '⇄' : '⇄'}</Text>
        </Pressable>
        <Pressable onPress={onRemove} style={styles.controlBtn}>
          <Text style={styles.controlText}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

// List view with move/remove
function ListCardItem({
  entry,
  isDark,
  board,
  onRemove,
  onMove,
}: {
  entry: DeckCardEntry;
  isDark: boolean;
  board: 'main' | 'side';
  onRemove: () => void;
  onMove: () => void;
}) {
  const thumb =
    entry.card.image_uris?.small ||
    entry.card.card_faces?.[0]?.image_uris?.small ||
    '';

  return (
    <View style={[styles.cardRow, isDark && styles.cardRowDark]}>
      <Image source={{ uri: thumb }} style={styles.cardRowImage} />
      <Text style={[styles.cardRowName, isDark && styles.cardRowNameDark]} numberOfLines={1}>
        {entry.card.name}
      </Text>
      <Text style={[styles.cardRowQty, isDark && styles.cardRowQtyDark]}>x{entry.quantity}</Text>
      <Pressable onPress={onMove} style={styles.listControlBtn}>
        <Text style={styles.controlText}>⇄</Text>
      </Pressable>
      <Pressable onPress={onRemove} style={styles.listControlBtn}>
        <Text style={styles.controlText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerDark: { backgroundColor: '#0f172a' },

  // section labels
  sectionHeader: { marginTop: 72, marginLeft: 8, fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  sectionHeaderDark: { color: '#f3f4f6' },

  // search
  searchBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 8, zIndex: 3,
  },
  searchBarDark: { backgroundColor: '#1f2937' },
  searchInput: { backgroundColor: '#e5e7eb', borderRadius: 6, padding: 8 },
  searchInputDark: { backgroundColor: '#374151', color: '#f3f4f6' },

  // overlay
  overlay: {
    position: 'absolute', top: 48, left: 8, right: 8, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, zIndex: 2,
  },
  collapseArrow: { alignSelf: 'center', marginBottom: 8 },
  collapseArrowText: { fontSize: 18, color: '#fff' },
  resultsList: { backgroundColor: '#fff', borderRadius: 6, maxHeight: 300 },
  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 8, borderBottomWidth: 1, borderColor: '#e5e7eb',
  },
  resultItemDark: { backgroundColor: '#374151', borderColor: '#4b5563' },
  resultThumb: { width: 32, height: 45, marginRight: 8 },
  resultText: { fontSize: 14, color: '#1f2937' },
  resultTextDark: { color: '#f3f4f6' },

  // grid
  deckGrid: { paddingTop: 96, paddingHorizontal: H_PADDING, paddingBottom: 80 },
  gridTile: {
    width: TILE_WIDTH, aspectRatio: 0.7, margin: TILE_MARGIN,
    borderRadius: 8, overflow: 'hidden', backgroundColor: '#f9fafb', elevation: 2,
  },
  gridTileDark: { backgroundColor: '#1f2937' },
  gridImage: { width: '100%', height: '100%', position: 'absolute' },
  gridOverlay: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  gridOverlayDark: { backgroundColor: 'rgba(31,41,55,0.7)' },
  gridName: { flex: 1, color: '#fff', fontSize: 12, marginRight: 4 },
  gridNameDark: { color: '#f3f4f6' },
  gridQtyBadge: {
    backgroundColor: '#3b82f6', borderRadius: 6, paddingHorizontal: 4,
  },
  gridQtyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // tile controls
  tileControls: {
    position: 'absolute', top: 4, right: 4, flexDirection: 'row',
  },
  controlBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)', marginLeft: 4,
    borderRadius: 4, padding: 2,
  },
  controlText: { color: '#fff', fontSize: 12 },

  // list
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 8,
    marginVertical: 4, marginHorizontal: 8,
    borderRadius: 6, elevation: 1,
  },
  cardRowDark: { backgroundColor: '#1f2937' },
  cardRowImage: { width: 32, height: 45, borderRadius: 4, marginRight: 8 },
  cardRowName: { flex: 1, fontSize: 14, color: '#1f2937' },
  cardRowNameDark: { color: '#f3f4f6' },
  cardRowQty: { fontSize: 14, color: '#1f2937', marginLeft: 8 },
  cardRowQtyDark: { color: '#f3f4f6' },
  listControlBtn: {
    marginLeft: 8, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4, padding: 4,
  },

  // actions
  buttonRow: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1, marginRight: 8, backgroundColor: '#ef4444',
    padding: 12, borderRadius: 6, alignItems: 'center',
  },
  saveButton: {
    flex: 1, marginLeft: 8, backgroundColor: '#10b981',
    padding: 12, borderRadius: 6, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
