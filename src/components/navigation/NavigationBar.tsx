import { NavLink } from 'react-router-dom';
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
  { key: 'practice', to: '/practice', label: '練習' },
  { key: 'admin', to: '/admin', label: '管理コンソール' },
];

export const NavigationBar = () => {
  const { data: contests } = useContestsQuery();
  const leaderboardContestId = contests?.[0]?.id;

  const leaderboardLink: NavigationItem = leaderboardContestId
    ? { key: 'leaderboard', to: `/leaderboard/${leaderboardContestId}`, label: 'ランキング' }
    : { key: 'leaderboard', label: 'ランキング' };

  const links: NavigationItem[] = [...staticLinks];
  links.splice(3, 0, leaderboardLink);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Typing Arena
        </NavLink>
        <nav aria-label="主要ナビゲーション">
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
      </div>
    </header>
  );
};
