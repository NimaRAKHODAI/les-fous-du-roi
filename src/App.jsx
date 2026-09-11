import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish';

const UNICODE_PIECES = {
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};


// Dictionnaire de traduction des pièces
const PIECE_TRANSLATION = {
  K: 'R', // King -> Roi
  Q: 'D', // Queen -> Dame
  R: 'T', // Rook -> Tour
  B: 'F', // Bishop -> Fou
  N: 'C', // Knight -> Cavalier
};

// Fonction de conversion
function toFrenchNotation(moveStr) {
  if (!moveStr) return '';
  return moveStr.replace(/[KQRBN]/g, (match) => PIECE_TRANSLATION[match]);
}



export default function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [skillLevel, setSkillLevel] = useState(5);

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
    if (game.turn() === 'b' && !game.isGameOver()) {
      requestMove(game.fen(), 500);
    }
  }, [game, requestMove]);

  function handleSquareClick(square) {
    if (game.turn() !== 'w' || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === 'w') {
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
        // Coup illégal : sélection ignorée
      }
      setSelectedSquare(null);
    }
  }

  // Fonction pour réinitialiser le jeu
  function resetGame(newColor) {
    console.log('Nouvelle partie commencée !'); // s'affiche dans la console F12
    setGame(new Chess());
    setSelectedSquare(null);
    // On s'assure qu'on ne passe la nouvelle couleur que si c'est une chaîne de caractères ('w' ou 'b')
    if (typeof newColor === 'string') {
      setPlayerColor(newColor);
    }
  }

  // Structuration de l'historique par tour (1. e4 e5)
  const rawHistory = game.history();
  const historyPairs = [];
  for (let i = 0; i < rawHistory.length; i += 2) {
    historyPairs.push({
      number: Math.floor(i / 2) + 1,
      white: rawHistory[i],
      black: rawHistory[i + 1] || '',
    });
  }

  const board = game.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div style={{ maxWidth: '750px', margin: '30px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Les Fous du Roi</h1>

      <div style={{ marginBottom: '20px' }}>
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

      <button
        onClick={() => resetGame()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#2c3e50',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Recommencer
      </button>

      <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Échiquier */}
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              width: '400px',
              height: '400px',
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

        {/* Panneau d'historique */}
        <div
          style={{
            width: '220px',
            height: '400px',
            border: '2px solid #ccc',
            borderRadius: '6px',
            padding: '10px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '6px', fontSize: '16px' }}>
            Historique
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#777', borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', width: '30px', padding: '3px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '3px' }}>Blancs</th>
                  <th style={{ textAlign: 'left', padding: '3px' }}>Noirs</th>
                </tr>
              </thead>
              <tbody>
                {historyPairs.map((pair) => (
                  <tr key={pair.number} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ color: '#999', padding: '3px' }}>{pair.number}.</td>
                    <td style={{ fontWeight: '500', padding: '3px' }}>{toFrenchNotation(pair.white)}</td>
                    <td style={{ padding: '3px' }}>{toFrenchNotation(pair.black)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}