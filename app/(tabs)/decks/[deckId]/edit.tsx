import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { getDecks, saveDeck, Deck } from '../../../../utils/storage';

export default function EditDeckScreen() {
  const { deckId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    getDecks().then((decks) => {
      const found = decks.find((d) => d.id === deckId);
      if (found) {
        setDeck(found);
        setName(found.name);
        setFormat(found.format);
      }
    });
  }, [deckId]);

  const handleUpdate = async () => {
    if (!deck) return;

    const updatedDeck: Deck = {
      ...deck,
      name,
      format,
    };

    await saveDeck(updatedDeck);
    router.replace(`/decks/${deck.id}`);
  };

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Deck not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Deck</Text>

      <TextInput
        style={styles.input}
        placeholder="Deck Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Format"
        value={format}
        onChangeText={setFormat}
      />

      <Pressable style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Deck</Text>
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
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
