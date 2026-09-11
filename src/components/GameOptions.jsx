export default function GameOptions({ skillLevel, setSkillLevel, playerColor, resetGame }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
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

      <div>
        <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Jouer avec :</label>
        <select value={playerColor} onChange={(e) => resetGame(e.target.value)}>
          <option value="w">Blancs</option>
          <option value="b">Noirs</option>
        </select>
      </div>

      <button
        onClick={() => resetGame(playerColor)}
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