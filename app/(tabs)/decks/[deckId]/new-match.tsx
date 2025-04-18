import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { getDecks, saveDeck, Deck, Match } from '../../../../utils/storage';
import * as Crypto from 'expo-crypto';

export default function NewMatchScreen() {
  const { deckId } = useLocalSearchParams();
  const [opponentDeck, setOpponentDeck] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');

  const handleSaveMatch = async () => {
    const decks = await getDecks();
    const deck = decks.find((d) => d.id === deckId) as Deck;

    const newMatch: Match = {
      id: await Crypto.randomUUIDAsync(),
      opponentDeck,
      result,
      date: new Date().toISOString(),
    };

    const updatedDeck: Deck = {
      ...deck,
      matches: [newMatch, ...(deck.matches || [])],
    };

    await saveDeck(updatedDeck);
    router.back(); // Go back to the previous screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Match</Text>

      <TextInput
        placeholder="Opponent Deck Name"
        style={styles.input}
        value={opponentDeck}
        onChangeText={setOpponentDeck}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, result === 'win' && styles.active]}
          onPress={() => setResult('win')}
        >
          <Text style={styles.buttonText}>Win</Text>
        </Pressable>
        <Pressable
          style={[styles.button, result === 'loss' && styles.active]}
          onPress={() => setResult('loss')}
        >
          <Text style={styles.buttonText}>Loss</Text>
        </Pressable>
      </View>

      <Pressable style={styles.saveButton} onPress={handleSaveMatch}>
        <Text style={styles.saveText}>Save Match</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: {
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  active: { backgroundColor: '#10b981' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold' },
});
