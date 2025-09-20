import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { KeyStats } from '@/components/typing/KeyStats.tsx';
import { formatAccuracy } from '@/lib/keyboard/typingUtils.ts';
import { SessionResult } from '@/types/api.ts';
import styles from './Result.module.css';

type ResultLocationState = {
  result?: SessionResult;
  contest?: { title: string } | null;
};

export const Result = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultLocationState | null;
  const result = state?.result;

  if (!result) {
    return (
      <PageContainer title="リザルト" description="結果情報が見つかりませんでした">
        <p>直接アクセスされた場合はダッシュボードに戻ってください。</p>
        <button type="button" onClick={() => navigate('/dashboard')} className={styles.primaryButton}>
          ダッシュボードへ戻る
        </button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="リザルト"
      description={`${state?.contest?.title ?? 'コンテスト'} - セッションID: ${sessionId}`}
      actions={
        <button type="button" className={styles.primaryButton} onClick={() => navigate(-1)}>
          前の画面へ戻る
        </button>
      }
    >
      <div className={styles.grid}>
        <KeyStats
          cpm={Math.round(result.cpm)}
          wpm={Math.round(result.wpm)}
          accuracy={result.accuracy}
          errors={result.errors}
          remainingSeconds={0}
        />
        <section className={styles.summary}>
          <h2>概要</h2>
          <dl>
            <div>
              <dt>スコア</dt>
              <dd>{result.score}</dd>
            </div>
            <div>
              <dt>正確率</dt>
              <dd>{formatAccuracy(result.accuracy)}</dd>
            </div>
            <div>
              <dt>ミス</dt>
              <dd>{result.errors}</dd>
            </div>
            <div>
              <dt>ログ総数</dt>
              <dd>{result.keylog.length}</dd>
            </div>
            <div>
              <dt>異常スコア</dt>
              <dd>{result.clientFlags?.anomalyScore ?? 0}</dd>
            </div>
          </dl>
        </section>
      </div>
    </PageContainer>
  );
};
