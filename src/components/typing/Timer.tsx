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
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor(duration)));
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor(duration)));
    hasExpiredRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (resetKey == null) {
      return;
    }
    setRemaining(Math.max(0, Math.floor(duration)));
    hasExpiredRef.current = false;
  }, [resetKey, duration]);

  useEffect(() => {
    if (!isRunning || hasExpiredRef.current) {
      return;
    }
    if (remaining <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, remaining]);

  useEffect(() => {
    if (!Number.isFinite(remaining)) {
      return;
    }
    onTick?.(remaining);
    if (remaining <= 0 && isRunning && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire();
    }
  }, [remaining, isRunning, onExpire, onTick]);

  return (
    <div className={styles.timer} role="timer" aria-live="polite">
      <span className={styles.label}>残り時間</span>
      <span className={styles.value}>{remaining}s</span>
    </div>
  );
};
