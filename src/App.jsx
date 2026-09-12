import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessClock } from './components/ChessClock';
import { GameOptions } from './components/GameOptions';
import { HistoryPanel } from './components/HistoryPanel';
import { useBoardSize } from './hooks/useBoardSize';
import { useStockfish } from './hooks/useStockfish';
import './App.css';

export default function App() {
  const gameRef = useRef(new Chess());
  const [gamePosition, setGamePosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState(null);

  const { wrapperRef, boardWidth } = useBoardSize();
  const { getBestMove } = useStockfish();
  const [isThinking, setIsThinking] = useState(false);

  const [whitePlayer, setWhitePlayer] = useState({
    type: 'human',
    name: 'Joueur 1',
    aiModel: 'default',
  });

  const [blackPlayer, setBlackPlayer] = useState({
    type: 'ai',
    name: 'Stockfish',
    aiModel: 'default',
  });

  const [skillLevel, setSkillLevel] = useState(10);
  const historyHeight = Math.max(150, boardWidth - 80);

  const getHistoryPairs = (historyList) => {
    const pairs = [];
    for (let i = 0; i < historyList.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: historyList[i],
        black: historyList[i + 1] || '',
      });
    }
    return pairs;
  };

  const handleTimeout = (winnerColor) => {
    const winnerName = winnerColor === 'w' ? 'Blancs' : 'Noirs';
    setGameOver({ winner: winnerName, reason: 'au temps' });
  };

  const resetGame = () => {
    gameRef.current = new Chess();
    setGamePosition(gameRef.current.fen());
    setHistory([]);
    setGameOver(null);
    setSelectedSquare(null);
    setGameKey((prev) => prev + 1);
  };

  const makeAMove = (moveData) => {
    try {
      const result = gameRef.current.move(moveData);

      if (result) {
        setGamePosition(gameRef.current.fen());
        setHistory((prev) => [...prev, result.san]);

        if (gameRef.current.isGameOver()) {
          if (gameRef.current.isCheckmate()) {
            setGameOver({
              winner: gameRef.current.turn() === 'w' ? 'Noirs' : 'Blancs',
              reason: 'échec et mat',
            });
          } else if (gameRef.current.isDraw()) {
            setGameOver({ winner: null, reason: 'pat / égalité' });
          }
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Gestion du clic unique (sélection + déplacement)
  const onSquareClick = (square) => {
    if (gameOver) return;

    const currentTurn = gameRef.current.turn();
    const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;
    if (currentPlayer.type !== 'human') return;

    // 1. Premier clic : sélection de la pièce
    if (!selectedSquare) {
      const piece = gameRef.current.get(square);
      if (piece && piece.color === currentTurn) {
        setSelectedSquare(square);
      }
      return;
    }

    // 2. Annulation si clic sur la même case
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // 3. Deuxième clic : tentative de coup
    const movingPiece = gameRef.current.get(selectedSquare);
    const isPromotion =
      (movingPiece?.type === 'p' && square[1] === '8') ||
      (movingPiece?.type === 'p' && square[1] === '1');

    const moveSuccess = makeAMove({
      from: selectedSquare,
      to: square,
      ...(isPromotion && { promotion: 'q' }),
    });

    if (moveSuccess) {
      setSelectedSquare(null);
    } else {
      // Si le coup échoue mais qu'on a cliqué sur une autre pièce de sa couleur
      const clickedPiece = gameRef.current.get(square);
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  // Tour de l'IA Stockfish
  useEffect(() => {
    if (gameOver) return;

    const currentTurn = gameRef.current.turn();
    const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;

    if (currentPlayer.type === 'ai') {
      let isMounted = true;
      setIsThinking(true);

      getBestMove(gameRef.current.fen(), skillLevel)
        .then((bestMove) => {
          if (isMounted) {
            if (bestMove) {
              makeAMove(bestMove);
            }
            setIsThinking(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsThinking(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [gamePosition, whitePlayer, blackPlayer, gameOver, skillLevel]);

  return (
    <div className="main-container">
      <h1>Les Fous du Roi</h1>

      <GameOptions
        whitePlayer={whitePlayer}
        setWhitePlayer={setWhitePlayer}
        blackPlayer={blackPlayer}
        setBlackPlayer={setBlackPlayer}
        skillLevel={skillLevel}
        setSkillLevel={setSkillLevel}
        resetGame={resetGame}
      />

      <div className="game-layout">
        <div className="board-wrapper" ref={wrapperRef}>
          <Chessboard
            position={gamePosition}
            boardWidth={boardWidth}
            onSquareClick={onSquareClick}
            arePiecesDraggable={false}
            customSquareStyles={{
              ...(selectedSquare && {
                [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
              }),
            }}
          />
        </div>

        <div className="right-panel" style={{ width: `${Math.min(260, boardWidth * 0.7)}px` }}>
          <ChessClock
            key={gameKey}
            turn={gameRef.current.turn()}
            isGameOver={Boolean(gameOver)}
            onTimeout={handleTimeout}
          />

          <div className="thinking-container">
            {isThinking ? (
              <span className="thinking-text">
                <span className="dots-pulse"></span> Stockfish réfléchit…
              </span>
            ) : (
              <span className="thinking-placeholder">&nbsp;</span>
            )}
          </div>

          <HistoryPanel
            historyPairs={getHistoryPairs(history)}
            height={historyHeight}
          />
        </div>
      </div>
    </div>
  );
}