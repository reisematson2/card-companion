import AsyncStorage from '@react-native-async-storage/async-storage';

export type Match = {
  id: string;
  result: 'win' | 'loss' | 'draw';
  gameWins: number;
  gameLosses: number;
  opponentDeck: string;
  opponentDeckNormalized?: string;
  deckName: string;
  date: string;
  notes?: string;
};

export type DeckVersion = {
  id: string;
  timestamp: string;
  cards: { [name: string]: { card: any; quantity: number } };
};


export type Deck = {
  id: string;
  name: string;
  format: string;
  createdAt: string;
  matches: Match[];
  versions?: DeckVersion[]; // ✅ Add this line
};


const DECKS_KEY = '@card_companion_decks';

export async function getDecks(): Promise<Deck[]> {
  const data = await AsyncStorage.getItem(DECKS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveDeck(updatedDeck: Deck): Promise<void> {
  console.log('>>> saveDeck() called'); // ← this should print no matter what

  const decks = await getDecks();
  const index = decks.findIndex((d) => d.id === updatedDeck.id);

  if (index >= 0) {
    decks[index] = updatedDeck;
  } else {
    decks.unshift(updatedDeck); // fallback
  }

  console.log('Saving this to AsyncStorage:', decks);

  await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}


