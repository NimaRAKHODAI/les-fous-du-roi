import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessClock } from './components/ChessClock';
import { GameOptions } from './components/GameOptions';
import { HistoryPanel } from './components/HistoryPanel';
import { CustomTimeForm } from './components/CustomTimeForm';
import { useBoardSize } from './hooks/useBoardSize';
import { useStockfish } from './hooks/useStockfish';
import { AI_PROFILES } from './constants/aiProfiles';
import './App.css';

export default function App() {
  const gameRef = useRef(new Chess());
  const [gamePosition, setGamePosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState(null);

  const [timeControl, setTimeControl] = useState({
    initialSeconds: 300,
    incrementSeconds: 3,
    bonusOnMove40: 0,
  });

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
    name: 'Paul Pousse-Pion',
    aiModel: 'pousse_pion',
  });

  const activePlayer = gameRef.current.turn() === 'w' ? whitePlayer : blackPlayer;
  const currentAiLevel = AI_PROFILES.find((ai) => ai.id === activePlayer.aiModel)?.level ?? 10;

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

  useEffect(() => {
    if (gameOver) return;

    const currentTurn = gameRef.current.turn();
    const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;

    if (currentPlayer.type === 'ai') {
      let isMounted = true;
      setIsThinking(true);

      getBestMove(gameRef.current.fen(), currentAiLevel)
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
  }, [gamePosition, whitePlayer, blackPlayer, gameOver, currentAiLevel]);

  const rightPanelWidth = Math.min(260, boardWidth * 0.7);

  return (
    <div className="main-container">
      <h1>Les Fous du Roi</h1>

      <div className="game-container-wrapper">
        {/* Configuration des Joueurs */}
        <GameOptions
          whitePlayer={whitePlayer}
          setWhitePlayer={setWhitePlayer}
          blackPlayer={blackPlayer}
          setBlackPlayer={setBlackPlayer}
        />

        {/* Barre de commandes intermédiaire alignée sur les 2 colonnes du jeu */}
        <div className="controls-bar-layout">
          {/* Au-dessus de l'échiquier : bloc Cadence */}
          <div className="board-header" style={{ width: `${boardWidth}px` }}>
            <CustomTimeForm
              timeControl={timeControl}
              onChangeTimeControl={handleTimeControlChange}
              disabled={history.length > 0}
            />
          </div>

          {/* Au-dessus du bloc Clock : bouton Recommencer */}
          <div className="panel-header" style={{ width: `${rightPanelWidth}px` }}>
            <button className="reset-btn" onClick={resetGame}>
              Recommencer
            </button>
          </div>
        </div>

        {/* Zone de jeu */}
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

          <div
            className="right-panel"
            style={{
              width: `${rightPanelWidth}px`,
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

        {/* Barre de statut */}
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