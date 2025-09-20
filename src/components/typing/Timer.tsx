import { useEffect, useRef, useState } from 'react';
import styles from './Timer.module.css';

type TimerProps = {
  duration: number;
  isRunning: boolean;
  onExpire: () => void;
  onTick?: (remaining: number) => void;
  resetKey?: string | number;
};

export const Timer = ({ duration, isRunning, onExpire, onTick, resetKey }: TimerProps) => {
  const [remaining, setRemaining] = useState(duration);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    hasExpiredRef.current = false;
    onTick?.(duration);
  }, [duration, onTick]);

  useEffect(() => {
    if (resetKey == null) {
      return;
    }
    setRemaining(duration);
    hasExpiredRef.current = false;
    onTick?.(duration);
  }, [resetKey, duration, onTick]);

  useEffect(() => {
    if (!isRunning || remaining <= 0 || hasExpiredRef.current) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        onTick?.(Math.max(next, 0));
        if (next <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onExpire();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, remaining, onExpire, onTick]);

  return (
    <div className={styles.timer} role="timer" aria-live="polite">
      <span className={styles.label}>残り時間</span>
      <span className={styles.value}>{remaining}s</span>
    </div>
  );
};
