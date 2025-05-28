
export type Element = 'fire' | 'water' | 'air' | 'earth';

export interface Card {
  id: string;
  element: Element;
  value: number;
}

export type GamePhase = 'home' | 'selection' | 'discard-reveal' | 'main-game' | 'final';

export interface GameState {
  phase: GamePhase;
  playerCards: Card[];
  aiCards: Card[];
  playerSelected: Card[];
  aiSelected: Card[];
  playerDiscarded: Card[];
  aiDiscarded: Card[];
  currentRound: number;
  playerScore: number;
  aiScore: number;
  currentPlayer: 'player' | 'ai';
  roundWinner: 'player' | 'ai' | 'tie' | null;
  gameWinner: 'player' | 'ai' | 'tie' | null;
  playedCards: { player: Card | null; ai: Card | null };
}
