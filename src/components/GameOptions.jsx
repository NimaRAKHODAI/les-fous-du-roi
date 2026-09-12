export function GameOptions({
  whitePlayer,
  setWhitePlayer,
  blackPlayer,
  setBlackPlayer,
  skillLevel,
  setSkillLevel,
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
              onChange={(e) => setWhitePlayer({ ...whitePlayer, type: e.target.value })}
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
                onChange={(e) => setWhitePlayer({ ...whitePlayer, aiModel: e.target.value })}
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
              onChange={(e) => setBlackPlayer({ ...blackPlayer, type: e.target.value })}
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
                onChange={(e) => setBlackPlayer({ ...blackPlayer, aiModel: e.target.value })}
              >
                <option value="default">IA par défaut</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Niveau IA et Recommencer */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Niveau IA : {skillLevel}</label>
          <input
            type="range"
            min="0"
            max="20"
            value={skillLevel}
            onChange={(e) => setSkillLevel(Number(e.target.value))}
          />
        </div>

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
    </div>
  );
}
