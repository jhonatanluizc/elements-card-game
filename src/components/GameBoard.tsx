
import { useState, useEffect } from 'react';
import { GameState, Card as CardType } from '@/types/game';
import { 
  createDeck, 
  shuffleDeck, 
  dealCards, 
  aiSelectCards, 
  aiPlayCard, 
  determineRoundWinner,
  getHighestDiscardedValue 
} from '@/utils/gameLogic';
import Card from './Card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GameBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'home',
    playerCards: [],
    aiCards: [],
    playerSelected: [],
    aiSelected: [],
    playerDiscarded: [],
    aiDiscarded: [],
    currentRound: 1,
    playerScore: 0,
    aiScore: 0,
    currentPlayer: 'player',
    roundWinner: null,
    gameWinner: null,
    playedCards: { player: null, ai: null }
  });

  const startGame = () => {
    const deck = shuffleDeck(createDeck());
    const playerCards = dealCards(deck, 7);
    const aiCards = dealCards(deck.slice(7), 7);
    
    setGameState({
      ...gameState,
      phase: 'selection',
      playerCards,
      aiCards,
      playerSelected: [],
      aiSelected: [],
      playerDiscarded: [],
      aiDiscarded: [],
      currentRound: 1,
      playerScore: 0,
      aiScore: 0,
      roundWinner: null,
      gameWinner: null,
      playedCards: { player: null, ai: null }
    });
  };

  const selectCard = (card: CardType) => {
    if (gameState.playerSelected.length < 5) {
      setGameState({
        ...gameState,
        playerSelected: [...gameState.playerSelected, card]
      });
    }
  };

  const deselectCard = (card: CardType) => {
    setGameState({
      ...gameState,
      playerSelected: gameState.playerSelected.filter(c => c.id !== card.id)
    });
  };

  const confirmSelection = () => {
    if (gameState.playerSelected.length !== 5) {
      toast.error('Please select exactly 5 cards to continue');
      return;
    }

    const playerDiscarded = gameState.playerCards.filter(
      card => !gameState.playerSelected.find(selected => selected.id === card.id)
    );

    const { selected: aiSelected, discarded: aiDiscarded } = aiSelectCards(gameState.aiCards);

    // Determine starting player based on highest discarded card
    const playerHighest = getHighestDiscardedValue(playerDiscarded);
    const aiHighest = getHighestDiscardedValue(aiDiscarded);
    
    let startingPlayer: 'player' | 'ai';
    if (playerHighest > aiHighest) {
      startingPlayer = 'player';
    } else if (aiHighest > playerHighest) {
      startingPlayer = 'ai';
    } else {
      startingPlayer = Math.random() < 0.5 ? 'player' : 'ai';
    }

    setGameState({
      ...gameState,
      phase: 'discard-reveal',
      playerDiscarded,
      aiSelected,
      aiDiscarded,
      currentPlayer: startingPlayer
    });
  };

  const proceedToMainGame = () => {
    setGameState({
      ...gameState,
      phase: 'main-game'
    });
  };

  const playCard = (card: CardType) => {
    if (gameState.currentPlayer !== 'player') return;

    const newPlayerSelected = gameState.playerSelected.filter(c => c.id !== card.id);
    
    setGameState({
      ...gameState,
      playerSelected: newPlayerSelected,
      playedCards: { ...gameState.playedCards, player: card }
    });

    // AI responds
    setTimeout(() => {
      const aiCard = aiPlayCard(gameState.aiSelected, card);
      const newAiSelected = gameState.aiSelected.filter(c => c.id !== aiCard.id);
      
      const winner = determineRoundWinner(card, aiCard);
      const newPlayerScore = gameState.playerScore + (winner === 'player' ? 1 : 0);
      const newAiScore = gameState.aiScore + (winner === 'ai' ? 1 : 0);
      
      setGameState(prev => ({
        ...prev,
        aiSelected: newAiSelected,
        playedCards: { player: card, ai: aiCard },
        roundWinner: winner,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        currentPlayer: winner === 'tie' ? prev.currentPlayer : winner
      }));

      // Check if game is over
      if (newPlayerSelected.length === 0) {
        setTimeout(() => {
          let gameWinner: 'player' | 'ai' | 'tie';
          if (newPlayerScore > newAiScore) gameWinner = 'player';
          else if (newAiScore > newPlayerScore) gameWinner = 'ai';
          else gameWinner = 'tie';

          setGameState(prev => ({
            ...prev,
            phase: 'final',
            gameWinner
          }));
        }, 2000);
      } else {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentRound: prev.currentRound + 1,
            playedCards: { player: null, ai: null },
            roundWinner: null
          }));
        }, 2000);
      }
    }, 1000);
  };

  const aiPlayFirst = () => {
    if (gameState.currentPlayer !== 'ai') return;

    const aiCard = aiPlayCard(gameState.aiSelected);
    const newAiSelected = gameState.aiSelected.filter(c => c.id !== aiCard.id);
    
    setGameState({
      ...gameState,
      aiSelected: newAiSelected,
      playedCards: { ...gameState.playedCards, ai: aiCard },
      currentPlayer: 'player'
    });
  };

  const playPlayerCard = (card: CardType) => {
    if (gameState.playedCards.ai) {
      // AI already played, resolve round
      const newPlayerSelected = gameState.playerSelected.filter(c => c.id !== card.id);
      
      const winner = determineRoundWinner(card, gameState.playedCards.ai);
      const newPlayerScore = gameState.playerScore + (winner === 'player' ? 1 : 0);
      const newAiScore = gameState.aiScore + (winner === 'ai' ? 1 : 0);
      
      setGameState({
        ...gameState,
        playerSelected: newPlayerSelected,
        playedCards: { player: card, ai: gameState.playedCards.ai },
        roundWinner: winner,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        currentPlayer: winner === 'tie' ? gameState.currentPlayer : winner
      });

      // Check if game is over
      if (newPlayerSelected.length === 0) {
        setTimeout(() => {
          let gameWinner: 'player' | 'ai' | 'tie';
          if (newPlayerScore > newAiScore) gameWinner = 'player';
          else if (newAiScore > newPlayerScore) gameWinner = 'ai';
          else gameWinner = 'tie';

          setGameState(prev => ({
            ...prev,
            phase: 'final',
            gameWinner
          }));
        }, 2000);
      } else {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentRound: prev.currentRound + 1,
            playedCards: { player: null, ai: null },
            roundWinner: null
          }));
        }, 2000);
      }
    }
  };

  // Auto-play AI when it goes first
  useEffect(() => {
    if (gameState.phase === 'main-game' && gameState.currentPlayer === 'ai' && !gameState.playedCards.ai) {
      setTimeout(aiPlayFirst, 1000);
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.playedCards.ai]);

  const restartGame = () => {
    setGameState({
      phase: 'home',
      playerCards: [],
      aiCards: [],
      playerSelected: [],
      aiSelected: [],
      playerDiscarded: [],
      aiDiscarded: [],
      currentRound: 1,
      playerScore: 0,
      aiScore: 0,
      currentPlayer: 'player',
      roundWinner: null,
      gameWinner: null,
      playedCards: { player: null, ai: null }
    });
  };

  const renderHomeScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          ⚔️ Elemental Duel ⚔️
        </h1>
        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
          Master the elements in this strategic card battle! Fire burns Air, Air blows away Water, 
          Water extinguishes Fire, and Earth stands neutral but strong.
        </p>
        <Button 
          onClick={startGame}
          className="text-xl px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          ⚡ Start Game ⚡
        </Button>
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Choose 5 Cards to Battle ({gameState.playerSelected.length}/5)
        </h2>
        
        <div className="grid grid-cols-7 gap-4 mb-8">
          {gameState.playerCards.map(card => (
            <Card
              key={card.id}
              card={card}
              isSelected={gameState.playerSelected.some(c => c.id === card.id)}
              onClick={() => 
                gameState.playerSelected.some(c => c.id === card.id) 
                  ? deselectCard(card) 
                  : selectCard(card)
              }
              size="large"
            />
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={confirmSelection}
            disabled={gameState.playerSelected.length !== 5}
            className="text-lg px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDiscardReveal = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Discarded Cards</h2>
        
        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-300 mb-4">Your Discards</h3>
            <div className="flex justify-center gap-4">
              {gameState.playerDiscarded.map(card => (
                <Card key={card.id} card={card} size="large" />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-red-300 mb-4">AI Discards</h3>
            <div className="flex justify-center gap-4">
              {gameState.aiDiscarded.map(card => (
                <Card key={card.id} card={card} size="large" />
              ))}
            </div>
          </div>
        </div>

        <div className="text-xl text-white mb-6">
          {gameState.currentPlayer === 'player' ? 'You go first!' : 'AI goes first!'}
        </div>

        <Button 
          onClick={proceedToMainGame}
          className="text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700"
        >
          Begin Battle!
        </Button>
      </div>
    </div>
  );

  const renderMainGame = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Score and Round Info */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-4">
            Round {gameState.currentRound} | Score: You {gameState.playerScore} - {gameState.aiScore} AI
          </div>
          <div className="text-xl text-gray-300">
            {gameState.currentPlayer === 'player' ? 'Your Turn' : 'AI Turn'}
          </div>
        </div>

        {/* Played Cards Area */}
        <div className="bg-black/20 rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-white text-center mb-4">Battle Arena</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-bold text-blue-300 mb-2">Your Card</h4>
              {gameState.playedCards.player ? (
                <Card card={gameState.playedCards.player} size="large" />
              ) : (
                <div className="w-24 h-32 mx-auto border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Waiting...</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-red-300 mb-2">AI Card</h4>
              {gameState.playedCards.ai ? (
                <Card card={gameState.playedCards.ai} size="large" />
              ) : (
                <div className="w-24 h-32 mx-auto border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Waiting...</span>
                </div>
              )}
            </div>
          </div>
          
          {gameState.roundWinner && (
            <div className="text-center mt-4">
              <div className={`text-2xl font-bold ${
                gameState.roundWinner === 'player' ? 'text-green-400' : 
                gameState.roundWinner === 'ai' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {gameState.roundWinner === 'player' ? 'You Win This Round!' : 
                 gameState.roundWinner === 'ai' ? 'AI Wins This Round!' : 'Round Tied!'}
              </div>
            </div>
          )}
        </div>

        {/* Player's Hand */}
        <div>
          <h3 className="text-2xl font-bold text-white text-center mb-4">Your Cards</h3>
          <div className="flex justify-center gap-4">
            {gameState.playerSelected.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => gameState.currentPlayer === 'player' && !gameState.playedCards.player ? 
                  (gameState.playedCards.ai ? playPlayerCard(card) : playCard(card)) : undefined}
                size="large"
                className={gameState.currentPlayer === 'player' && !gameState.playedCards.player ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}
              />
            ))}
          </div>
        </div>

        {/* AI Cards (hidden) */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white text-center mb-4">AI Cards</h3>
          <div className="flex justify-center gap-4">
            {gameState.aiSelected.map((_, index) => (
              <Card key={index} isHidden size="large" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4">
          {gameState.gameWinner === 'player' ? '🏆 Victory! 🏆' : 
           gameState.gameWinner === 'ai' ? '💀 Defeat 💀' : '⚖️ Draw ⚖️'}
        </h1>
        <div className="text-3xl text-gray-200">
          Final Score: You {gameState.playerScore} - {gameState.aiScore} AI
        </div>
        <Button 
          onClick={restartGame}
          className="text-xl px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          ⚡ Play Again ⚡
        </Button>
      </div>
    </div>
  );

  switch (gameState.phase) {
    case 'home':
      return renderHomeScreen();
    case 'selection':
      return renderSelection();
    case 'discard-reveal':
      return renderDiscardReveal();
    case 'main-game':
      return renderMainGame();
    case 'final':
      return renderFinal();
    default:
      return renderHomeScreen();
  }
};

export default GameBoard;
