import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { saveDeck } from '../../../utils/storage';
import * as Crypto from 'expo-crypto';



export default function NewDeckScreen() {
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !format.trim()) return;
  
    const newDeck = {
      id: Crypto.randomUUID(),
      name,
      format,
      createdAt: new Date().toISOString(),
    };
    
  
    await saveDeck(newDeck);
    router.replace('/decks');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Deck</Text>

      <TextInput
        style={styles.input}
        placeholder="Deck Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Format (e.g. Modern, Standard)"
        value={format}
        onChangeText={setFormat}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Deck</Text>
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
  saveButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});
