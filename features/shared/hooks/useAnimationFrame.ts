import { useRef, useEffect, useCallback } from "react";

export const useAnimationFrame = (callback: () => void) => {
  const rafRef = useRef<number>();
  const lastTime = useRef(performance.now());

  const animate = useCallback(
    (time: number) => {
      if (time - lastTime.current > 16) {
        // ~60fps
        callback();
        lastTime.current = time;
      }
      rafRef.current = requestAnimationFrame(animate);
    },
    [callback],
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);
};
