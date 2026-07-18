// src/lib/match.ts
export interface Player {
  id: string;
  name: string;
  rating: number; // numeric rating
}

export interface CourtAssignment {
  courtNumber: number; // 1..6 (or dynamic)
  players: Player[]; // exactly 4 players per court (two teams)
}

export interface ScoreRecord {
  courtNumber: number;
  teamA: { playerIds: string[]; points: number };
  teamB: { playerIds: string[]; points: number };
}

export interface MatchDay {
  id: string;
  date: string; // ISO date string
  courts: CourtAssignment[];
  scores?: ScoreRecord[];
}

export interface Suggestion {
  pair: string[]; // two player names
  court: number;
  reason: string;
}
