import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import styles from './Auth.module.css';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!agreed) {
      setMessage('利用規約への同意が必要です');
      return;
    }
    setMessage('デモ環境のため、サーバー接続は行われません。');
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
        <button type="submit" className={styles.submit}>
          サインイン
        </button>
        {message ? <p role="status">{message}</p> : null}
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
