import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useSignUpMutation } from '@/features/auth/api/authQueries.ts';
import { setAccessToken } from '@/lib/apiClient.ts';
import { storeAuthUser } from '@/lib/authStorage.ts';
import styles from './Auth.module.css';

export const SignUp = () => {
  const navigate = useNavigate();
  const signUp = useSignUpMutation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed) {
      setFeedback({ type: 'error', message: '利用規約への同意が必要です。' });
      return;
    }
    setFeedback(null);
    signUp.mutate(
      { username, email, password },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
          storeAuthUser(data.user);
          setFeedback({ type: 'success', message: 'アカウント登録が完了しました。ダッシュボードへ移動します。' });
          navigate('/dashboard');
        },
        onError: (error) => {
          setFeedback({ type: 'error', message: error.message ?? 'アカウント登録に失敗しました。' });
        },
      },
    );
  };

  return (
    <PageContainer title="新規登録" description="メールアドレスとパスワードでアカウントを作成します">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            required
          />
        </div>
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
        <div className={styles.field}>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className={styles.checkbox}>
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            required
          />
          <label htmlFor="agree">利用規約とプライバシーポリシーに同意します</label>
        </div>
        <button type="submit" className={styles.submit} disabled={signUp.isPending}>
          {signUp.isPending ? '送信中...' : 'アカウントを作成'}
        </button>
        {feedback ? (
          <p
            className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </p>
        ) : null}
        <p className={styles.switchLink}>
          すでにアカウントをお持ちの場合は<Link to="/signin">ログイン</Link>
        </p>
      </form>
    </PageContainer>
  );
};
