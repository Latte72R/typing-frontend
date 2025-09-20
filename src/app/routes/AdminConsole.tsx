import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { AdminForms } from '@/components/typing/AdminForms.tsx';

export const AdminConsole = () => {
  return (
    <PageContainer
      title="管理コンソール"
      description="コンテストの作成・プロンプト管理・ライブ監視を行います"
    >
      <AdminForms />
    </PageContainer>
  );
};
