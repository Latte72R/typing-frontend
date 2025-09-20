import { FormEvent, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import styles from './Auth.module.css';

export const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage('デモ環境のため、再設定メールは送信されません。');
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
        <button type="submit" className={styles.submit}>
          再設定リンクを送信
        </button>
        {message ? <p role="status">{message}</p> : null}
      </form>
    </PageContainer>
  );
};
