import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useSignInMutation } from '@/features/auth/api/authQueries.ts';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';
import { setAccessToken } from '@/lib/apiClient.ts';
import styles from './Auth.module.css';

export const SignIn = () => {
  const navigate = useNavigate();
  const signIn = useSignInMutation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    signIn.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
          setUser(data.user);
          setFeedback({ type: 'success', message: 'ログインに成功しました。ダッシュボードへ移動します。' });
          navigate('/dashboard');
        },
        onError: (error) => {
          setFeedback({ type: 'error', message: error.message ?? 'サインインに失敗しました。' });
        },
      },
    );
  };

  return (
    <PageContainer title="ログイン" description="登録済みのアカウントでサインインします">
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
        <div className={styles.field}>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submit} disabled={signIn.isPending}>
          {signIn.isPending ? '送信中...' : 'サインイン'}
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
          アカウントをお持ちでない場合は<Link to="/signup">新規登録</Link>へ
        </p>
        <p>
          パスワードをお忘れの方は<Link to="/password-reset">再設定</Link>
        </p>
      </form>
    </PageContainer>
  );
};
