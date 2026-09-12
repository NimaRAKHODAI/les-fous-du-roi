const PIECE_TRANSLATION = {
  K: 'R', // King -> Roi
  Q: 'D', // Queen -> Dame
  R: 'T', // Rook -> Tour
  B: 'F', // Bishop -> Fou
  N: 'C', // Knight -> Cavalier
};

function toFrenchNotation(moveStr) {
  if (!moveStr) return '';
  return moveStr.replace(/[KQRBN]/g, (match) => PIECE_TRANSLATION[match]);
}

export function HistoryPanel({ historyPairs, height = 290 }) {
  return (
      <div
      style={{
        width: '100%',
        height: `${height}px`,
        border: '2px solid #ccc',
        borderRadius: '6px',
        padding: '10px',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        boxSizing: 'border-box',
        transition: 'height 0.2s ease',
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
  );
}