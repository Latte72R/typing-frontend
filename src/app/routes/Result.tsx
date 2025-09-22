import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { KeyStats } from '@/components/typing/KeyStats.tsx';
import { formatAccuracy } from '@/lib/keyboard/typingUtils.ts';
import type { SessionResult } from '@/types/api.ts';
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


  const safeCpm = Number.isFinite(result.cpm) ? Math.round(result.cpm) : 0;
  const safeWpm = Number.isFinite(result.wpm) ? Math.round(result.wpm) : 0;
  const safeAccuracy = Number.isFinite(result.accuracy) ? result.accuracy : 0;
  const safeErrors = typeof result.errors === 'number' ? result.errors : 0;
  const safeScore = typeof result.score === 'number' ? result.score : 0;
  const keylogCount = Array.isArray(result.keylog) ? result.keylog.length : 0;
  const anomalyScore = result.clientFlags?.anomalyScore ?? 0;

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
          cpm={safeCpm}
          wpm={safeWpm}
          accuracy={safeAccuracy}
          errors={safeErrors}
          remainingSeconds={0}
        />
        <section className={styles.summary}>
          <h2>概要</h2>
          <dl>
            <div>
              <dt>スコア</dt>
              <dd>{safeScore}</dd>
            </div>
            <div>
              <dt>正確率</dt>
              <dd>{formatAccuracy(safeAccuracy)}</dd>
            </div>
            <div>
              <dt>ミス</dt>
              <dd>{safeErrors}</dd>
            </div>
            <div>
              <dt>ログ総数</dt>
              <dd>{keylogCount}</dd>
            </div>
            <div>
              <dt>異常スコア</dt>
              <dd>{anomalyScore}</dd>
            </div>
          </dl>
        </section>
      </div>
    </PageContainer>
  );
};
