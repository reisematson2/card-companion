import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
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
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.title}>Match not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Match</Text>

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
          style={[styles.input, { minHeight: 80 }]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Update Match</Text>
        </Pressable>
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
});
