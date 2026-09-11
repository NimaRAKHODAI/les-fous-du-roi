const UNICODE_PIECES = {
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function ChessboardView({ game, selectedSquare, onSquareClick }) {
  const board = game.board();

  return (
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
                onClick={() => onSquareClick(square)}
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