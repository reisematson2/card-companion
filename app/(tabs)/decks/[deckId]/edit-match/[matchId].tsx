import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { getDecks, saveDeck, Deck, Match } from '../../../../../utils/storage';

export default function EditMatchScreen() {
  const { deckId, matchId } = useLocalSearchParams();
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
      if (!foundMatch) return;

      setDeck(foundDeck);
      setMatch(foundMatch);
      setOpponentDeck(foundMatch.opponentDeck);
      setGameWins(foundMatch.gameWins.toString());
      setGameLosses(foundMatch.gameLosses.toString());
      setNotes(foundMatch.notes || '');
    });
  }, [deckId, matchId]);

  const calculateResult = (wins: number, losses: number): Match['result'] => {
    if (wins === losses) return 'draw';
    return wins > losses ? 'win' : 'loss';
  };

  const handleSave = async () => {
    if (!deck || !match) return;

    const updatedMatch: Match = {
      ...match,
      opponentDeck,
      gameWins: Number(gameWins),
      gameLosses: Number(gameLosses),
      result: calculateResult(Number(gameWins), Number(gameLosses)),
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

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Match not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Match</Text>

      <TextInput
        placeholder="Opponent Deck Name"
        style={styles.input}
        value={opponentDeck}
        onChangeText={setOpponentDeck}
      />

      <View style={styles.row}>
        <TextInput
          style={styles.smallInput}
          placeholder="Wins"
          keyboardType="numeric"
          value={gameWins}
          onChangeText={setGameWins}
        />
        <TextInput
          style={styles.smallInput}
          placeholder="Losses"
          keyboardType="numeric"
          value={gameLosses}
          onChangeText={setGameLosses}
        />
      </View>

      <TextInput
        placeholder="Notes (optional)"
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Update Match</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold' },
});
