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

  const [whitePlayer, setWhitePlayer] = useState({ type: 'human', name: 'Joueur 1', aiModel: 'default' });
  const [blackPlayer, setBlackPlayer] = useState({ type: 'ai', name: 'IA', aiModel: 'default' });

  const currentTurn = game.turn(); // 'w' ou 'b'
  const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;

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
    if (currentPlayer.type === 'ai' && !game.isGameOver()) {
      requestMove(game.fen(), 500);
    }
  }, [game, currentPlayer, requestMove]);

  function handleSquareClick(square) {
    if (currentPlayer.type !== 'human' || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === currentTurn) {
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

  function resetGame() {
    setGame(new Chess());
    setSelectedSquare(null);
  }

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

      <GameOptions
        whitePlayer={whitePlayer}
        setWhitePlayer={setWhitePlayer}
        blackPlayer={blackPlayer}
        setBlackPlayer={setBlackPlayer}
        skillLevel={skillLevel}
        setSkillLevel={setSkillLevel}
        resetGame={resetGame}
      />

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
