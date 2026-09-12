import { useState, useEffect } from 'react';
import './CustomTimeForm.css';

const PRESETS = [
  // --- BULLET ---
  { id: 'bullet_1_0', label: "Bullet — 1' + 0''", minutes: 1, increment: 0, bonusOnMove40: 0 },
  { id: 'bullet_2_1', label: "Bullet — 2' + 1'' / coup", minutes: 2, increment: 1, bonusOnMove40: 0 },

  // --- BLITZ ---
  { id: 'blitz_fischer', label: "Blitz Fischer — 3' + 2'' / coup", minutes: 3, increment: 2, bonusOnMove40: 0 },
  { id: 'blitz_5_0', label: "Blitz Classique — 5' + 0''", minutes: 5, increment: 0, bonusOnMove40: 0 },
  { id: 'blitz_5_3', label: "Blitz — 5' + 3'' / coup", minutes: 5, increment: 3, bonusOnMove40: 0 },

  // --- RAPIDE ---
  { id: 'rapide_10_5', label: "Rapide — 10' + 5'' / coup", minutes: 10, increment: 5, bonusOnMove40: 0 },
  { id: 'rapide_fischer', label: "Rapide Fischer — 15' + 10'' / coup", minutes: 15, increment: 10, bonusOnMove40: 0 },
  { id: 'rapide_25_0', label: "Rapide — 25' + 0''", minutes: 25, increment: 0, bonusOnMove40: 0 },

  // --- CLASSIQUE / STANDARD ---
  { id: '1h_ko', label: "Semi-Rapide — 1h KO", minutes: 60, increment: 0, bonusOnMove40: 0 },
  { id: 'standard_fide', label: "Standard FIDE — 90' + 30'' / coup (+30' au 40e)", minutes: 90, increment: 30, bonusOnMove40: 1800 },
  { id: 'classique_40_2h', label: "Classique — 40 coups / 2h + 1h KO", minutes: 120, increment: 0, bonusOnMove40: 3600 },

  // --- OPTION SUR MESURE ---
  { id: 'custom', label: "Personnalisé...", minutes: 5, increment: 3, bonusOnMove40: 0 },
];

export function CustomTimeForm({ timeControl, onChangeTimeControl, disabled }) {
  const [selectedPresetId, setSelectedPresetId] = useState('blitz_fischer');
  const [minutes, setMinutes] = useState(Math.floor(timeControl.initialSeconds / 60));
  const [increment, setIncrement] = useState(timeControl.incrementSeconds);

  useEffect(() => {
    setMinutes(Math.floor(timeControl.initialSeconds / 60));
    setIncrement(timeControl.incrementSeconds);
  }, [timeControl]);

  const handleSelectChange = (e) => {
    if (disabled) return;
    const presetId = e.target.value;
    setSelectedPresetId(presetId);

    if (presetId !== 'custom') {
      const preset = PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setMinutes(preset.minutes);
        setIncrement(preset.increment);
        onChangeTimeControl({
          initialSeconds: preset.minutes * 60,
          incrementSeconds: preset.increment,
          bonusOnMove40: preset.bonusOnMove40 || 0,
        });
      }
    } else {
      onChangeTimeControl({
        initialSeconds: minutes * 60,
        incrementSeconds: increment,
        bonusOnMove40: 0,
      });
    }
  };

  const handleMinutesChange = (e) => {
    if (disabled) return;
    const val = Math.max(1, Number(e.target.value));
    setMinutes(val);
    onChangeTimeControl({
      initialSeconds: val * 60,
      incrementSeconds: increment,
      bonusOnMove40: 0,
    });
  };

  const handleIncrementChange = (e) => {
    if (disabled) return;
    const val = Math.max(0, Number(e.target.value));
    setIncrement(val);
    onChangeTimeControl({
      initialSeconds: minutes * 60,
      incrementSeconds: val,
      bonusOnMove40: 0,
    });
  };

  return (
    <div className={`time-config-container ${disabled ? 'disabled' : ''}`}>
      <span className="config-label">Cadence :</span>

      <select
        className="time-select"
        value={selectedPresetId}
        onChange={handleSelectChange}
        disabled={disabled}
      >
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      {selectedPresetId === 'custom' && (
        <div className="custom-fields">
          <label>
            Min :
            <input
              type="number"
              min="1"
              max="180"
              value={minutes}
              onChange={handleMinutesChange}
              disabled={disabled}
            />
          </label>
          <label>
            Incr (s) :
            <input
              type="number"
              min="0"
              max="60"
              value={increment}
              onChange={handleIncrementChange}
              disabled={disabled}
            />
          </label>
        </div>
      )}
    </div>
  );
}