// Full updated code for app/decks/[deckId]/new-match.tsx with normalized deck names, animation, suggestions limited to 5, and correct original casing display

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Keyboard,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { getDecks, saveDeck, Match, Deck } from '../../../utils/storage';
import uuid from 'react-native-uuid';

export default function NewMatchScreen() {
  const { deckId } = useLocalSearchParams();
  const [opponentDeck, setOpponentDeck] = useState('');
  const [gameWins, setGameWins] = useState('');
  const [gameLosses, setGameLosses] = useState('');
  const [notes, setNotes] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const animateDropdown = (visible: boolean) => {
    Animated.timing(dropdownAnim, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const fetchDeck = async () => {
      const decks = await getDecks();
      const foundDeck = decks.find((d) => d.id === deckId) || null;
      setDeck(foundDeck);
    };
    fetchDeck();
  }, [deckId, setDeck]);

  useEffect(() => {
    if (!deck) return;

    const map = new Map<string, string>();
    for (const match of deck.matches ?? []) {
      const original = match.opponentDeck?.trim();
      const normalized = original?.toLowerCase();
      if (original && normalized && !map.has(normalized)) {
        map.set(normalized, original);
      }
    }

    setSuggestions(Array.from(map.values()));
  }, [deck, setSuggestions]);

  useEffect(() => {
    if (!opponentDeck.trim()) {
      setFilteredSuggestions([]);
      animateDropdown(false);
      return;
    }

    const lower = opponentDeck.toLowerCase();
    const filtered = suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 5);
    setFilteredSuggestions(filtered);
    animateDropdown(filtered.length > 0);
  }, [opponentDeck, suggestions]);

  const handleSaveMatch = async () => {
    const decks = await getDecks();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const wins = parseInt(gameWins);
    const losses = parseInt(gameLosses);
    const result: Match['result'] =
      wins === losses ? 'draw' : wins > losses ? 'win' : 'loss';

    const normalizedOpponent = opponentDeck.trim().toLowerCase();

    const newMatch: any = {
      id: uuid.v4().toString(),
      opponentDeck: opponentDeck.trim(),
      opponentDeckNormalized: normalizedOpponent,
      result,
      gameWins: wins,
      gameLosses: losses,
      notes,
      date: new Date().toISOString(),
    };

    const updatedDeck: Deck = {
      ...deck,
      matches: [newMatch, ...(deck.matches || [])],
    };

    await saveDeck(updatedDeck);
    router.replace(`/decks/${deck.id}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ title: 'New Match' }} />

      <View style={styles.container}>
        <Text style={styles.title}>Add Match</Text>

        <View style={styles.formBlock}>
          <Text style={styles.label}>Opponent Deck (optional)</Text>
          <TextInput
            style={styles.input}
            value={opponentDeck}
            onChangeText={(text) => {
              setOpponentDeck(text);
              setShowSuggestions(true);
            }}
            placeholder="e.g. Rakdos Midrange"
            placeholderTextColor="#aaa"
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <Animated.View
              style={[
                styles.suggestionContainer,
                {
                  opacity: dropdownAnim,
                  transform: [
                    {
                      scaleY: dropdownAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <FlatList
                data={filteredSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setOpponentDeck(item);
                      setShowSuggestions(false);
                      animateDropdown(false);
                      Keyboard.dismiss();
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </Pressable>
                )}
              />
            </Animated.View>
          )}

          <View style={styles.row}>
            <TextInput
              placeholder="Wins"
              keyboardType="numeric"
              style={styles.smallInput}
              value={gameWins}
              onChangeText={setGameWins}
            />
            <TextInput
              placeholder="Losses"
              keyboardType="numeric"
              style={styles.smallInput}
              value={gameLosses}
              onChangeText={setGameLosses}
            />
          </View>

          <TextInput
            placeholder="Notes (optional)"
            style={[styles.input, { minHeight: 80 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Pressable style={styles.button} onPress={handleSaveMatch}>
            <Text style={styles.buttonText}>Save Match</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  smallInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    fontSize: 16,
    color: '#1f2937',
    width: '48%',
  },
  button: {
    backgroundColor: '#fbbf24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#1e3a8a',
    fontSize: 16,
  },
  formBlock: {
    marginTop: 20,
  },
  label: {
    color: '#f5c443',
    marginBottom: 4,
    fontSize: 16,
  },
  suggestionContainer: {
    backgroundColor: '#1e2d45',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0e1a2b',
  },
  suggestionText: {
    color: '#d4e0f0',
  },
});
