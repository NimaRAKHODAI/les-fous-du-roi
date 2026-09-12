import { useState, useEffect } from 'react';
import './ChessClock.css';

const INITIAL_TIME = 20 * 60; // 20 minutes par joueur

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
    // Ignoré si bloqué par la politique d'interaction du navigateur
  }
};

export function ChessClock({ turn, isGameOver, onTimeout }) {
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);

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

  // Alerte sonore sous la minute et dans les 10 dernières secondes
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="clock-container">
      <div className={`player-clock ${turn === 'b' ? 'active' : ''} ${blackTime < 60 ? 'low-time' : ''}`}>
        Noirs : {formatTime(blackTime)}
      </div>
      <div className={`player-clock ${turn === 'w' ? 'active' : ''} ${whiteTime < 60 ? 'low-time' : ''}`}>
        Blancs : {formatTime(whiteTime)}
      </div>
    </div>
  );
}