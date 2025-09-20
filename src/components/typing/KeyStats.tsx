import styles from './KeyStats.module.css';
import { formatAccuracy } from '@/lib/keyboard/typingUtils.ts';

type KeyStatsProps = {
  cpm: number;
  wpm: number;
  accuracy: number;
  errors: number;
  remainingSeconds: number;
};

export const KeyStats = ({ cpm, wpm, accuracy, errors, remainingSeconds }: KeyStatsProps) => {
  return (
    <section className={styles.stats} aria-label="タイピング統計">
      <div>
        <span className={styles.label}>CPM</span>
        <span className={styles.value}>{cpm}</span>
      </div>
      <div>
        <span className={styles.label}>WPM</span>
        <span className={styles.value}>{wpm}</span>
      </div>
      <div>
        <span className={styles.label}>正確率</span>
        <span className={styles.value}>{formatAccuracy(accuracy)}</span>
      </div>
      <div>
        <span className={styles.label}>ミス</span>
        <span className={styles.value}>{errors}</span>
      </div>
      <div>
        <span className={styles.label}>残り時間</span>
        <span className={styles.value}>{remainingSeconds}s</span>
      </div>
    </section>
  );
};
