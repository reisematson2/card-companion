// utils/normalize.ts

/**
 * Takes an array of matches and returns grouped opponent stats
 * using normalized deck names, but preserves the original casing
 * for display.
 */
export function getNormalizedOpponentStats(matches) {
  const opponentStats = new Map();

  for (const match of matches || []) {
    const original = match.opponentDeck?.trim() || 'Unknown';
    const normalized = original.toLowerCase();

    if (!opponentStats.has(normalized)) {
      opponentStats.set(normalized, {
        name: original,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }

    const stat = opponentStats.get(normalized);
    if (match.result === 'win') stat.wins++;
    else if (match.result === 'loss') stat.losses++;
    else if (match.result === 'draw') stat.draws++;
  }

  return Array.from(opponentStats.values());
}

/**
 * Calculates win rate from wins, losses, and draws.
 */
export function getWinRate(wins, losses, draws) {
  const total = wins + losses + draws;
  return total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;
}

/**
 * Groups matches by ISO date string (yyyy-mm-dd)
 */
export function groupMatchesByDate(matches) {
  const groups = {};
  for (const match of matches || []) {
    const dateKey = new Date(match.date).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(match);
  }
  return groups;
}

/**
 * Produces a high-level summary of a deck's match performance.
 */
export function summarizeDeckPerformance(matches) {
  const sorted = [...(matches || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const total = matches.length;
  const wins = matches.filter((m) => m.result === 'win').length;
  const losses = matches.filter((m) => m.result === 'loss').length;
  const draws = matches.filter((m) => m.result === 'draw').length;

  const winRate = getWinRate(wins, losses, draws);
  const lastPlayed = sorted[0]?.date ? new Date(sorted[0].date).toLocaleDateString() : 'N/A';

  let currentStreak = 0;
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (const match of sorted) {
    if (match.result === 'win') {
      tempWinStreak++;
      tempLossStreak = 0;
    } else if (match.result === 'loss') {
      tempLossStreak++;
      tempWinStreak = 0;
    } else {
      tempWinStreak = 0;
      tempLossStreak = 0;
    }
    bestWinStreak = Math.max(bestWinStreak, tempWinStreak);
    worstLossStreak = Math.max(worstLossStreak, tempLossStreak);
  }

  for (const match of sorted) {
    if (match.result === 'win') currentStreak++;
    else break;
  }

  return {
    total,
    wins,
    losses,
    draws,
    winRate,
    lastPlayed,
    currentStreak,
    bestWinStreak,
    worstLossStreak,
  };
}
