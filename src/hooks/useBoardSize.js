import { useState, useEffect, useRef } from 'react';

export function useBoardSize() {
  const wrapperRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(400);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const roundedWidth = Math.floor(entry.contentRect.width);
        
        // Ne mettre à jour QUE si la taille varie d'au moins 5px
        setBoardWidth((prevWidth) => {
          if (Math.abs(prevWidth - roundedWidth) >= 5 && roundedWidth > 0) {
            return roundedWidth;
          }
          return prevWidth;
        });
      }
    });

    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, []);

  return { wrapperRef, boardWidth };
}