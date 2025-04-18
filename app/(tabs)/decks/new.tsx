import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Deck, saveDeck, getDecks } from '../../../utils/storage';
import uuid from 'react-native-uuid';

export default function NewDeckScreen() {
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');

  const handleSave = async () => {
    if (!name || !format) return;
    const newDeck: Deck = {
      id: uuid.v4().toString(),
      name,
      format,
      createdAt: new Date().toISOString(),
      matches: [],
    };
    const existingDecks = await getDecks();
    await saveDeck(newDeck);
    router.replace(`/decks/${newDeck.id}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Deck</Text>

        <TextInput
          placeholder="Deck Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Format (Standard, Modern, etc.)"
          style={styles.input}
          value={format}
          onChangeText={setFormat}
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Deck</Text>
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
