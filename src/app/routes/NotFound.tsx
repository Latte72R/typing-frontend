import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';

export const NotFound = () => {
  return (
    <PageContainer title="ページが見つかりません" description="指定のページは存在しませんでした">
      <p>
        URLを再確認するか、<Link to="/">トップページ</Link>に戻ってください。
      </p>
    </PageContainer>
  );
};
