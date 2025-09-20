import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import styles from './Practice.module.css';

const practicePrompts = [
  { id: 'romaji-1', label: '季節の挨拶', target: 'kyouhawa' },
  { id: 'romaji-2', label: '駅名トレーニング', target: 'shinjukueki' },
  { id: 'en-1', label: 'English pangram', target: 'thequickbrownfoxjumpsoverthelazydog' },
];

export const Practice = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(practicePrompts[0]);
  const [showHint, setShowHint] = useState(true);

  return (
    <PageContainer
      title="自由練習"
      description="好きなお題を選んでローマ字ヒントのON/OFFを切り替えながら練習できます"
    >
      <section className={styles.section}>
        <h2>お題選択</h2>
        <ul className={styles.promptList}>
          {practicePrompts.map((prompt) => (
            <li key={prompt.id}>
              <button
                type="button"
                className={prompt.id === selectedPrompt.id ? styles.active : ''}
                onClick={() => setSelectedPrompt(prompt)}
              >
                {prompt.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>練習設定</h2>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={showHint}
            onChange={(event) => setShowHint(event.target.checked)}
          />
          ローマ字ヒントを表示する
        </label>
        <div className={styles.preview}>
          <p>選択中のお題：{selectedPrompt.label}</p>
          {showHint ? <code>{selectedPrompt.target}</code> : <p>ヒント非表示</p>}
        </div>
      </section>
    </PageContainer>
  );
};
