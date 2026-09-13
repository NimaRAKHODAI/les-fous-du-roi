import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessClock } from './components/ChessClock';
import { GameOptions } from './components/GameOptions';
import { HistoryPanel } from './components/HistoryPanel';
import { CustomTimeForm } from './components/CustomTimeForm';
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

  // Configuration de la cadence (par défaut : 5 min + 3s d'incrément)
  const [timeControl, setTimeControl] = useState({
    initialSeconds: 300,
    incrementSeconds: 3,
    bonusOnMove40: 0,
  });

  const { wrapperRef, boardWidth } = useBoardSize();
  const { getBestMove } = useStockfish();
  const [isThinking, setIsThinking] = useState(false);

  // Initialisation des états
  const [whitePlayer, setWhitePlayer] = useState({
    type: 'human',
    name: 'Joueur 1',
    aiModel: 'default',
  });

  const [blackPlayer, setBlackPlayer] = useState({
    type: 'ai',
    name: 'IA par défaut',
    aiModel: 'default',
  });

  const [skillLevel, setSkillLevel] = useState(10);

  // Déterminer le joueur actif du tour courant
  const activePlayer = gameRef.current.turn() === 'w' ? whitePlayer : blackPlayer;

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

  const handleTimeControlChange = (newTimeControl) => {
    setTimeControl(newTimeControl);
    resetGame();
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

    if (!selectedSquare) {
      const piece = gameRef.current.get(square);
      if (piece && piece.color === currentTurn) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

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

      <div className="top-options-bar">
        <GameOptions
          whitePlayer={whitePlayer}
          setWhitePlayer={setWhitePlayer}
          blackPlayer={blackPlayer}
          setBlackPlayer={setBlackPlayer}
          skillLevel={skillLevel}
          setSkillLevel={setSkillLevel}
          resetGame={resetGame}
        />
        
        <CustomTimeForm
          timeControl={timeControl}
          onChangeTimeControl={handleTimeControlChange}
          disabled={history.length > 0}
        />
      </div>

      {/* Ensemble de jeu et barre de statut centrés */}
      <div className="game-container-wrapper">
        <div className="game-layout">
          {/* Échiquier */}
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

          {/* Panneau latéral droit */}
          <div
            className="right-panel"
            style={{
              width: `${Math.min(260, boardWidth * 0.7)}px`,
              height: `${boardWidth}px`,
            }}
          >
            <ChessClock
              key={gameKey}
              initialSeconds={timeControl.initialSeconds}
              incrementSeconds={timeControl.incrementSeconds}
              bonusOnMove40={timeControl.bonusOnMove40 || 0}
              turn={gameRef.current.turn()}
              isGameOver={Boolean(gameOver)}
              onTimeout={handleTimeout}
            >
              <HistoryPanel
                historyPairs={getHistoryPairs(history)}
                height="100%"
              />
            </ChessClock>
          </div>
        </div>

        {/* Barre de statut sous l'ensemble du jeu */}
        <div className="status-bar">
          {isThinking ? (
            <span className="thinking-text">
              <span className="dots-pulse"></span> {activePlayer.name} réfléchit…
            </span>
          ) : (
            <span className="status-text">
              Trait aux {gameRef.current.turn() === 'w' ? 'Blancs' : 'Noirs'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}