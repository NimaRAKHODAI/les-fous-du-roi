import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish';

// Symboles Unicode des pièces d'échecs
const UNICODE_PIECES = {
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [skillLevel, setSkillLevel] = useState(5);

  // Réception du coup joué par Stockfish
  const handleEngineMove = useCallback((move) => {
    setGame((prevGame) => {
      const gameCopy = new Chess(prevGame.fen());
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

  // Déclenche le calcul de l'IA au tour des Noirs
  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      requestMove(game.fen(), 500);
    }
  }, [game, requestMove]);

  // Gestion des clics : sélection puis déplacement
  function handleSquareClick(square) {
    if (game.turn() !== 'w' || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      // Sélectionne uniquement si c'est une pièce blanche
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
    } else {
      // Tente d'exécuter le déplacement
      try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          setGame(gameCopy);
        }
      } catch (e) {
        // Coup illégal : on annule la sélection sans planter
      }
      setSelectedSquare(null);
    }
  }

  const board = game.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div style={{ maxWidth: '450px', margin: '30px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Les Fous du Roi ♟️</h1>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
          Niveau IA (0 à 20) : {skillLevel}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={skillLevel}
          onChange={(e) => setSkillLevel(Number(e.target.value))}
        />
      </div>

      {/* Grille Échiquier 8x8 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          width: '400px',
          height: '400px',
          margin: '0 auto',
          border: '3px solid #333',
          userSelect: 'none',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const square = `${files[colIndex]}${8 - rowIndex}`;
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare === square;

            let pieceSymbol = '';
            if (cell) {
              const key = cell.color === 'w' ? cell.type.toUpperCase() : cell.type;
              pieceSymbol = UNICODE_PIECES[key];
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: isSelected
                    ? '#baca44'
                    : isLight
                    ? '#f0d9b5'
                    : '#b58863',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  cursor: 'pointer',
                }}
              >
                {pieceSymbol}
              </div>
            );
          })
        )}
      </div>

      {game.isGameOver() && (
        <h2 style={{ color: 'red', marginTop: '15px' }}>
          {game.isCheckmate() ? 'Échec et mat !' : 'Partie terminée'}
        </h2>
      )}
    </div>
  );
}