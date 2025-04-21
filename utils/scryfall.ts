// utils/scryfall.ts

export async function searchScryfallCards(query: string) {
  const encoded = encodeURIComponent(query);
  const url = `https://api.scryfall.com/cards/search?q=${encoded}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status}`);
    }
    const data = await response.json();
    return data.data; // Returns an array of card objects
  } catch (error) {
    console.error('Scryfall fetch failed:', error);
    return [];
  }
}
