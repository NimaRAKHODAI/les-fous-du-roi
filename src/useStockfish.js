import { useEffect, useRef } from 'react';

export function useStockfish(onBestMove) {
  const stockfishRef = useRef(null);

  useEffect(() => {
    // Initialisation du Web Worker Stockfish
    const worker = new Worker('/stockfish.js');
    stockfishRef.current = worker;

    // Initialisation du protocole UCI
    worker.postMessage('uci');
    worker.postMessage('isready');

    // Réception des messages envoyés par Stockfish
    worker.onmessage = (event) => {
      const message = event.data;

      // Quand Stockfish trouve le meilleur coup (ex: "bestmove e2e4 ponder e7e5")
      if (message.startsWith('bestmove')) {
        const moveStr = message.split(' ')[1];
        if (moveStr && moveStr !== '(none)') {
          const from = moveStr.substring(0, 2);
          const to = moveStr.substring(2, 4);
          const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

          onBestMove({ from, to, promotion });
        }
      }
    };

    return () => {
      worker.terminate();
    };
  }, [onBestMove]);

  // Fonction pour configurer la difficulté (Skill Level de 0 à 20)
  const setDifficulty = (level) => {
    if (stockfishRef.current) {
      stockfishRef.current.postMessage(`setoption name Skill Level value ${level}`);
    }
  };

  // Fonction pour demander à Stockfish de calculer un coup à partir de la position FEN
  const requestMove = (fen, moveTime = 1000) => {
    if (stockfishRef.current) {
      stockfishRef.current.postMessage(`position fen ${fen}`);
      stockfishRef.current.postMessage(`go movetime ${moveTime}`);
    }
  };

  return { requestMove, setDifficulty };
}