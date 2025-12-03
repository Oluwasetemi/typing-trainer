import type {
  Match,
  MatchResult,
  Round,
  TournamentParticipant,
  WinCondition,
} from '../types/tournament.types';

/**
 * Generate a single elimination bracket
 * Winners advance, losers are eliminated
 */
export function generateSingleEliminationBracket(
  participants: TournamentParticipant[],
  tournamentId: string,
): Round[] {
  const rounds: Round[] = [];
  const totalRounds = Math.log2(participants.length);

  // Round 1: Pair participants by seed
  const round1Matches = pairParticipantsBySeeding(participants, 1, tournamentId);
  rounds.push({
    number: 1,
    bracket: 'winners',
    matches: round1Matches,
    state: 'pending',
  });

  // Subsequent rounds: Create placeholder matches
  for (let i = 2; i <= totalRounds; i++) {
    const matchCount = 2 ** (totalRounds - i);
    const roundMatches: Match[] = [];

    for (let j = 0; j < matchCount; j++) {
      roundMatches.push({
        id: `${tournamentId}-r${i}-m${j + 1}`,
        roundNumber: i,
        matchNumber: j + 1,
        bracket: 'winners',
        state: 'pending',
        participants: [], // Will be filled by winners
      });
    }

    rounds.push({
      number: i,
      bracket: 'winners',
      matches: roundMatches,
      state: 'pending',
    });
  }

  return rounds;
}

/**
 * Generate a double elimination bracket
 * Winners bracket + Losers bracket + Grand finals
 */
export function generateDoubleEliminationBracket(
  participants: TournamentParticipant[],
  tournamentId: string,
): Round[] {
  const rounds: Round[] = [];

  // Winners Bracket
  const winnersBracket = generateSingleEliminationBracket(participants, tournamentId);
  rounds.push(...winnersBracket);

  // Losers Bracket - more complex, feeds from winners bracket
  const losersBracketRounds = generateLosersBracket(participants.length, tournamentId);
  rounds.push(...losersBracketRounds);

  // Grand Finals - winner of winners bracket vs winner of losers bracket
  const grandFinalsRound: Round = {
    number: rounds.length + 1,
    bracket: 'winners',
    matches: [{
      id: `${tournamentId}-grand-finals`,
      roundNumber: rounds.length + 1,
      matchNumber: 1,
      bracket: 'winners',
      state: 'pending',
      participants: [], // Will be filled by bracket winners
    }],
    state: 'pending',
  };
  rounds.push(grandFinalsRound);

  return rounds;
}

/**
 * Generate losers bracket for double elimination
 */
function generateLosersBracket(participantCount: number, tournamentId: string): Round[] {
  const rounds: Round[] = [];
  const winnersRounds = Math.log2(participantCount);

  // Losers bracket has (winnersRounds * 2 - 1) rounds
  const losersRoundsCount = winnersRounds * 2 - 1;

  for (let i = 1; i <= losersRoundsCount; i++) {
    const matchCount = i % 2 === 1
      ? 2 ** (winnersRounds - Math.ceil(i / 2))
      : 2 ** (winnersRounds - Math.ceil(i / 2) - 1);

    const matches: Match[] = [];
    for (let j = 0; j < matchCount; j++) {
      matches.push({
        id: `${tournamentId}-L-r${i}-m${j + 1}`,
        roundNumber: i,
        matchNumber: j + 1,
        bracket: 'losers',
        state: 'pending',
        participants: [],
      });
    }

    rounds.push({
      number: i,
      bracket: 'losers',
      matches,
      state: 'pending',
    });
  }

  return rounds;
}

/**
 * Generate round robin groups
 * All participants play each other once
 */
export function generateRoundRobinGroups(
  participants: TournamentParticipant[],
  tournamentId: string,
): Round[] {
  const rounds: Round[] = [];
  const matchups = generateRoundRobinMatchups(participants);

  matchups.forEach((roundMatchups, index) => {
    const matches: Match[] = [];
    for (let i = 0; i < roundMatchups.length; i += 2) {
      if (roundMatchups[i + 1]) {
        matches.push({
          id: `${tournamentId}-rr-r${index + 1}-m${Math.floor(i / 2) + 1}`,
          roundNumber: index + 1,
          matchNumber: Math.floor(i / 2) + 1,
          bracket: 'winners',
          state: 'pending',
          participants: [roundMatchups[i], roundMatchups[i + 1]],
        });
      }
    }

    rounds.push({
      number: index + 1,
      bracket: 'winners',
      matches,
      state: 'pending',
    });
  });

  return rounds;
}

/**
 * Generate round robin matchups using circle method
 */
