import { type ChangeEvent, type FormEvent, useState } from 'react';
import {
  useCreateContestMutation,
  useCreatePromptMutation,
  useDeleteContestMutation,
  useDeletePromptMutation,
  usePromptsQuery,
} from '@/features/admin/api/adminQueries.ts';
import { useContestsQuery } from '@/features/contest/api/contestQueries.ts';
import type {
  ContestLanguage,
  ContestVisibility,
  LeaderboardVisibility,
} from '@/types/api.ts';
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

const parseDateTimeField = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString();
};

export const AdminForms = () => {
  const createContest = useCreateContestMutation();
  const createPrompt = useCreatePromptMutation();
  const deleteContest = useDeleteContestMutation();
  const deletePrompt = useDeletePromptMutation();
  const { data: contests, isLoading: isContestsLoading, error: contestsError } = useContestsQuery();
  const {
    data: prompts,
    isLoading: isPromptsLoading,
    error: promptsError,
  } = usePromptsQuery();
  const [contestFeedback, setContestFeedback] = useState<Feedback | null>(null);
  const [promptFeedback, setPromptFeedback] = useState<Feedback | null>(null);
  const [contestVisibility, setContestVisibility] = useState<ContestVisibility>('public');

  const handleVisibilityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setContestVisibility(event.target.value as ContestVisibility);
  };

  const handleContestSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const visibility = String(formData.get('visibility') ?? 'public') as ContestVisibility;
    const joinCode = String(formData.get('joinCode') ?? '').trim();
    const startsAt = parseDateTimeField(formData.get('startsAt'));
    const endsAt = parseDateTimeField(formData.get('endsAt'));
    const leaderboardVisibility = String(
      formData.get('leaderboardVisibility') ?? 'during',
    ) as LeaderboardVisibility;
    const language = String(formData.get('language') ?? 'romaji') as ContestLanguage;
    const timeLimitSec = parseNumberField(formData.get('timeLimit'));
    const allowBackspace = formData.get('allowBackspace') === 'on';

    setContestFeedback(null);

    if (!startsAt) {
      setContestFeedback({ type: 'error', message: '開始日時を正しく入力してください。' });
      return;
    }
    if (!endsAt) {
      setContestFeedback({ type: 'error', message: '終了日時を正しく入力してください。' });
      return;
    }
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setContestFeedback({ type: 'error', message: '終了日時は開始日時より後に設定してください。' });
      return;
    }

    createContest.mutate(
      {
        title,
        description: description === '' ? undefined : description,
        visibility,
        joinCode: joinCode === '' ? undefined : joinCode,
        startsAt,
        endsAt,
        timezone: 'Asia/Tokyo',
        timeLimitSec,
        allowBackspace,
        leaderboardVisibility,
        language,
      },
      {
        onSuccess: () => {
          setContestFeedback({ type: 'success', message: 'コンテストを保存しました。' });
          form.reset();
          setContestVisibility('public');
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

  const handleContestDelete = (contestId: string, title: string) => {
    if (!window.confirm(`「${title}」を削除しますか？この操作は元に戻せません。`)) {
      return;
    }
    setContestFeedback(null);
    deleteContest.mutate(contestId, {
      onSuccess: () => {
        setContestFeedback({ type: 'success', message: 'コンテストを削除しました。' });
      },
      onError: (error) => {
        setContestFeedback({
          type: 'error',
          message: error.message ?? 'コンテストの削除に失敗しました。',
        });
      },
    });
  };

  const handlePromptDelete = (promptId: string, title: string) => {
    if (!window.confirm(`プロンプト「${title}」を削除しますか？`)) {
      return;
    }
    setPromptFeedback(null);
    deletePrompt.mutate(promptId, {
      onSuccess: () => {
        setPromptFeedback({ type: 'success', message: 'プロンプトを削除しました。' });
      },
      onError: (error) => {
        setPromptFeedback({
          type: 'error',
          message: error.message ?? 'プロンプトの削除に失敗しました。',
        });
      },
    });
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
          説明
          <textarea name="description" rows={3} />
        </label>
        <label>
          公開設定
          <select
            name="visibility"
            defaultValue="public"
            onChange={handleVisibilityChange}
          >
            <option value="public">公開</option>
            <option value="private">非公開</option>
          </select>
        </label>
        <label>
          参加コード
          <input
            name="joinCode"
            placeholder="非公開コンテストで使用"
            disabled={contestVisibility !== 'private'}
          />
        </label>
        <label>
          開始日時
          <input type="datetime-local" name="startsAt" required />
        </label>
        <label>
          終了日時
          <input type="datetime-local" name="endsAt" required />
        </label>
        <label>
          ランキング公開
          <select name="leaderboardVisibility" defaultValue="during">
            <option value="during">期間中公開</option>
            <option value="after">終了後公開</option>
            <option value="hidden">非公開</option>
          </select>
        </label>
        <label>
          言語
          <select name="language" defaultValue="romaji">
            <option value="romaji">ローマ字</option>
            <option value="english">英語</option>
            <option value="kana">かな</option>
          </select>
        </label>
        <label>
          制限時間（秒）
          <input type="number" name="timeLimit" min={10} max={300} defaultValue={60} />
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

      <section className={styles.listSection} aria-label="登録済みコンテスト">
        <h2>登録済みコンテスト</h2>
        {isContestsLoading ? <p>読み込み中...</p> : null}
        {contestsError ? (
          <p className={styles.listError} role="alert">
            コンテスト一覧を取得できませんでした。
          </p>
        ) : null}
        {!isContestsLoading && !contestsError ? (
          <ul className={styles.itemList}>
            {(contests ?? []).length === 0 ? (
              <li className={styles.emptyMessage}>まだコンテストが登録されていません。</li>
            ) : null}
            {(contests ?? []).map((contest) => (
              <li key={contest.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{contest.title}</p>
                  <p className={styles.itemMeta}>
                    {new Date(contest.startsAt).toLocaleString()} 〜 {new Date(contest.endsAt).toLocaleString()} /
                    制限時間: ${contest.timeLimitSec} 秒
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => handleContestDelete(contest.id, contest.title)}
                    disabled={deleteContest.isPending}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={styles.listSection} aria-label="登録済みプロンプト">
        <h2>登録済みプロンプト</h2>
        {isPromptsLoading ? <p>読み込み中...</p> : null}
        {promptsError ? (
          <p className={styles.listError} role="alert">
            プロンプト一覧を取得できませんでした。
          </p>
        ) : null}
        {!isPromptsLoading && !promptsError ? (
          <ul className={styles.itemList}>
            {(prompts ?? []).length === 0 ? (
              <li className={styles.emptyMessage}>まだプロンプトが登録されていません。</li>
            ) : null}
            {(prompts ?? []).map((prompt) => (
              <li key={prompt.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{prompt.displayText}</p>
                  <p className={styles.itemMeta}>言語: {prompt.language ?? '不明'} / キー列: {prompt.typingTarget}</p>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => handlePromptDelete(prompt.id, prompt.displayText)}
                    disabled={deletePrompt.isPending}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </section>
  );
};
