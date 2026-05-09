import { useEffect, useRef, useState } from 'react';

type CountdownOverlayProps = {
  countdownStartTime: number;
  onCountdownComplete: () => void;
};

export default function CountdownOverlay({
  countdownStartTime,
  onCountdownComplete,
}: CountdownOverlayProps) {
  // Initialize count with lazy calculation
  const [count, setCount] = useState(() => {
    const elapsed = Date.now() - countdownStartTime;
    const remaining = 3000 - elapsed;
    return remaining <= 0 ? 0 : Math.ceil(remaining / 1000);
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const elapsed = Date.now() - countdownStartTime;
    const remaining = 3000 - elapsed;

    if (remaining <= 0) {
      onCountdownComplete();
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timeoutRef.current = setTimeout(onCountdownComplete, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [countdownStartTime, onCountdownComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="text-center">
        {count > 0
          ? (
              <div className="animate-bounce">
                <div className="text-9xl font-bold text-white mb-4 drop-shadow-2xl">
                  {count}
                </div>
                <p className="text-2xl text-white font-semibold">
                  Get Ready...
                </p>
              </div>
            )
          : (
              <div className="animate-pulse">
                <div className="text-9xl font-bold text-green-400 mb-4 drop-shadow-2xl">
                  GO!
                </div>
                <p className="text-2xl text-white font-semibold">
                  Start Typing!
                </p>
              </div>
            )}
      </div>
    </div>
  );
}