function generateRoundRobinMatchups(
  participants: TournamentParticipant[],
): string[][] {
  const n = participants.length;
  const rounds: string[][] = [];

  // If odd number, add a "bye" placeholder
  const players = participants.map(p => p.userId);
  if (n % 2 === 1) {
    players.push('BYE');
  }

  const totalPlayers = players.length;
  const totalRounds = totalPlayers - 1;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatchups: string[][] = [];

    for (let i = 0; i < totalPlayers / 2; i++) {
      const home = (round + i) % (totalPlayers - 1);
      const away = (totalPlayers - 1 - i + round) % (totalPlayers - 1);

      // Last player stays fixed
      const homePlayer = i === 0 ? players[totalPlayers - 1] : players[home];
      const awayPlayer = players[away];

      // Skip matches with BYE
      if (homePlayer !== 'BYE' && awayPlayer !== 'BYE') {
        roundMatchups.push([homePlayer, awayPlayer]);
      }
    }

    if (roundMatchups.length > 0) {
      rounds.push(roundMatchups.flat());
    }
  }

  return rounds;
}

/**
 * Generate Swiss system pairings for a round
 * Pairs participants with similar W-L records
 */
export function generateSwissSystemPairings(
  participants: TournamentParticipant[],
  currentRound: number,
  tournamentId: string,
): Match[] {
  // Sort by wins (descending), then losses (ascending)
  const sorted = [...participants]
    .filter(p => !p.isEliminated)
    .sort((a, b) => {
      if (b.wins !== a.wins)
        return b.wins - a.wins;
      return a.losses - b.losses;
    });

  const matches: Match[] = [];

  // Pair adjacent players in sorted order
  for (let i = 0; i < sorted.length; i += 2) {
    if (sorted[i + 1]) {
      matches.push({
        id: `${tournamentId}-swiss-r${currentRound}-m${(i / 2) + 1}`,
        roundNumber: currentRound,
        matchNumber: (i / 2) + 1,
        bracket: 'winners',
        state: 'pending',
        participants: [sorted[i].userId, sorted[i + 1].userId],
      });
    }
  }

  return matches;
}

/**
 * Pair participants by standard tournament seeding
 * 1 vs n, 2 vs n-1, 3 vs n-2, etc.
 */
function pairParticipantsBySeeding(
  participants: TournamentParticipant[],
  roundNumber: number,
  tournamentId: string,
): Match[] {
  const n = participants.length;
  const matches: Match[] = [];

  // Standard seeding: 1 vs n, 2 vs n-1, etc.
  for (let i = 0; i < n / 2; i++) {
    matches.push({
      id: `${tournamentId}-r${roundNumber}-m${i + 1}`,
      roundNumber,
      matchNumber: i + 1,
      bracket: 'winners',
      state: 'pending',
      participants: [participants[i].userId, participants[n - 1 - i].userId],
    });
  }

  return matches;
}

/**
 * Determine match winner based on win condition
 */
export function determineMatchWinner(
  results: MatchResult[],
  winCondition: WinCondition,
  minAccuracy = 95,
): string {
  const scored = results.map(result => ({
    ...result,
    calculatedScore: calculateScore(result, winCondition, minAccuracy),
  }));

  // Sort by calculated score (descending)
  scored.sort((a, b) => b.calculatedScore - a.calculatedScore);

  return scored[0].userId;
}

/**
 * Calculate score based on win condition
 */
function calculateScore(
  result: MatchResult,
  condition: WinCondition,
  minAccuracy: number,
): number {
  switch (condition) {
    case 'fastest-completion':
      // Lower finish time = higher score
      return result.finishTime ? 1000000 - result.finishTime : 0;

    case 'highest-wpm':
      // Must meet minimum accuracy threshold
      return result.accuracy >= minAccuracy ? result.wpm : 0;

    case 'best-score':
      // WPM × Accuracy percentage
      return result.wpm * (result.accuracy / 100);

    case 'race-to-target':
      // Assumes target already met, score by time
      return result.finishTime ? 1000000 - result.finishTime : 0;

    default:
      return result.wpm;
  }
}

/**
 * Generate tournament code
 */
export function generateTournamentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TOUR-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get round name for display
 */
export function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0)
    return 'Finals';
  if (roundsFromEnd === 1)
    return 'Semi-Finals';
  if (roundsFromEnd === 2)
    return 'Quarter-Finals';

  return `Round ${roundNumber}`;
}

/**
 * Calculate total rounds needed for a format
 */
export function calculateTotalRounds(
  format: string,
  participantCount: number,
): number {
  switch (format) {
    case 'single-elimination':
      return Math.log2(participantCount);

    case 'double-elimination':
      return Math.log2(participantCount) * 2;

    case 'round-robin':
      // Each participant plays n-1 matches
      return participantCount - 1;

    case 'swiss-system':
      // Typically log2(n) + 1 rounds
      return Math.ceil(Math.log2(participantCount)) + 1;

    default:
      return 0;
  }
}
