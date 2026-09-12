import { useRef, useEffect } from 'react';

export function useStockfish() {
  const workerRef = useRef(null);

  useEffect(() => {
    // Worker Stockfish autonome via CDN (évite les 404 sur les fichiers locaux)
    const blob = new Blob(
      [
        `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`
      ],
      { type: 'application/javascript' }
    );

    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    workerRef.current = worker;

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  const getBestMove = (fen, skillLevel = 10) => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve(null);
        return;
      }

      const worker = workerRef.current;

      // Timeout de sécurité passe à 5s pour laisser le temps au moteur d'analyser
      const timer = setTimeout(() => {
        worker.removeEventListener('message', handleMessage);
        console.warn('Stockfish n’a pas répondu dans le délai imparti.');
        resolve(null);
      }, 5000);

      const handleMessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : '';

        if (line.startsWith('bestmove')) {
          clearTimeout(timer);
          worker.removeEventListener('message', handleMessage);

          const parts = line.split(' ');
          const rawMove = parts[1];

          if (rawMove && rawMove !== '(none)') {
            resolve({
              from: rawMove.substring(0, 2),
              to: rawMove.substring(2, 4),
              ...(rawMove.length === 5 && { promotion: rawMove[4] }),
            });
          } else {
            resolve(null);
          }
        }
      };

      worker.addEventListener('message', handleMessage);

      // Séquence d'initialisation UCI complète
      worker.postMessage('uci');
      worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      worker.postMessage('ucinewgame');
      worker.postMessage('isready');
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage('go movetime 1000');
    });
  };

  return { getBestMove };
}