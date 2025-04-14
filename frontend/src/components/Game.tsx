import { useState, useEffect } from "react";
import Header from "./Header";

interface Card {
  suit: string; // "CLUB", "DIAMOND", "HEART", "SPADE"
  value: string;
  numericValue: number;
  imagePath: string;
}

const Game = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameState, setGameState] = useState("betting"); // betting, playing, dealerTurn, gameOver
  const [message, setMessage] = useState("Place your bet!");
  const [bet, setBet] = useState(10);
  const [tokens, setTokens] = useState(0);
  const [showDealerFirstCard, setShowDealerFirstCard] = useState(false);
  const [isDealing, setIsDealing] = useState(false);

  // Initialize multi-deck shoe (using multiple decks makes card counting harder)
  useEffect(() => {
    initializeDecks();
  }, []);

  // Calculate scores whenever hands change
  useEffect(() => {
    if (playerHand.length > 0) {
      setPlayerScore(calculateScore(playerHand));
    }
    if (dealerHand.length > 0) {
      setDealerScore(calculateScore(dealerHand));
    }
  }, [playerHand, dealerHand]);

  // Check for bust or 21 when player score changes
  useEffect(() => {
    if (playerScore > 21 && gameState === "playing") {
      endRound("Player busts! House wins!");
    } else if (
      playerScore === 21 &&
      playerHand.length === 2 &&
      gameState === "playing"
    ) {
      // Blackjack!
      dealerTurn();
    }
  }, [playerScore, gameState]);

  // Check dealer score during dealer's turn
  useEffect(() => {
    if (gameState === "dealerTurn") {
      if (dealerScore >= 17) {
        determineWinner();
      } else {
        const timer = setTimeout(() => {
          dealCard("dealer");
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [dealerScore, gameState]);

  // Reset game for a new hand
  const resetGame = async () => {
    setGameState("betting");
    setMessage("Place your bet! (Max: 100 tokens)");
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setShowDealerFirstCard(false);
    setIsDealing(false);

    // TODO query tokens

    // Reshuffle if deck is getting low
    if (deck.length < 52 * 6 * 0.25) {
      setMessage("Shuffling decks...");
      initializeDecks();
    }
  };

  // Initialize multiple decks to make card counting ineffective
  const initializeDecks = () => {
    const suits = ["CLUB", "HEART", "DIAMOND", "SPADE"];
    const values = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
    ];
    const valueMap: { [key: string]: string } = {
      "11": "JACK",
      "12": "QUEEN",
      "13": "KING",
    };
    const numDecks = 6;

    let newDeck: Card[] = [];

    for (let d = 0; d < numDecks; d++) {
      for (const suit of suits) {
        for (const value of values) {
          const displayValue = valueMap[value] || value;
          const imagePath = `/cards/${suit}-${value}${
            valueMap[value] ? `-${valueMap[value]}` : ""
          }.svg`;
          //   console.log(imagePath);

          let numericValue: number;
          if (value === "1") {
            numericValue = 11; // Ace
          } else if (["11", "12", "13"].includes(value)) {
            numericValue = 10; // Face cards
          } else {
            numericValue = parseInt(value);
          }

          newDeck.push({
            suit,
            value: displayValue,
            numericValue,
            imagePath,
          });
        }
      }
    }

    newDeck = shuffleDeck(newDeck);
    setDeck(newDeck);
  };

  // Fisher-Yates shuffle algorithm
  const shuffleDeck = (deck: Card[]) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Cut the deck at a random point to further obfuscate card order
    const cutPoint =
      Math.floor(Math.random() * (newDeck.length / 2)) + newDeck.length / 4;
    const firstPart = newDeck.slice(0, cutPoint);
    const secondPart = newDeck.slice(cutPoint);

    return [...secondPart, ...firstPart];
  };

  // Calculate hand score
  const calculateScore = (hand: Card[]) => {
    // First, calculate total with all Aces as 11
    let score = hand.reduce((total, card) => {
      if (card.value === "1") {
        // Ace
        return total + 11;
      }
      return total + card.numericValue;
    }, 0);

    // Then count Aces and convert them to 1s as needed
    const aces = hand.filter((card) => card.value === "1").length;
    let remainingAces = aces;

    // While score is over 21 and we still have Aces, convert them to 1
    while (score > 21 && remainingAces > 0) {
      score -= 10; // Convert an Ace from 11 to 1 (subtract 10)
      remainingAces--;
    }

    return score;
  };

  // Deal a card to player or dealer
  const dealCard = (to: "player" | "dealer") => {
    if (deck.length === 0) {
      setMessage("No cards left in the deck! Reshuffling...");
      initializeDecks();
      return;
    }

    setIsDealing(true);

    const newDeck = [...deck];
    const card = newDeck.pop()!;

    if (to === "player") {
      setPlayerHand([...playerHand, card]);
    } else {
      setDealerHand([...dealerHand, card]);
    }

    setDeck(newDeck);

    // Reshuffle when deck gets low (around 25% remaining)
    // This makes card counting even harder
    if (newDeck.length < 52 * 6 * 0.25) {
      setTimeout(() => {
        setMessage("Shuffling decks...");
        initializeDecks();
      }, 1000);
    }

    setTimeout(() => setIsDealing(false), 300);
  };

  // Start a new round
  const startRound = () => {
    if (tokens < bet) {
      setMessage("You don't have enough tokens!");
      return;
    }

    // Deduct bet from tokens
    setTokens(tokens - bet);

    // Reset hands
    setPlayerHand([]);
    setDealerHand([]);
    setShowDealerFirstCard(false);
    setGameState("playing");
    setMessage("Hit or Stand?");

    // Deal initial cards
    setTimeout(() => {
      dealInitialCards();
    }, 500);
  };

  // Deal initial cards (2 each)
  const dealInitialCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop()!, newDeck.pop()!];
    const dealerCards = [newDeck.pop()!, newDeck.pop()!];

    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(newDeck);
  };

  // Player actions
  const playerHit = () => {
    if (gameState !== "playing" || isDealing) return;
    dealCard("player");
  };

  const playerStand = () => {
    if (gameState !== "playing") return;
    dealerTurn();
  };

  const dealerTurn = () => {
    setGameState("dealerTurn");
    setShowDealerFirstCard(true);
    setMessage("Dealer's turn...");
  };

  // Determine winner at the end of the round
  const determineWinner = () => {
    let newMessage = "";
    let winnings = 0;

    if (playerScore > 21) {
      newMessage = "You bust! House wins!";
    } else if (dealerScore > 21) {
      newMessage = "Dealer busts! You win!";
      winnings = bet * 2;
    } else if (playerScore > dealerScore) {
      newMessage = "You win!";
      winnings = bet * 2;
    } else if (playerScore < dealerScore) {
      newMessage = "House wins!";
    } else {
      newMessage = "It's a push!";
      winnings = bet; // Return the bet on a push
    }

    // Blackjack pays 3:2
    if (
      playerScore === 21 &&
      playerHand.length === 2 &&
      !(dealerScore === 21 && dealerHand.length === 2)
    ) {
      newMessage = "Blackjack! You win!";
      winnings = bet + Math.floor(bet * 1.5);
    }

    setTokens(tokens + winnings);
    endRound(newMessage);
  };

  // End the round and update game state
  const endRound = (message: string) => {
    setShowDealerFirstCard(true);
    setGameState("gameOver");
    setMessage(message);
  };

  // Adjust bet amount
  const changeBet = (amount: number) => {
    if (gameState !== "betting") return;
    const maxBet = 100; // $1 = 100 tokens
    const newBet = Math.max(
      10,
      Math.min(maxBet, Math.min(tokens, bet + amount))
    );
    setBet(newBet);

    // Show warning if trying to bet more than max
    if (bet + amount > maxBet) {
      setMessage("Maximum bet is 100 tokens ($1)");
      setTimeout(() => {
        setMessage("Place your bet! (Max: 100 tokens)");
      }, 2000);
    }
  };

  const cardDisplay = (card: Card) => {
    return (
      <div className="card">
        <img
          src={card.imagePath}
          alt={`${card.value} of ${card.suit}`}
          className="card-image"
        />
      </div>
    );
  };

  return (
    <div className="blackjack-game">
      <Header />
      <div className="game-header">
        <h2>♠️ Blackjack ♦️</h2>
        <div className="token-display">
          <span className="token-icon">💰</span>
          Tokens: {tokens.toLocaleString()}
        </div>
      </div>

      <div className="game-message">{message}</div>

      {gameState === "betting" ? (
        <div className="betting-controls">
          <div className="current-bet">Current Bet: {bet}</div>
          <div className="bet-buttons">
            <button onClick={() => changeBet(-25)}>-25</button>
            <button onClick={() => changeBet(-5)}>-5</button>
            <button onClick={() => changeBet(5)}>+5</button>
            <button onClick={() => changeBet(25)}>+25</button>
          </div>
          <button className="deal-button" onClick={startRound}>
            Deal
          </button>
        </div>
      ) : (
        <>
          <div className="dealer-area">
            <h3>Dealer: {showDealerFirstCard ? dealerScore : "?"}</h3>
            <div className="card-container">
              {dealerHand.map((card, index) => (
                <div key={index} className="card-wrapper">
                  {index === 0 && !showDealerFirstCard ? (
                    <div className="card back" />
                  ) : (
                    cardDisplay(card)
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="player-area">
            <h3>Player: {playerScore}</h3>
            <div className="card-container">
              {playerHand.map((card, index) => (
                <div key={index} className="card-wrapper">
                  {cardDisplay(card)}
                </div>
              ))}
            </div>
          </div>

          <div className="game-controls">
            {gameState === "playing" && (
              <>
                <button onClick={playerHit} disabled={isDealing}>
                  Hit
                </button>
                <button onClick={playerStand} disabled={isDealing}>
                  Stand
                </button>
              </>
            )}
            {gameState === "gameOver" && (
              <button onClick={resetGame}>New Hand</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
