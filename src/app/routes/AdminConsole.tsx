import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { AdminForms } from '@/components/typing/AdminForms.tsx';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';

export const AdminConsole = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageContainer
        title="管理コンソール"
        description="コンテストの作成・プロンプト管理・ライブ監視を行います"
      >
        <p role="alert">
          管理機能を利用するには
          <Link to="/signin">ログイン</Link>
          してください。
        </p>
      </PageContainer>
    );
  }

  if (user.role !== 'admin') {
    return (
      <PageContainer
        title="管理コンソール"
        description="コンテストの作成・プロンプト管理・ライブ監視を行います"
      >
        <p role="alert">管理者権限を持つアカウントでのみ利用できます。</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="管理コンソール"
      description="コンテストの作成・プロンプト管理・ライブ監視を行います"
    >
      <AdminForms />
    </PageContainer>
  );
};
