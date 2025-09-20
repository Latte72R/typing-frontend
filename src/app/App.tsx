import { Suspense } from 'react';
import { AppRoutes } from './routes/AppRoutes.tsx';
import styles from './App.module.css';
import { NavigationBar } from '@/components/navigation/NavigationBar.tsx';

const App = () => {
  return (
    <div className={styles.appShell}>
      <a className="visually-hidden" href="#main-content">
        メインコンテンツへスキップ
      </a>
      <NavigationBar />
      <main id="main-content" className={styles.main}>
        <Suspense fallback={<p>読み込み中...</p>}>
          <AppRoutes />
        </Suspense>
      </main>
    </div>
  );
};

export default App;
