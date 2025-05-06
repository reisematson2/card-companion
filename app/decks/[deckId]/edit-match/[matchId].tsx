import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { getDecks, saveDeck, Deck, Match } from '../../../../utils/storage';
import { useTheme } from '../../../../context/ThemeContext';

export default function EditMatchScreen() {
  const { deckId, matchId } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [opponentDeck, setOpponentDeck] = useState('');
  const [gameWins, setGameWins] = useState('');
  const [gameLosses, setGameLosses] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getDecks().then((decks) => {
      const foundDeck = decks.find((d) => d.id === deckId);
      if (!foundDeck) return;
      const foundMatch = foundDeck.matches?.find((m) => m.id === matchId);
      if (foundMatch) {
        setDeck(foundDeck);
        setMatch(foundMatch);
        setOpponentDeck(foundMatch.opponentDeck || '');
        setGameWins(foundMatch.gameWins?.toString() || '');
        setGameLosses(foundMatch.gameLosses?.toString() || '');
        setNotes(foundMatch.notes || '');
      }
    });
  }, [deckId, matchId, setDeck, setMatch]);

  const determineResult = (wins: number, losses: number): 'win' | 'loss' | 'draw' => {
    if (wins > losses) return 'win';
    if (losses > wins) return 'loss';
    return 'draw';
  };

  const handleSave = async () => {
    if (!deck || !match) return;

    const wins = parseInt(gameWins) || 0;
    const losses = parseInt(gameLosses) || 0;

    const updatedMatch: Match = {
      ...match,
      opponentDeck,
      result: determineResult(wins, losses),
      gameWins: wins,
      gameLosses: losses,
      notes,
    };

    const updatedMatches = (deck.matches || []).map((m) =>
      m.id === match.id ? updatedMatch : m
    );

    const updatedDeck: Deck = {
      ...deck,
      matches: updatedMatches,
    };

    await saveDeck(updatedDeck);
    router.replace(`/decks/${deck.id}`);
  };

  if (!deck || !match) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.title, isDark && styles.textDark]}>Match not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ headerShown: true }} />
      <Stack.Screen options={{ title: 'Edit Match' }} />

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Opponent Deck"
        placeholderTextColor={isDark ? '#ccc' : '#999'}
        value={opponentDeck}
        onChangeText={setOpponentDeck}
      />

      <Text style={[styles.label, isDark && styles.textDark]}>Games Won</Text>
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Games Won"
        keyboardType="numeric"
        placeholderTextColor={isDark ? '#ccc' : '#999'}
        value={gameWins}
        onChangeText={setGameWins}
      />

      <Text style={[styles.label, isDark && styles.textDark]}>Games Lost</Text>
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Games Lost"
        keyboardType="numeric"
        placeholderTextColor={isDark ? '#ccc' : '#999'}
        value={gameLosses}
        onChangeText={setGameLosses}
      />

      <TextInput
        style={[styles.input, styles.notesInput, isDark && styles.inputDark]}
        placeholder="Notes (optional)"
        placeholderTextColor={isDark ? '#ccc' : '#999'}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Match</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textDark: {
    color: '#f8fafc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    color: '#f3f4f6',
  },
  notesInput: {
    minHeight: 80,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
