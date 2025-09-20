import { NavLink } from 'react-router-dom';
import styles from './NavigationBar.module.css';

const links = [
  { to: '/', label: 'トップ' },
  { to: '/dashboard', label: 'ダッシュボード' },
  { to: '/practice', label: '練習' },
  { to: '/leaderboard/sample-contest', label: 'ランキング' },
  { to: '/admin', label: '管理コンソール' },
];

export const NavigationBar = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Typing Arena
        </NavLink>
        <nav aria-label="主要ナビゲーション">
          <ul className={styles.linkList}>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
