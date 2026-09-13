// src/components/HistoryPanel.jsx

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

export function HistoryPanel({ historyPairs }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%', // Occupe toute la hauteur disponible dès le début
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        border: '1px solid #3f4452',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#2a2d37',
        boxSizing: 'border-box',
      }}
    >
      <h3
        style={{
          margin: '0 0 10px 0',
          borderBottom: '1px solid #3f4452',
          paddingBottom: '6px',
          fontSize: '15px',
        }}
      >
        Liste des coups
      </h3>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#a0a5b5', borderBottom: '1px solid #3f4452' }}>
              <th style={{ textAlign: 'left', width: '30px', padding: '4px' }}>#</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Blancs</th>
              <th style={{ textAlign: 'left', padding: '4px' }}>Noirs</th>
            </tr>
          </thead>
          <tbody>
            {historyPairs.map((pair) => (
              <tr key={pair.number} style={{ borderBottom: '1px solid #343844' }}>
                <td style={{ color: '#6c7280', padding: '4px' }}>{pair.number}.</td>
                <td style={{ fontWeight: '500', padding: '4px', color: '#f0f0f0' }}>
                  {toFrenchNotation(pair.white)}
                </td>
                <td style={{ padding: '4px', color: '#f0f0f0' }}>
                  {toFrenchNotation(pair.black)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}