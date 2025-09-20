import type { FormEvent } from 'react';
import styles from './AdminForms.module.css';

export const AdminForms = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    // 本実装ではAPIへ送信する。
    console.info('管理フォームの送信', data);
  };

  return (
    <section className={styles.adminArea} aria-label="管理フォーム">
      <form className={styles.form} onSubmit={handleSubmit}>
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
        <button type="submit">保存</button>
      </form>

      <form className={styles.form} onSubmit={handleSubmit}>
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
        <button type="submit">追加</button>
      </form>
    </section>
  );
};
