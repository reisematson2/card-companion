import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { getDecks, saveDeck, Deck, Match } from '../../../../utils/storage';
import uuid from 'react-native-uuid';



export default function NewMatchScreen() {
  const { deckId } = useLocalSearchParams();
  const [opponentDeck, setOpponentDeck] = useState('');
  const [gameWins, setGameWins] = useState('');
  const [gameLosses, setGameLosses] = useState('');

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
    <View style={styles.container}>
      <Text style={styles.header}>Add Match</Text>

      <TextInput
        placeholder="Opponent Deck Name"
        style={styles.input}
        value={opponentDeck}
        onChangeText={setOpponentDeck}
      />

      <View style={styles.row}>
        <TextInput
          placeholder="Game Wins"
          keyboardType="numeric"
          style={styles.smallInput}
          value={gameWins}
          onChangeText={setGameWins}
        />
        <TextInput
          placeholder="Game Losses"
          keyboardType="numeric"
          style={styles.smallInput}
          value={gameLosses}
          onChangeText={setGameLosses}
        />
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
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold' },
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
  
});
