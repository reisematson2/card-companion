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

const DECKS_KEY = '@card_companion_decks';

export type DeckCardEntry = { card: any; quantity: number; };
export type DeckVersion = { id: string; timestamp: string; cards: { main: Record<string,DeckCardEntry>; side: Record<string,DeckCardEntry> } };

export interface Deck {
  id: string;
  name: string;
  format: string;
  createdAt: string;
  matches: Match[];
  // new shape: nested main/side
  cards: {
    main: Record<string, DeckCardEntry>;
    side: Record<string, DeckCardEntry>;
  };
  versions?: DeckVersion[];
}

// whenever you read decks, migrate old flat `cards` into `main`, and default missing fields:
export async function getDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem('@CardCompanion:decks');
  const arr = raw ? JSON.parse(raw) : [];
  return arr.map((d: any) => {
    // migrate old decks that stored cards flat at d.cards
    const legacy = d.cards && !('main' in d.cards);
    return {
      ...d,
      cards: legacy
        ? { main: d.cards, side: {} }
        : {
            main: d.cards?.main ?? {},
            side: d.cards?.side ?? {},
          },
      versions: d.versions ?? [],
    };
  });
}

// your saveDeck stays the same — now it writes out the nested shape.
export async function saveDeck(deck: Deck) {
  const decks = await getDecks();
  const i = decks.findIndex((d) => d.id === deck.id);
  if (i >= 0) decks[i] = deck;
  else decks.push(deck);
  await AsyncStorage.setItem('@CardCompanion:decks', JSON.stringify(decks));
}


