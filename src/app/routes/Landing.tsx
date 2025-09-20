import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { LogoutButton } from '@/features/auth/components/LogoutButton.tsx';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';
import styles from './Landing.module.css';

export const Landing = () => {
  const { user } = useAuth();

  return (
    <PageContainer
      title="Typing Arena"
      description="e-typingの緊張感と分析機能を備えたモダンなタイピング学習・競技プラットフォーム"
      actions={
        user ? (
          <div className={styles.actions}>
            <p className={styles.loggedInMessage} aria-live="polite">
              {user.username}さんとしてログイン中
            </p>
            <LogoutButton className={styles.logoutButton} />
          </div>
        ) : (
          <div className={styles.actions}>
            <Link className={styles.primaryCta} to="/signup">
              今すぐ無料で始める
            </Link>
            <Link className={styles.secondaryCta} to="/signin">
              ログイン
            </Link>
          </div>
        )
      }
    >
      <section className={styles.featureGrid} aria-label="主な特徴">
        <article>
          <h2>ローマ字練習に最適化</h2>
          <p>
            日本語表示と正規化済みローマ字列を同時に提示し、IMEを使わずに正確なホームポジションを身に付けられます。
          </p>
        </article>
        <article>
          <h2>大会機能とライブランキング</h2>
          <p>
            コンテストに参加するとリアルタイムに順位が更新され、練習の成果を仲間と競い合えます。
          </p>
        </article>
        <article>
          <h2>緻密なリプレイと分析</h2>
          <p>
            キーログ、CPM/WPM、正確率推移などを詳細に可視化し、自分の癖を発見して改善できます。
          </p>
        </article>
      </section>
    </PageContainer>
  );
};
