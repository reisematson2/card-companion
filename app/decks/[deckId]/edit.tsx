import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Deck, getDecks, saveDeck } from '../../../utils/storage';

export default function EditDeckScreen() {
  const { deckId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');

  useEffect(() => {
    getDecks().then((decks) => {
      const deck = decks.find((d) => d.id === deckId);
      if (deck) {
        setName(deck.name);
        setFormat(deck.format);
      }
    });
  }, [deckId]);

  const handleSave = async () => {
    const decks = await getDecks();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    const updatedDeck: Deck = { ...deck, name, format };
    await saveDeck(updatedDeck);
    router.replace(`/decks/${deck.id}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* ✅ Set screen title */}
      <Stack.Screen options={{ title: 'Edit Deck' }} />
      <View style={styles.container}>
        <TextInput
          placeholder="Deck Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Format"
          style={styles.input}
          value={format}
          onChangeText={setFormat}
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
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
