import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish';
import GameOptions from './components/GameOptions';
import ChessboardView from './components/ChessboardView';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [skillLevel, setSkillLevel] = useState(5);
  const [playerColor, setPlayerColor] = useState('w');

  const aiColor = playerColor === 'w' ? 'b' : 'w';

  const handleEngineMove = useCallback((move) => {
    setGame((prevGame) => {
      const gameCopy = new Chess();
      if (prevGame.pgn()) gameCopy.loadPgn(prevGame.pgn());
      try {
        gameCopy.move(move);
      } catch (e) {
        console.error('Coup IA invalide :', e);
      }
      return gameCopy;
    });
  }, []);

  const { requestMove, setDifficulty } = useStockfish(handleEngineMove);

  useEffect(() => {
    setDifficulty(skillLevel);
  }, [skillLevel, setDifficulty]);

  useEffect(() => {
    if (game.turn() === aiColor && !game.isGameOver()) {
      requestMove(game.fen(), 500);
    }
  }, [game, aiColor, requestMove]);

  function handleSquareClick(square) {
    if (game.turn() !== playerColor || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
      }
    } else {
      try {
        const gameCopy = new Chess();
        if (game.pgn()) gameCopy.loadPgn(game.pgn());

        const move = gameCopy.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          setGame(gameCopy);
        }
      } catch (e) {
        // Coup illégal
      }
      setSelectedSquare(null);
    }
  }

  function resetGame(newColor = playerColor) {
    setGame(new Chess());
    setSelectedSquare(null);
    if (typeof newColor === 'string') {
      setPlayerColor(newColor);
    }
  }

  // Historique par tour
  const rawHistory = game.history();
  const historyPairs = [];
  for (let i = 0; i < rawHistory.length; i += 2) {
    historyPairs.push({
      number: Math.floor(i / 2) + 1,
      white: rawHistory[i],
      black: rawHistory[i + 1] || '',
    });
  }

  return (
    <div style={{ maxWidth: '750px', margin: '30px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Les Fous du Roi ♟️</h1>

      {/* Barre d'options */}
      <GameOptions
        skillLevel={skillLevel}
        setSkillLevel={setSkillLevel}
        playerColor={playerColor}
        resetGame={resetGame}
      />

      {/* Échiquier et Panneau d'historique */}
      <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <ChessboardView
          game={game}
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
        />
        <HistoryPanel historyPairs={historyPairs} />
      </div>
    </div>
  );
}