import { type FormEvent, useState } from 'react';
import { useCreateContestMutation, useCreatePromptMutation } from '@/features/admin/api/adminQueries.ts';
import type { ContestLanguage } from '@/types/api.ts';
import styles from './AdminForms.module.css';

type Feedback = { type: 'success' | 'error'; message: string };

const parseNumberField = (value: FormDataEntryValue | null) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return 0;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const AdminForms = () => {
  const createContest = useCreateContestMutation();
  const createPrompt = useCreatePromptMutation();
  const [contestFeedback, setContestFeedback] = useState<Feedback | null>(null);
  const [promptFeedback, setPromptFeedback] = useState<Feedback | null>(null);

  const handleContestSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const timeLimitSec = parseNumberField(formData.get('timeLimit'));
    const maxAttempts = parseNumberField(formData.get('maxAttempts'));
    const allowBackspace = formData.get('allowBackspace') === 'on';

    setContestFeedback(null);

    createContest.mutate(
      { title, timeLimitSec, maxAttempts, allowBackspace },
      {
        onSuccess: () => {
          setContestFeedback({ type: 'success', message: 'コンテストを保存しました。' });
          form.reset();
        },
        onError: (error) => {
          setContestFeedback({
            type: 'error',
            message: error.message ?? 'コンテストの保存に失敗しました。',
          });
        },
      },
    );
  };

  const handlePromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const displayText = String(formData.get('displayText') ?? '').trim();
    const typingTarget = String(formData.get('typingTarget') ?? '').trim();
    const language = String(formData.get('language') ?? 'romaji') as ContestLanguage;

    setPromptFeedback(null);

    createPrompt.mutate(
      { displayText, typingTarget, language },
      {
        onSuccess: () => {
          setPromptFeedback({ type: 'success', message: 'プロンプトを追加しました。' });
          form.reset();
        },
        onError: (error) => {
          setPromptFeedback({
            type: 'error',
            message: error.message ?? 'プロンプトの追加に失敗しました。',
          });
        },
      },
    );
  };

  return (
    <section className={styles.adminArea} aria-label="管理フォーム">
      <form className={styles.form} onSubmit={handleContestSubmit}>
        <h2>コンテスト設定</h2>
        <label>
          タイトル
          <input name="title" required />
        </label>
        <label>
          制限時間（秒）
          <input type="number" name="timeLimit" min={10} max={300} defaultValue={60} />
        </label>
        <label>
          最大試行回数
          <input type="number" name="maxAttempts" min={0} max={10} defaultValue={3} />
        </label>
        <div className={styles.checkbox}>
          <input
            id="allowBackspace"
            type="checkbox"
            name="allowBackspace"
            defaultChecked={false}
          />
          <label htmlFor="allowBackspace">Backspace を許可する</label>
        </div>
        <button type="submit" disabled={createContest.isPending}>
          {createContest.isPending ? '送信中...' : '保存'}
        </button>
        {contestFeedback ? (
          <p
            className={`${styles.feedback} ${contestFeedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
            role={contestFeedback.type === 'error' ? 'alert' : 'status'}
          >
            {contestFeedback.message}
          </p>
        ) : null}
      </form>

      <form className={styles.form} onSubmit={handlePromptSubmit}>
        <h2>プロンプト登録</h2>
        <label>
          表示文
          <textarea name="displayText" required rows={3} />
        </label>
        <label>
          タイプ対象（ローマ字列）
          <textarea name="typingTarget" required rows={2} />
        </label>
        <label>
          言語
          <select name="language" defaultValue="romaji">
            <option value="romaji">ローマ字</option>
            <option value="english">英語</option>
            <option value="kana">かな</option>
          </select>
        </label>
        <button type="submit" disabled={createPrompt.isPending}>
          {createPrompt.isPending ? '送信中...' : '追加'}
        </button>
        {promptFeedback ? (
          <p
            className={`${styles.feedback} ${promptFeedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
            role={promptFeedback.type === 'error' ? 'alert' : 'status'}
          >
            {promptFeedback.message}
          </p>
        ) : null}
      </form>
    </section>
  );
};
