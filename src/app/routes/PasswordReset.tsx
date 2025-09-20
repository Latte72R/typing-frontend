import { FormEvent, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { usePasswordResetMutation } from '@/features/auth/api/authQueries.ts';
import styles from './Auth.module.css';

export const PasswordReset = () => {
  const reset = usePasswordResetMutation();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    reset.mutate(
      { email },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', message: '再設定メールを送信しました。' });
        },
        onError: (error) => {
          setFeedback({ type: 'error', message: error.message ?? '再設定リクエストに失敗しました。' });
        },
      },
    );
  };

  return (
    <PageContainer title="パスワード再設定" description="登録済みメールアドレスに再設定用リンクを送信します">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submit} disabled={reset.isPending}>
          {reset.isPending ? '送信中...' : '再設定リンクを送信'}
        </button>
        {feedback ? (
          <p
            className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </p>
        ) : null}
      </form>
    </PageContainer>
  );
};
