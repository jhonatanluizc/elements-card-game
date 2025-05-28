import { Card, Element } from '@/types/game';

export const createDeck = (): Card[] => {
  const elements: Element[] = ['fire', 'water', 'air', 'earth'];
  const deck: Card[] = [];
  
  elements.forEach(element => {
    for (let value = 1; value <= 7; value++) {
      deck.push({
        id: `${element}-${value}`,
        element,
        value
      });
    }
  });
  
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], count: number): Card[] => {
  return deck.slice(0, count);
};

export const determineRoundWinner = (playerCard: Card, aiCard: Card): 'player' | 'ai' | 'tie' => {
  const { element: playerElement, value: playerValue } = playerCard;
  const { element: aiElement, value: aiValue } = aiCard;
  
  // Earth is neutral - only wins if value is higher
  if (playerElement === 'earth' && aiElement === 'earth') {
    if (playerValue > aiValue) return 'player';
    if (aiValue > playerValue) return 'ai';
    return 'tie';
  }
  
  if (playerElement === 'earth') {
    return playerValue > aiValue ? 'player' : 'ai';
  }
  
  if (aiElement === 'earth') {
    return aiValue > playerValue ? 'ai' : 'player';
  }
  
  // Elemental advantages
  const advantages = {
    fire: 'air',
    air: 'water',
    water: 'fire'
  };
  
  if (advantages[playerElement] === aiElement) {
    return 'player';
  }
  
  if (advantages[aiElement] === playerElement) {
    return 'ai';
  }
  
  // Same element - higher value wins
  if (playerValue > aiValue) return 'player';
  if (aiValue > playerValue) return 'ai';
  return 'tie';
};

export const aiSelectCards = (cards: Card[]): { selected: Card[], discarded: Card[] } => {
  // AI strategy: keep highest value cards, prefer variety of elements
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  const selected = sorted.slice(0, 5);
  const discarded = sorted.slice(5);
  
  return { selected, discarded };
};

export const aiPlayCard = (availableCards: Card[], playerCard?: Card): Card => {
  if (!playerCard) {
    // AI goes first - play highest value card
    return availableCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }
  
  // AI responds - try to counter or play highest
  const counters = {
    fire: 'water',
    water: 'air', 
    air: 'fire',
    earth: 'earth'
  };
  
  const counterCards = availableCards.filter(card => card.element === counters[playerCard.element]);
  
  if (counterCards.length > 0) {
    return counterCards.reduce((highest, card) => 
      card.value > highest.value ? card : highest
    );
  }
  
  // No counter available - play highest value
  return availableCards.reduce((highest, card) => 
    card.value > highest.value ? card : highest
  );
};

export const getHighestDiscardedValue = (cards: Card[]): number => {
  return Math.max(...cards.map(card => card.value));
};
