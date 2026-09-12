import { useState, useEffect, useRef } from 'react';

export function ChessClock({ 
  initialTime = 20 * 60, 
  increment = 0, // Temps ajouté en secondes par coup
  turn, 
  isGameOver, 
  onTimeout 
}) {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  
  // Référence pour suivre le tour précédent
  const prevTurnRef = useRef(turn);

  // 1. Décompte du temps (identique)
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => (prev <= 1 ? (clearInterval(timer), onTimeout('b'), 0) : prev - 1));
      } else {
        setBlackTime((prev) => (prev <= 1 ? (clearInterval(timer), onTimeout('w'), 0) : prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, isGameOver]);

  // 2. Rajout de l'incrément à chaque coup joué
  useEffect(() => {
    // Si le tour change et qu'il y a un incrément
    if (prevTurnRef.current !== turn && increment > 0) {
      if (prevTurnRef.current === 'w') {
        setWhiteTime((prev) => prev + increment);
      } else if (prevTurnRef.current === 'b') {
        setBlackTime((prev) => prev + increment);
      }
    }
    prevTurnRef.current = turn;
  }, [turn, increment]);

  // ... (formatTime, playBeep et rendu JSX identiques)
}