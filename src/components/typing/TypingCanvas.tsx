import clsx from 'clsx';
import styles from './TypingCanvas.module.css';

type TypingCanvasProps = {
  displayText: string;
  typingTarget: string;
  cursorIndex: number;
  hasError: boolean;
};

export const TypingCanvas = ({ displayText, typingTarget, cursorIndex, hasError }: TypingCanvasProps) => {
  const characters = typingTarget.split('');
  const remaining = Math.max(characters.length - cursorIndex, 0);

  return (
    <div className={styles.canvas}>
      <p className={styles.displayText} aria-label="表示文">
        {displayText}
      </p>
      <div className={styles.target} aria-live="polite">
        {characters.map((char, index) => {
          const isCurrent = index === cursorIndex;
          const isTyped = index < cursorIndex;
          const key = typingTarget.slice(0, index + 1);
          const className = clsx(styles.char, {
            [styles.typed]: isTyped,
            [styles.current]: isCurrent && !hasError,
            [styles.error]: isCurrent && hasError,
            [styles.pending]: !isTyped && !isCurrent,
          });
          return (
            <span key={key} className={className} aria-hidden="true">
              {char}
            </span>
          );
        })}
        {cursorIndex >= characters.length && characters.length > 0 ? (
          <span className={clsx(styles.char, styles.completed)} aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>
      <output className={styles.progress}>
        残り {remaining} 文字
      </output>
    </div>
  );
};
