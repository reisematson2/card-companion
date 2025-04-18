import AsyncStorage from '@react-native-async-storage/async-storage';

export type Match = {
  id: string;
  result: 'win' | 'loss';
  opponentDeck: string;
  date: string;
};

export type Deck = {
  id: string;
  name: string;
  format: string;
  createdAt: string;
  matches?: Match[]; // ⬅️ new field
};


const DECKS_KEY = '@card_companion_decks';

export async function getDecks(): Promise<Deck[]> {
  const data = await AsyncStorage.getItem(DECKS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveDeck(updatedDeck: Deck): Promise<void> {
  const decks = await getDecks();
  const newDecks = decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d));
  await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(newDecks));
}

