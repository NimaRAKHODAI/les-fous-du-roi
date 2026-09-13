import { AI_PROFILES } from '../constants/aiProfiles';

export function PlayerConfigCard({ player, setPlayer, label, symbol, defaultName }) {
  const handleAiChange = (modelId) => {
    const selectedProfile = AI_PROFILES.find((ai) => ai.id === modelId);
    if (selectedProfile) {
      setPlayer({
        ...player,
        aiModel: selectedProfile.id,
        name: selectedProfile.name,
      });
    }
  };

  return (
    <div className="player-config-card">
      <h4 className="player-config-title">{label} {symbol}</h4>

      <div className="config-field">
        <label>Type :</label>
        <select
          className="player-select"
          value={player.type}
          onChange={(e) => {
            const type = e.target.value;
            const defaultAi = AI_PROFILES[2]; // Paul Pousse-Pion par défaut
            setPlayer({
              type,
              name: type === 'ai' ? defaultAi.name : defaultName,
              aiModel: type === 'ai' ? defaultAi.id : 'default',
            });
          }}
        >
          <option value="human">Humain</option>
          <option value="ai">IA</option>
        </select>
      </div>

      {player.type === 'human' ? (
        <div className="config-field">
          <label>Nom :</label>
          <input
            type="text"
            className="player-input"
            value={player.name}
            onChange={(e) => setPlayer({ ...player, name: e.target.value })}
            placeholder={defaultName}
          />
        </div>
      ) : (
        <div className="config-field">
          <label>IA :</label>
          <select
            className="player-select"
            value={player.aiModel}
            onChange={(e) => handleAiChange(e.target.value)}
          >
            {AI_PROFILES.map((ai) => (
              <option key={ai.id} value={ai.id}>
                {ai.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export function GameOptions({ whitePlayer, setWhitePlayer, blackPlayer, setBlackPlayer }) {
  return (
    <div className="players-options-container">
      <PlayerConfigCard
        player={whitePlayer}
        setPlayer={setWhitePlayer}
        label="Blancs"
        symbol="♔"
        defaultName="Joueur 1"
      />
      <PlayerConfigCard
        player={blackPlayer}
        setPlayer={setBlackPlayer}
        label="Noirs"
        symbol="♚"
        defaultName="Joueur 2"
      />
    </div>
  );
}