import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { getDecks, saveDeck, Deck, Match } from '../../../../utils/storage';

export default function EditMatchScreen() {
  const { deckId, matchId } = useLocalSearchParams();
  const router = useRouter();

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
  }, [deckId, matchId]);

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
      <View style={styles.container}>
        <Text style={styles.title}>Match not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true }} />
      <Stack.Screen options={{ title: 'Edit Match' }} />

      <TextInput
        style={styles.input}
        placeholder="Opponent Deck"
        value={opponentDeck}
        onChangeText={setOpponentDeck}
      />

      <Text style={styles.label}>Games Won</Text>
      <TextInput
        style={styles.input}
        placeholder="Games Won"
        keyboardType="numeric"
        value={gameWins}
        onChangeText={setGameWins}
      />

      <Text style={styles.label}>Games Lost</Text>
      <TextInput
        style={styles.input}
        placeholder="Games Lost"
        keyboardType="numeric"
        value={gameLosses}
        onChangeText={setGameLosses}
      />

      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
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
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
