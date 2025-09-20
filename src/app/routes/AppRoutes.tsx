import { useRoutes } from 'react-router-dom';
import { Landing } from './Landing.tsx';
import { SignIn } from './SignIn.tsx';
import { SignUp } from './SignUp.tsx';
import { PasswordReset } from './PasswordReset.tsx';
import { Dashboard } from './Dashboard.tsx';
import { Practice } from './Practice.tsx';
import { ContestLobby } from './ContestLobby.tsx';
import { TypingPlay } from './TypingPlay.tsx';
import { Result } from './Result.tsx';
import { Leaderboard } from './Leaderboard.tsx';
import { AdminConsole } from './AdminConsole.tsx';
import { NotFound } from './NotFound.tsx';

export const AppRoutes = () => {
  const element = useRoutes([
    { path: '/', element: <Landing /> },
    { path: '/signin', element: <SignIn /> },
    { path: '/signup', element: <SignUp /> },
    { path: '/password-reset', element: <PasswordReset /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/practice', element: <Practice /> },
    { path: '/contests/:contestId', element: <ContestLobby /> },
    { path: '/typing/:contestId', element: <TypingPlay /> },
    { path: '/result/:sessionId', element: <Result /> },
    { path: '/leaderboard/:contestId', element: <Leaderboard /> },
    { path: '/admin', element: <AdminConsole /> },
    { path: '*', element: <NotFound /> },
  ]);

  return element;
};
