// utils/compareVersions.ts

/**
 * Compares two versions of a deck and returns a diff of cards added and removed.
 * Each version is a map of card names to { card, quantity } objects.
 */
export function diffDeckVersions(prev, current) {
  const added = [];
  const removed = [];

  const prevKeys = Object.keys(prev);
  const currentKeys = Object.keys(current);

  const allKeys = new Set([...prevKeys, ...currentKeys]);

  for (const key of allKeys) {
    const prevQty = prev[key]?.quantity || 0;
    const currQty = current[key]?.quantity || 0;

    if (currQty > prevQty) {
      added.push({
        card: current[key].card,
        quantity: currQty - prevQty,
      });
    } else if (prevQty > currQty) {
      removed.push({
        card: prev[key].card,
        quantity: prevQty - currQty,
      });
    }
  }

  return { added, removed };
}
