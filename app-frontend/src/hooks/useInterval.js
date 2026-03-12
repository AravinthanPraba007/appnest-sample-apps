import { useEffect, useRef } from 'react';

/**
 * Run a callback on an interval. Pass null for delay to pause.
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  const idRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay == null) return;
    const tick = () => savedCallback.current?.();
    idRef.current = setInterval(tick, delay);
    return () => {
      if (idRef.current) clearInterval(idRef.current);
    };
  }, [delay]);
}
