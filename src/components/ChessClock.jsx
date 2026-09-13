import { useState, useEffect, useRef } from 'react';
import './ChessClock.css';

const playBeep = (frequency = 800, duration = 0.15) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignoré si bloqué par le navigateur
  }
};

function PlayerClock({ label, timeInSeconds, isActive, isLowTime }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`player-clock-box ${isActive ? 'active' : ''} ${isLowTime ? 'low-time' : ''}`}>
      <span className="player-label">{label}</span>
      <span className="time-display">{formatTime(timeInSeconds)}</span>
    </div>
  );
}

export function ChessClock({
  initialSeconds = 300,
  incrementSeconds = 3,
  bonusOnMove40 = 0,
  turn,
  isGameOver,
  onTimeout,
  children,
}) {
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);

  const prevTurnRef = useRef(turn);
  const whiteMovesCount = useRef(0);
  const blackMovesCount = useRef(0);
  const whiteBonusApplied = useRef(false);
  const blackBonusApplied = useRef(false);

  // Incrément Fischer et bonus au 40ᵉ coup
  useEffect(() => {
    if (prevTurnRef.current !== turn && !isGameOver) {
      if (prevTurnRef.current === 'w') {
        whiteMovesCount.current += 1;
        setWhiteTime((prev) => {
          let next = prev + incrementSeconds;
          if (bonusOnMove40 > 0 && whiteMovesCount.current === 40 && !whiteBonusApplied.current) {
            next += bonusOnMove40;
            whiteBonusApplied.current = true;
          }
          return next;
        });
      } else {
        blackMovesCount.current += 1;
        setBlackTime((prev) => {
          let next = prev + incrementSeconds;
          if (bonusOnMove40 > 0 && blackMovesCount.current === 40 && !blackBonusApplied.current) {
            next += bonusOnMove40;
            blackBonusApplied.current = true;
          }
          return next;
        });
      }
      prevTurnRef.current = turn;
    }
  }, [turn, incrementSeconds, bonusOnMove40, isGameOver]);

  // Décompte chaque seconde du joueur actif
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeout('b');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeout('w');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, isGameOver, onTimeout]);

  // Alertes sonores
  useEffect(() => {
    if (turn === 'w' && whiteTime === 59) {
      playBeep(880, 0.25);
    } else if (turn === 'b' && blackTime === 59) {
      playBeep(880, 0.25);
    }

    const activeTime = turn === 'w' ? whiteTime : blackTime;
    if (activeTime <= 10 && activeTime > 0) {
      playBeep(600, 0.08);
    }
  }, [whiteTime, blackTime, turn]);

  return (
    <div
      className="chess-clock-vertical-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Remplit la hauteur totale de right-panel
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {/* Horloge des Noirs */}
      <PlayerClock
        label="Noirs"
        timeInSeconds={blackTime}
        isActive={turn === 'b'}
        isLowTime={blackTime < 60}
      />

      {/* Zone centrale (Conteneur de HistoryPanel) */}
      <div
        className="clock-middle-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0, // Indispensable pour forcer le flex-grow
        }}
      >
        {children}
      </div>

      {/* Horloge des Blancs */}
      <PlayerClock
        label="Blancs"
        timeInSeconds={whiteTime}
        isActive={turn === 'w'}
        isLowTime={whiteTime < 60}
      />
    </div>
  );
}