import { NavLink } from 'react-router-dom';
import { LogoutButton } from '@/features/auth/components/LogoutButton.tsx';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';
import { useContestsQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './NavigationBar.module.css';

type NavigationItem = {
  key: string;
  label: string;
  to?: string;
};

const staticLinks: NavigationItem[] = [
  { key: 'home', to: '/', label: 'トップ' },
  { key: 'dashboard', to: '/dashboard', label: 'ダッシュボード' },
  { key: 'admin', to: '/admin', label: '管理コンソール' },
];

export const NavigationBar = () => {
  const { data: contests } = useContestsQuery();
  const leaderboardContestId = contests?.[0]?.id;
  const { user } = useAuth();

  const leaderboardLink: NavigationItem = leaderboardContestId
    ? { key: 'leaderboard', to: `/leaderboard/${leaderboardContestId}`, label: 'ランキング' }
    : { key: 'leaderboard', label: 'ランキング' };

  const links: NavigationItem[] = [...staticLinks];
  links.splice(2, 0, leaderboardLink);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Typing Arena
        </NavLink>
        <nav className={styles.nav} aria-label="主要ナビゲーション">
          <ul className={styles.linkList}>
            {links.map((link) => (
              <li key={link.key}>
                {link.to ? (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <span className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
                    {link.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.authArea}>
          {user ? (
            <>
              <span className={styles.userBadge} aria-live="polite">
                {user.username} としてログイン中
              </span>
              <LogoutButton className={styles.logoutButton} />
            </>
          ) : (
            <div className={styles.authLinks}>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  isActive ? `${styles.authLink} ${styles.authLinkActive}` : styles.authLink
                }
              >
                ログイン
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.authLink} ${styles.authLinkPrimary} ${styles.authLinkActive}`
                    : `${styles.authLink} ${styles.authLinkPrimary}`
                }
              >
                新規登録
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
