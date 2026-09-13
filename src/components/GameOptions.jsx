// src/components/GameOptions.jsx

export function GameOptions({
  whitePlayer,
  setWhitePlayer,
  blackPlayer,
  setBlackPlayer,
  resetGame,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Configuration Blancs */}
        <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'left', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Blancs ♔</h4>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ marginRight: '6px' }}>Type :</label>
            <select
              value={whitePlayer.type}
              onChange={(e) => {
                const newType = e.target.value;
                setWhitePlayer({
                  ...whitePlayer,
                  type: newType,
                  name: newType === 'ai' ? 'IA par défaut' : 'Joueur 1',
                });
              }}
            >
              <option value="human">Joueur humain</option>
              <option value="ai">Joueur IA</option>
            </select>
          </div>

          {whitePlayer.type === 'human' ? (
            <div>
              <label style={{ marginRight: '6px' }}>Nom :</label>
              <input
                type="text"
                value={whitePlayer.name}
                onChange={(e) => setWhitePlayer({ ...whitePlayer, name: e.target.value })}
                placeholder="Nom du joueur"
                style={{ width: '130px' }}
              />
            </div>
          ) : (
            <div>
              <label style={{ marginRight: '6px' }}>IA :</label>
              <select
                value={whitePlayer.aiModel}
                onChange={(e) => {
                  const selectedLabel = e.target.options[e.target.selectedIndex].text;
                  setWhitePlayer({
                    ...whitePlayer,
                    aiModel: e.target.value,
                    name: selectedLabel,
                  });
                }}
              >
                <option value="default">IA par défaut</option>
              </select>
            </div>
          )}
        </div>

        {/* Configuration Noirs */}
        <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'left', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Noirs ♚</h4>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ marginRight: '6px' }}>Type :</label>
            <select
              value={blackPlayer.type}
              onChange={(e) => {
                const newType = e.target.value;
                setBlackPlayer({
                  ...blackPlayer,
                  type: newType,
                  name: newType === 'ai' ? 'IA par défaut' : 'Joueur 2',
                });
              }}
            >
              <option value="human">Joueur humain</option>
              <option value="ai">Joueur IA</option>
            </select>
          </div>

          {blackPlayer.type === 'human' ? (
            <div>
              <label style={{ marginRight: '6px' }}>Nom :</label>
              <input
                type="text"
                value={blackPlayer.name}
                onChange={(e) => setBlackPlayer({ ...blackPlayer, name: e.target.value })}
                placeholder="Nom du joueur"
                style={{ width: '130px' }}
              />
            </div>
          ) : (
            <div>
              <label style={{ marginRight: '6px' }}>IA :</label>
              <select
                value={blackPlayer.aiModel}
                onChange={(e) => {
                  const selectedLabel = e.target.options[e.target.selectedIndex].text;
                  setBlackPlayer({
                    ...blackPlayer,
                    aiModel: e.target.value,
                    name: selectedLabel,
                  });
                }}
              >
                <option value="default">IA par défaut</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Bouton Recommencer */}
      <button
        onClick={resetGame}
        style={{
          padding: '6px 14px',
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
    </div>
  );
}