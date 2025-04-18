import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getDecks, saveDeck, Match, Deck } from '../../../utils/storage';
import uuid from 'react-native-uuid';

export default function NewMatchScreen() {
  const { deckId } = useLocalSearchParams();
  const [opponentDeck, setOpponentDeck] = useState('');
  const [gameWins, setGameWins] = useState('');
  const [gameLosses, setGameLosses] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveMatch = async () => {
    const decks = await getDecks();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const wins = parseInt(gameWins);
    const losses = parseInt(gameLosses);
    const result: Match['result'] =
      wins === losses ? 'draw' : wins > losses ? 'win' : 'loss';

    const newMatch: Match = {
      id: uuid.v4().toString(),
      opponentDeck,
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
      <View style={styles.container}>
        <Text style={styles.title}>Add Match</Text>

        <TextInput
          placeholder="Opponent Deck Name"
          style={styles.input}
          value={opponentDeck}
          onChangeText={setOpponentDeck}
        />

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
